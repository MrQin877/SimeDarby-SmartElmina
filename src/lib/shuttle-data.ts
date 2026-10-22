import geometry from "../../assets/shuttle-route.json";
import type { Coordinate, Place } from "./data";
export const SHUTTLE_BLUE = "#38BDF8";
export const elminaBusStops: Place[] = [
  { id: "bus-stop-1", name: "Elmina Central Park / Iconic Bridge", subtitle: "Lakeside Pavilion & Bay", coordinate: [101.51425, 3.17901], kind: "transport" },
  { id: "bus-stop-2", name: "Elmina Valley (Phases 3 & 4)", subtitle: "Persiaran Atmosfera", coordinate: [101.5160, 3.1765], kind: "transport" },
  { id: "bus-stop-3", name: "Elmina Green Lake Park", subtitle: "Sakura Lake recreational stop", coordinate: [101.5035, 3.1970], kind: "transport" },
  { id: "bus-stop-4", name: "Ilham Residence / Elmina Green 7", subtitle: "Jalan Casuarina precinct", coordinate: [101.5080, 3.2010], kind: "transport" },
  { id: "bus-stop-5", name: "TEMU Elmina", subtitle: "Commercial hub & retail avenue", coordinate: [101.5099, 3.18133], kind: "transport" },
  { id: "bus-stop-6", name: "Elmina Gardens (Persiaran Eserina)", subtitle: "Eastern residential gateway", coordinate: [101.5240, 3.1730], kind: "transport" },
  { id: "bus-stop-7", name: "Elmina Ridge Main Entrance", subtitle: "Scenic ridge access", coordinate: [101.5190, 3.1880], kind: "transport" },
  { id: "bus-stop-8", name: "e-Boulevard Denai Alam", subtitle: "Jalan Elektron commercial avenue", coordinate: [101.5280, 3.1600], kind: "transport" },
  { id: "bus-stop-9", name: "SK Bukit Subang", subtitle: "Primary school community stop", coordinate: [101.5220, 3.1610], kind: "transport" },
  { id: "bus-stop-10", name: "Persiaran Singgahsana / Ficus Peak", subtitle: "Ficus Peak residential loop", coordinate: [101.5340, 3.1630], kind: "transport" },
];
// Captured OSRM road geometry, including the return leg to Central Park.
export const shuttleRouteCoordinates = geometry.geometry.coordinates as Coordinate[];
export const liveBusLocation = {
  id: "live-bus-s1", name: "Feeder Bus S1 (Demo in transit)",
  // Road-snapped sample position; an actual vertex of the loop, not GPS telemetry.
  coordinate: [101.512072, 3.179985] as Coordinate,
  heading: 135, status: "In transit · Next: Elmina Central Park", speed: "32 km/h",
};
export const liveBusPlace: Place = { ...liveBusLocation, subtitle: `${liveBusLocation.status} · ${liveBusLocation.speed} · simulated`, kind: "transport" };
export const shuttleMapPlaces = (allPlaces: Place[]) => [...allPlaces.filter(p => p.kind !== "transport"), ...elminaBusStops];
export function canonicalShuttlePlace(place: Place): Place {
  const aliases: Record<string, number> = { "stop-1": 0, "stop-2": 4, "atmosfera-stop": 1 };
  return place.id in aliases ? elminaBusStops[aliases[place.id]] : place;
}
