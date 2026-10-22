import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { places } from "../src/lib/data";
import { canonicalShuttlePlace, elminaBusStops, liveBusLocation, shuttleMapPlaces, shuttleRouteCoordinates } from "../src/lib/shuttle-data";
import * as schedule from "../src/lib/shuttle-schedule";
import { filterMapPlaces } from "../src/lib/map-layers";
import { lineFeature } from "../src/lib/map";
const now = Date.parse("2026-10-23T00:25:00Z"); // 08:25 in Malaysia

test("S1 departures follow Malaysia time and later selections shift all ten arrivals", () => {
  const choices = schedule.followingDepartures("S1", now);
  assert.deepEqual(choices.map(d => d.label), ["08:30 AM", "08:50 AM", "09:10 AM", "09:30 AM"]);
  assert.equal(schedule.departureCountdown(choices[0].at, now), "5:00");
  assert.equal(schedule.departureCountdown(choices[1].at, now), "25:00");
  assert.equal(schedule.departureCountdown(choices[0].at, choices[0].at + 1), "Due now");
  const early = schedule.shuttleArrivals("S1", choices[0].at);
  const later = schedule.shuttleArrivals("S1", choices[1].at);
  assert.equal(later.length, 10);
  assert.deepEqual(later.slice(0, 3).map(s => s.time), ["08:50 AM", "08:55 AM", "09:01 AM"]);
  later.forEach((stop, i) => assert.equal(stop.at - early[i].at, 20 * 60000));
});

test("departures roll into the next service day after closing and T102 retains its own cadence", () => {
  const overnight = schedule.followingDepartures("S1", Date.parse("2026-10-23T15:59:00Z"));
  assert.equal(overnight[0].label, "06:30 AM");
  assert.equal(overnight[0].day, "24 Oct");
  assert.ok(overnight.every(d => d.at > Date.parse("2026-10-23T15:59:00Z")));
  const feeder = schedule.followingDepartures("T102", now);
  assert.equal(feeder[1].at - feeder[0].at, 15 * 60000);
  assert.equal(schedule.shuttleArrivals("T102", feeder[0].at).length, 3);
});

test("the shuttle layer has exactly the ten landmark stops, replacing legacy duplicates", () => {
  const stops = filterMapPlaces(shuttleMapPlaces(places), "shuttle");
  assert.equal(stops.length, 10);
  assert.equal(new Set(stops.map(s => s.id)).size, 10);
  assert.deepEqual(stops.map(s => s.coordinate), [[101.51425,3.17901],[101.516,3.1765],[101.5035,3.197],[101.508,3.201],[101.5099,3.18133],[101.524,3.173],[101.519,3.188],[101.528,3.16],[101.522,3.161],[101.534,3.163]]);
  assert.equal(canonicalShuttlePlace(places.find(p => p.id === "atmosfera-stop")!).id, "bus-stop-2");
});

test("the cached street route is continuous and closed, approaches every stop, and contains the demo bus", () => {
  assert.ok(shuttleRouteCoordinates.length > 100);
  assert.deepEqual(shuttleRouteCoordinates[0], shuttleRouteCoordinates.at(-1));
  assert.equal(lineFeature(shuttleRouteCoordinates).features.length, 1);
  assert.ok(shuttleRouteCoordinates.some(p => p[0] === liveBusLocation.coordinate[0] && p[1] === liveBusLocation.coordinate[1]));
  for (const stop of elminaBusStops) {
    const distance = Math.min(...shuttleRouteCoordinates.map(p => Math.hypot((p[0] - stop.coordinate[0]) * 111000, (p[1] - stop.coordinate[1]) * 111000)));
    assert.ok(distance < 150, `${stop.name}: ${distance}m from road`);
  }
});

type Node = { type: unknown; props: Record<string, any> };
function nodes(node: any): Node[] { return node && typeof node === "object" && node.props ? [node, ...[node.props.children].flat(Infinity).flatMap(nodes)] : []; }
function text(node: any): string { if (typeof node === "string" || typeof node === "number") return String(node); if (!node || typeof node !== "object") return ""; return [node.props?.children].flat(Infinity).map(text).join(" "); }

test("real departure chip handlers update selection, countdown, and rendered arrival times", () => {
  const state: any[] = [];
  let reminderOpen = false;
  let editingData = { busReminders: [] as import("../src/lib/bus-reminders").BusReminder[] };
  const notices: string[] = [];
  let cursor = 0;
  const jsx = (type: unknown, props: Node["props"]): Node => ({ type, props });
  const dependencies: Record<string, any> = {
    react: { useEffect() {}, useState: (initial: unknown) => { const i = cursor++; if (!(i in state)) state[i] = typeof initial === "function" ? initial() : initial; return [state[i], (next: unknown) => { state[i] = next; }]; } },
    "react/jsx-runtime": { jsx, jsxs: jsx }, "react-native": { View: "View" },
    "./Common": { Badge: "Badge", Button: Object.assign(() => {}, { Label: "ButtonLabel" }), Description: "Description", DemoNote: "DemoNote", Surface: "Surface", Typography: Object.assign(() => {}, { Heading: "Heading" }) },
    "lucide-react-native": { Bell: "Bell" }, "./BusReminderForm": { default: "BusReminderForm" }, "./LineTabs": { default: "LineTabs" }, "./RoadCorridorContent": {}, "./RoutingSheet": {},
    "react-native-reanimated": { default: { View: "AnimatedView" } },
    "../hooks/useSheetContentTransition": { useSheetContentTransition: () => ({}) },
    "../state/store": { useStore: () => ({ data: editingData, update: (fn: any) => { editingData = fn(editingData); } }) },
    "../hooks/useAppToast": { useAppToast: () => (message: string) => notices.push(message) },
    "../lib/theme": { colors: {}, fonts: {}, ui: {} }, "../lib/shuttle-schedule": schedule,
  };
  const exports: Record<string, any> = {};
  const source = ts.transpileModule(readFileSync(new URL("../src/components/MobilitySheets.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  class Clock extends Date { static now() { return now; } }
  runInNewContext(source, { exports, Date: Clock, require(name: string) { assert.ok(name in dependencies, name); return dependencies[name]; } });
  const render = () => { cursor = 0; return exports.ShuttleContent({ onFocusBus() {}, onClose() {}, reminderOpen, onReminderOpenChange(value: boolean) { reminderOpen = value; } }); };
  const before = render();
  assert.ok(text(before).includes("5:00"));
  const chip = nodes(before).find(n => n.props.accessibilityLabel?.startsWith("Departure 08:50 AM"))!;
  chip.props.onPress();
  const after = render();
  const selected = nodes(after).find(n => n.props.accessibilityLabel?.startsWith("Departure 08:50 AM"))!;
  assert.equal(selected.props.accessibilityState.selected, true);
  assert.ok(text(after).includes("25:00"));
  for (const label of ["08:55 AM", "09:01 AM"]) assert.ok(text(after).includes(label));
  for (const stop of elminaBusStops) assert.ok(text(after).includes(stop.name));
  for (const removed of ["Wheelchair Ramp", "Audio Announcements", "Low-Floor Entry"]) assert.ok(!text(after).includes(removed));
  assert.ok(text(after).indexOf("FOLLOWING DEPARTURES") < text(after).indexOf("NEXT DEPARTURE"));
  nodes(after).find(n => text(n).trim() === "Set Reminder" && typeof n.props.onPress === "function")!.props.onPress();
  const reminder = nodes(render()).find(n => n.type === "BusReminderForm")!;
  assert.equal(reminder.props.open, true);
  const page = nodes(render()).find(n => n.props.accessibilityElementsHidden === true)!;
  assert.equal(page.props.style.display, "none", "schedule content is replaced while configuring a reminder");
  assert.equal(reminder.props.routeId, "S1");
  assert.equal(reminder.props.departureAt, schedule.followingDepartures("S1", now)[1].at);
  reminder.props.onOpenChange(false);
  assert.equal(nodes(render()).find(n => n.type === "BusReminderForm")!.props.open, false);
  editingData = { busReminders: [{ id: "saved", routeId: "S1", stopId: "bus-stop-1", stopName: "Central Park", departureTime: "08:50 AM", scheduledTime: schedule.followingDepartures("S1", now)[1].at, leadMinutes: 15, active: true }] };
  let tree = render();
  nodes(tree).find(n => n.props.accessibilityLabel === "Edit reminder for Central Park")!.props.onPress();
  assert.equal(nodes(render()).find(n => n.type === "BusReminderForm")!.props.reminder.id, "saved");
  assert.equal(reminderOpen, true);
  reminder.props.onOpenChange(false);
  tree = render();
  nodes(tree).find(n => n.props.accessibilityLabel === "Cancel reminder for Central Park")!.props.onPress();
  assert.equal(editingData.busReminders[0].active, false);
  assert.ok(editingData.busReminders[0].dismissedAt);
  assert.ok(notices.includes("Reminder cancelled."));
  nodes(after).find(n => n.type === "LineTabs")!.props.onChange("T102");
  assert.ok(text(render()).includes("Elmina Green → MRT Feeder"));
});
