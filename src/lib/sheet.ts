/** Snap heights are relative to the map viewport, which excludes the tab bar. */
export function sheetSnapPoints(availableHeight: number, expandedHeight?: number): number[] {
  const expanded = Math.max(1, Math.floor(expandedHeight ?? availableHeight * 0.8));
  return [Math.min(220, expanded * 0.55), Math.min(440, expanded * 0.8), expanded];
}
export function nearestSnap(points: number[], height: number, velocity = 0): number {
  const projected = height - velocity * 120;
  return points.reduce((best, point, i) => Math.abs(point - projected) < Math.abs(points[best] - projected) ? i : best, 0);
}

/** Routing uses a compact overview and a bounded reading panel. */
export function routingSnapPoints(availableHeight: number, topInset = 0): number[] {
  const expanded = Math.max(1, Math.floor(availableHeight - topInset - 8));
  return [Math.min(120, expanded * 0.3), Math.min(340, expanded * 0.65), expanded];
}

/** Taps alternate reading and overview; peek is reached by dragging only. */
export function toggledSheetSnap(index: number): number {
  return index === 2 ? 1 : 2;
}
