import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as routing from "../src/lib/routing";
import { demoRouteOptions } from "../src/lib/journey-planner";
import { places } from "../src/lib/data";
import { initialData } from "../src/lib/model";

test("duration-only carbon model clamps short journeys and calculates 10 and 35 minutes", () => {
  assert.deepEqual(routing.calculateCarbonEmissions(0), { carKg: 0.1, transitKg: 0.02, transitSavingsKg: 0.08, walkSavingsKg: 0.1 });
  assert.deepEqual(routing.calculateCarbonEmissions(10), { carKg: 1.4, transitKg: 0.28, transitSavingsKg: 1.12, walkSavingsKg: 1.4 });
  assert.deepEqual(routing.calculateCarbonEmissions(35), { carKg: 4.9, transitKg: 0.98, transitSavingsKg: 3.92, walkSavingsKg: 4.9 });
});

test("fractional durations are rounded to two decimals and invalid inputs stay finite", () => {
  assert.deepEqual(routing.calculateCarbonEmissions(10.5), { carKg: 1.47, transitKg: 0.29, transitSavingsKg: 1.18, walkSavingsKg: 1.47 });
  for (const invalid of [-1, NaN, Infinity, -Infinity]) assert.deepEqual(routing.calculateCarbonEmissions(invalid), routing.calculateCarbonEmissions(0));
  for (const duration of [0, 0.1, 10, 35, 60]) {
    const result = routing.calculateCarbonEmissions(duration);
    assert.equal(Number((result.transitKg + result.transitSavingsKg).toFixed(2)), result.carKg);
    assert.equal(result.walkSavingsKg, result.carKg);
  }
});

type Node = { type: unknown; props: Record<string, any> };
function nodes(node: any): Node[] { return node && typeof node === "object" && node.props ? [node, ...[node.props.children].flat(Infinity).flatMap(nodes)] : []; }
function text(node: any): string { if (typeof node === "string" || typeof node === "number") return String(node); if (!node || typeof node !== "object") return ""; return [node.props?.children].flat(Infinity).map(text).join(" "); }
function loadComponents() {
  const jsx = (type: unknown, props: Node["props"]): Node => ({ type, props });
  const dependencies: Record<string, any> = {
    react: { useEffect() {}, useState: (value: unknown) => [value, () => {}] },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": { View: "View", Image: "Image" },
    "lucide-react-native": new Proxy({}, { get: (_, key) => String(key) }),
    "./Common": { Badge: "Badge", Button: Object.assign(() => {}, { Label: "ButtonLabel" }), DemoNote: "DemoNote", PressableFeedback: "PressableFeedback", Surface: "Surface", Typography: Object.assign(() => {}, { Heading: "Heading" }) },
    "./LineTabs": { default: "LineTabs" }, "./Action": { default: "Action" },
    "../lib/theme": { colors: {}, fonts: {}, ui: {} }, "../lib/routing": routing,
    "../state/store": { useStore: () => ({ data: initialData, update() {} }) },
  };
  const load = (file: string) => {
    const output = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
    const exports: Record<string, any> = {};
    runInNewContext(output, { exports, require(name: string) { assert.ok(name in dependencies, name); return dependencies[name]; } });
    return exports.default;
  };
  const Carbon = load("../src/components/CarbonEmissionCard.tsx");
  dependencies["./CarbonEmissionCard"] = { default: Carbon };
  return { Carbon, Sheet: load("../src/components/RoutingSheet.tsx") };
}

test("expanded route selection updates carbon values, ignores distance and places the card immediately before travel advice", () => {
  const { Sheet, Carbon } = loadComponents();
  const destination = places.find(p => p.id === "park")!;
  const base = demoRouteOptions(places[0], destination, "drive")[0];
  const options = [{ ...base, id: "quick", duration: 600, distance: 1000 }, { ...base, id: "slower", duration: 2100, distance: 1000 }];
  const props = { mode: "drive", options, selectedId: "quick", destination, compact: false, expanded: true, stickyStart: true, loading: false, onSelect() {}, onStart() {}, onModeChange() {}, onExpand() {} };
  const card = (tree: Node) => nodes(tree).find(n => n.type === Carbon)!;
  const quick = Sheet(props);
  assert.equal(card(quick).props.durationMinutes, 10);
  assert.ok(text(Carbon(card(quick).props)).includes("1.40 kg CO₂"));
  const slower = Sheet({ ...props, selectedId: "slower" });
  assert.equal(card(slower).props.durationMinutes, 35);
  assert.ok(text(Carbon(card(slower).props)).includes("4.90 kg CO₂"));
  const differentDistance = Sheet({ ...props, options: [{ ...options[0], distance: 99000 }] });
  assert.equal(card(differentDistance).props.durationMinutes, 10);
  const group = nodes(quick).find(n => Array.isArray(n.props.children) && n.props.children[0]?.type === Carbon)!;
  assert.ok(text(group.props.children[1]).includes("Before you travel"));
  for (const hidden of [{ expanded: false }, { compact: true }, { destination: null }, { options: [] }]) assert.equal(nodes(Sheet({ ...props, ...hidden })).some(n => n.type === Carbon), false);
});

test("carbon comparison shows percentage and absolute savings with 100/20/0 indicators", () => {
  const { Carbon } = loadComponents();
  const tree = Carbon({ durationMinutes: 10 });
  const content = text(tree);
  for (const label of ["-80% CO₂", "Save 1.12 kg CO₂ vs driving", "100% Clean", "Zero Emissions", "Save 1.40 kg CO₂ vs driving", "0.00 kg CO₂", "Duration-based: 10 min × 140g/min"]) assert.ok(content.includes(label), label);
  assert.deepEqual(nodes(tree).filter(n => n.props.accessibilityRole === "progressbar").map(n => n.props.accessibilityValue.now), [100, 20, 0]);
});
