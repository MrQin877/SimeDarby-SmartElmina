import { useEffect, useState } from "react";
import { View } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Bell, ChevronDown } from "lucide-react-native";
import { Button, Surface, Typography } from "./Common";
import MenuSheet from "./MenuSheet";
import { useStore } from "../state/store";
import { useAppToast } from "../hooks/useAppToast";
import { createBusReminder, malaysiaDayStart, reminderDepartures } from "../lib/bus-reminders";
import { shuttleArrivals, shuttleDay, shuttleTime, type ShuttleRoute } from "../lib/shuttle-schedule";
import { colors, ui } from "../lib/theme";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; routeId: ShuttleRoute; stopId?: string; stopName?: string; departureAt: number };
export default function BusReminderModal({ open, onOpenChange, routeId, stopId, stopName, departureAt }: Props) {
  const { update } = useStore();
  const notify = useAppToast();
  const stops = shuttleArrivals(routeId, 0);
  const [chosenStop, setChosenStop] = useState(stops[0].id);
  const [day, setDay] = useState(malaysiaDayStart(Date.now()));
  const [departure, setDeparture] = useState(departureAt);
  const [lead, setLead] = useState(15);
  const [picker, setPicker] = useState<"stop" | "time" | null>(null);
  useEffect(() => {
    if (!open) return;
    const options = shuttleArrivals(routeId, 0);
    setChosenStop((options.find(s => s.id === stopId || s.name === stopName) || options[0]).id);
    setDay(malaysiaDayStart(departureAt)); setDeparture(departureAt); setLead(15); setPicker(null);
  }, [open, routeId, stopId, stopName, departureAt]);
  const today = malaysiaDayStart(Date.now());
  const choices = reminderDepartures(routeId, day).filter(d => shuttleArrivals(routeId, d.at).find(s => s.id === chosenStop)!.at > Date.now());
  const arrival = shuttleArrivals(routeId, departure).find(s => s.id === chosenStop);
  const save = () => {
    try {
      const reminder = createBusReminder(routeId, chosenStop, departure, lead, Date.now());
      update(d => ({ ...d, busReminders: [...d.busReminders.filter(r => r.id !== reminder.id), reminder] }));
      onOpenChange(false);
      notify(`Reminder scheduled for ${reminder.stopName} at ${shuttleTime(reminder.scheduledTime)}.`, "success");
    } catch (error) { notify(error instanceof Error ? error.message : "Unable to set this reminder.", "warning"); }
  };
  return <MenuSheet open={open} onOpenChange={onOpenChange} label="Bus Arrival Reminder" scrollable snapPoint="85%" showCloseButton={false}>
    <BottomSheetScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
      <Typography style={ui.muted}>Get notified before your feeder bus arrives</Typography>
      <Typography style={ui.body}>Select Bus Stop · Route {routeId}</Typography>
      <Button variant="secondary" accessibilityLabel="Select bus stop" accessibilityState={{ expanded: picker === "stop" }} onPress={() => setPicker(picker === "stop" ? null : "stop")}><Button.Label style={{ flex: 1 }} numberOfLines={2}>{stops.find(s => s.id === chosenStop)?.name}</Button.Label><ChevronDown size={16} color={colors.muted} /></Button>
      {picker === "stop" && <View style={{ gap: 6 }}>{stops.map(s => <Button key={s.id} variant={chosenStop === s.id ? "primary" : "secondary"} accessibilityState={{ selected: chosenStop === s.id }} onPress={() => { setChosenStop(s.id); setPicker(null); }}><Button.Label style={{ flex: 1 }} numberOfLines={2}>{s.name}</Button.Label></Button>)}</View>}
      <Typography style={ui.body}>Date & departure time · Malaysia time</Typography>
      <View style={{ flexDirection: "row", gap: 8 }}>{[0, 1].map(offset => <Button key={offset} size="sm" variant={day === today + offset * 86400000 ? "primary" : "secondary"} accessibilityState={{ selected: day === today + offset * 86400000 }} onPress={() => {
        const nextDay = today + offset * 86400000;
        setDay(nextDay);
        const next = reminderDepartures(routeId, nextDay).find(d => shuttleArrivals(routeId, d.at).find(s => s.id === chosenStop)!.at > Date.now());
        setDeparture(next?.at ?? NaN);
      }}><Button.Label>{offset ? "Tomorrow" : "Today"}</Button.Label></Button>)}</View>
      <Button variant="secondary" accessibilityLabel="Select departure time" accessibilityState={{ expanded: picker === "time" }} onPress={() => setPicker(picker === "time" ? null : "time")}><Button.Label style={{ flex: 1 }}>{Number.isFinite(departure) ? `${shuttleTime(departure)} · ${shuttleDay(departure)}` : "No departures remaining"}</Button.Label><ChevronDown size={16} color={colors.muted} /></Button>
      {picker === "time" && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{choices.map(d => <Button key={d.id} size="sm" variant={departure === d.at ? "primary" : "secondary"} accessibilityState={{ selected: departure === d.at }} onPress={() => { setDeparture(d.at); setPicker(null); }}><Button.Label>{d.label}</Button.Label></Button>)}{!choices.length && <Typography style={ui.muted}>No departures remaining. Choose Tomorrow.</Typography>}</View>}
      {Number.isFinite(departure) && arrival && <Typography style={ui.muted}>Scheduled arrival at this stop: {arrival.time} · {shuttleDay(arrival.at)}</Typography>}
      <Typography style={ui.body}>Alert lead time</Typography>
      <View style={{ flexDirection: "row", gap: 8 }}>{[10, 15, 20].map(value => <Button key={value} size="sm" variant={lead === value ? "primary" : "secondary"} accessibilityLabel={`${value} minutes${value === 15 ? ", default" : ""}`} accessibilityState={{ selected: lead === value }} onPress={() => setLead(value)}><Button.Label>{value} min</Button.Label></Button>)}</View>
      <Surface style={{ backgroundColor: colors.amberSoft, padding: 14, gap: 8 }}><Bell size={18} color={colors.amber} /><Typography style={ui.body}>Reminder will fire {lead} minutes before arrival at your chosen stop.</Typography><Typography style={ui.muted}>Simulated timetable. Alerts appear while the app is open.</Typography></Surface>
    </BottomSheetScrollView>
    <View style={{ flexDirection: "row", gap: 8, paddingTop: 12 }}><Button variant="secondary" style={{ flex: 1 }} onPress={() => onOpenChange(false)}><Button.Label>Cancel</Button.Label></Button><Button style={{ flex: 1 }} isDisabled={!Number.isFinite(departure)} onPress={save}><Button.Label>Set Reminder</Button.Label></Button></View>
  </MenuSheet>;
}
