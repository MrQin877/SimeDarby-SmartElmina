import { demoReports, restoreReports } from "./reports";
import { restoreBusReminders, type BusReminder } from "./bus-reminders";
import { restoreAvatarUri } from "./avatar";
import { defaultRewardState, restoreRewards, type RewardState } from "./rewards";
import { restoreShortcuts, type ShortcutItem } from "./shortcuts";

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
  authorName?: string;
  authorNeighborhood?: string;
  isVerified?: boolean;
};

export type DiscussionPost = {
  id: string;
  authorName: string;
  authorInitials: string;
  authorNeighborhood: string;
  timestamp: string;
  category: "transport" | "neighbourhood" | "events" | "general";
  categoryLabel: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  isLiked?: boolean;
  trending?: boolean;
  badgeLabel?: string;
  highlightNote?: string;
  highlightAuthor?: string;
  locationTag?: string;
  eventDate?: string;
  imageUrl?: string;
};

export type AlertItem = {
  id: string;
  title: string;
  subtitle: string;
  source: string;
  timestamp: string;
  type: "urgent" | "mobility" | "shuttle" | "official" | "social" | "maintenance";
  badgeLabel: string;
  content: string;
  quote?: string;
  isRead: boolean;
  isImportant: boolean;
  isAcknowledged?: boolean;
  actionType?: "acknowledge" | "mobility_link" | "shuttle_link" | "forum_link" | "none";
  actionLabel?: string;
};

export type VisitorPass = {
  id: string;
  visitorName: string;
  vehiclePlate: string;
  entryDate: string;
  validHours: number;
  passCode: string;
  createdAt: string;
  status: "active" | "used" | "expired";
};

export type LocalData = RewardState & {
  busReminders: BusReminder[];
  reports: Report[];
  reportsDemoSeeded: boolean;
  comments: Comment[];
  liked: string[];
  saved: string[];
  recentSearches: string[];
  workPlaceId: string | null;
  homePlaceId: string | null;
  shortcuts: ShortcutItem[];
  name: string;
  fullName: string;
  avatarUri: string | null;
  precinct: string;
  address: string;
  phone: string;
  email: string;
  emailVerified: boolean;
  residentId: string;
  unitId: string;
  memberSince: string;
  language: "English (UK)" | "Bahasa Melayu" | "中文 (Simplified)";
  textSize: "standard" | "large";
  notifications: {
    traffic: boolean;
    official: boolean;
    community: boolean;
  };
  discussions: DiscussionPost[];
  visitorPasses: VisitorPass[];
  acknowledgedAlerts: string[];
  acknowledgedNotices: string[];
  readAlerts: string[];
  vanSeatsRemaining: number;
  isVanReserved: boolean;
};

export const initialData: LocalData = {
  ...defaultRewardState,
  busReminders: [],
  reports: demoReports,
  reportsDemoSeeded: true,
  comments: [],
  liked: [],
  saved: [],
  recentSearches: ["elmina-city-centre", "elmina-valley", "elmina-green-1", "atmosfera-stop"],
  workPlaceId: null,
  homePlaceId: null,
  shortcuts: [],
  name: "Aiman",
  fullName: "Aiman Farhan Bin Razak",
  avatarUri: null,
  precinct: "Elmina Valley — Resident",
  address: "Elmina Valley 3, Persiaran Atmosfera",
  phone: "+60 12-482 9180",
  email: "aiman.razak@example.com",
  emailVerified: true,
  residentId: "900512-10-XXXX",
  unitId: "ELM-V3-0812",
  memberSince: "Jan 2024",
  language: "English (UK)",
  textSize: "standard",
  notifications: {
    traffic: true,
    official: true,
    community: true,
  },
  discussions: [],
  visitorPasses: [],
  acknowledgedAlerts: [],
  acknowledgedNotices: [],
  readAlerts: [],
  vanSeatsRemaining: 2,
  isVanReserved: false,
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
      ...restoreRewards(d),
      busReminders: restoreBusReminders(d.busReminders),
      reports: restoreReports(d.reports, d.reportsDemoSeeded === true),
      reportsDemoSeeded: true,
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
      recentSearches: Array.isArray(d.recentSearches) ? [...new Set(d.recentSearches.filter((value: unknown): value is string => typeof value === "string"))].slice(0, 20) as string[] : initialData.recentSearches,
      workPlaceId: typeof d.workPlaceId === "string" ? d.workPlaceId : null,
      homePlaceId: typeof d.homePlaceId === "string" ? d.homePlaceId : null,
      shortcuts: restoreShortcuts(d.shortcuts),
      name: typeof d.name === "string" && d.name.trim() && d.name !== "Farhan" ? d.name : "Aiman",
      avatarUri: restoreAvatarUri(d.avatarUri),
      fullName: typeof d.fullName === "string" && !d.fullName.includes("Roslan") ? d.fullName : initialData.fullName,
      precinct: typeof d.precinct === "string" ? d.precinct : initialData.precinct,
      address: typeof d.address === "string" ? d.address : initialData.address,
      phone: typeof d.phone === "string" ? d.phone : initialData.phone,
      email: typeof d.email === "string" ? d.email : initialData.email,
      emailVerified: typeof d.emailVerified === "boolean" ? d.emailVerified : initialData.emailVerified,
      residentId: initialData.residentId,
      unitId: typeof d.unitId === "string" ? d.unitId : initialData.unitId,
      memberSince: typeof d.memberSince === "string" ? d.memberSince : initialData.memberSince,
      language:
        d.language === "Bahasa Melayu" || d.language === "中文 (Simplified)"
          ? d.language
          : "English (UK)",
      textSize: d.textSize === "large" ? "large" : "standard",
      notifications: {
        traffic: d.notifications?.traffic !== false,
        official: d.notifications?.official !== false,
        community: d.notifications?.community !== false,
      },
      discussions: Array.isArray(d.discussions) ? d.discussions : [],
      visitorPasses: Array.isArray(d.visitorPasses) ? d.visitorPasses : [],
      acknowledgedAlerts: Array.isArray(d.acknowledgedAlerts) ? d.acknowledgedAlerts : [],
      acknowledgedNotices: Array.isArray(d.acknowledgedNotices) ? d.acknowledgedNotices : [],
      readAlerts: Array.isArray(d.readAlerts) ? d.readAlerts : [],
      vanSeatsRemaining: typeof d.vanSeatsRemaining === "number" ? d.vanSeatsRemaining : 2,
      isVanReserved: !!d.isVanReserved,
    };
  } catch {
    return initialData;
  }
}
