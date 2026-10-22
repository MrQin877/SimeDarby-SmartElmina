export const shortcutIcons = ["map-pin", "dumbbell", "graduation-cap", "shopping-basket", "landmark"] as const;
export type ShortcutIcon = typeof shortcutIcons[number];
export interface ShortcutItem {
  id: string;
  title: string;
  address: string;
  placeId: string;
  iconName: ShortcutIcon;
}

/** Home and Work are separate protected slots, never custom shortcuts. */
export function restoreShortcuts(value: unknown): ShortcutItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.filter((item): item is ShortcutItem => {
    if (!item || typeof item.id !== "string" || !item.id.trim() || item.id === "home" || item.id === "work" || seen.has(item.id)
      || typeof item.title !== "string" || !item.title.trim() || typeof item.address !== "string" || typeof item.placeId !== "string" || !item.placeId.trim()) return false;
    seen.add(item.id);
    return true;
  }).slice(0, 20).map((item) => ({
    id: item.id, title: item.title.trim().slice(0, 24), address: item.address, placeId: item.placeId,
    iconName: shortcutIcons.includes(item.iconName) ? item.iconName : "map-pin",
  }));
}

export function upsertShortcut(items: ShortcutItem[], item: ShortcutItem): ShortcutItem[] {
  const clean = restoreShortcuts([item])[0];
  if (!clean) return items;
  if (items.some((entry) => entry.id === clean.id)) return items.map((entry) => entry.id === clean.id ? clean : entry);
  return items.length < 20 ? [...items, clean] : items;
}
