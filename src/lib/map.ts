import trafficGeometry from '../../assets/demo-traffic.json';
import type { FeatureCollection, LineString } from "geojson";
import { CENTER, roadCorridors, type Coordinate, type Place } from "./data";
import { validCoordinate } from "./routing";
import baseStyle from "../../assets/map-style.json";
export const mapStyle = process.env.EXPO_PUBLIC_MAP_STYLE_URL || baseStyle;
export type MapProps = {
  markers: Place[];
  onSelect?: (place: Place) => void;
  onMapPress?: (coordinate: Coordinate) => void;
  onMapLongPress?: (coordinate: Coordinate) => void;
  onTrafficPress?: (selection?: { corridorId?: string; name?: string; coordinate?: Coordinate }) => void;
  selectedId?: string;
  center?: Coordinate;
  traffic?: boolean;
  route?: Coordinate[];
  shuttleRoute?: Coordinate[];
  zoomLevel?: number;
  routeOptions?: { id: string; coordinates: Coordinate[]; segments?: Coordinate[][] }[];
  selectedRouteId?: string;
  onRouteSelect?: (id: string) => void;
  viewportPadding?: { top: number; bottom: number };
  bearing?: number;
  pitch?: number;
  following?: boolean;
  userCoordinate?: Coordinate;
  cameraKey?: number;
};
/** Split at invalid coordinates rather than drawing a false bridge across a gap. */
export function validLineSegments(coordinates: Coordinate[]): Coordinate[][] {
  const result: Coordinate[][] = [];
  let current: Coordinate[] = [];
  const flush = () => { if (current.length > 1) result.push(current); current = []; };
  for (const point of coordinates) {
    if (!Array.isArray(point) || !validCoordinate(point)) { flush(); continue; }
    const previous = current[current.length - 1];
    if (!previous || previous[0] !== point[0] || previous[1] !== point[1]) current.push(point);
  }
  flush();
  return result;
}
export function lineFeature(coordinates: Coordinate[], segments?: Coordinate[][]): FeatureCollection<LineString> {
  return {
    type: "FeatureCollection",
    features: (segments || [coordinates]).flatMap(validLineSegments).map((segment) => ({
      type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: segment },
    })),
  };
}
// Real road geometry from OSRM / OpenStreetMap; traffic colours are synthetic demo data.
export { default as trafficGeometry } from '../../assets/demo-traffic.json';

export const trafficLines: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: (trafficGeometry as FeatureCollection<LineString>).features.flatMap((feature, index) => lineFeature(feature.geometry.coordinates as Coordinate[]).features.map((line) => ({ ...line, properties: { ...feature.properties, corridorId: roadCorridors[index % roadCorridors.length].id } }))),
};
export const roadLayerIds = baseStyle.layers.filter((layer) => layer.type === "line" && /^road_/.test(layer.id) && !/rail|path/.test(layer.id)).map((layer) => layer.id);


export function routeBounds(coordinates: Coordinate[]): [Coordinate, Coordinate] {
  const valid = coordinates.filter((point) => Array.isArray(point) && validCoordinate(point));
  if (!valid.length) return [[CENTER[0] - 0.001, CENTER[1] - 0.001], [CENTER[0] + 0.001, CENTER[1] + 0.001]];
  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
  for (const [lng, lat] of valid) { west = Math.min(west, lng); east = Math.max(east, lng); south = Math.min(south, lat); north = Math.max(north, lat); }
  return [[west, south], [east === west ? east + 0.00001 : east, north === south ? north + 0.00001 : north]];
}
