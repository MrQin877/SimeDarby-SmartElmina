import { initialDiscussions, type Announcement } from "./data";
import type { Comment, DiscussionPost } from "./model";

export type DiscussionFilter = "all" | "saved" | "trending" | "transport" | "neighbourhood";
export const discussionFilters: { value: DiscussionFilter; label: string }[] = [
  { value: "all", label: "All Discussions" },
  { value: "saved", label: "Saved Posts" },
  { value: "trending", label: "Trending" },
  { value: "transport", label: "Transportation" },
  { value: "neighbourhood", label: "Neighbourhood" },
];
export function mergeDiscussions(custom: DiscussionPost[]): DiscussionPost[] {
  return [...custom, ...initialDiscussions.filter((post) => !custom.some((item) => item.id === post.id))];
}
export function filterDiscussions(posts: DiscussionPost[], filter: DiscussionFilter, saved: string[]): DiscussionPost[] {
  return posts.filter((post) => filter === "all" || (filter === "saved" ? saved.includes(post.id) : filter === "trending" ? post.trending : post.category === filter));
}
export function createDiscussionReply(postId: string, text: string, author: { fullName: string; precinct: string }, createdAt = new Date().toISOString()): Comment | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 1000) return null;
  return {
    id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    postId, text: trimmed, createdAt, authorName: author.fullName,
    authorNeighborhood: author.precinct, isVerified: true,
  };
}
export function discussionReplies(postId: string, comments: Comment[]): Comment[] {
  return [...sampleReplies.filter((reply) => reply.postId === postId), ...comments.filter((reply) => reply.postId === postId)]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
const sampleReplies: Comment[] = [
  { id: "sample-reply-1", postId: "disc-01", text: "Leaving before 7:20 AM has been smoother for me. The queue usually builds after the school drop-off rush.", createdAt: "2026-10-21T00:00:00Z", authorName: "Nadia A.", authorNeighborhood: "Elmina Valley 2", isVerified: true },
  { id: "sample-reply-2", postId: "disc-01", text: "I check the merge camera before leaving and compare the bypass when the queue is long. Allow a little extra time on rainy mornings.", createdAt: "2026-10-21T00:15:00Z", authorName: "David K.", authorNeighborhood: "Elmina Green 1", isVerified: true },
  { id: "sample-reply-3", postId: "disc-02", text: "The park loop has plenty of places to rest. I would check the lighting on your first visit and choose a shorter loop if needed.", createdAt: "2026-10-21T01:00:00Z", authorName: "Farhan H.", authorNeighborhood: "Elmina Valley 3", isVerified: true },
];

export type AnnouncementFilter = "all" | "roads" | "maintenance" | "wellness";
export const announcementFilters: { value: AnnouncementFilter; label: string; short: string }[] = [
  { value: "all", label: "All Announcements", short: "All" },
  { value: "roads", label: "Road Closures", short: "Roads" },
  { value: "maintenance", label: "Maintenance", short: "Utility" },
  { value: "wellness", label: "Wellness", short: "Health" },
];
export function filterAnnouncements(posts: Announcement[], filter: AnnouncementFilter): Announcement[] {
  return posts.filter((post) => filter === "all" || (filter === "roads" ? post.category === "Roads" : filter === "maintenance" ? post.category === "Maintenance" : /health|wellness|screening/i.test(`${post.title} ${post.body}`)));
}
export const discussionFilterPills: Record<DiscussionFilter, { short: string }> = {
  all: { short: "All" }, saved: { short: "Saved" },
  trending: { short: "Top" }, transport: { short: "Transit" },
  neighbourhood: { short: "Local" },
};
