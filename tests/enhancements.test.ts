import test from "node:test";
import assert from "node:assert/strict";
import { cctvTelemetry, getCCTVTelemetry, places, CENTER } from "../src/lib/data";
import { restoreData, initialData } from "../src/lib/model";
import { demoRouteOptions, requestDrivingOptions, requestWalkingOptions, requestTransitOptions } from "../src/lib/journey-planner";

const origin = { id: "origin", name: "Demo start", subtitle: "", kind: "place" as const, coordinate: CENTER };
const destination = places.find((place) => place.id === "kwasa-hub")!;

test("all map cameras resolve to distinct telemetry with consistent classification shares", () => {
  const cameras = places.filter((place) => place.kind === "camera");
  assert.equal(cameras.length, 3);
  assert.deepEqual(cameras.map((camera) => getCCTVTelemetry(camera.id)?.detectedSpeed.value), ["74 km/h", "38 km/h", "45 km/h"]);
  assert.equal(new Set(cameras.map((camera) => getCCTVTelemetry(camera.id)?.id)).size, 3);
  cctvTelemetry.forEach((camera) => {
    assert.equal(Object.values(camera.vehicleClassification).reduce((sum, value) => sum + value, 0), 100);
    assert.ok(camera.detections.length >= 2);
  });
  assert.equal(getCCTVTelemetry("unknown"), undefined);
});

test("older saved profiles gain defaults and edited email verification remains pending", () => {
  const restored = restoreData(JSON.stringify({ name: "Kamal", fullName: "Kamal Chan", phone: "0123456789" }));
  assert.equal(restored.name, "Kamal");
  assert.equal(restored.email, initialData.email);
  assert.equal(restored.unitId, initialData.unitId);
  const edited = restoreData(JSON.stringify({ ...restored, email: "new@example.com", emailVerified: false, residentId: "unmasked-identity" }));
  assert.equal(edited.emailVerified, false);
  assert.equal(edited.residentId, "900512-10-XXXX");
});

test("preview routes never draw invented geometry and retain destination instructions", () => {
  for (const mode of ["drive", "transit", "walk"] as const) {
    const options = demoRouteOptions(origin, destination, mode);
    assert.equal(options.length, mode === "drive" ? 2 : mode === "transit" ? 3 : 1);
    options.forEach((option) => {
      assert.deepEqual(option.coordinates, []);
      assert.deepEqual(option.steps.at(-1)?.coordinate, destination.coordinate);
      assert.equal(option.steps.at(-1)?.instruction, `Arrive at ${destination.name}`);
      assert.equal(option.steps.at(-1)?.duration, 0);
      assert.ok(option.duration > 0 && option.distance > 0);
      assert.ok(option.delay * 60 <= option.duration);
      assert.equal(option.isDemo, true);
    });
  }
  assert.deepEqual(demoRouteOptions(origin, origin, "drive"), []);
  const reversed = demoRouteOptions(destination, origin, "drive")[0];
  assert.deepEqual(reversed.coordinates, []);
  assert.deepEqual(reversed.steps.at(-1)?.coordinate, origin.coordinate);
});

test("driving request uses both selected locations and parses alternative road routes", async () => {
  const previousFetch = globalThis.fetch;
  let requested = "";
  globalThis.fetch = (async (url: string | URL | Request) => {
    requested = String(url);
    const route = { duration: 840, distance: 6800, geometry: { coordinates: [origin.coordinate, destination.coordinate] }, legs: [{ steps: [{ name: "Road", distance: 6800, duration: 840, maneuver: { type: "depart", location: origin.coordinate } }, { distance: 0, duration: 0, maneuver: { type: "arrive", location: destination.coordinate } }] }] };
    return new Response(JSON.stringify({ code: "Ok", routes: [route, { ...route, duration: 1080 }] }), { status: 200 });
  }) as typeof fetch;
  try {
    const routes = await requestDrivingOptions(origin, destination, new AbortController().signal);
    assert.ok(requested.includes(`${origin.coordinate.join(",")};${destination.coordinate.join(",")}`));
    assert.ok(requested.includes("alternatives=true"));
    assert.equal(routes.length, 2);
    assert.equal(routes[1].duration, 1080);
    assert.equal(routes[0].isDemo, false);
  } finally { globalThis.fetch = previousFetch; }
});


test("walking uses a pedestrian routing server and preserves its curved path and instructions", async () => {
  const previousFetch = globalThis.fetch;
  const previousEndpoint = process.env.EXPO_PUBLIC_WALKING_ROUTING_URL;
  process.env.EXPO_PUBLIC_WALKING_ROUTING_URL = "https://walking.test";
  let requested = "";
  const coordinates = [origin.coordinate, [101.512, 3.1802], [101.520, 3.1802], [101.528, 3.177], destination.coordinate];
  globalThis.fetch = (async (url: string | URL | Request) => {
    requested = String(url);
    return new Response(JSON.stringify({ code: "Ok", routes: [{ duration: 2400, distance: 6400, geometry: { coordinates }, legs: [{ steps: [
      { name: "Mapped pedestrian crossing", distance: 6400, duration: 2400, maneuver: { type: "depart", location: coordinates[0] } },
      { distance: 0, duration: 0, maneuver: { type: "arrive", location: coordinates.at(-1) } },
    ] }] }] }));
  }) as typeof fetch;
  try {
    const [route] = await requestWalkingOptions(origin, destination, new AbortController().signal);
    assert.ok(requested.startsWith("https://walking.test/route/v1/foot/"));
    assert.deepEqual(route.coordinates, coordinates);
    assert.equal(route.geometrySource, "walking-service");
    assert.ok(route.steps[0].instruction.includes("Mapped pedestrian crossing"));
    assert.equal(route.duration, 2400);
  } finally { globalThis.fetch = previousFetch; if (previousEndpoint === undefined) delete process.env.EXPO_PUBLIC_WALKING_ROUTING_URL; else process.env.EXPO_PUBLIC_WALKING_ROUTING_URL = previousEndpoint; }
});

test("transit joins mapped walking and bus-road legs without drawing artificial connector segments", async () => {
  const previousFetch = globalThis.fetch;
  const previousEndpoint = process.env.EXPO_PUBLIC_WALKING_ROUTING_URL;
  process.env.EXPO_PUBLIC_WALKING_ROUTING_URL = "https://transit-walking.test";
  const requests: string[] = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    const value = String(url); requests.push(value);
    const points = value.split("/route/v1/")[1].split("/")[1].split("?")[0].split(";").map((point) => point.split(",").map(Number));
    return new Response(JSON.stringify({ code: "Ok", routes: [{ duration: 300, distance: 1200, geometry: { coordinates: points }, legs: [{ steps: [
      { name: "Mapped road", distance: 1200, duration: 300, maneuver: { type: "depart", location: points[0] } },
      { distance: 0, duration: 0, maneuver: { type: "arrive", location: points.at(-1) } },
    ] }] }] }));
  }) as typeof fetch;
  try {
    const routes = await requestTransitOptions(origin, destination, new AbortController().signal);
    assert.equal(routes.length, 3);
    assert.ok(requests.some((url) => url.includes("/foot/")));
    assert.ok(requests.some((url) => url.includes("/driving/") && url.split(";").length === 3));
    routes.forEach((route) => {
      assert.ok(route.segments && route.segments.length >= 2);
      assert.deepEqual(route.coordinates, route.segments.flat());
      assert.equal(route.steps.at(-1)?.instruction, `Arrive at ${destination.name}`);
      assert.equal(route.isDemo, true); // Proposed services remain a demo, despite real network geometry.
    });
    const { lineFeature } = await import("../src/lib/map");
    const route = routes[0];
    assert.equal(lineFeature(route.coordinates, route.segments).features.length, route.segments!.length);
  } finally { globalThis.fetch = previousFetch; if (previousEndpoint === undefined) delete process.env.EXPO_PUBLIC_WALKING_ROUTING_URL; else process.env.EXPO_PUBLIC_WALKING_ROUTING_URL = previousEndpoint; }
});
