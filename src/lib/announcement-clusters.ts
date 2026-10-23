import type { Coordinate, Place } from "./data";
import { isAnnouncementMarker } from "./map-layers";

export const ANNOUNCEMENT_CLUSTER_RADIUS = 64;
export const ANNOUNCEMENT_EXPAND_ZOOM = 17;
export interface AnnouncementCluster {
  id: string;
  coordinate: Coordinate;
  members: Place[];
  count: number;
  expansionZoom: number;
}
const project = ([longitude, latitude]: Coordinate): Coordinate => {
  const sin = Math.sin(Math.max(-85.051129, Math.min(85.051129, latitude)) * Math.PI / 180);
  return [(longitude + 180) / 360, 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)];
};
const unproject = ([x, y]: Coordinate): Coordinate => [x * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180 / Math.PI];

function groups(places: Place[], zoom: number): Place[][] {
  if (zoom >= ANNOUNCEMENT_EXPAND_ZOOM) return places.map(place => [place]);
  const scale = 512 * 2 ** zoom;
  const points = places.map(place => project(place.coordinate));
  const visited = new Set<number>();
  const result: Place[][] = [];
  for (let start = 0; start < places.length; start++) {
    if (visited.has(start)) continue;
    const group: Place[] = [], queue = [start];
    visited.add(start);
    for (let n = 0; n < queue.length; n++) {
      const i = queue[n];
      group.push(places[i]);
      for (let j = 0; j < places.length; j++) {
        if (visited.has(j)) continue;
        const dx = Math.abs(points[i][0] - points[j][0]);
        if (Math.hypot(Math.min(dx, 1 - dx) * scale, (points[i][1] - points[j][1]) * scale) <= ANNOUNCEMENT_CLUSTER_RADIUS) {
          visited.add(j); queue.push(j);
        }
      }
    }
    result.push(group);
  }
  return result;
}

/** Same zoom/radius rules on native and web; ordinary markers never join notice clusters. */
export function clusterAnnouncementMarkers(markers: Place[], zoom: number): { places: Place[]; clusters: AnnouncementCluster[] } {
  const safeZoom = Number.isFinite(zoom) ? Math.max(0, Math.min(22, zoom)) : 14.4;
  const notices: Place[] = [], ordinary: Place[] = [];
  for (const marker of markers) {
    if (!Array.isArray(marker.coordinate) || marker.coordinate.length !== 2 || !marker.coordinate.every(Number.isFinite) || Math.abs(marker.coordinate[0]) > 180 || Math.abs(marker.coordinate[1]) > 90) continue;
    (isAnnouncementMarker(marker) ? notices : ordinary).push(marker);
  }
  notices.sort((a, b) => a.id.localeCompare(b.id));
  const clusters: AnnouncementCluster[] = [];
  for (const members of groups(notices, safeZoom)) {
    if (members.length === 1) { ordinary.push(members[0]); continue; }
    const originX = project(members[0].coordinate)[0];
    const center: Coordinate = [0, 0];
    for (const member of members) {
      const [x, y] = project(member.coordinate);
      // Wrap longitude around the first member, including a group crossing the date line.
      center[0] += originX + ((((x - originX) + 1.5) % 1) - 0.5);
      center[1] += y;
    }
    center[0] = ((center[0] / members.length) % 1 + 1) % 1;
    center[1] /= members.length;
    let expansionZoom = Math.min(ANNOUNCEMENT_EXPAND_ZOOM, safeZoom + 0.5);
    while (expansionZoom < ANNOUNCEMENT_EXPAND_ZOOM && groups(members, expansionZoom).length === 1) expansionZoom = Math.min(ANNOUNCEMENT_EXPAND_ZOOM, expansionZoom + 0.5);
    clusters.push({ id: `announcement-cluster:${members.map(place => place.id).join("|")}`, coordinate: unproject(center), members, count: members.length, expansionZoom });
  }
  return { places: ordinary, clusters };
}
