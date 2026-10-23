import test from "node:test";
import assert from "node:assert/strict";
import { announcementMapPlaces } from "../src/lib/map-layers";
import { ANNOUNCEMENT_EXPAND_ZOOM, clusterAnnouncementMarkers } from "../src/lib/announcement-clusters";
import { places, type Place } from "../src/lib/data";
const fixtures = announcementMapPlaces(places);
const notices = fixtures.filter(place => place.announcementId);

test("zoomed-out announcements combine into a numbered cluster without grouping ordinary markers", () => {
  const result = clusterAnnouncementMarkers(fixtures, 9);
  assert.equal(result.clusters.length, 1);
  assert.equal(result.clusters[0].count, 5);
  assert.deepEqual(new Set(result.clusters[0].members.map(p => p.id)), new Set(notices.map(p => p.id)));
  assert.equal(result.places.length, fixtures.length - notices.length);
  assert.ok(result.places.some(p => p.kind === "camera"));
  assert.ok(result.places.some(p => p.kind === "transport"));
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
