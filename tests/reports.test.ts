import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { initialData, restoreData } from "../src/lib/model";
import * as model from "../src/lib/model";
import { demoReports, newestReports, reportStatus } from "../src/lib/reports";
import * as reports from "../src/lib/reports";

test("the reports hub seeds two realistic samples once without losing resident reports", () => {
  assert.equal(initialData.reports.length, 2);
  assert.equal(reportStatus(demoReports[0].status).tone, "blue");
  assert.equal(reportStatus(demoReports[1].status).tone, "green");
  const custom = { ...demoReports[0], id: "resident-report", status: "Submitted" as const, createdAt: "2026-10-23T10:00:00+08:00" };
  const migrated = restoreData(JSON.stringify({ reports: [custom] }));
  assert.equal(migrated.reports.length, 3);
  assert.equal(newestReports(migrated.reports)[0].id, custom.id);
  assert.equal(reportStatus(custom.status).label, "Under Review");
  assert.equal(restoreData(JSON.stringify(migrated)).reports.length, 3);
  assert.equal(restoreData(JSON.stringify({ ...migrated, reports: [] })).reports.length, 0);
  assert.ok(newestReports(migrated.reports) !== migrated.reports);
});

type Node = { type: any; props: Record<string, any> };
const nodes = (node: any): Node[] => node?.props ? [node, ...[node.props.children].flat(Infinity).flatMap(nodes)] : [];
const text = (node: any): string => typeof node === "string" || typeof node === "number" ? String(node) : node?.props ? [node.props.children].flat(Infinity).map(text).join("") : "";
function screen(path: string, deps: Record<string, any>) {
  const exports: Record<string, any> = {};
  const jsx = (type: any, props: any) => ({ type, props });
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(source, { exports, require(name: string) { if (name === "react/jsx-runtime") return { jsx, jsxs: jsx }; assert.ok(name in deps, name); return deps[name]; } });
  return exports.default;
}
const common = new Proxy({}, { get: (_, key) => String(key) });
const icons = new Proxy({}, { get: (_, key) => String(key) });
const theme = { colors: {}, fonts: {}, radius: {}, ui: {} };

test("submitting a report returns to the dashboard with newest-first status cards and photo thumbnails", async () => {
  let data = { ...initialData };
  let cursor = 0;
  const states: any[] = [], routes: string[] = [];
  const dependencies: Record<string, any> = {
    react: { useState(initial: any) { const i = cursor++; if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial; return [states[i], (value: any) => { states[i] = value; }]; } },
    "react-native": { View: "View", Image: "Image", Platform: { OS: "web" } },
    "expo-router": { router: { navigate: (path: string) => routes.push(path), push: (path: string) => routes.push(path) }, useLocalSearchParams: () => ({}) },
    "expo-image-picker": {}, "expo-file-system/legacy": {},
    "lucide-react-native": icons, "../components/Common": common, "../components/Action": { default: "Action" },
    "../lib/model": model, "../lib/reports": reports, "../lib/theme": theme,
    "../hooks/useAppToast": { useAppToast: () => () => {} },
    "../state/store": { useStore: () => ({ data, update: (fn: any) => { data = fn(data); } }) },
  };
  const Form = screen("../src/app/report.tsx", dependencies);
  const render = () => { cursor = 0; return Form(); };
  let tree = render();
  nodes(tree).find(n => n.props.accessibilityLabel === "Issue location")!.props.onChangeText("Central Park entrance");
  nodes(tree).find(n => n.props.accessibilityLabel === "Issue description")!.props.onChangeText("Broken railing beside the footpath");
  tree = render();
  nodes(tree).find(n => n.type === "Action" && n.props.label === "Submit report")!.props.onPress();
  await Promise.resolve();
  assert.equal(routes.at(-1), "/reports");
  assert.equal(data.reports[0].description, "Broken railing beside the footpath");
  assert.equal(data.reports[0].status, "Submitted");
  data = restoreData(JSON.stringify(data));
  data.reports[0].photos = ["file:///report-a.jpg", "file:///report-b.jpg"];
  const Dashboard = screen("../src/app/reports.tsx", dependencies);
  const dashboard = Dashboard();
  assert.ok(text(dashboard).indexOf("Broken railing") < text(dashboard).indexOf("Deep pothole"));
  for (const label of ["Under Review", "In Progress", "Resolved"]) assert.ok(text(dashboard).includes(label));
  assert.equal(nodes(dashboard).filter(n => n.type === "Image").length, 2);
  nodes(dashboard).find(n => n.type === "Action")!.props.onPress();
  assert.equal(routes.at(-1), "/report");
});

test("Profile and Settings feedback entries open My Reports first", () => {
  const routes: string[] = [];
  const deps: Record<string, any> = {
    react: { useState: (value: any) => [value, () => {}] }, "react-native": { View: "View", Modal: "Modal", Switch: "Switch" },
    "expo-router": { router: { push: (path: string) => routes.push(path) }, useLocalSearchParams: () => ({ section: "support" }) },
    "lucide-react-native": icons, "../components/Common": common, "../lib/theme": theme,
    "../state/store": { useStore: () => ({ data: initialData, update() {} }) }, "../../package.json": { version: "0.1.0" },
    ...Object.fromEntries(["ResidentAvatar", "PaymentMethodSheet", "MenuSheet", "LanguageSheet"].map(name => [`../components/${name}`, { default: name }])),
  };
  const profile = screen("../src/app/profile.tsx", deps)();
  nodes(profile).find(n => n.props.label === "Report Issue / Feedback")!.props.onPress();
  const settings = screen("../src/app/settings.tsx", deps)();
  nodes(settings).find(n => n.type === "PressableFeedback" && text(n).includes("Report an issue / feedback"))!.props.onPress();
  assert.deepEqual(routes, ["/reports", "/reports"]);
});
