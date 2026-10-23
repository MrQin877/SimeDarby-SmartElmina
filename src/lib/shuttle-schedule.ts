import { elminaBusStops } from "./shuttle-data";
export type ShuttleRoute = "S1" | "T102";
export interface Departure { id: string; at: number; label: string; day: string }
const MYT = 8 * 3600000;
const DAY = 86400000;
export function shuttleTime(at: number): string {
  const malaysia = new Date(at + MYT);
  const hour = malaysia.getUTCHours();
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(malaysia.getUTCMinutes()).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}
export const shuttleDay = (at: number) => new Date(at).toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur", day: "numeric", month: "short" });
/** Next four scheduled services in Malaysia time; never invent a six-minute countdown. */
export function followingDepartures(route: ShuttleRoute, now: number): Departure[] {
  const dayStart = Math.floor((now + MYT) / DAY) * DAY - MYT;
  const start = route === "S1" ? 390 : 360;
  const end = route === "S1" ? 1320 : 1350;
  const interval = route === "S1" ? 20 : 15;
  const departures: Departure[] = [];
  for (let day = 0; day < 3 && departures.length < 4; day++) {
    for (let minute = start; minute <= end && departures.length < 4; minute += interval) {
      const at = dayStart + day * DAY + minute * 60000;
      if (at >= now) departures.push({ id: String(at), at, label: shuttleTime(at), day: shuttleDay(at) });
    }
  }
  return departures;
}
export const departureSeconds = (at: number, now: number) => Math.max(0, Math.ceil((at - now) / 1000));
export function departureCountdown(at: number, now: number): string {
  const seconds = departureSeconds(at, now);
  if (!seconds) return "Due now";
  const minutes = Math.floor(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}` : `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
// Proposed timetable offsets, not measured travel times or live arrival estimates.
export const s1ArrivalOffsets = [0, 5, 11, 17, 28, 36, 45, 57, 63, 72];
const feederStops = [
  { id: "t102-1", name: "Proposed Elmina Green 1 Shuttle Stop", subtitle: "Precinct pickup · Departure 10:10 AM", offset: 0 },
  { id: "t102-2", name: "Elmina Lakeside Mall", subtitle: "Lakeside connection · Arrival 10:20 AM", offset: 10 },
  { id: "t102-3", name: "Kwasa Sentral MRT Station", subtitle: "MRT connection · Terminal arrival 10:28 AM", offset: 18 },
];
export function shuttleArrivals(route: ShuttleRoute, departure: number) {
  const stops = route === "S1" ? elminaBusStops.map((stop, index) => ({ ...stop, offset: s1ArrivalOffsets[index] })) : feederStops;
  return stops.map(stop => ({ ...stop, at: departure + stop.offset * 60000, time: shuttleTime(departure + stop.offset * 60000), note: stop.offset === 0 ? "Origin" : `+${stop.offset} min` }));
}
