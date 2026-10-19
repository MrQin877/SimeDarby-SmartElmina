import test from "node:test";
import assert from "node:assert/strict";
import { reportError, restoreData, toggleItem } from "../src/lib/model";
import { visiblePlaces, searchPlaces } from "../src/lib/data";
import { parseRoute, validCoordinate } from "../src/lib/routing";
test("report validation rejects empty locations, short text, excess photos", () => {
  assert.ok(
    reportError({
      location: "  ",
      description: "A fallen branch on the road",
      photos: [],
    }),
  );
  assert.ok(
    reportError({ location: "Park", description: "short", photos: [] }),
  );
  assert.ok(
    reportError({
      location: "Park",
      description: "A fallen branch on the road",
      photos: ["a", "b", "c", "d"],
    }),
  );
  assert.equal(
    reportError({
      location: "Park",
      description: "A fallen branch on the road",
      photos: [],
    }),
    null,
  );
});
test("corrupt local data does not crash startup", () => {
  assert.equal(restoreData("{bad").reports.length, 0);
  assert.deepEqual(
    restoreData('{"comments":[null],"liked":[1,"post"]}').liked,
    ["post"],
  );
});
test("reactions toggle without duplicates", () => {
  assert.deepEqual(toggleItem(toggleItem([], "a"), "a"), []);
});
test("map filters isolate camera and hazard markers", () => {
  assert.equal(visiblePlaces("CCTV").length, 3);
  assert.ok(visiblePlaces("CCTV").every((p) => p.kind === "camera"));
  assert.ok(visiblePlaces("Hazards").every((p) => p.kind === "hazard"));
});
test("search normalises whitespace and case and excludes camera fixtures", () => {
  assert.equal(searchPlaces("  LAKESIDE ")[0].id, "mall");
  assert.equal(searchPlaces("Camera").length, 0);
});
test("routing rejects invalid coordinates and missing routes", () => {
  assert.equal(validCoordinate([NaN, 3]), false);
  assert.equal(validCoordinate([181, 3]), false);
  assert.throws(() => parseRoute({ code: "NoRoute" }, "Park"));
});
test("route parser carries duration, geometry and turn instructions", () => {
  const route = parseRoute(
    {
      code: "Ok",
      routes: [
        {
          duration: 120,
          distance: 500,
          geometry: {
            coordinates: [
              [101.5, 3.1],
              [101.51, 3.12],
            ],
          },
          legs: [
            {
              steps: [
                {
                  name: "Park road",
                  distance: 500,
                  duration: 120,
                  maneuver: {
                    type: "turn",
                    modifier: "right",
                    location: [101.5, 3.1],
                    bearing_after: 90,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    "Park",
  );
  assert.equal(route.steps[0].instruction, "Continue right on Park road");
  assert.equal(route.duration, 120);
});
