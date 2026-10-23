import { useEffect } from "react";
import { View } from "react-native";
import { Bell, ChevronRight } from "lucide-react-native";
import Animated, { cancelAnimation, ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { PressableFeedback, Typography } from "./Common";
import type { BusReminder } from "../lib/bus-reminders";
import { shuttleTime } from "../lib/shuttle-schedule";
import { colors, fonts, ui } from "../lib/theme";

export default function BusReminderPill({ reminder, onPress }: { reminder: BusReminder; onPress: () => void }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.35, { duration: 1000 }), -1, true, undefined, ReduceMotion.System);
    return () => cancelAnimation(pulse);
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return <PressableFeedback accessibilityRole="button" accessibilityLabel={`Manage bus ${reminder.routeId} reminder, ${shuttleTime(reminder.scheduledTime)}, ${reminder.stopName}`} onPress={onPress} style={[ui.shadow, { flex: 1, minWidth: 0, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }]}>
    <View style={{ flexDirection: "row", alignItems: "center", minHeight: 46, gap: 7, paddingHorizontal: 12 }}>
      <Animated.View accessible={false} style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981", flexShrink: 0 }, pulseStyle]} />
      <Bell size={15} color={colors.green} />
      <Typography numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, minWidth: 0, fontFamily: fonts.medium, fontSize: 12, color: colors.ink }}>Bus {reminder.routeId} · {shuttleTime(reminder.scheduledTime)} • {reminder.stopName}</Typography>
      <ChevronRight size={14} color={colors.muted} />
    </View>
  </PressableFeedback>;
}
