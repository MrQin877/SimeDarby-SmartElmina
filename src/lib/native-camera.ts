/** MapLibre's camera methods return native promises despite being typed void. */
export async function runCameraCommand(
  isCurrent: () => boolean,
  command: () => unknown,
  onError: (error: unknown) => void,
): Promise<void> {
  if (!isCurrent()) return;
  try {
    await command();
  } catch (error) {
    if (!isCurrent()) return;
    const message = error instanceof Error ? error.message : String(error);
    // The native view can disappear between the JS ref check and native dispatch.
    if (/could not find MLRNCamera|NativeCameraComponent ref is null/.test(message)) return;
    onError(error);
  }
}
