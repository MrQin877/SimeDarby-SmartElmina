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

test("My Posts recognises both the current author name and locally authored posts after a rename", async () => {
  const { discussionFilters, discussionFilterPills, isOwnDiscussion } = await import("../src/lib/community");
  const named = { ...initialDiscussions[0], id: "own-current", authorName: initialData.fullName };
  const renamed = { ...initialDiscussions[1], id: "own-renamed", authorName: "Previous resident name" };
  const posts = [named, renamed, ...initialDiscussions];
  assert.deepEqual(filterDiscussions(posts, "my_posts", [], initialData.fullName).map(p => p.id), [named.id]);
  assert.deepEqual(filterDiscussions(posts, "my_posts", [], initialData.fullName, [renamed.id]).map(p => p.id), [named.id, renamed.id]);
  assert.deepEqual(filterDiscussions(posts, "my_posts", []), []);
  assert.equal(isOwnDiscussion(renamed, initialData.fullName, [renamed.id]), true);
  assert.ok(discussionFilters.some(item => item.value === "my_posts"));
  assert.equal(discussionFilterPills.my_posts.short, "My Posts");
});

test("deleting an authored discussion removes replies, likes and saves and survives reload", async () => {
  const { deleteDiscussionPost } = await import("../src/lib/model");
  const mine = { ...initialDiscussions[0], id: "own-deleted", authorName: initialData.fullName };
  const keep = { ...mine, id: "own-kept" };
  const reply = createDiscussionReply(mine.id, "A neighbour reply", initialData)!;
  const otherReply = createDiscussionReply(keep.id, "Keep this reply", initialData)!;
  const before = { ...initialData, discussions: [mine, keep], saved: [mine.id, keep.id, "saved-place"], liked: [mine.id, keep.id], comments: [reply, otherReply] };
  const after = deleteDiscussionPost(before, mine.id);
  assert.deepEqual(after.discussions.map(p => p.id), [keep.id]);
  assert.deepEqual(after.saved, [keep.id, "saved-place"]);
  assert.deepEqual(after.liked, [keep.id]);
  assert.deepEqual(after.comments, [otherReply]);
  assert.equal(before.discussions.length, 2, "the reducer does not mutate the prior snapshot");
  const restored = restoreData(JSON.stringify(after));
  assert.ok(!mergeDiscussions(restored.discussions).some(post => post.id === mine.id));
  assert.deepEqual(deleteDiscussionPost(after, mine.id), after, "deletion is idempotent");
});
