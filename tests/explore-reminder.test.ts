import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as dataModule from "../src/lib/data";
import * as shuttle from "../src/lib/shuttle-data";
import * as reminders from "../src/lib/bus-reminders";
import * as sheet from "../src/lib/sheet";
import * as layers from "../src/lib/map-layers";
import { initialData } from "../src/lib/model";

type Node = { type: any; props: Record<string, any> };
const nodes = (node: any): Node[] => node?.props ? [node, ...[node.props.children].flat(Infinity).flatMap(nodes)] : [];

test("the map pill leaves a 16px Locate gap, opens its stop's management view, and hides for search/navigation", () => {
  const now = Date.parse("2026-10-23T00:25:00Z");
  const reminder = reminders.createBusReminder("S1", "bus-stop-3", Date.parse("2026-10-23T00:50:00Z"), 15, now);
  let data = { ...initialData, busReminders: [reminder] };
  const states: any[] = [];
  let cursor = 0;
  const jsx = (type: any, props: any) => ({ type, props });
  const deps: Record<string, any> = {
    react: { useState(initial: any) { const i = cursor++; if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial; return [states[i], (value: any) => { states[i] = typeof value === "function" ? value(states[i]) : value; }]; }, useEffect() {}, useCallback: (fn: any) => fn, useMemo: (fn: any) => fn(), useRef: () => ({ current: { scrollTo() {} } }) },
    "react/jsx-runtime": { jsx, jsxs: jsx }, "react-native": { View: "View", Pressable: "Pressable", ScrollView: "ScrollView", StyleSheet: { create: (styles: any) => styles }, Keyboard: { dismiss() {} } },
    "expo-router": { router: { setParams() {} }, useFocusEffect() {}, useLocalSearchParams: () => ({}) },
    "react-native-safe-area-context": { useSafeAreaInsets: () => ({ top: 20, bottom: 34 }) }, "expo-location": {},
    "lucide-react-native": new Proxy({}, { get: (_, key) => String(key) }),
    "../../lib/data": dataModule, "../../lib/shuttle-data": shuttle, "../../lib/bus-reminders": reminders,
    "../../lib/sheet": sheet, "../../lib/map-layers": layers,
    "../../lib/model": {}, "../../lib/journey-planner": { demoRouteOptions: () => [] }, "../../lib/routing": {},
    "../../lib/theme": { colors: {}, fonts: {}, radius: {}, ui: {} },
    "../../state/store": { useStore: () => ({ data, update() {} }) },
    "../../hooks/useAppToast": { useAppToast: () => () => {} },
    "../../hooks/useRouteOptions": { useRouteOptions: () => ({ options: [], loading: false, message: null }) },
    "../../components/ExploreSheetContext": { useExploreSheetVisibility: () => () => {} },
    "../../components/Common": new Proxy({}, { get: (_, key) => String(key) }),
    "../../components/MobilitySheets": { ShuttleContent: "ShuttleContent", PlanJourneyContent: "PlanJourneyContent", TrafficDetailsContent: "TrafficDetailsContent" },
    ...Object.fromEntries(["BusReminderPill", "TownshipMap", "DraggableSheet", "MenuSheet", "JourneyOverlay", "SearchOverlay", "CameraFeed", "Action"].map(name => [`../../components/${name}`, { default: name }])),
  };
  const exports: Record<string, any> = {};
  class Clock extends Date { static now() { return now; } }
  const source = ts.transpileModule(readFileSync(new URL("../src/app/(tabs)/explore.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(source, { exports, Date: Clock, require(name: string) { assert.ok(name in deps, name); return deps[name]; } });
  const render = () => { cursor = 0; return exports.default(); };
  let tree = render();
  const bar = nodes(tree).find(n => n.props.style?.bottom === 12)!;
  assert.equal(bar.props.style.gap, 16);
  assert.equal(nodes(bar).filter(n => n.type === "IconButton" && n.props.label === "Show my location").length, 1);
  const pill = nodes(tree).find(n => n.type === "BusReminderPill")!;
  assert.equal(pill.props.reminder.id, reminder.id);
  pill.props.onPress();
  tree = render();
  const content = nodes(tree).find(n => n.type === "ShuttleContent")!;
  assert.equal(content.props.stopId, "bus-stop-3");
  assert.equal(content.props.managedReminder.id, reminder.id);
  assert.equal(nodes(tree).find(n => n.type === "DraggableSheet")!.props.index, 1);
  nodes(tree).find(n => n.type === "CloseButton" && n.props.accessibilityLabel === "Close map details")!.props.onPress();
  tree = render();
  nodes(tree).find(n => n.props.accessibilityLabel === "Search destination")!.props.onPress();
  assert.ok(!nodes(render()).some(n => n.type === "BusReminderPill"));
  nodes(render()).find(n => n.type === "SearchOverlay")!.props.onClose();
  tree = render();
  nodes(tree).find(n => n.type === "TownshipMap")!.props.onSelect(dataModule.places.find(p => p.kind === "place"));
  tree = render();
  nodes(tree).find(n => n.type === "Action" && n.props.label === "Directions / Plan Journey")!.props.onPress();
  nodes(render()).find(n => n.type === "PlanJourneyContent")!.props.onStart({ coordinates: [[101.5, 3.1], [101.51, 3.11]], steps: [{ coordinate: [101.5, 3.1] }] });
  assert.ok(!nodes(render()).some(n => n.type === "BusReminderPill"));
  nodes(render()).find(n => n.type === "JourneyOverlay")!.props.onExit();
  data = { ...data, busReminders: [{ ...reminder, active: false, dismissedAt: now }] };
  assert.ok(!nodes(render()).some(n => n.type === "BusReminderPill"));
});
