export type Coordinate = [number, number];
export type MapFilter = "Traffic" | "Transport" | "Hazards" | "CCTV";
export type PlaceKind = "place" | "transport" | "hazard" | "camera";
export type Place = {
  id: string;
  name: string;
  subtitle: string;
  coordinate: Coordinate;
  kind: PlaceKind;
  detail?: string;
  streamUrl?: string;
};
export const CENTER: Coordinate = [101.5118, 3.1796];
// Fixtures are illustrative, including stop/camera placements. Never represent them as verified live observations.
export const places: Place[] = [
  {
    id: "park",
    name: "Elmina Valley Central Park",
    subtitle: "Park & recreation · City of Elmina",
    coordinate: [101.51425, 3.17901],
    kind: "place",
  },
  {
    id: "mall",
    name: "Elmina Lakeside Mall",
    subtitle: "Shopping & dining · City of Elmina",
    coordinate: [101.5099, 3.18133],
    kind: "place",
  },
  {
    id: "entrance",
    name: "Township entrance",
    subtitle: "Neighbourhood access",
    coordinate: [101.5156, 3.1742],
    kind: "place",
  },
  {
    id: "stop-1",
    name: "Park shuttle stop",
    subtitle: "Proposed township shuttle",
    coordinate: [101.5135, 3.1785],
    kind: "transport",
    detail:
      "Proposed connection to public transport. This service is not operating; the timetable below is for demonstration.",
  },
  {
    id: "stop-2",
    name: "Lakeside shuttle stop",
    subtitle: "Proposed township shuttle",
    coordinate: [101.5088, 3.1805],
    kind: "transport",
    detail:
      "A proposed stop beside the retail area. No live arrivals or bookings are available.",
  },
  {
    id: "hazard-1",
    name: "Lane obstruction near the park",
    subtitle: "Park access road",
    coordinate: [101.5138, 3.1778],
    kind: "hazard",
    detail:
      "Demo incident: a fallen branch is obstructing one lane. The sample response shows a maintenance team assigned.",
  },
  {
    id: "camera-1",
    name: "Main entrance · Camera 01",
    subtitle: "Township entrance road",
    coordinate: [101.5153, 3.1751],
    kind: "camera",
    streamUrl: process.env.EXPO_PUBLIC_CCTV_STREAM_URL,
  },
  {
    id: "camera-2",
    name: "Park access · Camera 02",
    subtitle: "Park access road",
    coordinate: [101.514, 3.1782],
    kind: "camera",
  },
  {
    id: "camera-3",
    name: "Lakeside · Camera 03",
    subtitle: "Lakeside approach",
    coordinate: [101.51, 3.1806],
    kind: "camera",
  },
];
export const filters: MapFilter[] = ["Traffic", "Transport", "Hazards", "CCTV"];
export function visiblePlaces(filter: MapFilter): Place[] {
  const kinds: Record<MapFilter, PlaceKind[]> = {
    Traffic: ["place"],
    Transport: ["transport"],
    Hazards: ["hazard"],
    CCTV: ["camera"],
  };
  return places.filter((p) => kinds[filter].includes(p.kind));
}
export function searchPlaces(query: string) {
  const q = query.trim().toLocaleLowerCase();
  return places.filter(
    (p) =>
      p.kind === "place" &&
      `${p.name} ${p.subtitle}`.toLocaleLowerCase().includes(q),
  );
}
export type Announcement = {
  id: string;
  title: string;
  category: "Roads" | "Maintenance" | "Community";
  body: string;
  time: string;
  reactions: number;
  placeId?: string;
  icon: "road" | "tree" | "light";
};
export const announcements: Announcement[] = [
  {
    id: "roadworks",
    title: "A little patience. A smoother road.",
    category: "Roads",
    body: "Road resurfacing is planned near the township entrance, 9 am–12 pm tomorrow. One lane will remain open. Please allow a little extra travel time.",
    time: "Sample announcement",
    reactions: 24,
    placeId: "entrance",
    icon: "road",
  },
  {
    id: "lights",
    title: "A brighter path home",
    category: "Maintenance",
    body: "Our maintenance team will inspect the walking-trail lights this week. Please use the main path while work is underway.",
    time: "Sample announcement",
    reactions: 16,
    placeId: "park",
    icon: "light",
  },
  {
    id: "cleanup",
    title: "Good neighbours, greener spaces",
    category: "Community",
    body: "Join a neighbourhood clean-up at the community park. Watch this space for the confirmed date and registration details.",
    time: "Sample announcement",
    reactions: 32,
    placeId: "park",
    icon: "tree",
  },
];
