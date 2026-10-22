import { useState } from "react";
import { View } from "react-native";
import { Gauge, Navigation } from "lucide-react-native";
import { Badge, Card, DemoNote, PressableFeedback, Typography } from "./Common";
import Action from "./Action";
import { hourlyTrafficData, roadCorridors, type RoadCorridor } from "../lib/data";
import { colors, fonts, ui } from "../lib/theme";
export default function RoadCorridorContent({ corridor = roadCorridors[0], onPlanJourney }: { corridor?: RoadCorridor; onPlanJourney: () => void; onClose: () => void }) {
  const [hour, setHour] = useState("8 AM");
  const factor = corridor.tone === "green" ? 0.4 : corridor.tone === "amber" ? 0.7 : 1;
  const selected = hourlyTrafficData.find((item) => item.hour === hour)!;
  return <View style={{ gap: 16 }}>
    <View style={{ gap: 6 }}><Badge tone={corridor.tone}>{corridor.status} · demo</Badge><DemoNote text="Road corridor telemetry · simulated sensor readings" /></View>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {[
        ["Speed limit", `${corridor.speedLimit} km/h`], ["Average speed", `${corridor.speed} km/h`],
        ["Congestion delay", `${corridor.delay} min`], ["Queue length", `${corridor.queue} meters`],
      ].map(([label, value]) => <Card key={label} style={{ flexBasis: "47%", flexGrow: 1, gap: 7 }}><Gauge size={18} color={colors[corridor.tone]} /><Typography style={ui.muted}>{label}</Typography><Typography style={[ui.heading, { fontSize: 20 }]}>{value}</Typography></Card>)}
    </View>
    <Card style={{ gap: 12 }}>
      <Typography style={ui.heading}>Hourly traffic volume</Typography>
      <View style={{ flexDirection: "row", alignItems: "flex-end", height: 110, gap: 6 }}>
        {hourlyTrafficData.map((item) => <PressableFeedback key={item.hour} accessibilityLabel={`${item.hour}: ${Math.round(item.today * factor)} vehicles per minute`} accessibilityState={{ selected: hour === item.hour }} onPress={() => setHour(item.hour)} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 7 }}>
          <View style={{ width: 12, height: Math.max(5, item.today * factor * 0.75), borderRadius: 3, backgroundColor: hour === item.hour ? colors.red : colors.surfaceSecondary }} />
          <Typography style={{ fontFamily: fonts.medium, fontSize: 9, color: hour === item.hour ? colors.red : colors.muted }}>{item.hour.replace(" ", "")}</Typography>
        </PressableFeedback>)}
      </View>
      <Typography style={ui.muted}>{hour} · {Math.round(selected.today * factor)} veh/min · simulated volume</Typography>
      <Typography style={ui.muted}>Current sample throughput: {corridor.throughput} veh/min</Typography>
    </Card>
    <Card style={{ backgroundColor: colors.ink, borderColor: colors.ink, gap: 10 }}><Navigation size={19} color={colors.white} /><Typography style={[ui.label, { color: colors.white }]}>SMART TRAFFIC ADVISORY</Typography><Typography style={[ui.body, { color: colors.white }]}>{corridor.advisory}</Typography></Card>
    <Action label="Plan detour" onPress={onPlanJourney} />
  </View>;
}
