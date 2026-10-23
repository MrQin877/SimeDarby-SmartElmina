import { announcements, type Announcement, type Place } from "./data";
export type MapLayer = "all" | "traffic" | "shuttle" | "cctv";
export const mapLayers: { value: MapLayer; label: string }[] = [
  { value: "all", label: "All" }, { value: "traffic", label: "Traffic" },
  { value: "shuttle", label: "Shuttle" }, { value: "cctv", label: "CCTV" },
];
export function isLiveBusMarker(place: Place): boolean {
  return place.id === "live-bus-s1" || place.id === "demo-shuttle-bus-t102";
}
export function filterMapPlaces(places: Place[], layer: MapLayer, zoom = 16): Place[] {
  const landmarks = new Set(["kwasa-hub", "park", "mall", "entrance", "temu-hub", "rainbow-bridge", "elmina-city-centre"]);
  return places.filter(place => markerKind(place) !== "traffic").filter(place => {
    if (layer !== "all") return layer === "traffic" ? place.kind === "hazard" || place.announcementCategory === "Roads" || place.announcementCategory === "Transport" : layer === "shuttle" ? place.kind === "transport" : place.kind === "camera";
    if (zoom >= 16 || isAnnouncementMarker(place) || isLiveBusMarker(place)) return true;
    if (place.kind === "hazard" && !/obstruction/i.test(`${place.id} ${place.name}`)) return true;
    return zoom >= 14.5 && landmarks.has(place.id);
  });
}
export function markerKind(place: Place): "camera" | "shuttle" | "hazard" | "traffic" | "place" {
  return place.id === "bottleneck-gce" || place.id.startsWith("corridor-") ? "traffic" : place.kind === "camera" ? "camera" : place.kind === "transport" ? "shuttle" : place.kind === "hazard" ? "hazard" : "place";
}

export function placeAnnouncement(place: Place): Announcement | undefined {
  return announcements.find(post => place.announcementId ? post.id === place.announcementId : post.placeId === place.id && place.kind === "hazard");
}

/** Keep each notice addressable, including several notices linked to a single place. */
export function announcementMapPlaces(base: Place[], posts: Announcement[] = announcements): Place[] {
  const result = [...base];
  const linked: Place[] = [];
  for (const post of posts) {
    const target = base.find(place => place.id === post.placeId);
    const coordinate = post.coordinate ?? target?.coordinate;
    if (!coordinate || coordinate.length !== 2 || !coordinate.every(Number.isFinite) || Math.abs(coordinate[0]) > 180 || Math.abs(coordinate[1]) > 90) continue;
    const reuseHazard = target?.kind === "hazard" && !linked.some(place => place.id === target.id);
    const marker: Place = { id: reuseHazard ? target.id : `announcement-${post.id}`, name: post.title, subtitle: post.summary || post.body, coordinate, kind: target?.kind === "hazard" ? "hazard" : "place", announcementId: post.id, imageUrl: post.imageUrl, announcementCategory: post.category, announcementPriority: post.priority };
    if (reuseHazard) result.splice(result.findIndex(place => place.id === target.id), 1);
    linked.push(marker);
  }
  for (const marker of linked) {
    const colocated = linked.filter(other => other.coordinate[0] === marker.coordinate[0] && other.coordinate[1] === marker.coordinate[1]);
    marker.markerOffset = [(colocated.indexOf(marker) - (colocated.length - 1) / 2) * 52, colocated.length > 1 ? -24 : 5];
  }
  return [...result, ...linked];
}

export const isAnnouncementMarker = (place: Place) => Boolean(place.announcementId || place.imageUrl || place.announcementCategory || placeAnnouncement(place));
