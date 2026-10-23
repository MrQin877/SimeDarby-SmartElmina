import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Image, Text, View } from "react-native";
import { BusFront, Video, TriangleAlert, MapPin, Construction, Zap, HeartPulse, Megaphone } from "lucide-react-native";
import type { Place } from "../lib/data";
import { getAnnouncementImageSource } from "../lib/announcement-images";
import { markerKind, placeAnnouncement, isLiveBusMarker } from "../lib/map-layers";
import { SHUTTLE_BLUE } from "../lib/shuttle-data";
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
  const isLiveBus = isLiveBusMarker(place);
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
    const community = category === "Wellness" || /health|screening/i.test(announcement?.title || "");
    const CategoryIcon = road ? Construction : power ? Zap : community ? HeartPulse : Megaphone;
    const tint = road ? colors.redSoft : power ? colors.amberSoft : colors.greenSoft;
    const ink = road ? colors.red : power ? colors.amber : colors.green;
    return <View style={{ width: 64, height: 64, alignItems: "center", paddingTop: 8, zIndex: selected ? 999 : 30, transform: [{ scale: selected ? 1.15 : 1 }] }}>
      {selected && <MarkerCallout name={place.name} top={-24} />}
      {beacon && <Animated.View pointerEvents="none" style={{ position: "absolute", top: 8, width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: ink, opacity: reducedMotion ? 0.2 : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }), transform: [{ scale: reducedMotion ? 1.12 : pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }] }} />}
      {selected && <View pointerEvents="none" style={{ position: "absolute", top: 5, width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: colors.red }} />}
      <View pointerEvents="none" style={{ position: "absolute", top: 51, width: 10, height: 10, backgroundColor: colors.white, transform: [{ rotate: "45deg" }] }} />
      <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: colors.white, backgroundColor: tint, alignItems: "center", justifyContent: "center", shadowColor: colors.ink, shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 5 }}>
        {photo ? <Image source={photo} resizeMode="cover" onError={() => setFailedImage(photoKey)} accessibilityLabel={announcement?.title || place.name} style={{ width: 42, height: 42, borderRadius: 21 }} /> : <CategoryIcon size={22} color={ink} strokeWidth={2} />}
        <View style={{ position: "absolute", right: -2, bottom: -2, width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.white, backgroundColor: tint, alignItems: "center", justifyContent: "center" }}><CategoryIcon size={11} color={ink} strokeWidth={2} /></View>
      </View>
    </View>;
  }
  const Icon = kind === "camera" ? Video : kind === "shuttle" ? BusFront : kind === "hazard" ? TriangleAlert : MapPin;
  const backgroundColor = isLiveBus ? SHUTTLE_BLUE : kind === "camera" ? colors.blue : kind === "shuttle" ? colors.ink : kind === "traffic" ? colors.red : kind === "hazard" ? "transparent" : selected ? colors.red : colors.white;
  const size = isLiveBus ? 48 : kind === "shuttle" ? 30 : kind === "camera" || kind === "hazard" ? 32 : 26;
  return <View style={{ width: isLiveBus ? 80 : 48, height: isLiveBus ? 80 : 48, alignItems: "center", justifyContent: "center", zIndex: selected ? 999 : 10, transform: [{ scale: selected ? 1.15 : 1 }] }}>
    {selected && <MarkerCallout name={place.name} top={-22} />}
    {(kind === "traffic" || isLiveBus) && <Animated.View style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: isLiveBus ? SHUTTLE_BLUE : colors.red, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, isLiveBus ? 1.6 : 1.5] }) }] }} />}
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor, borderWidth: kind === "hazard" ? 0 : selected ? 3 : 2, borderColor: selected ? colors.ink : kind === "place" ? colors.border : colors.white, alignItems: "center", justifyContent: "center" }}>
      {kind === "traffic" ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.white }} /> : <Icon size={kind === "hazard" ? 32 : isLiveBus ? 26 : kind === "camera" ? 16 : kind === "shuttle" ? 14 : 12} fill={kind === "hazard" ? colors.amber : "none"} color={kind === "hazard" ? colors.white : backgroundColor === colors.white ? colors.muted : colors.white} />}
    </View>
    {isLiveBus && <View pointerEvents="none" style={{ position: "absolute", bottom: 9, alignSelf: "center", borderRadius: 8, backgroundColor: colors.green, borderWidth: 1, borderColor: colors.white, paddingHorizontal: 5, paddingVertical: 1 }}><Text style={{ fontFamily: fonts.bold, fontSize: 8, lineHeight: 11, color: colors.white }}>● LIVE</Text></View>}
  </View>;
}

function MarkerCallout({ name, top }: { name: string; top: number }) {
  return <View pointerEvents="none" style={{ position: "absolute", top, alignSelf: "center", maxWidth: 190, minWidth: 80, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.ink }}><Text numberOfLines={1} ellipsizeMode="tail" style={{ fontFamily: fonts.semibold, fontSize: 11, color: colors.white }}>{name}</Text></View>;
}
