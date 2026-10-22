import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated } from "react-native";
import { SlidersHorizontal, X, type LucideIcon } from "lucide-react-native";
import { PressableFeedback, Typography } from "./Common";
import { colors, fonts } from "../lib/theme";

export default function CommunityFilterButton({ active, label, icon: Icon, onPress }: { active: boolean; label: string; icon: LucideIcon; onPress: () => void }) {
  const width = useRef(new Animated.Value(active ? 122 : 40)).current;
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    const animation = Animated.timing(width, { toValue: active ? 122 : 40, duration: reducedMotion ? 0 : 180, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [active, reducedMotion, width]);
  return <Animated.View style={{ width, height: 40, borderRadius: 20, overflow: "hidden", backgroundColor: active ? colors.redSoft : colors.white, borderWidth: 1, borderColor: active ? colors.redSoft : colors.border }}>
    <PressableFeedback accessibilityRole="button" accessibilityLabel={active ? `Clear ${label.trim()} filter` : "Filter community"} onPress={onPress} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
      {active ? <><Icon size={14} color={colors.red} /><Typography numberOfLines={1} style={{ color: colors.red, fontFamily: fonts.semibold, fontSize: 13 }}>{label}</Typography><X size={13} color={colors.red} /></> : <SlidersHorizontal size={18} color={colors.ink} />}
    </PressableFeedback>
  </Animated.View>;
}
