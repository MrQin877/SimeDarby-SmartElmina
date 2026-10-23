import test from "node:test";
import assert from "node:assert/strict";
import { announcementMapPlaces } from "../src/lib/map-layers";
import { ANNOUNCEMENT_EXPAND_ZOOM, clusterAnnouncementMarkers } from "../src/lib/announcement-clusters";
import { places, type Place } from "../src/lib/data";
const fixtures = announcementMapPlaces(places);
const notices = fixtures.filter(place => place.announcementId);

test("wide clusters group different facility types without losing or duplicating any markers", () => {
  const result = clusterAnnouncementMarkers(fixtures, 9);
  const represented = [...result.places, ...result.clusters.flatMap(cluster => cluster.members)];
  assert.deepEqual(new Set(represented.map(p => p.id)), new Set(fixtures.map(p => p.id)));
  assert.equal(represented.length, fixtures.length);
  assert.ok(result.clusters.some(cluster => cluster.mixed));
  assert.ok(result.clusters.some(cluster => cluster.members.some(p => p.kind === "camera") && cluster.members.some(p => p.announcementId)));
});

test("tapping a cluster uses a zoom that reveals smaller groups or individual bubbles", () => {
  const cluster = clusterAnnouncementMarkers(notices, 9).clusters[0];
  assert.ok(cluster.expansionZoom > 9);
  const expanded = clusterAnnouncementMarkers(cluster.members, cluster.expansionZoom);
  assert.ok(expanded.clusters.length + expanded.places.length > 1);
  assert.equal(expanded.places.length + expanded.clusters.reduce((sum, c) => sum + c.count, 0), 5);
});

test("co-located notices remain a cluster until street level, then retain their fan-out offsets", () => {
  const neighborhood = clusterAnnouncementMarkers(notices, 14.4);
  assert.equal(neighborhood.clusters.length, 1);
  const park = neighborhood.clusters[0];
  assert.equal(park.count, 3);
  assert.equal(park.expansionZoom, ANNOUNCEMENT_EXPAND_ZOOM);
  const street = clusterAnnouncementMarkers(park.members, park.expansionZoom);
  assert.equal(street.clusters.length, 0);
  assert.equal(street.places.length, 3);
  assert.equal(new Set(street.places.map(p => p.markerOffset?.join(","))).size, 3);
  const collapsed = clusterAnnouncementMarkers(street.places, 14.4);
  assert.equal(collapsed.clusters[0].count, 3);
});

test("cluster membership and IDs remain stable as marker order changes; filtering does not leave stale counts", () => {
  const original = clusterAnnouncementMarkers(notices, 9).clusters[0];
  const reversed = clusterAnnouncementMarkers([...notices].reverse(), 9).clusters[0];
  assert.deepEqual(reversed, original);
  const filtered = clusterAnnouncementMarkers(notices.filter(p => p.announcementCategory === "Roads"), 9);
  assert.equal(filtered.clusters[0].count, 2);
  assert.deepEqual(clusterAnnouncementMarkers([], 9), { places: [], clusters: [] });
  assert.equal(clusterAnnouncementMarkers([notices[0]], 9).places.length, 1);
});

test("invalid zooms and coordinates are safe and clusters across the date line remain nearby", () => {
  assert.doesNotThrow(() => clusterAnnouncementMarkers(notices, NaN));
  const invalid = { ...notices[0], coordinate: [Infinity, 91] } as Place;
  assert.deepEqual(clusterAnnouncementMarkers([invalid], 9), { places: [], clusters: [] });
  const edges: Place[] = [{ ...notices[0], id: "west", coordinate: [-179.999, 3] }, { ...notices[0], id: "east", coordinate: [179.999, 3] }];
  const group = clusterAnnouncementMarkers(edges, 9).clusters[0];
  assert.ok(Math.abs(group.coordinate[0]) > 179);
  assert.ok(Math.abs(group.coordinate[1] - 3) < 0.000001);
});

test("close camera and bus markers receive stable cross-type fan offsets without moving their coordinates", () => {
  const camera: Place = { id: "camera-test", name: "Camera", subtitle: "", kind: "camera", coordinate: [101.51, 3.18] };
  const stop: Place = { ...camera, id: "stop-test", name: "Stop", kind: "transport", coordinate: [101.51001, 3.18] };
  const nearby = [camera, stop];
  const wide = clusterAnnouncementMarkers(nearby, 14);
  assert.equal(wide.clusters[0].mixed, true);
  const close = clusterAnnouncementMarkers(nearby, 16.5);
  assert.equal(close.clusters.length, 0);
  assert.equal(new Set(close.places.map(p => p.markerOffset?.join(","))).size, 2);
  close.places.forEach(place => assert.equal(place.coordinate, nearby.find(p => p.id === place.id)!.coordinate));
  assert.deepEqual(clusterAnnouncementMarkers([...nearby].reverse(), 16.5), close);
});

test("large indivisible groups open a list, while dedicated layers retain every individual marker", async () => {
  const { clusterOpensList } = await import("../src/lib/announcement-clusters");
  const group = Array.from({ length: 5 }, (_, i) => ({ ...notices[0], id: `same-${i}` }));
  const close = clusterAnnouncementMarkers(group, 16.5);
  assert.equal(close.clusters[0].count, 5);
  assert.equal(clusterOpensList(close.clusters[0], 16.5), true);
  assert.equal(clusterOpensList(clusterAnnouncementMarkers(group, 12).clusters[0], 12), true);
  const dedicated = clusterAnnouncementMarkers(group, 9, undefined, false);
  assert.equal(dedicated.clusters.length, 0);
  assert.equal(dedicated.places.length, 5);
  const selected = clusterAnnouncementMarkers(group, 16.5, group[0].id);
  assert.equal(selected.places.at(-1)?.id, group[0].id);
  assert.equal(selected.clusters[0].count, 4);
});

test("the live bus remains visible with space beside an overlapping cluster", () => {
  const bus: Place = { ...notices[0], announcementId: undefined, imageUrl: undefined, announcementCategory: undefined, id: "live-bus-s1", kind: "transport" };
  const result = clusterAnnouncementMarkers([bus, notices[0], { ...notices[0], id: "same-notice" }], 9);
  assert.ok(result.places.some(p => p.id === bus.id));
  assert.ok(Math.hypot(...result.clusters[0].markerOffset) >= 60);
});
