import type { Coordinate, Place } from "./data";
import { isAnnouncementMarker, isLiveBusMarker, markerKind } from "./map-layers";

export const ANNOUNCEMENT_CLUSTER_RADIUS = 52;
export const ANNOUNCEMENT_EXPAND_ZOOM = 16.5;
export interface AnnouncementCluster {
  id: string;
  coordinate: Coordinate;
  members: Place[];
  count: number;
  expansionZoom: number;
  mixed: boolean;
  coLocated: boolean;
  markerOffset: Coordinate;
}
const project = ([longitude, latitude]: Coordinate): Coordinate => {
  const sin = Math.sin(Math.max(-85.051129, Math.min(85.051129, latitude)) * Math.PI / 180);
  return [(longitude + 180) / 360, 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)];
};
const unproject = ([x, y]: Coordinate): Coordinate => [x * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180 / Math.PI];

function groups(places: Place[], zoom: number, nearOnly = false): Place[][] {
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
        if (nearOnly ? distanceMeters(places[i].coordinate, places[j].coordinate) <= 15 : Math.hypot(Math.min(dx, 1 - dx) * scale, (points[i][1] - points[j][1]) * scale) <= ANNOUNCEMENT_CLUSTER_RADIUS) {
          visited.add(j); queue.push(j);
        }
      }
    }
    result.push(group);
  }
  return result;
}

export function markerDiameter(place: Place): number {
  return isAnnouncementMarker(place) || isLiveBusMarker(place) ? 48 : markerKind(place) === "camera" || markerKind(place) === "hazard" ? 32 : markerKind(place) === "shuttle" ? 30 : 26;
}
function distanceMeters(a: Coordinate, b: Coordinate): number {
  const lng = Math.min(Math.abs(a[0] - b[0]), 360 - Math.abs(a[0] - b[0]));
  return Math.hypot(lng * Math.cos((a[1] + b[1]) * Math.PI / 360), a[1] - b[1]) * 111320;
}
function fanOut(members: Place[]): Place[] {
  const largest = Math.max(...members.map(markerDiameter));
  // The base pattern keeps 30px stops apart; enlarge it for 48px photo bubbles.
  const scale = Math.max(1, (largest + 4) / 36);
  const radius = Math.max(28, (largest + 6) / (2 * Math.sin(Math.PI / members.length)));
  return members.map((place, index) => {
    const pattern = members.length === 2 ? [[-18, 0], [18, 0]] : members.length === 3 ? [[0, -20], [-18, 14], [18, 14]] : null;
    const angle = -Math.PI / 2 + index * 2 * Math.PI / members.length;
    return { ...place, markerOffset: pattern ? [pattern[index][0] * scale, pattern[index][1] * scale] : [Math.cos(angle) * radius, Math.sin(angle) * radius] };
  });
}
/** Cross-type grouping, with deterministic close-range offsets on native and web. */
export function clusterAnnouncementMarkers(markers: Place[], zoom: number, selectedId?: string, enabled = true): { places: Place[]; clusters: AnnouncementCluster[] } {
  const safeZoom = Number.isFinite(zoom) ? Math.max(0, Math.min(22, zoom)) : 14.4;
  const notices: Place[] = [], ordinary: Place[] = [];
  for (const marker of markers) {
    if (!Array.isArray(marker.coordinate) || marker.coordinate.length !== 2 || !marker.coordinate.every(Number.isFinite) || Math.abs(marker.coordinate[0]) > 180 || Math.abs(marker.coordinate[1]) > 90) continue;
    (!isLiveBusMarker(marker) ? notices : ordinary).push(marker);
  }
  notices.sort((a, b) => a.id.localeCompare(b.id));
  const clusters: AnnouncementCluster[] = [];
  const close = safeZoom >= ANNOUNCEMENT_EXPAND_ZOOM || !enabled;
  for (const members of groups(notices, safeZoom, close)) {
    if (members.length === 1) { ordinary.push(members[0]); continue; }
    if (close && (members.length <= 3 || !enabled)) { ordinary.push(...fanOut(members)); continue; }
    const selected = close ? members.find(place => place.id === selectedId) : undefined;
    if (selected) {
      ordinary.push({ ...selected, markerOffset: [0, -64] });
      members.splice(members.indexOf(selected), 1);
    }
    const coLocated = members.every(place => members.every(other => distanceMeters(place.coordinate, other.coordinate) <= 15));
    const types = new Set(members.map(place => isAnnouncementMarker(place) ? "announcement" : markerKind(place)));
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
    const coordinate = unproject(center);
    const markerOffset: Coordinate = [0, 0];
    // Keep the always-visible live vehicle separate from a nearby count bubble.
    for (const bus of ordinary.filter(isLiveBusMarker)) {
      const busPoint = project(bus.coordinate), scale = 512 * 2 ** safeZoom;
      const dx = (center[0] - busPoint[0]) * scale, dy = (center[1] - busPoint[1]) * scale;
      const distance = Math.hypot(dx, dy);
      if (distance < 60) {
        const angle = distance < 1 ? -Math.PI / 4 : Math.atan2(dy, dx);
        markerOffset[0] = Math.cos(angle) * (64 - distance);
        markerOffset[1] = Math.sin(angle) * (64 - distance);
      }
    }
    clusters.push({ id: `announcement-cluster:${members.map(place => place.id).join("|")}`, coordinate, members, count: members.length, expansionZoom, mixed: types.size > 1, coLocated, markerOffset });
  }
  ordinary.sort((a, b) => Number(a.id === selectedId) - Number(b.id === selectedId));
  return { places: ordinary, clusters };
}

export function clusterOpensList(cluster: AnnouncementCluster, zoom: number): boolean {
  return cluster.coLocated || zoom >= ANNOUNCEMENT_EXPAND_ZOOM;
}
export const clusterLabel = (cluster: AnnouncementCluster) => `${cluster.count} ${cluster.mixed ? "mixed facilities" : "map items"}. ${cluster.coLocated ? "View colocated facilities" : "Zoom in to view"}`;
