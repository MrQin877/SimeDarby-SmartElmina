import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { initialData } from "../src/lib/model";
import * as data from "../src/lib/data";
import * as shortcuts from "../src/lib/shortcuts";
import * as search from "../src/lib/search";

// Exercise the real component handlers without requiring a native renderer.
type Node = { type: unknown; props: Record<string, any> };
function harness() {
  const state: any[] = [];
  let cursor = 0;
  let profile = { ...initialData, shortcuts: [] as shortcuts.ShortcutItem[] };
  let query = "";
  const jsx = (type: unknown, props: Node["props"]): Node => ({ type, props });
  const animation = { duration: () => animation, easing: () => animation, withInitialValues: () => animation, reduceMotion: () => animation };
  const dependencies: Record<string, any> = {
    "react-native-reanimated": { default: { View: "AnimatedView" }, FadeInUp: animation, Easing: { out: () => {}, cubic: () => {} }, ReduceMotion: { System: "system" } },
    react: {
      useRef: (value: unknown) => ({ current: value }),
      useState: (initial: unknown) => {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], (value: unknown) => { state[index] = value; }];
      },
    },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": { View: "View", ScrollView: "ScrollView", KeyboardAvoidingView: "KeyboardAvoidingView", TextInput: "TextInput", Platform: { OS: "ios" }, Keyboard: { dismiss() {} } },
    "react-native-safe-area-context": { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
    "lucide-react-native": new Proxy({}, { get: (_, key) => String(key) }),
    "heroui-native/hooks": { useBottomSheetAwareHandlers: () => ({}) },
    "@gorhom/bottom-sheet": { BottomSheetScrollView: "SheetScrollView" },
    "./Common": { Typography: "Typography", Surface: "Surface", PressableFeedback: "PressableFeedback", Button: Object.assign(() => {}, { Label: "ButtonLabel" }), Input: "Input", Label: "Label", IconButton: "IconButton", CloseButton: "CloseButton", Badge: "Badge", DemoNote: "DemoNote" },
    "./MenuSheet": { default: "MenuSheet" },
    "./VoiceInput": { default: "VoiceInput" },
    "../lib/data": data,
    "../lib/shortcuts": shortcuts,
    "../lib/search": search,
    "../lib/theme": { colors: {}, fonts: {}, radius: {}, ui: {} },
    "../state/store": { useStore: () => ({ data: profile, update: (fn: (d: typeof profile) => typeof profile) => { profile = fn(profile); } }) },
    "../hooks/useAppToast": { useAppToast: () => () => {} },
  };
  function load(file: string) {
    const output = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
    const exports: Record<string, any> = {};
    runInNewContext(output, { exports, require: (name: string) => { assert.ok(name in dependencies, `Unexpected dependency: ${name}`); return dependencies[name]; }, requestAnimationFrame: (fn: () => void) => fn() });
    return exports;
  }
  const menu = load("../src/components/ShortcutMenu.tsx");
  dependencies["./ShortcutMenu"] = menu;
  const overlay = load("../src/components/SearchOverlay.tsx").default;
  const render = () => { cursor = 0; return overlay({ query, onQueryChange: (value: string) => { query = value; }, onClose() {}, onSelect() {} }) as Node; };
  const sheet = (tree: Node) => menu.default(find(tree, n => n.type === menu.default).props) as Node;
  return { render, sheet, profile: () => profile };
}
function find(node: any, predicate: (node: Node) => boolean): Node {
  if (node && typeof node === "object" && predicate(node)) return node;
  for (const child of [node?.props?.children].flat(Infinity)) {
    if (!child || typeof child !== "object") continue;
    try { return find(child, predicate); } catch {}
  }
  throw new Error("Control not found");
}
const press = (tree: Node, label: string) => find(tree, n => n.props?.accessibilityLabel === label).props.onPress();

test("Add and More open the already-mounted sheet, and closing allows it to reopen", () => {
  const app = harness();
  assert.equal(app.sheet(app.render()).props.open, false);
  press(app.render(), "Add: Add custom shortcut");
  assert.equal(app.sheet(app.render()).props.open, true);
  assert.equal(app.sheet(app.render()).props.label, "Add shortcut");
  app.sheet(app.render()).props.onOpenChange(false);
  assert.equal(app.sheet(app.render()).props.open, false);
  press(app.render(), "More: Manage shortcuts");
  assert.equal(app.sheet(app.render()).props.open, true);
  assert.equal(app.sheet(app.render()).props.label, "Manage shortcuts");
});

test("unset Home and Work go directly to location selection and save the chosen place", () => {
  for (const slot of ["Home", "Work"]) {
    const app = harness();
    press(app.render(), `${slot} + Set: Not set`);
    assert.equal(app.sheet(app.render()).props.open, false);
    const input = find(app.render(), n => n.props?.accessibilityLabel === "Search Elmina destination");
    assert.equal(input.props.placeholder, `Choose ${slot} location`);
    const place = data.searchPlaces("")[0];
    press(app.render(), `Choose ${place.name}`);
    assert.equal(app.profile()[slot === "Home" ? "homePlaceId" : "workPlaceId"], place.id);
    assert.equal(find(app.render(), n => n.props?.accessibilityLabel === "Search Elmina destination").props.placeholder, "Search destination");
  }
});
