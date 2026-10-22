import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { advanceBusReminders, createBusReminder, malaysiaDayStart, reminderDepartures, restoreBusReminders } from "../src/lib/bus-reminders";
import * as reminders from "../src/lib/bus-reminders";
import * as schedule from "../src/lib/shuttle-schedule";
import { restoreData } from "../src/lib/model";
const now = Date.parse("2026-10-23T00:25:00Z");
const departure = Date.parse("2026-10-23T00:50:00Z");

test("reminders use chosen-stop arrival, selected lead time, and the current route", () => {
  const reminder = createBusReminder("S1", "bus-stop-3", departure, 15, now);
  assert.equal(reminder.scheduledTime, departure + 11 * 60000);
  assert.equal(reminder.departureTime, "08:50 AM");
  assert.equal(reminder.active, true);
  const feeder = createBusReminder("T102", "t102-3", departure - 5 * 60000, 20, now);
  assert.equal(feeder.scheduledTime, departure + 13 * 60000);
  assert.equal(feeder.routeId, "T102");
});

test("Malaysia dates roll over correctly, with distinct Today and Tomorrow service options", () => {
  assert.equal(new Date(malaysiaDayStart(now)).toISOString(), "2026-10-22T16:00:00.000Z");
  const today = reminderDepartures("S1", now);
  const tomorrow = reminderDepartures("S1", now + 86400000);
  assert.equal(today[0].label, "06:30 AM");
  assert.equal(tomorrow[0].at - today[0].at, 86400000);
  assert.equal(today[1].at - today[0].at, 20 * 60000);
  assert.equal(reminderDepartures("T102", now)[1].at - reminderDepartures("T102", now)[0].at, 15 * 60000);
});

test("invalid, past, and off-timetable reminders are rejected", () => {
  for (const [stop, time, lead] of [["missing", departure, 15], ["bus-stop-1", NaN, 15], ["bus-stop-1", departure, 12], ["bus-stop-1", departure + 60000, 15], ["bus-stop-1", departure, 15]] as const) {
    assert.throws(() => createBusReminder("S1", stop, time, lead, time === departure && stop === "bus-stop-1" && lead === 15 ? departure : now));
  }
});

test("the scheduler fires once at each lead threshold and does not write before it is due", () => {
  for (const lead of [10, 15, 20]) {
    const reminder = createBusReminder("S1", "bus-stop-2", departure, lead, now);
    const items = [reminder];
    const deadline = reminder.scheduledTime - lead * 60000;
    assert.equal(advanceBusReminders(items, deadline - 1), items);
    const fired = advanceBusReminders(items, deadline);
    assert.equal(fired[0].triggeredAt, deadline);
    assert.equal(fired[0].active, false);
    assert.equal(advanceBusReminders(fired, deadline + 1), fired);
  }
});

test("resuming during the lead window fires immediately, while missed arrivals expire quietly", () => {
  const reminder = createBusReminder("S1", "bus-stop-1", departure, 15, now);
  const fired = advanceBusReminders([reminder], departure - 5 * 60000);
  assert.ok(fired[0].triggeredAt);
  const expired = advanceBusReminders([reminder], departure + 1);
  assert.equal(expired[0].active, false);
  assert.equal(expired[0].triggeredAt, undefined);
  assert.ok(expired[0].dismissedAt);
  assert.ok(advanceBusReminders(fired, departure)[0].dismissedAt);
});

test("reminders survive storage restoration, dismissal and older app data", () => {
  const reminder = createBusReminder("S1", "bus-stop-1", departure, 15, now);
  const fired = advanceBusReminders([reminder], departure - 15 * 60000);
  const dismissed = [{ ...fired[0], dismissedAt: now }];
  assert.deepEqual(restoreData(JSON.stringify({ busReminders: dismissed })).busReminders, dismissed);
  assert.equal(advanceBusReminders(dismissed, departure - 60000), dismissed);
  assert.deepEqual(restoreData("{}").busReminders, []);
  assert.deepEqual(restoreBusReminders([null, { ...reminder, leadMinutes: "15" }, { ...reminder, scheduledTime: null }, reminder, reminder]), [reminder]);
});

// Exercise the real modal handlers without loading React Native's native runtime in Node.
test("the reminder form defaults to the current stop/departure, cancels without saving, and commits chosen date/lead", () => {
  type Node = { type: unknown; props: Record<string, any> };
  const states: any[] = [], deps: any[] = [], effects: (() => void)[] = [];
  let cursor = 0;
  let data = { busReminders: [] as reminders.BusReminder[] };
  let open = true;
  const notices: string[] = [];
  const jsx = (type: unknown, props: Node["props"]) => ({ type, props });
  const Button = Object.assign(() => {}, { Label: "ButtonLabel" });
  const modules: Record<string, any> = {
    react: {
      useState(initial: any) { const i = cursor++; if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial; return [states[i], (value: any) => { states[i] = value; }]; },
      useEffect(effect: () => void, dependencies: any[]) { const i = cursor++; if (!deps[i] || dependencies.some((v, n) => v !== deps[i][n])) effects.push(effect); deps[i] = dependencies; },
    },
    "react/jsx-runtime": { jsx, jsxs: jsx }, "react-native": { View: "View" },
    "@gorhom/bottom-sheet": { BottomSheetScrollView: "ScrollView" },
    "lucide-react-native": { Bell: "Bell", ChevronDown: "ChevronDown" },
    "./Common": { Button, Surface: "Surface", Typography: "Typography" },
    "./MenuSheet": { default: "MenuSheet" },
    "../state/store": { useStore: () => ({ update: (fn: any) => { data = fn(data); } }) },
    "../hooks/useAppToast": { useAppToast: () => (message: string) => notices.push(message) },
    "../lib/bus-reminders": reminders, "../lib/shuttle-schedule": schedule,
    "../lib/theme": { colors: {}, ui: {} },
  };
  const exports: Record<string, any> = {};
  class Clock extends Date { static now() { return now; } }
  const source = ts.transpileModule(readFileSync(new URL("../src/components/BusReminderModal.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(source, { exports, Date: Clock, require: (name: string) => { assert.ok(name in modules, name); return modules[name]; } });
  const render = (): Node => {
    cursor = 0;
    const tree = exports.default({ open, onOpenChange: (value: boolean) => { open = value; }, routeId: "S1", stopId: "bus-stop-3", departureAt: departure });
    if (effects.length) { effects.splice(0).forEach(effect => effect()); return render(); }
    return tree;
  };
  const nodes = (node: any): Node[] => node?.props ? [node, ...[node.props.children].flat(Infinity).flatMap(nodes)] : [];
  const content = (node: any): string => typeof node === "string" || typeof node === "number" ? String(node) : node?.props ? [node.props.children].flat(Infinity).map(content).join("") : "";
  const click = (label: string) => { const button = nodes(render()).find(n => n.type === Button && (n.props.accessibilityLabel === label || content(n) === label)); assert.ok(button, label); button.props.onPress(); };
  assert.ok(content(render()).includes("Elmina Green Lake Park"));
  assert.ok(content(render()).includes("08:50 AM"));
  click("Cancel");
  assert.equal(open, false);
  assert.equal(data.busReminders.length, 0);
  render(); open = true; render();
  click("Tomorrow"); click("20 minutes");
  click("Set Reminder");
  assert.equal(open, false);
  assert.equal(data.busReminders.length, 1);
  assert.equal(data.busReminders[0].stopId, "bus-stop-3");
  assert.equal(data.busReminders[0].leadMinutes, 20);
  assert.equal(malaysiaDayStart(data.busReminders[0].scheduledTime), malaysiaDayStart(now) + 86400000);
  assert.ok(notices[0].startsWith("Reminder scheduled for Elmina Green Lake Park at"));
});
