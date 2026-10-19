export type Report = {
  id: string;
  category: string;
  location: string;
  description: string;
  photos: string[];
  createdAt: string;
  status: "Submitted" | "In progress" | "Resolved";
};
export type Comment = {
  id: string;
  postId: string;
  text: string;
  createdAt: string;
};
export type LocalData = {
  reports: Report[];
  comments: Comment[];
  liked: string[];
  saved: string[];
  name: string;
};
export const initialData: LocalData = {
  reports: [],
  comments: [],
  liked: [],
  saved: [],
  name: "Alex",
};
export function reportError(
  input: Pick<Report, "location" | "description" | "photos">,
): string | null {
  if (!input.location.trim())
    return "Add a location so the team knows where to look.";
  if (input.description.trim().length < 10)
    return "Please describe the issue in at least 10 characters.";
  if (input.description.length > 500)
    return "Keep the description within 500 characters.";
  if (input.photos.length > 3) return "You can attach up to 3 photos.";
  return null;
}
export function toggleItem(items: string[], id: string) {
  return items.includes(id)
    ? items.filter((item) => item !== id)
    : [...items, id];
}
export function restoreData(raw: string | null): LocalData {
  if (!raw) return initialData;
  try {
    const d = JSON.parse(raw);
    return {
      reports: Array.isArray(d.reports)
        ? d.reports.filter(
            (r: Report) =>
              typeof r?.id === "string" &&
              typeof r.description === "string" &&
              Array.isArray(r.photos),
          )
        : [],
      comments: Array.isArray(d.comments)
        ? d.comments.filter(
            (c: Comment) =>
              typeof c?.id === "string" && typeof c.text === "string",
          )
        : [],
      liked: Array.isArray(d.liked)
        ? d.liked.filter((s: unknown) => typeof s === "string")
        : [],
      saved: Array.isArray(d.saved)
        ? d.saved.filter((s: unknown) => typeof s === "string")
        : [],
      name: typeof d.name === "string" ? d.name : "Alex",
    };
  } catch {
    return initialData;
  }
}
