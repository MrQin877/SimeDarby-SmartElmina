import test from "node:test";
import assert from "node:assert/strict";
import { initialDiscussions, roadCorridors, resolveRoadCorridor } from "../src/lib/data";
import { createDiscussionReply, discussionReplies, filterDiscussions, mergeDiscussions } from "../src/lib/community";
import { initialData, restoreData } from "../src/lib/model";
import { sheetSnapPoints } from "../src/lib/sheet";

test("saved, trending and category discussion filters preserve the correct posts", () => {
  const savedId = initialDiscussions[0].id;
  assert.deepEqual(filterDiscussions(initialDiscussions, "saved", [savedId]).map((post) => post.id), [savedId]);
  assert.deepEqual(filterDiscussions(initialDiscussions, "saved", []), []);
  assert.ok(filterDiscussions(initialDiscussions, "trending", []).every((post) => post.trending));
  assert.ok(filterDiscussions(initialDiscussions, "transport", []).every((post) => post.category === "transport"));
  const replacement = { ...initialDiscussions[0], title: "Updated question" };
  const merged = mergeDiscussions([replacement]);
  assert.equal(merged.filter((post) => post.id === savedId).length, 1);
  assert.equal(merged[0].title, "Updated question");
});

test("discussion replies are validated, persisted with authors, and ordered chronologically", () => {
  assert.equal(createDiscussionReply("disc-01", "  ", initialData), null);
  assert.equal(createDiscussionReply("disc-01", "x".repeat(1001), initialData), null);
  const later = createDiscussionReply("disc-01", "  A useful route tip.  ", initialData, "2026-10-21T04:00:00Z")!;
  const earlier = createDiscussionReply("disc-01", "Earlier reply", initialData, "2026-10-21T03:00:00Z")!;
  const otherPost = createDiscussionReply("different-post", "Unrelated", initialData)!;
  assert.equal(later.text, "A useful route tip.");
  const restored = restoreData(JSON.stringify({ ...initialData, comments: [later, otherPost, earlier] }));
  assert.equal(restored.comments[0].authorName, initialData.fullName);
  const replies = discussionReplies("disc-01", restored.comments);
  assert.ok(!replies.some((reply) => reply.postId === "different-post"));
  assert.ok(replies.findIndex((reply) => reply.id === earlier.id) < replies.findIndex((reply) => reply.id === later.id));
});

test("road selection resolves known corridors and retains the tapped road name and coordinate", () => {
  roadCorridors.forEach((road) => assert.equal(resolveRoadCorridor(road.id).name, road.name));
  assert.equal(resolveRoadCorridor(undefined, "E35").id, "gce");
  const selection = resolveRoadCorridor(undefined, "Neighbourhood Road", [101.51, 3.178]);
  assert.equal(selection.name, "Neighbourhood Road");
  assert.deepEqual(selection.coordinate, [101.51, 3.178]);
  assert.ok(selection.speedLimit > 0);
});

test("full sheet expansion can cover search controls while retaining peek and half heights", () => {
  assert.deepEqual(sheetSnapPoints(700, 692), [220, 440, 692]);
});

test("announcement filters distinguish road, utility and wellness notices", async () => {
  const { announcements } = await import("../src/lib/data");
  const { filterAnnouncements } = await import("../src/lib/community");
  assert.equal(filterAnnouncements(announcements, "all").length, announcements.length);
  assert.deepEqual(filterAnnouncements(announcements, "roads").map((post) => post.id), ["ann-01", "ann-04"]);
  assert.deepEqual(filterAnnouncements(announcements, "maintenance").map((post) => post.id), ["ann-02"]);
  assert.deepEqual(filterAnnouncements(announcements, "wellness").map((post) => post.id), ["ann-03"]);
});

test("map layers isolate cameras, transport and traffic without losing all places", async () => {
  const { places } = await import("../src/lib/data");
  const { filterMapPlaces, markerKind } = await import("../src/lib/map-layers");
  assert.equal(filterMapPlaces(places, "all").length, places.length - 1);
  assert.ok(!filterMapPlaces(places, "all").some((place) => place.id === "bottleneck-gce"));
  for (const [layer, kind] of [["cctv", "camera"], ["shuttle", "transport"], ["traffic", "hazard"]] as const) {
    const visible = filterMapPlaces(places, layer);
    assert.ok(visible.length > 0);
    assert.ok(visible.every((place) => place.kind === kind));
  }
  assert.equal(markerKind(places.find((place) => place.id === "bottleneck-gce")!), "traffic");
  assert.equal(markerKind(places.find((place) => place.kind === "camera")!), "camera");
});
