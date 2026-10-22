import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { Check, ChevronDown, ChevronRight, Car, Bus, Footprints, MapPin, ArrowRight, TriangleAlert } from "lucide-react-native";
import { Badge, Button, DemoNote, PressableFeedback, Surface, Typography } from "./Common";
import CarbonEmissionCard from "./CarbonEmissionCard";
import LineTabs from "./LineTabs";
import Action from "./Action";
import { colors, fonts, ui } from "../lib/theme";
import { distanceLabel, minutes } from "../lib/routing";
import type { RouteOption, TravelMode } from "../lib/journey-planner";
import type { Place } from "../lib/data";
import { useStore } from "../state/store";

export default function RoutingSheet({ mode, onModeChange, options, selectedId, onSelect, onStart, onExpand, compact, expanded = false, destination, stickyStart = false, loading, routeMessage }: {
  mode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
  options: RouteOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onStart: (option: RouteOption) => void;
  onExpand: () => void;
  compact: boolean;
  expanded?: boolean;
  destination?: Place | null;
  stickyStart?: boolean;
  loading: boolean;
  routeMessage: string;
}) {
  const { data, update } = useStore();
  const [details, setDetails] = useState<string | null>(null);
  useEffect(() => setDetails(null), [mode, options]);
  const selected = options.find((option) => option.id === selectedId) || options[0];
  const isCityCentre = destination?.id === "elmina-city-centre" || /city centre/i.test(destination?.name || "");
  const defaultDriveMinutes = isCityCentre ? "5" : "14";
  const defaultTransitMinutes = isCityCentre ? "14" : "24";
  const defaultWalkMinutes = isCityCentre ? "24" : "45";

  const [cachedDurations, setCachedDurations] = useState<Partial<Record<TravelMode, string>>>({
    drive: defaultDriveMinutes,
    transit: defaultTransitMinutes,
    walk: defaultWalkMinutes,
  });

  useEffect(() => {
    setCachedDurations((prev) => ({
      ...prev,
      drive: prev.drive || defaultDriveMinutes,
      transit: prev.transit || defaultTransitMinutes,
      walk: prev.walk || defaultWalkMinutes,
    }));
  }, [destination?.id, defaultDriveMinutes, defaultTransitMinutes, defaultWalkMinutes]);

  useEffect(() => {
    if (selected?.duration) {
      const minStr = String(minutes(selected.duration));
      setCachedDurations((prev) => (prev[mode] === minStr ? prev : { ...prev, [mode]: minStr }));
    }
  }, [mode, selected?.duration]);

  const reserveVan = () => update((d) => {
    if (!d.isVanReserved && d.vanSeatsRemaining <= 0) return d;
    return { ...d, isVanReserved: !d.isVanReserved, vanSeatsRemaining: Math.max(0, d.vanSeatsRemaining + (d.isVanReserved ? 1 : -1)) };
  });
  const ModeIcon = mode === "drive" ? Car : mode === "transit" ? Bus : Footprints;
  if (compact) return <View style={{ flexDirection: "row", gap: 12, alignItems: "center", minHeight: 58 }}>
    <ModeIcon size={18} color={colors.red} />
    <View style={{ flex: 1, gap: 3 }}><Typography style={[ui.heading, { fontSize: 15 }]}>{selected ? `${minutes(selected.duration)} min · ${distanceLabel(selected.distance)}` : "Choose locations"}</Typography><Typography numberOfLines={1} style={ui.muted}>{loading ? "Loading mapped route…" : selected?.title}</Typography></View>
    {selected && <Button animation="disable-all" isDisabled={selected.coordinates.length < 2} onPress={() => onStart(selected)} style={{ minHeight: 44, paddingHorizontal: 14 }}><ArrowRight size={16} color={colors.white} /><Button.Label>Start</Button.Label></Button>}
  </View>;
  return <View style={{ gap: 16 }}>
    <LineTabs value={mode} onChange={(value) => onModeChange(value as TravelMode)} items={[
      { value: "drive", icon: Car, accessibilityLabel: "Drive", label: `${cachedDurations.drive || defaultDriveMinutes} min` },
      { value: "transit", icon: Bus, accessibilityLabel: "Public Transit", label: `${cachedDurations.transit || defaultTransitMinutes} min` },
      { value: "walk", icon: Footprints, accessibilityLabel: "Walking", label: `${cachedDurations.walk || defaultWalkMinutes} min` },
    ]} />
    <DemoNote text={routeMessage || "Demo traffic, transit schedules and walking paths · not live conditions"} />
    {loading && <Typography accessibilityLiveRegion="polite" style={ui.muted}>Loading mapped routes… Preview estimates remain available.</Typography>}
    {!options.length && <Surface style={{ padding: 18, backgroundColor: colors.surfaceSecondary }}><Typography style={ui.body}>Choose two different locations from the suggestions to see routes.</Typography></Surface>}
    <View>
      {options.map((option) => {
        const active = selected?.id === option.id;
        const isVan = option.id === "transit-van";
        return <View key={option.id} style={{ borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 14, gap: 12 }}>
          <PressableFeedback accessibilityLabel={`Select ${option.title}`} accessibilityState={{ selected: active, expanded: details === option.id }} onPress={() => { onSelect(option.id); if (option.stops) { setDetails(details === option.id ? null : option.id); onExpand(); } }} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <View style={{ width: 22, height: 22, borderWidth: 1, borderRadius: 11, borderColor: active ? colors.red : colors.border, backgroundColor: active ? colors.red : colors.white, alignItems: "center", justifyContent: "center" }}>{active && <Check size={14} color={colors.white} />}</View>
            <View style={{ flex: 1, gap: 5 }}>
              <Typography style={{ fontFamily: fonts.bold, color: colors.ink, fontSize: 14 }}>{option.title}</Typography>
              <Typography style={ui.muted}>{minutes(option.duration)} min · {distanceLabel(option.distance)}{option.fare ? ` · ${option.fare}` : ""}</Typography>
              <Typography style={ui.muted}>{option.departure || option.detail}</Typography>
              {option.delay > 0 && <Badge tone="amber">+{option.delay} min simulated delay · included</Badge>}
            </View>
            {option.stops && (details === option.id ? <ChevronDown size={18} color={colors.muted} /> : <ChevronRight size={18} color={colors.muted} />)}
          </PressableFeedback>
          {isVan && <View style={{ gap: 8 }}>
            <Typography style={ui.muted}>{data.vanSeatsRemaining} sample seats remaining</Typography>
            <Button isDisabled={!data.isVanReserved && data.vanSeatsRemaining <= 0} variant={data.isVanReserved ? "secondary" : "primary"} onPress={reserveVan} style={{ minHeight: 44 }}><Button.Label>{data.isVanReserved ? "Demo seat reserved · Cancel" : "Reserve a demo seat"}</Button.Label></Button>
          </View>}
          {details === option.id && option.stops && <Surface style={{ padding: 14, backgroundColor: colors.surfaceSecondary, gap: 14 }}>
            <Typography style={ui.heading}>Stop sequence & timetable</Typography>
            {option.stops.map((stop, index) => <View key={`${stop.name}-${index}`} style={{ flexDirection: "row", gap: 10 }}>
              <Typography style={{ color: colors.red, fontSize: 12, fontFamily: fonts.bold }}>{stop.time}</Typography>
              <View style={{ flex: 1, gap: 3 }}><Typography style={[ui.body, { fontSize: 13 }]}>{stop.name}</Typography><Typography style={ui.muted}>{stop.detail}</Typography></View>
            </View>)}
            <DemoNote text="Example morning timetable · not current departures" />
          </Surface>}
        </View>;
      })}
    </View>
    {!stickyStart && selected && <Action disabled={selected.coordinates.length < 2} label={mode === "drive" ? "Start" : "Start Navigation"} onPress={() => onStart(selected)} />}
    {expanded && selected && <View style={{ gap: 16 }}>
      {destination && <CarbonEmissionCard durationMinutes={selected.duration / 60} mode={mode} />}
      <Surface style={{ padding: 14, backgroundColor: colors.amberSoft, gap: 8 }}><View style={[ui.row, { gap: 8 }]}><TriangleAlert size={18} color={colors.amber} /><Typography style={[ui.heading, { fontSize: 14 }]}>Before you travel</Typography></View><Typography style={ui.muted}>{mode === "walk" ? "Check crossing signals, lighting and path access. Mapped access may change; this route is not an accessibility audit." : mode === "transit" ? "Proposed services and example departures. These mapped corridors are not verified operating bus or rail routes." : "Road estimates exclude live traffic. Follow current road signs and closures."}</Typography></Surface>
      {destination && <Surface style={[ui.card, { padding: 0, overflow: "hidden" }]}>
        <Image source={{ uri: destination.id === "park" ? "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=900&auto=format&fit=crop&q=75" : "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=900&auto=format&fit=crop&q=75" }} accessibilityLabel="Illustrative destination photo" style={{ width: "100%", height: 140 }} />
        <View style={{ padding: 14, gap: 6 }}><View style={[ui.row, { gap: 6 }]}><MapPin size={16} color={colors.red} /><Typography style={[ui.heading, { flex: 1, fontSize: 16 }]}>{destination.name}</Typography></View><Typography style={ui.muted}>{destination.address || destination.subtitle}</Typography><DemoNote text="Illustrative photo · not a verified image of this destination" /></View>
      </Surface>}
      <Typography style={ui.heading}>Step-by-step directions</Typography>
      {selected.coordinates.length < 2 ? <Typography style={ui.muted}>Directions appear when a mapped route is available.</Typography> : selected.steps.map((step, index) => <View key={`${selected.id}-step-${index}`} style={{ flexDirection: "row", gap: 10, paddingBottom: 12, borderBottomWidth: 1, borderColor: colors.border }}><Typography style={{ fontFamily: fonts.bold, color: colors.red, width: 24 }}>{index + 1}</Typography><View style={{ flex: 1, gap: 4 }}><Typography style={ui.body}>{step.instruction}</Typography>{step.distance > 0 && <Typography style={ui.muted}>{distanceLabel(step.distance)} · {minutes(step.duration)} min</Typography>}</View></View>)}
    </View>}
    <DemoNote text="Navigation demonstrates instructions. Transit services and bookings are simulated; route geometry follows mapped networks." />
  </View>;
}
