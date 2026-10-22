import { requireOptionalNativeModule } from "expo";
import { writeClipboard, type NativeClipboard } from "./clipboard-shared";

export function copyText(text: string): Promise<boolean> {
  // Do not import expo-clipboard here: its module and native view are required at import time.
  // Resolve the optional module only when the resident taps Copy.
  return writeClipboard(requireOptionalNativeModule<NativeClipboard>("ExpoClipboard"), text);
}
