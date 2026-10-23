import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Image, Text, View } from "react-native";
import { BusFront, Video, TriangleAlert, MapPin, Construction, Zap, HeartPulse, Megaphone } from "lucide-react-native";
import type { Place } from "../lib/data";
import { getAnnouncementImageSource } from "../lib/announcement-images";
import { markerKind, placeAnnouncement } from "../lib/map-layers";
import { SHUTTLE_BLUE, liveBusLocation } from "../lib/shuttle-data";
import { colors, fonts } from "../lib/theme";

export default function MapMarkerBadge({ place, selected }: { place: Place; selected: boolean }) {
  const kind = markerKind(place);
  const announcement = placeAnnouncement(place);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const photoKey = `${announcement?.id ?? place.id}:${announcement?.imageUrl ?? place.imageUrl ?? ""}`;
  const photo = failedImage === photoKey ? null : getAnnouncementImageSource(announcement?.imageUrl ?? place.imageUrl, announcement?.id);
  const category = announcement?.category ?? place.announcementCategory;
  const isAnnouncement = Boolean(announcement || place.announcementId || place.imageUrl || category);
  const beacon = isAnnouncement && (announcement?.priority === "high" || announcement?.active === true || place.announcementPriority === "high");
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
    if ((kind !== "traffic" && !isLiveBus && !beacon) || reducedMotion) { pulse.setValue(0); return; }
    const animation = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true, isInteraction: false }));
    animation.start();
    return () => animation.stop();
  }, [kind, isLiveBus, beacon, pulse, reducedMotion]);
  if (isAnnouncement) {
    const road = category === "Roads" || category === "Transport";
    const power = category === "Maintenance" || category === "Power";
    const community = category === "Community" || category === "Wellness";
    const CategoryIcon = road ? Construction : power ? Zap : community ? HeartPulse : Megaphone;
    const tint = road ? colors.redSoft : power ? colors.amberSoft : community ? colors.greenSoft : "#EEF2FF";
    const ink = road ? colors.red : power ? colors.amber : community ? colors.green : "#4F46E5";
    return <View style={{ width: 64, height: 64, alignItems: "center", paddingTop: 8 }}>
      {beacon && <Animated.View pointerEvents="none" style={{ position: "absolute", top: 8, width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: ink, opacity: reducedMotion ? 0.2 : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }), transform: [{ scale: reducedMotion ? 1.12 : pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }] }} />}
      {selected && <View pointerEvents="none" style={{ position: "absolute", top: 5, width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: colors.red }} />}
      <View pointerEvents="none" style={{ position: "absolute", top: 47, width: 10, height: 10, backgroundColor: colors.white, transform: [{ rotate: "45deg" }] }} />
      <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: colors.white, backgroundColor: tint, alignItems: "center", justifyContent: "center", shadowColor: colors.ink, shadowOpacity: 0.18, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 5 }}>
        {photo ? <Image source={photo} resizeMode="cover" onError={() => setFailedImage(photoKey)} accessibilityLabel={announcement?.title || place.name} style={{ width: 38, height: 38, borderRadius: 19 }} /> : <CategoryIcon size={22} color={ink} strokeWidth={2} />}
      </View>
    </View>;
  }
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
