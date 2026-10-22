import test from "node:test";
import assert from "node:assert/strict";
import { initialData, restoreData } from "../src/lib/model";
import { restoreShortcuts, upsertShortcut, type ShortcutItem } from "../src/lib/shortcuts";

const gym: ShortcutItem = { id: "gym", title: "Gym", address: "Elmina Lakeside Mall", placeId: "mall", iconName: "dumbbell" };

test("existing profiles gain unset Home and empty custom shortcuts while preserving Work", () => {
  const data = restoreData(JSON.stringify({ workPlaceId: "mall" }));
  assert.equal(data.homePlaceId, null);
  assert.equal(data.workPlaceId, "mall");
  assert.deepEqual(data.shortcuts, []);
});

test("shortcut creation, edits, deletion and protected slot resets survive storage reload", () => {
  let data = { ...initialData, homePlaceId: "home-valley-3", workPlaceId: "mall", shortcuts: upsertShortcut([], gym) };
  const school: ShortcutItem = { ...gym, id: "school", title: "School", iconName: "graduation-cap" };
  data.shortcuts = upsertShortcut(data.shortcuts, school);
  data.shortcuts = upsertShortcut(data.shortcuts, { ...gym, title: "Fitness" });
  assert.deepEqual(data.shortcuts.map((s) => s.title), ["Fitness", "School"]);
  const restored = restoreData(JSON.stringify(data));
  assert.equal(restored.homePlaceId, "home-valley-3");
  assert.equal(restored.workPlaceId, "mall");
  assert.deepEqual(restored.shortcuts, data.shortcuts);
  const reset = restoreData(JSON.stringify({ ...restored, homePlaceId: null, workPlaceId: null, shortcuts: restored.shortcuts.filter((s) => s.id !== "gym") }));
  assert.equal(reset.homePlaceId, null);
  assert.equal(reset.workPlaceId, null);
  assert.deepEqual(reset.shortcuts, [school]);
});

test("restoration rejects malformed, duplicate and protected custom slots and repairs unknown icons", () => {
  assert.deepEqual(restoreShortcuts([null, {}, { ...gym, id: "home" }, { ...gym, id: "work" }, { ...gym, title: " " }, gym, gym]), [gym]);
  assert.deepEqual(upsertShortcut([gym], { ...gym, id: "home" }), [gym]);
  assert.equal(restoreShortcuts([{ ...gym, iconName: "unsupported" }])[0].iconName, "map-pin");
  assert.equal(restoreShortcuts(Array.from({ length: 25 }, (_, i) => ({ ...gym, id: String(i) }))).length, 20);
});
