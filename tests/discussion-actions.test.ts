import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { initialData, deleteDiscussionPost, toggleItem } from "../src/lib/model";
import { isOwnDiscussion } from "../src/lib/community";
import { initialDiscussions } from "../src/lib/data";

type Node = { type: any; props: Record<string, any> };
const nodes = (node: any): Node[] => node?.props ? [node, ...[node.props.children].flat(Infinity).flatMap(nodes)] : [];
const text = (node: any): string => typeof node === "string" ? node : node?.props ? [node.props.children].flat(Infinity).map(text).join("") : "";

test("author options save with feedback and delete only after native confirmation, cleaning up detail navigation", () => {
  const mine = { ...initialDiscussions[0], id: "own-discussion", authorName: "My previous name" };
  const unrelated = { ...initialDiscussions[1], id: "other-discussion" };
  let data = { ...initialData, discussions: [mine], comments: [{ id: "reply", postId: mine.id, text: "A reply", createdAt: new Date().toISOString() }], liked: [mine.id], saved: [] as string[] };
  let cursor = 0;
  const state: any[] = [], notices: string[] = [], navigation: string[] = [];
  let alert: { title: string; buttons: { text: string; style?: string; onPress?: () => void }[] } | undefined;
  let canGoBack = true;
  const jsx = (type: any, props: any) => ({ type, props });
  const common = new Proxy({}, { get: (_, key) => key === "Avatar" ? Object.assign(() => {}, { Fallback: "AvatarFallback" }) : String(key) });
  const modules: Record<string, any> = {
    react: { useState(initial: any) { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], (value: any) => { state[i] = value; }]; } },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": { Image: "Image", View: "View", Share: {}, Platform: { OS: "ios" }, Alert: { alert: (title: string, _message: string, buttons: any[]) => { alert = { title, buttons }; } } },
    "expo-router": { router: { canGoBack: () => canGoBack, back: () => navigation.push("back"), replace: (target: any) => navigation.push(target.pathname), push: () => navigation.push("detail") } },
    "lucide-react-native": new Proxy({}, { get: (_, key) => String(key) }), "./Common": common,
    "./MenuSheet": { default: "MenuSheet" }, "../hooks/useAppToast": { useAppToast: () => (message: string) => notices.push(message) },
    "../state/store": { useStore: () => ({ data, update: (fn: any) => { data = fn(data); } }) },
    "../lib/model": { deleteDiscussionPost, toggleItem }, "../lib/community": { isOwnDiscussion }, "../lib/theme": { colors: {}, fonts: {}, ui: {} },
  };
  const exports: Record<string, any> = {};
  const source = ts.transpileModule(readFileSync(new URL("../src/components/DiscussionCard.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(source, { exports, require: (name: string) => { assert.ok(name in modules, name); return modules[name]; } });
  const render = (post = mine, expanded = false) => { cursor = 0; return exports.default({ post, expanded }); };
  let tree = render(unrelated);
  assert.ok(!nodes(tree).some(n => n.props.label === "Post options"));
  tree = render();
  assert.ok(nodes(tree).some(n => n.type === "Badge" && text(n) === "You"));
  nodes(tree).find(n => n.props.label === "Post options")!.props.onPress();
  assert.equal(nodes(render()).find(n => n.type === "MenuSheet")!.props.open, true);
  nodes(render()).find(n => n.props.accessibilityLabel === "Store / Save Post")!.props.onPress();
  assert.ok(data.saved.includes(mine.id));
  assert.ok(notices.includes("Post stored in Saved Discussions"));
  nodes(render()).find(n => n.props.accessibilityLabel === "Remove post from Saved")!.props.onPress();
  assert.equal(data.saved.length, 0);
  assert.ok(notices.includes("Post removed from Saved"));
  data.saved = [mine.id];
  nodes(render(mine, true)).find(n => n.props.accessibilityLabel === "Delete Post")!.props.onPress();
  assert.equal(alert!.title, "Delete Discussion?");
  assert.ok(alert!.buttons.some(b => b.text === "Cancel" && b.style === "cancel"));
  assert.equal(data.discussions.length, 1, "opening confirmation does not delete anything");
  assert.equal(navigation.length, 0);
  const remove = alert!.buttons.find(b => b.text === "Delete")!;
  assert.equal(remove.style, "destructive");
  remove.onPress!();
  assert.equal(data.discussions.length, 0);
  assert.equal(data.comments.length, 0);
  assert.equal(data.saved.length, 0);
  assert.equal(data.liked.length, 0);
  assert.deepEqual(navigation, ["back"]);
  assert.ok(notices.includes("Discussion deleted"));
  // A detail opened by a deep link still has a valid destination after deletion.
  data.discussions = [mine]; canGoBack = false;
  nodes(render(mine, true)).find(n => n.props.accessibilityLabel === "Delete Post")!.props.onPress();
  alert!.buttons.find(b => b.text === "Delete")!.onPress!();
  assert.equal(navigation.at(-1), "/community");
});
