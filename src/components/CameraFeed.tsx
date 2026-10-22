import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import Svg, { Line, Path, Rect } from "react-native-svg";
import { Activity, Gauge, Pause, Play, ScanLine, ShieldCheck } from "lucide-react-native";
import { Badge, Button, Card, DemoNote, Description, Surface, Typography } from "./Common";
import Action from "./Action";
import { getCCTVTelemetry } from "../lib/data";
import { ui, colors, fonts, radius } from "../lib/theme";

function LivePlayer({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => { p.muted = true; });
  useFocusEffect(useCallback(() => { player.play(); return () => player.pause(); }, [player]));
  const { status } = useEvent(player, "statusChange", { status: player.status });
  return <View style={{ gap: 8 }}>
    <VideoView player={player} style={{ width: "100%", height: 190, borderRadius: radius.card }} nativeControls allowsFullscreen />
    <Description style={ui.muted}>{status === "error" ? "Feed unavailable. The camera may be offline." : status === "loading" ? "Connecting to camera…" : "Configured stream · simulated analytics below are independent of this video"}</Description>
  </View>;
}

function RoadScene() {
  return <Svg width="100%" height="100%" viewBox="0 0 360 240" preserveAspectRatio="none" accessibilityLabel="Illustrated road scene, not CCTV footage">
    <Rect width="360" height="240" fill="#17202B" />
    <Path d="M0 84 L130 60 L233 60 L360 90 L360 240 L0 240Z" fill="#333B46" />
    <Path d="M0 153 L134 63 M360 158 L229 63" stroke="#8C929B" strokeWidth="3" />
    <Path d="M92 240 L161 65 M264 240 L205 65" stroke="#CDD0D5" strokeWidth="2" strokeDasharray="18 15" />
    <Path d="M176 240 L182 65" stroke="#CFAB6D" strokeWidth="2" />
    <Path d="M0 90 L0 145 L122 64 L100 58Z M360 92 L360 146 L239 66 L260 60Z" fill="#252F36" />
    {[36, 74, 112].map((y) => <Line key={y} x1="0" y1={y} x2="360" y2={y} stroke="#FFFFFF" strokeOpacity="0.04" />)}
    <Path d="M170 110 H190 M180 100 V120 M20 20 H36 M20 20 V36 M340 20 H324 M340 20 V36 M20 220 H36 M20 220 V204 M340 220 H324 M340 220 V204" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.45" />
    <Rect x="91" y="131" width="31" height="47" rx="6" fill="#B7BDC7" />
    <Rect x="96" y="140" width="21" height="13" rx="2" fill="#455567" />
    <Rect x="230" y="161" width="33" height="49" rx="6" fill="#A4AAB5" />
    <Rect x="235" y="169" width="23" height="14" rx="2" fill="#455567" />
    <Rect x="151" y="83" width="17" height="26" rx="3" fill="#858F9F" />
  </Svg>;
}

export default function CameraFeed({ url, cameraId = "cam-1", compact = false, onPlanJourney }: {
  url?: string; cameraId?: string; compact?: boolean; onPlanJourney?: () => void;
}) {
  const telemetry = getCCTVTelemetry(cameraId);
  const [playing, setPlaying] = useState(true);
  const [focused, setFocused] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [timestamp, setTimestamp] = useState(() => new Date());
  const movement = useRef(new Animated.Value(0)).current;
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (!playing || !focused || compact) return;
    const clock = setInterval(() => setTimestamp(new Date()), 1000);
    const motion = Animated.loop(Animated.sequence([
      Animated.timing(movement, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(movement, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    if (!reducedMotion) motion.start();
    return () => { clearInterval(clock); motion.stop(); };
  }, [playing, focused, compact, reducedMotion, movement]);
  if (!telemetry) return <DemoNote text="Camera analytics unavailable for this location." />;
  const tone = colors[telemetry.statusTone];
  const liveUrl = url?.startsWith("https://") ? url : undefined;
  const metrics = [
    { label: "Throughput", ...telemetry.throughput, Icon: Activity },
    { label: "Detected speed", value: telemetry.detectedSpeed.value, note: telemetry.detectedSpeed.limit, Icon: Gauge },
    { label: "Road density", ...telemetry.roadDensity, Icon: ScanLine },
    { label: "Queue length", ...telemetry.queueLength, Icon: Activity },
  ];
  return <View style={{ gap: 14 }}>
    {compact ? <View style={{ gap: 4 }}>
      <Typography style={ui.heading}>{telemetry.camTag}</Typography>
      <Typography style={[ui.muted, { color: tone }]}>{telemetry.statusBadge} · {telemetry.detectedSpeed.value} · {telemetry.flowRate}</Typography>
      <DemoNote text="Simulated AI telemetry · expand for vision analytics" />
    </View> : <>
      {liveUrl && <LivePlayer key={liveUrl} url={liveUrl} />}
      <View style={{ width: "100%", maxWidth: 720, alignSelf: "center", aspectRatio: 16 / 9, backgroundColor: "#0D1117", borderRadius: 14, overflow: "hidden" }}>
        <RoadScene />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { padding: 12, justifyContent: "space-between" }]}>
          <View style={ui.between}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.red, opacity: movement.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }} /><Typography style={s.hudLabel}>{playing ? "REC · LIVE DEMO" : "DEMO PAUSED"}</Typography></View>
            <Typography style={s.hudLabel}>{timestamp.toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Kuala_Lumpur" })} MYT</Typography>
          </View>
          <View style={ui.between}>
            <Typography style={s.hudLabel}>{telemetry.camTag}</Typography>
            <Typography style={[s.hudLabel, { backgroundColor: colors.amber }]}>FLOW: {telemetry.flowRate}</Typography>
          </View>
        </View>
        {telemetry.detections.map((detection) => <Animated.View pointerEvents="none" key={detection.label} style={{ position: "absolute", top: hudPosition(detection.top, 68), left: hudPosition(detection.left, 60), width: 110, height: 32, borderWidth: 1, borderColor: "#7CE6A4", transform: [{ translateY: movement.interpolate({ inputRange: [0, 1], outputRange: [-3, 5] }) }] }}>
          <Typography numberOfLines={1} style={{ fontSize: 7.5, lineHeight: 12, fontFamily: fonts.bold, color: "#0D1117", backgroundColor: "#7CE6A4", position: "absolute", top: -14, left: -1, paddingHorizontal: 3 }}>{detection.label}</Typography>
        </Animated.View>)}
      </View>
      <View style={ui.between}>
        <DemoNote text="Simulated AI telemetry · illustrated scene" />
        <Button variant="ghost" size="sm" accessibilityLabel={playing ? "Pause telemetry simulation" : "Resume telemetry simulation"} onPress={() => setPlaying(!playing)} style={{ width: 40, height: 40, borderRadius: 20 }}>{playing ? <Pause size={18} color={colors.ink} /> : <Play size={18} color={colors.ink} />}</Button>
      </View>
      <Surface style={{ padding: 14, gap: 6, backgroundColor: colors[`${telemetry.statusTone}Soft`] }}>
        <View style={ui.between}>
          <Typography style={[ui.label, { color: tone }]}>{telemetry.statusText}</Typography>
          <Badge tone={telemetry.statusTone}>{telemetry.statusBadge}</Badge>
        </View>
        <Typography style={ui.muted}>{telemetry.statusDetail}</Typography>
      </Surface>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {metrics.map(({ label, value, note, Icon }) => <Card key={label} style={{ flexBasis: "47%", flexGrow: 1, gap: 6 }}>
          <Icon size={17} color={colors.muted} />
          <Typography style={ui.muted}>{label}</Typography>
          <Typography style={[ui.heading, { fontSize: 20 }]}>{value}</Typography>
          <Typography style={[ui.muted, { fontSize: 10 }]}>{note}</Typography>
        </Card>)}
      </View>
      <Typography style={ui.heading}>Vehicle classification</Typography>
      <DemoNote text="Vision AI · simulated share of detected vehicles" />
      <View accessibilityLabel="Vehicle classification percentages" style={{ flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden" }}>
        {classification.map(({ key, color }) => <View key={key} style={{ width: `${telemetry.vehicleClassification[key]}%`, backgroundColor: color }} />)}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {classification.map(({ key, color, label }) => <View key={key} style={{ flexDirection: "row", alignItems: "center", gap: 6, flexBasis: "47%", flexGrow: 1 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} /><Typography style={[ui.muted, { flex: 1 }]}>{label} · {telemetry.vehicleClassification[key]}%</Typography></View>)}
      </View>
      <Surface style={{ padding: 16, gap: 8, backgroundColor: colors.ink }}>
        <View style={[ui.row, { gap: 7 }]}><ShieldCheck size={18} color={colors.white} /><Typography style={[ui.label, { color: colors.white }]}>AI ROUTE ADVISORY · DEMO</Typography></View>
        <Typography style={[ui.body, { color: colors.white }]}>{telemetry.advisory}</Typography>
      </Surface>
      {onPlanJourney && <Action label="Plan alternative route" onPress={onPlanJourney} />}
    </>}
  </View>;
}

function hudPosition(value: number | string, maximum = 85): number | `${number}%` {
  if (typeof value === "number") return value;
  return `${Math.max(0, Math.min(maximum, parseFloat(value) || 0))}%`;
}
const classification = [
  { key: "cars", label: "Passenger Cars", color: colors.red },
  { key: "lorries", label: "Construction Lorries", color: colors.amber },
  { key: "motorcycles", label: "Motorcycles", color: "#0284C7" },
  { key: "vans", label: "Delivery Vans", color: "#9333EA" },
] as const;
const s = StyleSheet.create({ hudLabel: { color: "#FFFFFF", backgroundColor: "#0D1117CC", fontSize: 9, lineHeight: 15, fontFamily: fonts.medium, paddingHorizontal: 5 } });
