/** Most recent first, unique, and bounded so local history cannot grow indefinitely. */
export function rememberSearch(history: string[], placeId: string): string[] {
  return [placeId, ...history.filter((id) => id !== placeId)].slice(0, 20);
}
