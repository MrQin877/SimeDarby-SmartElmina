import test from "node:test";
import assert from "node:assert/strict";
import { URL } from "node:url";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as sheet from "../src/lib/sheet";

type Node = { type: string; props: Record<string, any> };
function harness() {
  const slots: any[] = [];
  let cursor = 0;
  const effects: (() => void)[] = [];
  const animations: { stopped: boolean; start: () => void; stop: () => void }[] = [];
  class Value {
    value: number;
    listener?: (event: { value: number }) => void;
    constructor(value: number) { this.value = value; }
    setValue(value: number) { this.value = value; this.listener?.({ value }); }
    stopAnimation() {}
    addListener(listener: Value["listener"]) { this.listener = listener; return "height-listener"; }
    removeListener() { this.listener = undefined; }
  }
  const dependencies: Record<string, any> = {
    react: {
      useRef(value: unknown) { const i = cursor++; return slots[i] ??= { current: value }; },
      useMemo: (fn: () => unknown) => fn(),
      useCallback: (fn: () => unknown) => fn,
      useEffect(fn: () => (() => void) | undefined, deps: unknown[]) {
        const i = cursor++;
        const previous = slots[i];
        if (!previous || deps.some((dep, index) => dep !== previous.deps[index])) {
          effects.push(() => { previous?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; });
        }
      },
    },
    "react/jsx-runtime": { jsx: (type: string, props: Node["props"]) => ({ type, props }), jsxs: (type: string, props: Node["props"]) => ({ type, props }) },
    "react-native": { View: "View", Pressable: "Pressable", PanResponder: { create: (handlers: unknown) => ({ panHandlers: handlers }) }, Animated: { View: "AnimatedView", Value, timing: (value: Value, config: { toValue: number }) => {
      const animation = { stopped: false, start: () => value.setValue(config.toValue), stop() { this.stopped = true; } };
      animations.push(animation); return animation;
    } } },
    "../lib/theme": { colors: { white: "white", border: "border" }, radius: {}, ui: {} },
    "../lib/sheet": sheet,
  };
  const exports: Record<string, any> = {};
  const source = ts.transpileModule(readFileSync(new URL("../src/components/DraggableSheet.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(source, { exports, require(name: string) { assert.ok(name in dependencies, name); return dependencies[name]; } });
  let snap = 1;
  return {
    render(visible: boolean): Node { cursor = 0; const node = exports.default({ visible, availableHeight: 800, index: 1, onSnap: (index: number) => { snap = index; }, children: "route content" }); while (effects.length) effects.shift()!(); return node; },
    animations,
    snap: () => snap,
    unmount() { for (const slot of slots) slot?.cleanup?.(); },
  };
}

test("hiding the map sheet preserves its native shell and cancels motion; reopening restores content", () => {
  const app = harness();
  const open = app.render(true);
  assert.equal(open.props.pointerEvents, "auto");
  const running = app.animations.at(-1)!;
  const hidden = app.render(false);
  assert.equal(running.stopped, true);
  assert.equal(hidden.type, open.type);
  assert.equal(hidden.props.pointerEvents, "none");
  assert.equal(hidden.props.accessibilityElementsHidden, true);
  assert.equal(hidden.props.children.length, open.props.children.length);
  assert.equal(hidden.props.children.at(-1).props.children, null);
  const reopened = app.render(true);
  assert.equal(reopened.props.children.at(-1).props.children, "route content");
  app.unmount();
  assert.equal(app.animations.at(-1)!.stopped, true);
});

test("drag release motion is cancelled on hide, and tap-to-expand still reaches full height", () => {
  const app = harness();
  const node = app.render(true);
  node.props.onPanResponderGrant();
  node.props.onPanResponderMove({}, { dy: -30 });
  node.props.onPanResponderRelease({}, { dy: -30, vy: 0 });
  const release = app.animations.at(-1)!;
  app.render(false);
  assert.equal(release.stopped, true);
  const reopened = app.render(true);
  reopened.props.children.find((child: Node) => child.type === "Pressable").props.onPress();
  assert.equal(app.snap(), 2);
  app.unmount();
});
