import { useEffect } from "react";
import { cancelAnimation, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

/** Animate a permanent content wrapper without native entering/exiting view removal. */
export function useSheetContentTransition(detail: boolean) {
  const offset = useSharedValue(0);
  useEffect(() => {
    offset.value = detail ? 16 : -16;
    offset.value = withTiming(0, { duration: 220, reduceMotion: ReduceMotion.System });
    return () => cancelAnimation(offset);
  }, [detail, offset]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));
}
