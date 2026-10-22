import { View } from "react-native";
import { Bus, Car, Footprints, Leaf } from "lucide-react-native";
import { Badge, Surface, Typography } from "./Common";
import { calculateCarbonEmissions } from "../lib/routing";
import { colors, fonts, ui } from "../lib/theme";
import type { TravelMode } from "../lib/journey-planner";

export default function CarbonEmissionCard({ durationMinutes, mode }: { durationMinutes: number; mode?: TravelMode }) {
  const duration = Number.isFinite(durationMinutes) ? Math.max(0, durationMinutes) : 0;
  const emissions = calculateCarbonEmissions(duration);
  const allRows = [
    { id: "drive", title: "Private Car", Icon: Car, value: emissions.carKg, share: 100, badge: null, note: `Duration-based: ${Number(duration.toFixed(2))} min × 140g/min${duration * 0.14 < 0.1 ? " · 0.10 kg minimum" : ""}`, isClean: false },
    { id: "transit", title: "Public Feeder Bus", Icon: Bus, value: emissions.transitKg, share: 20, badge: "-80% CO₂", note: `Save ${emissions.transitSavingsKg.toFixed(2)} kg CO₂ vs driving`, isClean: true },
    { id: "walk", title: "Walking", Icon: Footprints, value: 0, share: 0, badge: "Zero Emissions", note: `100% Clean · Save ${emissions.walkSavingsKg.toFixed(2)} kg CO₂ vs driving`, isClean: true },
  ];
  const rows = mode ? allRows.filter((r) => r.id === mode) : allRows;
  const description = mode === "drive"
    ? "Estimated for this journey. Driving emissions are calculated strictly from estimated duration."
    : mode === "transit"
    ? "Estimated public transit footprint. Riding the feeder bus drastically reduces carbon emissions compared to driving."
    : mode === "walk"
    ? "Estimated zero-emission journey on foot. Walking produces zero tailpipe emissions."
    : "Estimated for this journey. Driving emissions are calculated strictly from estimated duration.";

  return <Surface accessibilityLiveRegion="polite" style={{ padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.greenSoft, gap: 14 }}>
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7, flex: 1, minWidth: 180 }}><Leaf size={18} color={colors.green} /><Typography.Heading style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, color: colors.ink }}>Estimated Carbon Footprint</Typography.Heading></View>
      <Badge tone="green">Eco-Calculated</Badge>
    </View>
    <Typography style={[ui.muted, { fontSize: 12, lineHeight: 18 }]}>{description}</Typography>
    {rows.map(({ title, Icon, value, share, badge, note, isClean }, index) => <View key={title} style={{ gap: 8, paddingTop: index ? 12 : 0, borderTopWidth: index ? 1 : 0, borderColor: colors.border }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}><Icon size={17} color={isClean ? colors.green : colors.red} /><Typography style={{ fontFamily: fonts.semibold, fontSize: 13, lineHeight: 19, color: colors.ink }}>{title}</Typography></View>
        <Typography style={{ fontFamily: fonts.bold, fontSize: 14, lineHeight: 20, color: colors.ink }}>{`${value.toFixed(2)} kg CO₂`}</Typography>
      </View>
      {badge && <View style={{ alignSelf: "flex-start" }}><Badge tone="green">{badge}</Badge></View>}
      <Typography style={{ fontSize: 11, lineHeight: 17, color: isClean ? colors.green : colors.muted }}>{note}</Typography>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View accessibilityRole="progressbar" accessibilityLabel={`${title} footprint relative to driving`} accessibilityValue={{ min: 0, max: 100, now: share, text: `${share}% of driving emissions` }} style={{ flex: 1, height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: colors.border }}><View style={{ width: `${share}%`, height: "100%", borderRadius: 3, backgroundColor: isClean ? colors.green : colors.red }} /></View>
        <Typography style={{ minWidth: 30, textAlign: "right", fontSize: 11, lineHeight: 16, color: colors.muted }}>{share}%</Typography>
      </View>
    </View>)}
    <Typography style={[ui.muted, { fontSize: 11, lineHeight: 17 }]}>Illustrative comparison using the selected route’s duration · not measured emissions.</Typography>
  </Surface>;
}
