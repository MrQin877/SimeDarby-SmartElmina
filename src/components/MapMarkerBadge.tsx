import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, View } from "react-native";
import { BusFront, Video, TriangleAlert, MapPin } from "lucide-react-native";
import type { Place } from "../lib/data";
import { markerKind } from "../lib/map-layers";
import { colors } from "../lib/theme";

export default function MapMarkerBadge({ place, selected }: { place: Place; selected: boolean }) {
  const kind = markerKind(place);
  const pulse = useRef(new Animated.Value(0)).current;
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (kind !== "traffic" || reducedMotion) { pulse.setValue(0); return; }
    const animation = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true, isInteraction: false }));
    animation.start();
    return () => animation.stop();
  }, [kind, pulse, reducedMotion]);
  const Icon = kind === "camera" ? Video : kind === "shuttle" ? BusFront : kind === "hazard" ? TriangleAlert : MapPin;
  const backgroundColor = kind === "camera" ? colors.blue : kind === "shuttle" || kind === "traffic" ? colors.red : kind === "hazard" ? "transparent" : selected ? colors.red : colors.white;
  return <View style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}>
    {kind === "traffic" && <Animated.View style={{ position: "absolute", width: 40, height: 40, borderRadius: 20, backgroundColor: colors.red, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }] }} />}
    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor, borderWidth: kind === "hazard" ? 0 : selected ? 3 : 2, borderColor: selected ? colors.ink : colors.white, alignItems: "center", justifyContent: "center" }}>
      {kind === "traffic" ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.white }} /> : <Icon size={kind === "hazard" ? 36 : 20} fill={kind === "hazard" ? colors.amber : "none"} color={kind === "hazard" ? colors.white : backgroundColor === colors.white ? colors.ink : colors.white} />}
    </View>
  </View>;
}
