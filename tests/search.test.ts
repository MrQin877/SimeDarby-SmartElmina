import test from "node:test";
import assert from "node:assert/strict";
import { rememberSearch } from "../src/lib/search";
import { initialData, restoreData } from "../src/lib/model";
import { places, searchPlaces } from "../src/lib/data";

test("recent searches move selected destinations to the front without duplicates and are bounded", () => {
  assert.deepEqual(rememberSearch(["park", "mall", "entrance"], "mall"), ["mall", "park", "entrance"]);
  const history = rememberSearch(Array.from({ length: 25 }, (_, index) => `place-${index}`), "new");
  assert.equal(history.length, 20);
  assert.equal(history[0], "new");
});

test("old profiles gain recent samples; cleared history and a configured work shortcut survive reload", () => {
  assert.deepEqual(restoreData('{}').recentSearches, initialData.recentSearches);
  initialData.recentSearches.forEach((id) => assert.ok(places.some((place) => place.id === id)));
  const restored = restoreData(JSON.stringify({ recentSearches: [], workPlaceId: "mall" }));
  assert.deepEqual(restored.recentSearches, []);
  assert.equal(restored.workPlaceId, "mall");
  assert.deepEqual(restoreData('{"recentSearches":[null,4,"park","park","mall"]}').recentSearches, ["park", "mall"]);
});

test("search finds the preview locations and transit shortcut without exposing camera markers", () => {
  assert.ok(searchPlaces("  BUS STOP ").some((place) => place.id === "atmosfera-stop"));
  assert.ok(searchPlaces("Temu").some((place) => place.id === "temu-hub"));
  assert.ok(searchPlaces("Rainbow").some((place) => place.id === "rainbow-bridge"));
  assert.ok(!searchPlaces("").some((place) => place.kind === "camera" || place.kind === "hazard"));
});
