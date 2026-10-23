export function residentInitials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => Array.from(part)[0]).join("").toUpperCase() || "R";
}
export function restoreAvatarUri(value: unknown): string | null {
  return typeof value === "string" && /^(file:\/\/|data:image\/(jpeg|png|webp|heic|heif|gif);base64,)/i.test(value) ? value : null;
}
