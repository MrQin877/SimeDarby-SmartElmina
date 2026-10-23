import { View } from "react-native";
import { Clock, MapPin } from "lucide-react-native";
import { router } from "expo-router";
import { Badge, Typography } from "./Common";
import Action from "./Action";
import type { Announcement } from "../lib/data";
import { colors, ui } from "../lib/theme";

export default function AnnouncementMapPreview({ announcement, compact, onPlanRoute }: { announcement: Announcement; compact: boolean; onPlanRoute: () => void }) {
  return <View style={{ gap: 12 }}>
    <View style={[ui.row, { flexWrap: "wrap", gap: 8 }]}><Typography style={[ui.muted, { flex: 1 }]}>{announcement.source || "Township Management"}</Typography><Badge tone={announcement.priority === "high" ? "red" : "neutral"}>{announcement.time}</Badge></View>
    <Typography numberOfLines={compact ? 2 : undefined} style={ui.body}>{announcement.summary || announcement.body}</Typography>
    {!compact && <>
      <View style={[ui.row, { alignItems: "flex-start", gap: 8 }]}><MapPin size={17} color={colors.red} /><Typography style={[ui.body, { flex: 1 }]}>{announcement.impactArea || "At the marked location"}</Typography></View>
      <View style={[ui.row, { alignItems: "flex-start", gap: 8 }]}><Clock size={17} color={colors.muted} /><Typography style={[ui.muted, { flex: 1 }]}>{announcement.dateStr || announcement.time}</Typography></View>
      <Action label="View Full Advisory" onPress={() => router.push({ pathname: "/announcement", params: { id: announcement.id } })} />
      <Action label="Plan Detour / Route" secondary onPress={onPlanRoute} />
    </>}
  </View>;
}
