export interface NativeClipboard {
  setStringAsync?: (text: string, options: Record<string, never>) => Promise<boolean>;
}

/** Older development builds may not include the optional clipboard native module. */
export async function writeClipboard(module: NativeClipboard | null, text: string): Promise<boolean> {
  if (!module?.setStringAsync) return false;
  try {
    return await module.setStringAsync(text, {});
  } catch {
    return false;
  }
}
