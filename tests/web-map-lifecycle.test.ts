import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

test("web map effects do not touch a new, unloaded style when loaded state survives a refresh", () => {
  const effects: (() => unknown)[] = [], refs: any[] = [];
  let stateIndex = 0;
  const jsx = (type: any, props: any) => ({ type, props });
  let mapCreated = false;
  class NewMap {
    constructor() { mapCreated = true; }
    on() {}
    isStyleLoaded() { return false; }
    getLayer() { throw new Error("Style is not done loading"); }
    addSource() { throw new Error("Style is not done loading"); }
  }
  const dependencies: Record<string, any> = {
    react: { createElement: jsx, useEffect: (fn: any) => effects.push(fn), useState: (initial: any) => [stateIndex++ === 1 ? true : initial, () => {}], useRef: (initial: any) => { const value = { current: initial }; refs.push(value); return value; } },
    "react/jsx-runtime": { jsx, jsxs: jsx }, "react-dom/client": {}, "react-native": { View: "View", Pressable: "Pressable", Text: "Text" },
    "maplibre-gl": { Map: NewMap, setWorkerUrl() {} }, "maplibre-gl/dist/maplibre-gl.css": {},
    "../lib/data": { CENTER: [101.51, 3.18] }, "../lib/map": {}, "../lib/theme": { colors: {} }, "../lib/shuttle-data": {},
    "../lib/map-layers": {}, "../lib/announcement-clusters": {}, "./MapMarkerBadge": {}, "./AnnouncementClusterBadge": {},
  };
  const source = ts.transpileModule(readFileSync(new URL("../src/components/TownshipMap.web.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: Record<string, any> = {};
  runInNewContext(source, { exports, window: { location: { origin: "http://localhost" } }, ResizeObserver: class { observe() {} }, require: (name: string) => { assert.ok(name in dependencies, name); return dependencies[name]; } });
  exports.default({ markers: [], traffic: true, shuttleRoute: [[101, 3], [102, 3]], route: [[101, 3], [102, 3]], routeOptions: [{ id: "route" }] });
  refs[0].current = {};
  effects.forEach(effect => assert.doesNotThrow(effect));
  assert.equal(mapCreated, true);
});
