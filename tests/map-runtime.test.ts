import test from "node:test";
import assert from "node:assert/strict";
import { lineFeature, routeBounds, trafficLines } from "../src/lib/map";
import { runCameraCommand } from "../src/lib/native-camera";
import type { Coordinate } from "../src/lib/data";

test("map lines discard degenerate points and split invalid gaps without bridging them", () => {
  const a: Coordinate = [101.51, 3.17], b: Coordinate = [101.52, 3.18], c: Coordinate = [101.53, 3.19], d: Coordinate = [101.54, 3.20];
  assert.equal(lineFeature([]).features.length, 0);
  assert.equal(lineFeature([a, a, a]).features.length, 0);
  assert.deepEqual(lineFeature([a, a, b]).features[0].geometry.coordinates, [a, b]);
  const split = lineFeature([a, b, [NaN, 3], c, d]);
  assert.deepEqual(split.features.map((feature) => feature.geometry.coordinates), [[a, b], [c, d]]);
  assert.equal(lineFeature([[181, 3], [101, 91]]).features.length, 0);
  const segmented = lineFeature([], [[a], [a, b], [c, c], [c, d]]);
  assert.equal(segmented.features.length, 2);
  for (const feature of trafficLines.features) {
    assert.ok(feature.geometry.coordinates.length > 1);
    assert.ok(feature.properties?.corridorId);
  }
});

test("camera bounds remain finite for empty, invalid and large routes", () => {
  const empty = routeBounds([]);
  assert.ok(empty.flat().every(Number.isFinite));
  const single = routeBounds([[101.5, 3.2], [Infinity, 3]]);
  assert.ok(single[0][0] < single[1][0] && single[0][1] < single[1][1]);
  const large = routeBounds(Array.from({ length: 150000 }, (_, index) => [101 + index / 1000000, 3] as Coordinate));
  assert.ok(large.flat().every(Number.isFinite));
});

test("native camera commands skip stale views and contain asynchronous teardown failures", async () => {
  let invoked = false;
  const errors: unknown[] = [];
  await runCameraCommand(() => false, () => { invoked = true; }, (error) => errors.push(error));
  assert.equal(invoked, false);
  await runCameraCommand(() => true, () => Promise.reject(new Error("Invalid reactTag 123, could not find MLRNCamera")), (error) => errors.push(error));
  assert.equal(errors.length, 0);
  await runCameraCommand(() => true, () => { throw new Error("NativeCameraComponent ref is null, wait for the map being initialized"); }, (error) => errors.push(error));
  assert.equal(errors.length, 0);
  const unexpected = new Error("Invalid camera options");
  await runCameraCommand(() => true, () => Promise.reject(unexpected), (error) => errors.push(error));
  assert.equal(errors.length, 1);
  assert.equal(errors[0], unexpected);
  let current = true;
  await runCameraCommand(() => current, async () => { current = false; throw new Error("View removed"); }, (error) => errors.push(error));
  assert.equal(errors.length, 1);
});
