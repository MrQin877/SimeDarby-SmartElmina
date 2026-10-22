import type { Place } from "./data";
export type MapLayer = "all" | "traffic" | "shuttle" | "cctv";
export const mapLayers: { value: MapLayer; label: string }[] = [
  { value: "all", label: "All" }, { value: "traffic", label: "Traffic" },
  { value: "shuttle", label: "Shuttle" }, { value: "cctv", label: "CCTV" },
];
export function filterMapPlaces(places: Place[], layer: MapLayer): Place[] {
  return places.filter((place) => markerKind(place) !== "traffic").filter((place) => layer === "all" || (layer === "traffic" ? place.kind === "hazard" : layer === "shuttle" ? place.kind === "transport" : place.kind === "camera"));
}
export function markerKind(place: Place): "camera" | "shuttle" | "hazard" | "traffic" | "place" {
  return place.id === "bottleneck-gce" || place.id.startsWith("corridor-") ? "traffic" : place.kind === "camera" ? "camera" : place.kind === "transport" ? "shuttle" : place.kind === "hazard" ? "hazard" : "place";
}
