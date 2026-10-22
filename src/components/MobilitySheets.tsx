import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Badge,
  Button,
  Description,
  DemoNote,
  Surface,
  Typography,
} from "./Common";
import { Bell } from "lucide-react-native";
import BusReminderModal from "./BusReminderModal";
import LineTabs from "./LineTabs";
import { colors, fonts, ui } from "../lib/theme";
import { departureCountdown, followingDepartures, shuttleArrivals, type ShuttleRoute } from "../lib/shuttle-schedule";

/**
 * 1. Traffic Details Sheet Content
 */
export { default as TrafficDetailsContent } from "./RoadCorridorContent";

export { default as PlanJourneyContent } from "./RoutingSheet";

export function ShuttleContent({ onFocusBus, compact = false, stopName, stopId }: {
  onFocusBus: (route: string) => void;
  compact?: boolean;
  stopName?: string;
  stopId?: string;
  onClose: () => void;
}) {
  const [reminderOpen, setReminderOpen] = useState(false);
  const [route, setRoute] = useState<ShuttleRoute>("S1");
  const [now, setNow] = useState(Date.now());
  const [departures, setDepartures] = useState(() => followingDepartures("S1", Date.now()));
  const [selectedDeparture, setSelectedDeparture] = useState(departures[0].id);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const chooseRoute = (next: string) => {
    const value = next === "T102" ? "T102" : "S1";
    const time = Date.now();
    const nextDepartures = followingDepartures(value, time);
    setRoute(value); setNow(time); setDepartures(nextDepartures); setSelectedDeparture(nextDepartures[0].id);
  };
  const departure = departures.find(item => item.id === selectedDeparture) || departures[0];
  const stops = shuttleArrivals(route, departure.at);
  const countdown = departureCountdown(departure.at, now);
  return <> {compact ? <View style={{ gap: 6 }}>
    <Typography style={ui.heading}>Bus {route} · {countdown === "Due now" ? countdown : `Departs in ${countdown}`}</Typography>
    <Typography style={ui.muted}>{route === "S1" ? "Elmina & Denai Alam Circular" : "Elmina Green → MRT Feeder"} · Expand for stops and timetable.</Typography>
    <DemoNote text="Simulated departure · not live arrivals" />
  </View> : (
    <View style={{ gap: 16 }}>
      <LineTabs value={route} onChange={chooseRoute} items={[{ value: "S1", label: "Route S1" }, { value: "T102", label: "Route T102" }]} />
      <DemoNote text="Proposed services · Malaysia time · simulated timetable and bus position" />
      <View style={{ gap: 5 }}>
        <Typography.Heading type="h2" style={ui.heading}>
          {route === "S1" ? "Elmina & Denai Alam Circular" : "Elmina Green → MRT Feeder"}
        </Typography.Heading>
        <Description style={ui.muted}>
          {route === "S1" ? "06:30 AM–10:00 PM · Every 20 min" : "06:00 AM–10:30 PM · Every 15 min"}
        </Description>
      </View>
      <View style={{ gap: 8 }}>
        <Typography style={ui.label}>FOLLOWING DEPARTURES</Typography>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {departures.map(item => <Button key={item.id} size="sm" variant={selectedDeparture === item.id ? "primary" : "secondary"} accessibilityLabel={`Departure ${item.label}, ${item.day}`} accessibilityState={{ selected: selectedDeparture === item.id }} onPress={() => setSelectedDeparture(item.id)} style={{ borderRadius: 24, backgroundColor: selectedDeparture === item.id ? colors.red : colors.surfaceSecondary, paddingHorizontal: 12 }}><Button.Label style={{ fontSize: 12, color: selectedDeparture === item.id ? colors.white : colors.ink }}>{item.label}</Button.Label></Button>)}
        </View>
      </View>
      <Surface style={{ padding: 16, backgroundColor: colors.redSoft, gap: 8 }}>
        <View style={ui.between}>
          <Typography style={[ui.label, { color: colors.red }]}>NEXT DEPARTURE · DEMO</Typography>
          <Badge tone="red">{route === "S1" ? "EV-01" : "EV-04"}</Badge>
        </View>
        <Typography style={{ fontFamily: fonts.bold, fontSize: 32, lineHeight: 40, color: colors.red }}>{countdown}</Typography>
        <Description style={[ui.muted, { color: colors.ink }]}>
          {departure.label} · {departure.day} · {route === "S1" ? "Central Park Pavilion" : "Elmina Green 1"}
        </Description>
      </Surface>
      <View style={{ flexDirection: "row", gap: 8 }}><Button style={{ flex: 1 }} onPress={() => onFocusBus(route)}><Button.Label style={{ fontSize: 12 }}>Show Bus Location</Button.Label></Button><Button variant="secondary" style={{ flex: 1 }} onPress={() => setReminderOpen(true)}><Bell size={16} color={colors.ink} /><Button.Label style={{ fontSize: 12 }}>Set Reminder</Button.Label></Button></View>
      <Typography style={ui.heading}>Stops & arrival times</Typography>
      <View>
        {stops.map((stop, index) => <View key={stop.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: index === 0 ? colors.redSoft : colors.surfaceSecondary, alignItems: "center", justifyContent: "center" }}>
            <Typography style={{ fontSize: 11, color: index === 0 ? colors.red : colors.muted }}>{index + 1}</Typography>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Typography style={{ fontFamily: fonts.semibold, fontSize: 13, color: colors.ink }}>{stop.name}</Typography>
            <Description style={ui.muted}>{stop.subtitle}</Description>
          </View>
          <View style={{ alignItems: "flex-end", gap: 3 }}>
            <Typography style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.red }}>{stop.time}</Typography>
            <Description style={ui.muted}>{stop.note}</Description>
          </View>
        </View>)}
      </View>

    </View>
  )}<BusReminderModal open={reminderOpen} onOpenChange={setReminderOpen} routeId={route} stopId={stopId} stopName={stopName} departureAt={departure.at} /></>;
}
