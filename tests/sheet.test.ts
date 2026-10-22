import test from "node:test";
import assert from "node:assert/strict";
import { nearestSnap, sheetSnapPoints, routingSnapPoints, toggledSheetSnap } from "../src/lib/sheet";

test("sheet heights stay inside the map on compact and landscape viewports", () => {
  for (const height of [300, 500, 700, 1000]) {
    const points = sheetSnapPoints(height);
    assert.ok(points[0] < points[1] && points[1] < points[2]);
    assert.ok(points[2] <= height * 0.8);
  }
  assert.deepEqual(sheetSnapPoints(1000), [220, 440, 800]);
});

test("sheet release snaps to the closest height and respects swipe direction", () => {
  const points = [220, 440, 640];
  assert.equal(nearestSnap(points, 230), 0);
  assert.equal(nearestSnap(points, 460), 1);
  assert.equal(nearestSnap(points, 600), 2);
  assert.equal(nearestSnap(points, 440, -1.5), 2);
  assert.equal(nearestSnap(points, 440, 1.5), 0);
});

test("routing has a 120px peek, 340px overview and reading panel over the search bar", () => {
  assert.deepEqual(routingSnapPoints(900, 44), [120, 340, 848]);
  for (const height of [240, 400, 700, 1000]) {
    const points = routingSnapPoints(height, 30);
    assert.ok(points[0] < points[1] && points[1] < points[2]);
    assert.ok(points[2] <= height - 30);
  }
});

test("header taps toggle only full and middle while swipes can still reach peek", () => {
  assert.equal(toggledSheetSnap(0), 2);
  assert.equal(toggledSheetSnap(1), 2);
  assert.equal(toggledSheetSnap(2), 1);
  assert.equal(nearestSnap([120, 340, 800], 130), 0);
});
