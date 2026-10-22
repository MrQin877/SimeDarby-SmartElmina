import { places, type Coordinate, type Place } from "./data";
import { parseRoute, validCoordinate, type Journey } from "./routing";

export type TravelMode = "drive" | "transit" | "walk";
export type RouteOption = Journey & {
  segments?: Coordinate[][];
  geometrySource?: "walking-service" | "road-service";
  id: string;
  title: string;
  detail: string;
  delay: number;
  fare?: string;
  departure?: string;
  stops?: { name: string; time: string; detail: string }[];
};
export function distanceBetween(a: Coordinate, b: Coordinate): number {
  const rad = Math.PI / 180;
  const x = (b[0] - a[0]) * rad * Math.cos((a[1] + b[1]) * rad / 2);
  const y = (b[1] - a[1]) * rad;
  return Math.sqrt(x * x + y * y) * 6371000;
}
/** Schedule/price previews carry no invented map geometry. */
export function demoRouteOptions(origin: Place, destination: Place, mode: TravelMode): RouteOption[] {
  if (!validCoordinate(origin.coordinate) || !validCoordinate(destination.coordinate) || distanceBetween(origin.coordinate, destination.coordinate) < 20) return [];
  const distance = Math.max(100, Math.round(distanceBetween(origin.coordinate, destination.coordinate) * 1.12 / 100) * 100);
  const driveMinutes = destination.id === "kwasa-hub" ? 14 : Math.max(3, Math.round(distance / 500));
  const road: Coordinate[] = [];
  const alternative: Coordinate[] = [];
  const make = (id: string, title: string, duration: number, coordinates: Coordinate[], instructions: string[], extra: Partial<RouteOption> = {}): RouteOption => ({
    id, title, detail: "Illustrative journey", destination: destination.name, mode, isDemo: true, delay: 0,
    distance, duration: duration * 60, coordinates,
    steps: instructions.map((instruction, i) => ({ instruction, coordinate: i === instructions.length - 1 ? destination.coordinate : origin.coordinate, bearing: 0, distance: i === instructions.length - 1 ? 0 : Math.round(distance / (instructions.length - 1)), duration: i === instructions.length - 1 ? 0 : duration * 60 / (instructions.length - 1) })),
    ...extra,
  });
  if (mode === "drive") return [
    make("drive-main", "Via Persiaran Atmosfera", driveMinutes, road, [`Depart from ${origin.name}`, "Continue on Persiaran Atmosfera", "Turn towards the destination access road", `Arrive at ${destination.name}`], { detail: "Primary route · sample traffic delay included", delay: Math.min(12, Math.max(0, driveMinutes - 2)) }),
    make("drive-alt", "Via GCE / Elmina West bypass", driveMinutes + 4, alternative, [`Depart from ${origin.name}`, "Continue towards the Elmina West bypass", "Take the destination exit", `Arrive at ${destination.name}`], { detail: "Alternative route · lower simulated congestion", delay: 3, distance: Math.round(distance * 1.16) }),
  ];
  if (mode === "walk") return [make("walk-trail", "Park Scenic Trail", 45, road, [`Walk from ${origin.name}`, "Follow the pedestrian trail and marked crossings", "Continue to the destination entrance", `Arrive at ${destination.name}`], { detail: "Walking route pending · use marked crossings" })];
  return [
    make("transit-s1", "Feeder Bus S1 + MRT Kajang Line", 24, road, [`Walk from ${origin.name} to the S1 stop`, "Board Feeder S1", "Transfer to the MRT Kajang Line", `Arrive at ${destination.name}`], {
      fare: "RM 2.40", departure: "Leaves in 6 min", detail: "1 transfer · step-free connection (demo)", stops: [
        { name: origin.name, time: "08:26", detail: "Walk to covered boarding bay · 4 min" },
        { name: "Feeder S1 · Central Park", time: "08:32", detail: "Board S1 · every 20 min" },
        { name: "MRT Kajang Line interchange", time: "08:44", detail: "Transfer via concourse lift" },
        { name: destination.name, time: "08:50", detail: "Walk to destination entrance" },
      ],
    }),
    make("transit-van", "Smart Elmina Commuter Van", 16, alternative, [`Walk from ${origin.name} to the pickup point`, "Board the reserved commuter van", "Continue to the destination drop-off", `Arrive at ${destination.name}`], {
      fare: "RM 4.00 / seat", departure: "Departs 08:30", detail: "Direct · sample seat reservation", stops: [
        { name: origin.name, time: "08:27", detail: "Meet at the marked pickup bay" },
        { name: "Elmina Murni Pool pickup", time: "08:30", detail: "Direct commuter van" },
        { name: destination.name, time: "08:46", detail: "Terminal drop-off" },
      ],
    }),
    make("transit-trail", "Park Scenic Trail + Feeder T101", 32, road, [`Walk from ${origin.name} along the park trail`, "Continue to Feeder T101 boarding bay", "Board Feeder T101", `Arrive at ${destination.name}`], {
      fare: "RM 1.00", departure: "Leaves in 10 min", detail: "Scenic walk · covered feeder connection", stops: [
        { name: origin.name, time: "08:26", detail: "Begin scenic trail walk" },
        { name: "Central Park trail connection", time: "08:36", detail: "Board T101 · every 15 min" },
        { name: destination.name, time: "08:58", detail: "Destination boarding hub" },
      ],
    }),
  ];
}

export async function requestDrivingOptions(origin: Place, destination: Place, signal: AbortSignal): Promise<RouteOption[]> {
  if (!validCoordinate(origin.coordinate) || !validCoordinate(destination.coordinate)) throw new Error("Choose valid locations.");
  const endpoint = process.env.EXPO_PUBLIC_ROUTING_URL || "https://router.project-osrm.org";
  const response = await fetch(`${endpoint}/route/v1/driving/${origin.coordinate.join(",")};${destination.coordinate.join(",")}?alternatives=true&overview=full&geometries=geojson&steps=true`, { signal });
  if (!response.ok) throw new Error("Route service unavailable");
  const payload = await response.json();
  if (payload.code !== "Ok" || !Array.isArray(payload.routes) || !payload.routes.length) throw new Error("No route available");
  return payload.routes.slice(0, 2).map((route: unknown, i: number) => ({
    ...parseRoute({ code: "Ok", routes: [route] } as Parameters<typeof parseRoute>[0], destination.name),
    id: `road-${i}`, title: i ? "Alternative road route" : "Recommended road route", detail: "Road-service estimate · excludes live traffic", mode: "drive", delay: 0, isDemo: false,
  }));
}

const geometryCache = new Map<string, Journey>();
let nextFootRequest = 0;
async function streetRoute(points: Coordinate[], destination: string, walking: boolean, signal: AbortSignal): Promise<Journey> {
  if (points.some((point) => !validCoordinate(point))) throw new Error("Choose valid locations.");
  const endpoint = walking ? process.env.EXPO_PUBLIC_WALKING_ROUTING_URL || "https://routing.openstreetmap.de/routed-foot" : process.env.EXPO_PUBLIC_ROUTING_URL || "https://router.project-osrm.org";
  const url = `${endpoint}/route/v1/${walking ? "foot" : "driving"}/${points.map((point) => point.join(",")).join(";")}?overview=full&geometries=geojson&steps=true`;
  const cached = geometryCache.get(url);
  if (cached) return { ...cached, destination, steps: cached.steps.map((step, index) => index === cached.steps.length - 1 ? { ...step, instruction: `Arrive at ${destination}` } : step) };
  // Respect the public walking server's one request per second policy.
  if (walking && !process.env.EXPO_PUBLIC_WALKING_ROUTING_URL) {
    const now = Date.now();
    const wait = Math.max(0, nextFootRequest - now);
    nextFootRequest = Math.max(now, nextFootRequest) + 1100;
    if (wait) await new Promise<void>((resolve, reject) => {
      if (signal.aborted) { reject(new Error("Route request cancelled")); return; }
      const cancel = () => { clearTimeout(timer); reject(new Error("Route request cancelled")); };
      const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(); }, wait);
      signal.addEventListener("abort", cancel, { once: true });
    });
  }
  if (signal.aborted) throw new Error("Route request cancelled");
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Route service unavailable");
  const journey = parseRoute(await response.json(), destination);
  geometryCache.set(url, journey);
  if (geometryCache.size > 60) geometryCache.delete(geometryCache.keys().next().value!);
  return journey;
}
export async function requestWalkingOptions(origin: Place, destination: Place, signal: AbortSignal): Promise<RouteOption[]> {
  const journey = await streetRoute([origin.coordinate, destination.coordinate], destination.name, true, signal);
  return [{ ...journey, id: "walk-trail", title: "Walking via mapped paths", detail: "OpenStreetMap walking network · check crossings and access on site", mode: "walk", isDemo: false, delay: 0, geometrySource: "walking-service" }];
}
export async function requestTransitOptions(origin: Place, destination: Place, signal: AbortSignal): Promise<RouteOption[]> {
  const previews = demoRouteOptions(origin, destination, "transit");
  if (!previews.length) return [];
  const stop1 = places.find((place) => place.id === "stop-1")!;
  const stop2 = places.find((place) => place.id === "stop-2")!;
  const hub = places.find((place) => place.id === "kwasa-hub")!;
  const results: RouteOption[] = [];
  for (const option of previews) {
    const boarding = option.id === "transit-s1" ? stop1 : stop2;
    const alighting = option.id === "transit-van" || distanceBetween(destination.coordinate, hub.coordinate) < 20 ? destination : hub;
    const legs: Journey[] = [];
    if (distanceBetween(origin.coordinate, boarding.coordinate) >= 20) legs.push(await streetRoute([origin.coordinate, boarding.coordinate], boarding.name, true, signal));
    const roadPoints = option.id === "transit-s1" ? [boarding.coordinate, stop2.coordinate, alighting.coordinate] : option.id === "transit-trail" ? [boarding.coordinate, stop1.coordinate, alighting.coordinate] : [boarding.coordinate, alighting.coordinate];
    legs.push(await streetRoute(roadPoints, alighting.name, false, signal));
    if (distanceBetween(alighting.coordinate, destination.coordinate) >= 20) legs.push(await streetRoute([alighting.coordinate, destination.coordinate], destination.name, true, signal));
    const segments = legs.map((leg) => leg.coordinates);
    const coordinates = segments.flat();
    const distance = legs.reduce((sum, leg) => sum + leg.distance, 0);
    const duration = legs.reduce((sum, leg) => sum + leg.duration, 0) + 360;
    results.push({ ...option, coordinates, segments, distance, duration, geometrySource: "road-service", detail: "Mapped roads and walking legs · proposed service / example timetable", steps: [
      ...legs.flatMap((leg, legIndex) => leg.steps.map((step) => ({ ...step, instruction: `${legIndex === 0 && legs.length > 1 ? "Connection: " : ""}${step.instruction}` }))),
      { instruction: `Arrive at ${destination.name}`, coordinate: destination.coordinate, bearing: 0, duration: 0, distance: 0 },
    ] });
  }
  return results;
}
