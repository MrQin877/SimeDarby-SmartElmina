import trafficGeometry from '../../assets/demo-traffic.json';
import type { FeatureCollection, LineString } from "geojson";
import type { Coordinate, Place } from "./data";
import baseStyle from "../../assets/map-style.json";
export const mapStyle = process.env.EXPO_PUBLIC_MAP_STYLE_URL || baseStyle;
export type MapProps = {
  markers: Place[];
  onSelect?: (place: Place) => void;
  onMapPress?: (coordinate: Coordinate) => void;
  selectedId?: string;
  center?: Coordinate;
  traffic?: boolean;
  route?: Coordinate[];
  bearing?: number;
  userCoordinate?: Coordinate;
  cameraKey?: number;
};
export function lineFeature(
  coordinates: Coordinate[],
): FeatureCollection<LineString> {
  return {
    type: "FeatureCollection",
    features:
      coordinates.length > 1
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates },
            },
          ]
        : [],
  };
}
// Real road geometry from OSRM / OpenStreetMap; traffic colours are synthetic demo data.
export { default as trafficGeometry } from '../../assets/demo-traffic.json';

export const trafficLines = trafficGeometry as FeatureCollection<LineString>;
