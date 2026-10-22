import { shuttleArrivals, shuttleDay, shuttleTime, type Departure, type ShuttleRoute } from "./shuttle-schedule";

export interface BusReminder {
  id: string;
  routeId: ShuttleRoute;
  stopId: string;
  stopName: string;
  departureTime: string;
  scheduledTime: number;
  leadMinutes: number;
  active: boolean;
  triggeredAt?: number;
  dismissedAt?: number;
}
const DAY = 86400000;
export const malaysiaDayStart = (at: number) => Math.floor((at + 28800000) / DAY) * DAY - 28800000;

/** Full service day in Malaysia time, allowing a reminder at any scheduled departure. */
export function reminderDepartures(route: ShuttleRoute, day: number): Departure[] {
  const result: Departure[] = [];
  for (let minute = route === "S1" ? 390 : 360; minute <= (route === "S1" ? 1320 : 1350); minute += route === "S1" ? 20 : 15) {
    const at = malaysiaDayStart(day) + minute * 60000;
    result.push({ id: String(at), at, label: shuttleTime(at), day: shuttleDay(at) });
  }
  return result;
}

export function createBusReminder(routeId: ShuttleRoute, stopId: string, departureAt: number, leadMinutes: number, now: number): BusReminder {
  const stop = shuttleArrivals(routeId, departureAt).find(item => item.id === stopId);
  if (!stop || !Number.isFinite(departureAt) || ![10, 15, 20].includes(leadMinutes)) throw new Error("Choose a valid stop and reminder time.");
  if (!reminderDepartures(routeId, departureAt).some(item => item.at === departureAt)) throw new Error("Choose a scheduled departure.");
  if (stop.at <= now) throw new Error("This bus has already arrived. Choose a later departure.");
  return { id: `${routeId}:${stopId}:${departureAt}`, routeId, stopId, stopName: stop.name, departureTime: shuttleTime(departureAt), scheduledTime: stop.at, leadMinutes, active: true };
}

/** Returns the original array when nothing changes, avoiding a storage write each tick. */
export function advanceBusReminders(items: BusReminder[], now: number): BusReminder[] {
  let changed = false;
  const next = items.map(item => {
    if (item.scheduledTime <= now && (item.active || (item.triggeredAt && !item.dismissedAt))) {
      changed = true;
      return { ...item, active: false, dismissedAt: now };
    }
    if (item.active && now >= item.scheduledTime - item.leadMinutes * 60000) {
      changed = true;
      return { ...item, active: false, triggeredAt: now };
    }
    return item;
  });
  return changed ? next : items;
}
export function restoreBusReminders(raw: unknown): BusReminder[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  return raw.filter((r): r is BusReminder => {
    if (!r || typeof r !== "object" || typeof r.id !== "string" || seen.has(r.id) || !["S1", "T102"].includes(r.routeId) || typeof r.stopId !== "string" || typeof r.stopName !== "string" || typeof r.departureTime !== "string" || !Number.isFinite(r.scheduledTime) || ![10, 15, 20].includes(r.leadMinutes) || typeof r.active !== "boolean" || (r.triggeredAt !== undefined && !Number.isFinite(r.triggeredAt)) || (r.dismissedAt !== undefined && !Number.isFinite(r.dismissedAt))) return false;
    seen.add(r.id);
    return true;
  });
}
