import { View } from "react-native";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { Activity, Gauge, ScanLine, ShieldCheck } from "lucide-react-native";
import { Badge, Card, DemoNote, Description, Surface, Typography } from "./Common";
import Action from "./Action";
import { getCCTVTelemetry } from "../lib/data";
import { useFocusedVideoPlayback } from "../hooks/useFocusedVideoPlayback";
import { ui, colors, radius } from "../lib/theme";

const recordedFootage = require("../../assets/videos/provided-cctv-footage.mp4");

function CameraPlayer({ url }: { url?: string }) {
  const remote = Boolean(url?.startsWith("https://"));
  const player = useVideoPlayer(remote ? url! : recordedFootage, (p) => { p.muted = true; p.loop = !remote; });
  useFocusedVideoPlayback(player);
  const { status } = useEvent(player, "statusChange", { status: player.status });
  return <View style={{ gap: 8 }}>
    <VideoView player={player} accessibilityLabel={remote ? "Configured CCTV stream" : "Provided CCTV recording"} style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: radius.card, backgroundColor: colors.ink }} contentFit="contain" surfaceType="textureView" nativeControls allowsFullscreen />
    <Description style={ui.muted}>{status === "error" ? remote ? "Feed unavailable. The camera may be offline." : "Recording unavailable. Close and reopen this camera to retry." : status === "loading" ? remote ? "Connecting to camera…" : "Loading CCTV recording…" : remote ? "Configured CCTV stream" : "Provided CCTV recording · recorded footage, not a live feed"}</Description>
  </View>;
}

export default function CameraFeed({ url, cameraId = "cam-1", compact = false, onPlanJourney }: {
  url?: string; cameraId?: string; compact?: boolean; onPlanJourney?: () => void;
}) {
  const telemetry = getCCTVTelemetry(cameraId);
  if (!telemetry) return <DemoNote text="Camera analytics unavailable for this location." />;
  const tone = colors[telemetry.statusTone];
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
      <CameraPlayer url={url} />
      <DemoNote text="AI telemetry below is simulated, not calculated from this recording." />
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

const classification = [
  { key: "cars", label: "Passenger Cars", color: colors.red },
  { key: "lorries", label: "Construction Lorries", color: colors.amber },
  { key: "motorcycles", label: "Motorcycles", color: "#0284C7" },
  { key: "vans", label: "Delivery Vans", color: "#9333EA" },
] as const;
