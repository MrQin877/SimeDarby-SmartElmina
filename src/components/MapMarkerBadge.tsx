import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Text, View } from "react-native";
import { BusFront, Video, TriangleAlert, MapPin } from "lucide-react-native";
import type { Place } from "../lib/data";
import { markerKind } from "../lib/map-layers";
import { SHUTTLE_BLUE, liveBusLocation } from "../lib/shuttle-data";
import { colors, fonts } from "../lib/theme";

export default function MapMarkerBadge({ place, selected }: { place: Place; selected: boolean }) {
  const kind = markerKind(place);
  const isLiveBus = place.id === liveBusLocation.id;
  const pulse = useRef(new Animated.Value(0)).current;
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    if ((kind !== "traffic" && !isLiveBus) || reducedMotion) { pulse.setValue(0); return; }
    const animation = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true, isInteraction: false }));
    animation.start();
    return () => animation.stop();
  }, [kind, isLiveBus, pulse, reducedMotion]);
  const Icon = kind === "camera" ? Video : kind === "shuttle" ? BusFront : kind === "hazard" ? TriangleAlert : MapPin;
  const backgroundColor = isLiveBus ? SHUTTLE_BLUE : kind === "camera" ? colors.blue : kind === "shuttle" || kind === "traffic" ? colors.red : kind === "hazard" ? "transparent" : selected ? colors.red : colors.white;
  const size = isLiveBus ? 48 : kind === "shuttle" ? 36 : 40;
  return <View style={{ width: isLiveBus ? 80 : 48, height: isLiveBus ? 80 : 48, alignItems: "center", justifyContent: "center" }}>
    {(kind === "traffic" || isLiveBus) && <Animated.View style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: isLiveBus ? SHUTTLE_BLUE : colors.red, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, isLiveBus ? 1.6 : 1.5] }) }] }} />}
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor, borderWidth: kind === "hazard" ? 0 : selected ? 3 : 2, borderColor: selected ? colors.ink : colors.white, alignItems: "center", justifyContent: "center" }}>
      {kind === "traffic" ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.white }} /> : <Icon size={kind === "hazard" ? 36 : isLiveBus ? 26 : 20} fill={kind === "hazard" ? colors.amber : "none"} color={kind === "hazard" ? colors.white : backgroundColor === colors.white ? colors.ink : colors.white} />}
    </View>
    {isLiveBus && <View pointerEvents="none" style={{ position: "absolute", bottom: 9, alignSelf: "center", borderRadius: 8, backgroundColor: colors.green, borderWidth: 1, borderColor: colors.white, paddingHorizontal: 5, paddingVertical: 1 }}><Text style={{ fontFamily: fonts.bold, fontSize: 8, lineHeight: 11, color: colors.white }}>● LIVE</Text></View>}
  </View>;
}
