import { useEffect, useState } from "react";
import { AppState, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell } from "lucide-react-native";
import { Button, Surface, Typography } from "./Common";
import { useStore } from "../state/store";
import { advanceBusReminders } from "../lib/bus-reminders";
import { shuttleTime } from "../lib/shuttle-schedule";
import { colors, ui } from "../lib/theme";

export default function BusReminderAlerts() {
  const { data, update } = useStore();
  const insets = useSafeAreaInsets();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const check = () => {
      if (AppState.currentState && AppState.currentState !== "active") return;
      const time = Date.now();
      setNow(time);
      update(d => {
        const busReminders = advanceBusReminders(d.busReminders, time);
        return busReminders === d.busReminders ? d : { ...d, busReminders };
      });
    };
    check();
    const timer = setInterval(check, 1000);
    const listener = AppState.addEventListener("change", state => { if (state === "active") check(); });
    return () => { clearInterval(timer); listener.remove(); };
  }, [update]);
  const reminder = data.busReminders.find(r => r.triggeredAt && !r.dismissedAt && r.scheduledTime > now);
  if (!reminder) return null;
  const minutes = Math.max(1, Math.ceil((reminder.scheduledTime - now) / 60000));
  return <View pointerEvents="box-none" style={{ position: "absolute", top: insets.top + 8, left: 16, right: 16, zIndex: 1000 }}>
    <Surface accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ padding: 16, gap: 10, backgroundColor: colors.amberSoft, borderColor: colors.border, borderWidth: 1 }}>
      <View style={ui.row}><Bell size={20} color={colors.amber} /><Typography style={[ui.body, { flex: 1, fontWeight: "600" }]}>Feeder Bus {reminder.routeId} · Arriving in {minutes} Minutes</Typography></View>
      <Typography style={ui.body}>Scheduled arrival at {reminder.stopName} is {shuttleTime(reminder.scheduledTime)}.</Typography>
      <Button size="sm" variant="secondary" onPress={() => update(d => ({ ...d, busReminders: d.busReminders.map(r => r.id === reminder.id ? { ...r, dismissedAt: Date.now() } : r) }))}><Button.Label>Dismiss</Button.Label></Button>
    </Surface>
  </View>;
}
