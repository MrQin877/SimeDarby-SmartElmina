import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Badge,
  Description,
  DemoNote,
  Surface,
  Typography,
} from "./Common";
import Action from "./Action";
import LineTabs from "./LineTabs";
import { colors, fonts, ui } from "../lib/theme";
import { shuttleStops } from "../lib/data";

/**
 * 1. Traffic Details Sheet Content
 */
export { default as TrafficDetailsContent } from "./RoadCorridorContent";

export { default as PlanJourneyContent } from "./RoutingSheet";

const feederStops = [
  { id: "t102-1", name: "Elmina Green 1", subtitle: "Precinct pickup point", time: "08:29 AM", note: "Origin" },
  { id: "t102-2", name: "Persiaran Atmosfera", subtitle: "Covered boarding bay", time: "08:35 AM", note: "+6 min" },
  { id: "t102-3", name: "Kwasa Damansara Transit Hub", subtitle: "MRT connection", time: "08:47 AM", note: "Terminal" },
];

export function ShuttleContent({ onFocusBus, compact = false }: {
  onFocusBus: (route: string) => void;
  compact?: boolean;
  stopName?: string;
  onClose: () => void;
}) {
  const [route, setRoute] = useState("S1");
  const [seconds, setSeconds] = useState(360);
  useEffect(() => {
    const departure = Date.now() + (route === "S1" ? 360 : 180) * 1000;
    const tick = () => setSeconds(Math.max(0, Math.ceil((departure - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [route]);
  const stops = route === "S1" ? shuttleStops : feederStops;
  const departures = route === "S1" ? ["08:52 AM", "09:12 AM", "09:32 AM"] : ["08:44 AM", "08:59 AM", "09:14 AM"];
  const countdown = seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "Due now";
  if (compact) return <View style={{ gap: 6 }}>
    <Typography style={ui.heading}>Bus {route} · {countdown === "Due now" ? countdown : `Departs in ${countdown}`}</Typography>
    <Typography style={ui.muted}>{route === "S1" ? "Valley & Central Park Circular" : "Elmina Green → MRT Feeder"} · Expand for stops and timetable.</Typography>
    <DemoNote text="Simulated departure · not live arrivals" />
  </View>;
  return (
    <View style={{ gap: 16 }}>
      <LineTabs value={route} onChange={setRoute} items={[{ value: "S1", label: "Route S1" }, { value: "T102", label: "Route T102" }]} />
      <DemoNote text="Proposed services · simulated countdown and timetable" />
      <View style={{ gap: 5 }}>
        <Typography.Heading type="h2" style={ui.heading}>
          {route === "S1" ? "Valley & Central Park Circular" : "Elmina Green → MRT Feeder"}
        </Typography.Heading>
        <Description style={ui.muted}>
          {route === "S1" ? "06:30 AM–10:00 PM · Every 20 min" : "06:00 AM–10:30 PM · Every 15 min"}
        </Description>
      </View>
      <Surface style={{ padding: 16, backgroundColor: colors.redSoft, gap: 8 }}>
        <View style={ui.between}>
          <Typography style={[ui.label, { color: colors.red }]}>NEXT DEPARTURE · DEMO</Typography>
          <Badge tone="red">{route === "S1" ? "EV-01" : "EV-04"}</Badge>
        </View>
        <Typography style={{ fontFamily: fonts.bold, fontSize: 32, color: colors.red }}>{countdown}</Typography>
        <Description style={[ui.muted, { color: colors.ink }]}>
          {route === "S1" ? "Central Park Pavilion · Bay 2" : "Elmina Green 1 · Precinct stop"}
        </Description>
      </Surface>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        <Badge>Wheelchair Ramp</Badge>
        <Badge>Audio Announcements</Badge>
        <Badge>Low-Floor Entry</Badge>
      </View>
      <Action label="Show demo bus location" onPress={() => onFocusBus(route)} />
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
      <Typography style={ui.label}>FOLLOWING DEPARTURES</Typography>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {departures.map((time) => <Surface key={time} style={{ flex: 1, padding: 10, backgroundColor: colors.surfaceSecondary, alignItems: "center" }}>
          <Typography style={{ fontSize: 12, fontFamily: fonts.semibold, color: colors.ink }}>{time}</Typography>
        </Surface>)}
      </View>
    </View>
  );
}
