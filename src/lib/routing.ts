import { CENTER, type Coordinate } from "./data";
export type RouteStep = {
  instruction: string;
  distance: number;
  duration: number;
  coordinate: Coordinate;
  bearing: number;
};
export type Journey = {
  mode?: "drive" | "transit" | "walk";
  isDemo?: boolean;
  destination: string;
  coordinates: Coordinate[];
  duration: number;
  distance: number;
  steps: RouteStep[];
};
let currentJourney: Journey | null = null;
export function getJourney() {
  return currentJourney;
}
export function clearJourney() {
  currentJourney = null;
}
export function setJourney(journey: Journey) {
  currentJourney = journey;
}
export function validCoordinate(value: number[]): value is Coordinate {
  return (
    value.length === 2 &&
    value.every(Number.isFinite) &&
    Math.abs(value[0]) <= 180 &&
    Math.abs(value[1]) <= 90
  );
}
type OSRMStep = {
  name?: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
    location: Coordinate;
    bearing_after?: number;
  };
};
type OSRMResponse = {
  code: string;
  routes?: {
    duration: number;
    distance: number;
    geometry: { coordinates: Coordinate[] };
    legs: { steps: OSRMStep[] }[];
  }[];
};
export function parseRoute(data: OSRMResponse, destination: string): Journey {
  const route = data.routes?.[0];
  if (
    data.code !== "Ok" ||
    !route ||
    !Array.isArray(route.geometry?.coordinates) ||
    route.geometry.coordinates.length < 2 ||
    !route.geometry.coordinates.every(validCoordinate) ||
    !Number.isFinite(route.duration) ||
    !Number.isFinite(route.distance)
  )
    throw new Error("No driving route is available for that location.");
  const steps = route.legs
    .flatMap((leg) => leg.steps)
    .map((step) => ({
      instruction:
        step.maneuver.type === "arrive"
          ? `Arrive at ${destination}`
          : `${step.maneuver.type === "depart" ? "Head" : step.maneuver.type === "roundabout" ? "At the roundabout, continue" : "Continue"} ${step.maneuver.modifier || "ahead"}${step.name ? ` on ${step.name}` : ""}`,
      distance: step.distance,
      duration: step.duration,
      coordinate: step.maneuver.location,
      bearing: step.maneuver.bearing_after || 0,
    }));
  if (!steps.length)
    throw new Error("Directions are unavailable for this route.");
  return {
    destination,
    coordinates: route.geometry.coordinates,
    distance: route.distance,
    duration: route.duration,
    steps,
  };
}
export async function requestRoute(
  destination: Coordinate,
  name: string,
  signal: AbortSignal,
): Promise<Journey> {
  if (!validCoordinate(destination))
    throw new Error("Choose a valid destination.");
  const endpoint =
    process.env.EXPO_PUBLIC_ROUTING_URL || "https://router.project-osrm.org";
  const response = await fetch(
    `${endpoint}/route/v1/driving/${CENTER.join(",")};${destination.join(",")}?overview=full&geometries=geojson&steps=true`,
    { signal },
  );
  if (!response.ok)
    throw new Error("The route service is unavailable. Please try again.");
  return parseRoute(await response.json(), name);
}
export function minutes(seconds: number) {
  return Math.max(1, Math.ceil(seconds / 60));
}
export function distanceLabel(meters: number) {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}
