import { places, type Coordinate, type Place } from "./data";
import { parseRoute, validCoordinate, type Journey } from "./routing";
import { cityCentreDirectRoad, cityCentreBypassRoad, cityCentreWalkTrail } from "./scenario-routes";

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
  const isCityCentre = destination.id === "elmina-city-centre" || /city centre/i.test(destination.name);
  if (mode === "drive") {
    if (isCityCentre) {
      return [
        make("drive-alt", "Via Elmina West Bypass (Recommended Detour)", 12, cityCentreBypassRoad, [
          `Depart from ${origin.name} via Persiaran Atmosfera`,
          "Take ramp onto Elmina West Bypass (diverts around Persiaran Elmina closure)",
          "Continue on Elmina West Bypass for 2.6 km with smooth flow",
          "Exit right onto Persiaran Boulevard towards City Centre",
          `Arrive at ${destination.name}`,
        ], {
          detail: "Fastest detour · Clear traffic flow (avoids 7:00–11:00 AM resurfacing)",
          delay: 0,
          distance: 4800,
        }),
        make("drive-main", "Via Persiaran Elmina (Road Resurfacing)", 27, cityCentreDirectRoad, [
          `Depart from ${origin.name}`,
          "Head north along Persiaran Elmina towards Elmina City Centre",
          "Caution: Road resurfacing active (single-lane bottleneck ahead)",
          "Follow auxiliary marshal directions through work zone",
          `Arrive at ${destination.name}`,
        ], {
          detail: "Direct corridor · +15 min delay · Heavy congestion & active maintenance",
          delay: 15,
          distance: 3900,
        }),
      ];
    }
    return [
      make("drive-main", "Via Persiaran Atmosfera", driveMinutes, road, [`Depart from ${origin.name}`, "Continue on Persiaran Atmosfera", "Turn towards the destination access road", `Arrive at ${destination.name}`], { detail: "Primary route · sample traffic delay included", delay: Math.min(12, Math.max(0, driveMinutes - 2)) }),
      make("drive-alt", "Via GCE / Elmina West bypass", driveMinutes + 4, alternative, [`Depart from ${origin.name}`, "Continue towards the Elmina West bypass", "Take the destination exit", `Arrive at ${destination.name}`], { detail: "Alternative route · lower simulated congestion", delay: 3, distance: Math.round(distance * 1.16) }),
    ];
  }
  if (mode === "walk") {
    if (isCityCentre) {
      return [
        make("walk-trail", "Park Scenic Trail", 24, cityCentreWalkTrail, [
          `Walk from ${origin.name} along Central Park Lakeside Trail`,
          "Follow shaded pedestrian trail past Rainbow Bridge",
          "Use marked signalised crossing towards Boulevard",
          `Arrive at ${destination.name}`,
        ], {
          detail: "Pedestrian scenic pathway · 1.8 km · Zero emissions · Calorie burn ~95 kcal",
          distance: 1800,
        })
      ];
    }
    const walkMinutes = Math.min(60, Math.max(10, Math.round(distance / 75)));
    return [make("walk-trail", "Park Scenic Trail", walkMinutes, road, [`Walk from ${origin.name}`, "Follow the pedestrian trail and marked crossings", "Continue to the destination entrance", `Arrive at ${destination.name}`], { detail: "Walking route pending · use marked crossings" })];
  }
  if (isCityCentre) {
    return [
      make("transit-s1", "Feeder Bus S1 (Priority Transit)", 14, cityCentreDirectRoad, [
        `Walk from ${origin.name} to Elmina Valley Gate stop (3 min)`,
        "Board Feeder Bus S1 (runs via dedicated bus bypass lane)",
        "Transit along express corridor unaffected by road closure",
        `Arrive at ${destination.name} Concourse`,
      ], {
        fare: "Free with Resident Pass",
        departure: "Leaves in 5 min (07:35 AM)",
        detail: "Dedicated transit lane · Unaffected by road closure",
        stops: [
          { name: "Elmina Valley Gate", time: "07:35", detail: "Board Feeder S1 · every 15 min" },
          { name: "Central Park Interchange", time: "07:41", detail: "Stop 4 · Covered connection" },
          { name: "Elmina City Centre Concourse", time: "07:49", detail: "Arrive at workplace lobby" },
        ],
      }),
      make("transit-van", "Smart Elmina Commuter Shuttle", 12, cityCentreBypassRoad, [
        `Board at ${origin.name} pickup point`,
        "Direct express via West Bypass to City Centre",
        `Arrive at ${destination.name}`,
      ], {
        fare: "RM 3.00 / seat",
        departure: "Departs 07:40 AM",
        detail: "Express van via bypass · 2 seats remaining",
        stops: [
          { name: "Elmina Valley Pickup", time: "07:40", detail: "Express departure" },
          { name: "Elmina City Centre Tower", time: "07:52", detail: "Direct drop-off" },
        ],
      }),
      make("transit-trail", "Park Scenic Trail + Feeder T101", 22, cityCentreWalkTrail, [
        `Walk from ${origin.name} along the park trail`,
        "Continue to Feeder T101 boarding bay",
        "Board Feeder T101",
        `Arrive at ${destination.name}`,
      ], {
        fare: "RM 1.00",
        departure: "Leaves in 10 min",
        detail: "Scenic walk · covered feeder connection",
        stops: [
          { name: origin.name, time: "07:35", detail: "Begin scenic trail walk" },
          { name: "Central Park trail connection", time: "07:45", detail: "Board T101 · every 15 min" },
          { name: destination.name, time: "07:57", detail: "Destination concourse" },
        ],
      }),
    ];
  }
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
  const isCityCentre = destination.id === "elmina-city-centre" || /city centre/i.test(destination.name);
  return payload.routes.slice(0, 2).map((route: unknown, i: number) => {
    const base = parseRoute({ code: "Ok", routes: [route] } as Parameters<typeof parseRoute>[0], destination.name);
    if (isCityCentre) {
      const isDetour = i === 0;
      return {
        ...base,
        id: `road-${i}`,
        title: isDetour ? "Via Elmina West Bypass (Recommended Detour)" : "Via Persiaran Elmina (Road Resurfacing)",
        detail: isDetour ? "Fastest detour route · Avoids Persiaran Elmina closure" : "Direct corridor · Active resurfacing (7:00 AM – 11:00 AM)",
        mode: "drive" as const,
        delay: isDetour ? 0 : 15,
        isDemo: false,
      };
    }
    return {
      ...base,
      id: `road-${i}`,
      title: i ? "Alternative road route" : "Recommended road route",
      detail: "Road-service estimate · excludes live traffic",
      mode: "drive" as const,
      delay: 0,
      isDemo: false,
    };
  });
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
  const isCityCentre = destination.id === "elmina-city-centre" || /city centre/i.test(destination.name);
  if (isCityCentre) {
    const previews = demoRouteOptions(origin, destination, "walk");
    if (previews.length) return previews.map((opt) => ({ ...opt, isDemo: false }));
  }
  const journey = await streetRoute([origin.coordinate, destination.coordinate], destination.name, true, signal);
  return [{ ...journey, id: "walk-trail", title: "Walking via mapped paths", detail: "OpenStreetMap walking network · check crossings and access on site", mode: "walk", isDemo: false, delay: 0, geometrySource: "walking-service" }];
}
export async function requestTransitOptions(origin: Place, destination: Place, signal: AbortSignal): Promise<RouteOption[]> {
  const previews = demoRouteOptions(origin, destination, "transit");
  if (!previews.length) return [];
  const isCityCentre = destination.id === "elmina-city-centre" || /city centre/i.test(destination.name);
  if (isCityCentre) {
    return previews.map((opt) => ({
      ...opt,
      isDemo: false,
      detail: "Dedicated township transit corridor · priority bus lane",
    }));
  }
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
