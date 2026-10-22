import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { VideoPlayer } from "expo-video";

export function useFocusedVideoPlayback(player: Pick<VideoPlayer, "play" | "pause">) {
  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => {
    setFocused(true);
    // useVideoPlayer may release the native object before this cleanup runs.
    // Let Expo own disposal; only update focus state during cleanup.
    return () => setFocused(false);
  }, []));
  useEffect(() => {
    if (focused) player.play();
    else player.pause();
  }, [focused, player]);
}
