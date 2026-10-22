import type { Report } from "./model";

export const demoReports: Report[] = [
  { id: "demo-report-road", category: "Road & traffic", location: "Persiaran Atmosfera near TEMU", description: "Deep pothole along the left lane", status: "In progress", photos: [], createdAt: "2026-10-22T08:15:00+08:00" },
  { id: "demo-report-streetlight", category: "Streetlights", location: "Elmina Valley 3, Jalan Casuarina", description: "Flickering LED lamp post replaced", status: "Resolved", photos: [], createdAt: "2026-10-21T18:20:00+08:00" },
];

/** Seed once when upgrading old profiles; keep residents' reports and deliberate empty lists. */
export function restoreReports(raw: unknown, seeded: boolean): Report[] {
  const reports = Array.isArray(raw) ? raw.filter((r): r is Report => r && typeof r.id === "string" && typeof r.category === "string" && typeof r.location === "string" && typeof r.description === "string" && Array.isArray(r.photos) && r.photos.every((photo: unknown) => typeof photo === "string") && typeof r.createdAt === "string" && Number.isFinite(Date.parse(r.createdAt)) && ["Submitted", "In progress", "Resolved"].includes(r.status)) : [];
  return seeded ? reports : [...reports, ...demoReports.filter(demo => !reports.some(r => r.id === demo.id))];
}
export function reportStatus(status: Report["status"]) {
  return status === "Resolved" ? { label: "Resolved", tone: "green" as const } : status === "In progress" ? { label: "In Progress", tone: "blue" as const } : { label: "Under Review", tone: "amber" as const };
}
export function newestReports(reports: Report[]) {
  return [...reports].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
