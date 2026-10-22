import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import type { ImagePickerAsset } from "expo-image-picker";
const avatarFolder = () => FileSystem.documentDirectory ? `${FileSystem.documentDirectory}avatars/` : null;
export async function persistAvatar(asset: ImagePickerAsset): Promise<string> {
  if ((asset.fileSize ?? 0) > 5 * 1024 * 1024) throw new Error("Choose a photo smaller than 5 MB.");
  if (Platform.OS === "web") {
    if (!asset.base64) throw new Error("This photo could not be saved. Please choose another image.");
    return `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`;
  }
  const folder = avatarFolder();
  if (!folder) throw new Error("Photo storage is unavailable on this device.");
  await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
  const extension = /\.(png|webp|heic|heif)(?:\?|$)/i.exec(asset.uri)?.[1]?.toLowerCase() || "jpg";
  const destination = `${folder}${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  await FileSystem.copyAsync({ from: asset.uri, to: destination });
  return destination;
}
export async function deleteAvatar(uri: string | null): Promise<void> {
  if (Platform.OS === "web" || !uri) return;
  const folder = avatarFolder();
  if (folder && uri.startsWith(folder)) await FileSystem.deleteAsync(uri, { idempotent: true });
}
