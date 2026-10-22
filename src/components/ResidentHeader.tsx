import { View } from "react-native";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import { Avatar, IconButton, PressableFeedback, Typography } from "./Common";
import { useStore } from "../state/store";
import { initialAlerts } from "../lib/data";
import { colors, fonts, ui } from "../lib/theme";

export default function ResidentHeader({ compact = false }: { compact?: boolean }) {
  const { data } = useStore();
  const unread = initialAlerts.some((alert) => !alert.isRead && !data.readAlerts.includes(alert.id));
  return <View style={[ui.between, { minHeight: 56 }]}>
    <View style={[ui.row, { flex: 1 }]}>
      <PressableFeedback accessibilityLabel="Open profile" onPress={() => router.push("/profile")} style={ui.iconButton}>
        <Avatar style={[ui.iconButton, { backgroundColor: colors.redSoft }]}>
          <Avatar.Fallback textProps={{ style: { fontFamily: fonts.bold, color: colors.red } }}>{data.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
        </Avatar>
      </PressableFeedback>
      <View style={{ flex: 1 }}>
        {!compact && <Typography style={ui.muted}>Good morning,</Typography>}
        <Typography numberOfLines={1} style={[ui.heading, { fontSize: 16, textAlign: compact ? "center" : "left" }]}>{compact ? "Smart Elmina" : data.name}</Typography>
      </View>
    </View>
    <View>
      <IconButton icon={Bell} label="View notifications" onPress={() => router.push("/alerts")} />
      {unread && <View pointerEvents="none" style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red, borderWidth: 1, borderColor: colors.white }} />}
    </View>
  </View>;
}
