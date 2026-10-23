import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Keyboard, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Search, Mic, LocateFixed, Bookmark, MapPin, ArrowDownUp, Layers, Car, BusFront, Video, Check } from "lucide-react-native";
import { CENTER, places, searchPlaces, roadCorridors, resolveRoadCorridor, type Coordinate, type Place } from "../../lib/data";
import { canonicalShuttlePlace, elminaBusStops, liveBusLocation, liveBusPlace, shuttleMapPlaces, shuttleRouteCoordinates } from "../../lib/shuttle-data";
import ColocatedFacilities from "../../components/ColocatedFacilities";
import AnnouncementMapPreview from "../../components/AnnouncementMapPreview";
import BusReminderPill from "../../components/BusReminderPill";
import { activeBusReminder, type BusReminder } from "../../lib/bus-reminders";
import TownshipMap from "../../components/TownshipMap";
import DraggableSheet from "../../components/DraggableSheet";
import MenuSheet from "../../components/MenuSheet";
import JourneyOverlay from "../../components/JourneyOverlay";
import SearchOverlay from "../../components/SearchOverlay";
import CameraFeed from "../../components/CameraFeed";
import { CloseButton, DemoNote, Description, IconButton, Input, PressableFeedback, Surface, Typography } from "../../components/Common";
import Action from "../../components/Action";
import { TrafficDetailsContent, PlanJourneyContent, ShuttleContent } from "../../components/MobilitySheets";
import { colors, fonts, radius, ui } from "../../lib/theme";
import { useStore } from "../../state/store";
import { toggleItem } from "../../lib/model";
import { demoRouteOptions, type TravelMode, type RouteOption } from "../../lib/journey-planner";
import { distanceLabel, minutes, clearJourney, getJourney, validCoordinate, type Journey } from "../../lib/routing";
import { useAppToast } from "../../hooks/useAppToast";
import { useRouteOptions } from "../../hooks/useRouteOptions";
import { filterMapPlaces, markerKind, mapLayers, announcementMapPlaces, placeAnnouncement, type MapLayer } from "../../lib/map-layers";
import { useExploreSheetVisibility } from "../../components/ExploreSheetContext";
import { sheetSnapPoints, routingSnapPoints, toggledSheetSnap } from "../../lib/sheet";

type SheetMode = "place" | "traffic_details" | "plan_journey" | "shuttle" | "announcement" | "colocated";
const defaultDestination = places.find((place) => place.id === "kwasa-hub")!;
const currentLocation: Place = { id: "current-location", name: "Current Location", subtitle: "Demo starting point until GPS is enabled", coordinate: CENTER, kind: "place" };
function modeForPlace(place: Place): SheetMode {
  if (placeAnnouncement(place)) return "announcement";
  return place.id === "bottleneck-gce" || place.id === "closure-persiaran-elmina" || place.kind === "hazard" ? "traffic_details" : place.kind === "transport" ? "shuttle" : "place";
}

export default function Explore() {
  const setSheetVisible = useExploreSheetVisibility();
  const [layer, setLayer] = useState<MapLayer>("all");
  const [layersOpen, setLayersOpen] = useState(false);
  const inset = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    place?: string;
    sheet?: string;
    arrived?: string;
    mode?: string;
    voice?: string;
    resume?: string;
    lng?: string;
    lat?: string;
    name?: string;
    origin?: string;
    destination?: string;
    corridor?: string;
    route?: string;
  }>();
  const { data, update } = useStore();
  const [mapZoom, setMapZoom] = useState(14.4);
  const [facilitiesZoom, setFacilitiesZoom] = useState(14.4);
  const [colocatedPlaces, setColocatedPlaces] = useState<Place[]>([]);
  const [mapHeight, setMapHeight] = useState(700);
  const [snapIndex, setSnapIndex] = useState(1);
  const [shuttleReminderOpen, setShuttleReminderOpen] = useState(false);
  const [managedReminderId, setManagedReminderId] = useState<string | null>(null);
  const managedReminder = data.busReminders.find(r => r.id === managedReminderId && !r.dismissedAt && r.scheduledTime > Date.now());
  const floatingReminder = activeBusReminder(data.busReminders, Date.now());
  const sheetScroll = useRef<ScrollView>(null);
  const changeShuttleReminder = (open: boolean) => {
    setShuttleReminderOpen(open);
    if (open) setSnapIndex(2);
    sheetScroll.current?.scrollTo({ y: 0, animated: false });
  };
  const [corridor, setCorridor] = useState(roadCorridors[0]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode | null>(null);
  useEffect(() => { setShuttleReminderOpen(false); }, [sheetMode, selected?.id]);
  const [center, setCenter] = useState<Coordinate>(CENTER);
  const [user, setUser] = useState<Coordinate>();
  const [cameraKey, setCameraKey] = useState(0);
  const notify = useAppToast();
  const [travelMode, setTravelMode] = useState<TravelMode>("drive");
  const [origin, setOrigin] = useState<Place | null>(currentLocation);
  const [destination, setDestination] = useState<Place | null>(defaultDestination);
  const [originText, setOriginText] = useState(currentLocation.name);
  const [destinationText, setDestinationText] = useState(defaultDestination.name);
  const [editing, setEditing] = useState<"origin" | "destination" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [routeId, setRouteId] = useState<string>();
  useFocusEffect(useCallback(() => {
    setSheetVisible(Boolean(sheetMode) || searchOpen || Boolean(activeJourney));
    return () => setSheetVisible(false);
  }, [sheetMode, searchOpen, activeJourney, setSheetVisible]));
  const routing = sheetMode === "plan_journey" && !activeJourney;
  const { options, loading, message: routeMessage } = useRouteOptions(origin, destination, travelMode, routing);
  const selectedOption = options.find((option) => option.id === routeId) || options[0];

  useEffect(() => {
    if (params.mode === "search") { setSearchOpen(true); setLayersOpen(false); }
    if (params.resume === "1") { const previous = getJourney(); if (previous?.steps.length) { setActiveJourney(previous); setJourneyIndex(0); setSheetMode(null); } clearJourney(); }
    if (params.lng && params.lat && validCoordinate([Number(params.lng), Number(params.lat)])) {
      const target: Place = { id: "custom-route", name: params.name || "Selected destination", coordinate: [Number(params.lng), Number(params.lat)], kind: "place", subtitle: "Selected map location" };
      setSelected(target); setDestination(target); setDestinationText(target.name); setCenter(target.coordinate);
    }
    if (params.arrived) {
      notify(`You’ve arrived at ${params.arrived}. Journey complete.`, "success");
      router.setParams({ arrived: "" });
      setSheetMode(null); setSelected(null); return;
    }
    if (params.origin) {
      const orig = places.find((p) => p.id === params.origin || p.name.toLowerCase().includes(params.origin!.toLowerCase()));
      if (orig) { setOrigin(orig); setOriginText(orig.name); }
    }
    if (params.destination) {
      const dest = places.find((p) => p.id === params.destination || p.name.toLowerCase().includes(params.destination!.toLowerCase()));
      if (dest) { setDestination(dest); setDestinationText(dest.name); setSelected(dest); }
    }
    const rawPlace = announcementMapPlaces([...places, ...elminaBusStops]).find((item) => item.id === params.place);
    const place = rawPlace ? canonicalShuttlePlace(rawPlace) : undefined;
    if (place) {
      setSelected(place); setCenter(place.coordinate); setSnapIndex(1);
      if (place.kind === "place") { setDestination(place); setDestinationText(place.name); }
    }
    if (params.sheet === "plan_journey") {
      setSheetMode("plan_journey"); setSnapIndex(1); setTravelMode("drive");
    } else if (params.sheet === "traffic_details") {
      const targetCorridor = roadCorridors.find(c => c.id === params.corridor) || (params.place === "closure-persiaran-elmina" ? roadCorridors.find(c => c.id === "persiaran-elmina") : roadCorridors[0]) || roadCorridors[0];
      const targetPlaceId = params.place || (params.corridor === "persiaran-elmina" ? "closure-persiaran-elmina" : "bottleneck-gce");
      const road = places.find((item) => item.id === targetPlaceId) || places.find((item) => item.id === "bottleneck-gce")!;
      setSelected(road); setCenter(road.coordinate); setCorridor(targetCorridor); setSheetMode("traffic_details"); setSnapIndex(1);
    } else if (params.sheet === "shuttle") {
      const stop = place?.kind === "transport" ? place : elminaBusStops[0];
      setSelected(stop); setCenter(stop.coordinate); setSheetMode("shuttle"); setSnapIndex(1);
    } else if (place) setSheetMode(modeForPlace(place));
  }, [params.sheet, params.place, params.arrived, params.mode, params.resume, params.lng, params.lat, params.name, params.origin, params.destination, params.corridor, notify]);

  const select = (target: Place) => {
    setManagedReminderId(null);
    const place = canonicalShuttlePlace(target);
    setSelected(place); setCenter(place.coordinate); setSnapIndex(1); setEditing(null); setLayersOpen(false); setSearchOpen(false); Keyboard.dismiss();
    if (place.id === "bottleneck-gce") setCorridor(roadCorridors.find(c => c.id === "gce") || roadCorridors[0]);
    if (place.id === "closure-persiaran-elmina") setCorridor(roadCorridors.find(c => c.id === "persiaran-elmina") || roadCorridors[0]);
    if (placeAnnouncement(place)) { setSheetMode("announcement"); return; }
    if (place.kind === "place") {
      setDestination(place); setDestinationText(place.name); setRouteId(undefined);
      if (!routing) setSheetMode("place");
    } else setSheetMode(modeForPlace(place));
  };
  const enterRouting = (place?: Place) => {
    let target = place?.kind === "place" ? place : destination || defaultDestination;
    if (corridor.id === "persiaran-elmina" || selected?.id === "closure-persiaran-elmina") {
      const elminaValley = places.find(p => p.id === "elmina-valley");
      const elminaCityCentre = places.find(p => p.id === "elmina-city-centre");
      if (elminaValley && elminaCityCentre) {
        setOrigin(elminaValley);
        setOriginText(elminaValley.name);
        target = elminaCityCentre;
      }
    }
    setSearchOpen(false); setDestination(target); setDestinationText(target.name); setSelected(target);
    setSheetMode("plan_journey"); setSnapIndex(1); setEditing(null); setRouteId(undefined); setTravelMode("drive");
  };
  const planAnnouncementRoute = () => {
    if (!selected || !selectedAnnouncement) return;
    const linkedPlace = places.find(place => place.id === selectedAnnouncement.placeId);
    const target: Place = places.find(place => place.id === selectedAnnouncement.routeDestinationId) || { ...(linkedPlace || selected), id: `advisory-destination-${selectedAnnouncement.id}`, name: linkedPlace?.name || selectedAnnouncement.impactArea || selected.name, kind: "place", announcementId: undefined, announcementCategory: undefined, imageUrl: undefined };
    const start = places.find(place => place.id === selectedAnnouncement.routeOriginId) || origin || currentLocation;
    setOrigin(start); setOriginText(start.name); setDestination(target); setDestinationText(target.name); setSelected(target); setCenter(target.coordinate);
    setSearchOpen(false); setSheetMode("plan_journey"); setSnapIndex(1); setEditing(null); setRouteId(undefined); setTravelMode("drive");
  };
  const closeSheet = () => {
    setManagedReminderId(null);
    setSelected(null); setSheetMode(null); setEditing(null);
    router.setParams({ place: "", sheet: "", arrived: "", mode: "", resume: "", lng: "", lat: "" });
  };
  const chooseLocation = (place: Place) => {
    if (editing === "origin") { setOrigin(place); setOriginText(place.name); }
    else { setDestination(place); setDestinationText(place.name); setSelected(place); }
    setRouteId(undefined); setEditing(null); Keyboard.dismiss();
  };
  async function locate() {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) { notify("Location permission is off. You can still use the demo starting point.", "warning"); return; }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coordinate: Coordinate = [location.coords.longitude, location.coords.latitude];
      setUser(coordinate); setCenter(coordinate); setCameraKey((key) => key + 1);
      if (origin?.id === "current-location") setOrigin({ ...currentLocation, coordinate, subtitle: "Your device location" });

    } catch { notify("Your location is unavailable. Please try again.", "warning"); }
  }
  const startJourney = (option: RouteOption) => {
    if (option.coordinates.length < 2 || !option.steps.length) return;
    setActiveJourney(option); setJourneyIndex(0); setSheetMode(null); setSearchOpen(false); setLayersOpen(false); Keyboard.dismiss(); setEditing(null);
  };
  const finishJourney = useCallback((arrived = false) => {
    if (arrived && activeJourney) notify(`You’ve arrived at ${activeJourney.destination}. Journey complete.`, "success");
    setActiveJourney(null); setSelected(null); setSheetMode(null); setSearchOpen(false); setEditing(null);
    router.setParams({ place: "", sheet: "", arrived: "", mode: "", resume: "" });
  }, [activeJourney, notify]);
  useEffect(() => {
    if (!activeJourney || journeyIndex < activeJourney.steps.length - 1) return;
    const timer = setTimeout(() => finishJourney(true), 1000);
    return () => clearTimeout(timer);
  }, [activeJourney, journeyIndex, finishJourney]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (searchOpen) { setSearchOpen(false); Keyboard.dismiss(); return true; }
      if (activeJourney) { finishJourney(); return true; }
      if (sheetMode === "shuttle" && shuttleReminderOpen) { setShuttleReminderOpen(false); sheetScroll.current?.scrollTo({ y: 0, animated: false }); return true; }
      if (sheetMode) { setSelected(null); setSheetMode(null); setEditing(null); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [searchOpen, activeJourney, sheetMode, shuttleReminderOpen, finishJourney]);
  const journeyStep = activeJourney?.steps[journeyIndex];
  const showShuttle = !activeJourney && !routing && (layer === "shuttle" || sheetMode === "shuttle");
  const markers = useMemo(() => {
    if (activeJourney) return [];
    const visible = routing ? destination ? [destination] : [] : filterMapPlaces(announcementMapPlaces(shuttleMapPlaces(places)), sheetMode === "shuttle" ? "shuttle" : layer, mapZoom);
    if (showShuttle || (!routing && layer === "all")) visible.push(liveBusPlace);
    return selected && markerKind(selected) !== "traffic" && !visible.some((place) => place.id === selected.id) ? [...visible, selected] : visible;
  }, [selected, destination, routing, layer, sheetMode, showShuttle, activeJourney, mapZoom]);
  const routeOverlays = useMemo(() => {
    if (activeJourney) return [{ id: "active-journey", coordinates: activeJourney.coordinates, segments: (activeJourney as RouteOption).segments }];
    if (!routing) return undefined;
    const visible = travelMode === "drive" ? options : selectedOption ? [selectedOption] : [];
    return [...visible.filter((option) => option.id !== selectedOption?.id), ...visible.filter((option) => option.id === selectedOption?.id)].filter((option) => option.coordinates.length > 1).map(({ id, coordinates, segments }) => ({ id, coordinates, segments }));
  }, [routing, travelMode, options, selectedOption, activeJourney]);
  const availableHeight = mapHeight;
  const expandedHeight = Math.max(220, mapHeight - inset.top - 8);
  const snapPoints = useMemo(() => routing ? routingSnapPoints(availableHeight, inset.top) : sheetSnapPoints(availableHeight, expandedHeight), [routing, availableHeight, expandedHeight, inset.top]);
  const sheetHeight = snapPoints[snapIndex];
  const viewportPadding = useMemo(() => ({ top: activeJourney ? 180 : routing ? 185 : 110, bottom: activeJourney ? 200 : sheetMode ? Math.min(sheetHeight + 10, Math.max(20, mapHeight - (routing ? 275 : 235))) : 20 }), [routing, sheetMode, sheetHeight, mapHeight, activeJourney]);
  const candidates = editing ? [
    ...(editing === "origin" ? [{ ...currentLocation, coordinate: user || CENTER }] : []),
    ...searchPlaces(editing === "origin" ? originText === "Current Location" ? "" : originText : destinationText === destination?.name ? "" : destinationText),
  ].slice(0, 5) : [];
  const placeEstimate = useMemo(() => selected?.kind === "place" ? demoRouteOptions(origin || currentLocation, selected, "drive")[0] : undefined, [origin, selected]);
  const selectedAnnouncement = selected ? placeAnnouncement(selected) : undefined;
  const cameraSelected = selected?.kind === "camera";
  const sheetTitle = sheetMode === "colocated" ? `Colocated Facilities (${colocatedPlaces.length} items)` : routing
    ? `${travelMode === "drive" ? "Drive" : travelMode === "transit" ? "Transit" : "Walk"}${selectedOption ? ` · ${minutes(selectedOption.duration)} min` : ""}${destination ? ` · ${destination.name}` : ""}`
    : sheetMode === "announcement" && selectedAnnouncement ? selectedAnnouncement.title : sheetMode === "shuttle" && managedReminder && !shuttleReminderOpen ? "Bus Reminder" : sheetMode === "shuttle" && shuttleReminderOpen ? "Bus Arrival Reminder" : sheetMode === "traffic_details" ? corridor.name : selected?.name || (sheetMode === "shuttle" ? "Elmina Shuttle S1" : "Selected location");

  const openReminderManagement = (reminder: BusReminder) => {
    const stop = elminaBusStops.find(item => item.id === reminder.stopId);
    const feederPlace = places.find(item => item.id === (reminder.stopId === "t102-1" ? "elmina-green-1" : reminder.stopId === "t102-2" ? "atmosfera-stop" : "kwasa-hub"));
    const target: Place = stop ?? { id: reminder.stopId, name: reminder.stopName, subtitle: "Feeder bus stop", kind: "transport", coordinate: feederPlace?.coordinate ?? CENTER };
    setSelected(target); setCenter(target.coordinate); setSheetMode("shuttle"); setManagedReminderId(reminder.id); setShuttleReminderOpen(false); setSnapIndex(1); setLayersOpen(false);
    sheetScroll.current?.scrollTo({ y: 0, animated: false });
  };

  return <View onLayout={(event) => setMapHeight(event.nativeEvent.layout.height)} style={{ flex: 1, backgroundColor: colors.surfaceSecondary }}>
    <TownshipMap markers={markers} onZoomChange={setMapZoom} clusterEnabled={layer === "all" && sheetMode !== "shuttle" && !routing} onClusterSelect={items => { setFacilitiesZoom(mapZoom); setColocatedPlaces(items); setSelected(null); setSheetMode("colocated"); setSnapIndex(1); setCenter(items[0].coordinate); sheetScroll.current?.scrollTo({ y: 0, animated: false }); }} selectedId={selected?.id} center={journeyStep?.coordinate || center} userCoordinate={journeyStep?.coordinate || user} pitch={activeJourney ? 50 : 0} bearing={journeyStep?.bearing || 0} following={Boolean(activeJourney)} cameraKey={cameraKey} traffic={!activeJourney && !routing && (layer === "all" || layer === "traffic")}
      shuttleRoute={showShuttle ? shuttleRouteCoordinates : undefined} zoomLevel={selected?.id === liveBusLocation.id || selected?.id === "demo-shuttle-bus-t102" ? 16 : sheetMode === "colocated" ? facilitiesZoom : selected && !routing ? 16.5 : undefined}
      routeOptions={routeOverlays} selectedRouteId={activeJourney ? "active-journey" : selectedOption?.id} viewportPadding={viewportPadding}
      onRouteSelect={(id) => { if (!activeJourney) { setRouteId(id); setSnapIndex(1); } }} onSelect={select}
      onMapPress={() => { if (activeJourney) return; setSnapIndex(0); setEditing(null); setLayersOpen(false); Keyboard.dismiss(); }}
      onTrafficPress={(selection) => {
        if (activeJourney) return;
        const road = resolveRoadCorridor(selection?.corridorId, selection?.name, selection?.coordinate);
        setCorridor(road); setSelected({ id: `corridor-${road.id}`, name: road.name, subtitle: "Simulated road telemetry", coordinate: road.coordinate, kind: "hazard" });
        setCenter(road.coordinate); setSheetMode("traffic_details"); setSnapIndex(1); setEditing(null);
      }}
      onMapLongPress={(coordinate) => !activeJourney && select({ id: "dropped-pin", name: "Dropped pin", subtitle: `${coordinate[1].toFixed(5)}, ${coordinate[0].toFixed(5)}`, address: `Custom location · ${coordinate[1].toFixed(5)}, ${coordinate[0].toFixed(5)}`, coordinate, kind: "place" })}
    />
    {!activeJourney && !searchOpen && <View pointerEvents={snapIndex === 2 && sheetMode ? "none" : "box-none"} aria-hidden={snapIndex === 2 && Boolean(sheetMode)} accessibilityElementsHidden={snapIndex === 2 && Boolean(sheetMode)} style={{ position: "absolute", top: inset.top + 12, left: 0, right: 0, gap: 8, zIndex: 2 }}>
      {routing ? <Surface style={[s.routingSearch, ui.shadow]}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={[ui.row, { gap: 8 }]}><View style={s.originDot} /><Input accessibilityLabel="Depart location" placeholder="Depart location" value={originText} onFocus={() => setEditing("origin")} onChangeText={(text) => { setOriginText(text); setOrigin(null); setEditing("origin"); }} style={s.searchInput} /></View>
          <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 18 }} />
          <View style={[ui.row, { gap: 8 }]}><MapPin size={12} color={colors.red} /><Input accessibilityLabel="Destination location" placeholder="Destination location" value={destinationText} onFocus={() => setEditing("destination")} onChangeText={(text) => { setDestinationText(text); setDestination(null); setEditing("destination"); }} style={s.searchInput} /></View>
        </View>
        <IconButton icon={ArrowDownUp} label="Swap departure and destination" onPress={() => { setOrigin(destination); setDestination(origin); setOriginText(destinationText); setDestinationText(originText); setRouteId(undefined); setEditing(null); }} style={{ borderWidth: 0 }} />
      </Surface> : <Surface style={[s.search, ui.shadow]}>
        <PressableFeedback accessibilityLabel="Search destination" onPress={() => { setSearchOpen(true); setLayersOpen(false); }} style={[ui.row, { flex: 1, minHeight: 48 }]}><Search size={19} color={colors.red} /><Description style={{ fontSize: 15, color: colors.muted }}>Where are you heading?</Description></PressableFeedback>
        <IconButton icon={Mic} label="Voice destination search" onPress={() => { setSearchOpen(true); setLayersOpen(false); }} style={{ borderWidth: 0, backgroundColor: colors.surfaceSecondary }} />
      </Surface>}
      {!routing && <View style={{ alignSelf: "flex-end", marginRight: 18 }}>
        <MenuSheet open={layersOpen} onOpenChange={setLayersOpen} label="Map layers" trigger={<IconButton icon={Layers} label="Map layers" color={layer === "all" ? colors.ink : colors.red} onPress={() => setLayersOpen(!layersOpen)} />}>
          {mapLayers.map((item) => {
            const Icon = item.value === "traffic" ? Car : item.value === "shuttle" ? BusFront : item.value === "cctv" ? Video : Layers;
            return <PressableFeedback key={item.value} accessibilityRole="radio" accessibilityLabel={`${item.label} map layer`} accessibilityState={{ checked: layer === item.value }} onPress={() => { setLayer(item.value); setLayersOpen(false); closeSheet(); }} style={{ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, borderRadius: 12, backgroundColor: layer === item.value ? colors.redSoft : colors.white }}><Icon size={18} color={layer === item.value ? colors.red : colors.muted} /><Typography style={[ui.body, { flex: 1, color: layer === item.value ? colors.red : colors.ink }]}>{item.label}</Typography>{layer === item.value && <Check size={16} color={colors.red} />}</PressableFeedback>;
          })}
        </MenuSheet>
      </View>}
      {editing && <Surface style={[ui.shadow, { marginHorizontal: 18, padding: 8 }]}>
        <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 230 }}>
          {candidates.map((place) => <PressableFeedback key={place.id} onPress={() => chooseLocation(place)} style={{ padding: 12, gap: 3, borderBottomWidth: 1, borderColor: colors.border }}><Typography style={[ui.body, { fontSize: 13 }]}>{place.name}</Typography><Typography style={ui.muted}>{place.subtitle}</Typography></PressableFeedback>)}
          {!candidates.length && <Typography style={[ui.muted, { padding: 12 }]}>No matching demo places. Try “park”, “mall”, or “Kwasa”.</Typography>}
        </ScrollView>
      </Surface>}
      <Surface style={{ alignSelf: "flex-start", marginHorizontal: 18, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#FFFFFFF2" }}><DemoNote text={routing ? user ? "ROUTE ESTIMATES · NO LIVE TRAFFIC" : "DEMO STARTING POINT · ENABLE GPS WITH LOCATE" : showShuttle ? "DEMO BUS POSITION & TIMETABLE" : "DEMO OVERLAYS · NOT LIVE TRAFFIC"} /></Surface>

    </View>}
    {!activeJourney && !searchOpen && sheetMode && <View style={{ position: "absolute", right: 18, bottom: sheetMode ? Math.min(sheetHeight + 12, Math.max(18, mapHeight - (routing ? 240 : 220))) : 22, zIndex: 2 }}><IconButton icon={LocateFixed} label="Show my location" onPress={() => { void locate(); }} /></View>}
    {!activeJourney && !searchOpen && <View pointerEvents={sheetMode ? "none" : "box-none"} accessibilityElementsHidden={Boolean(sheetMode)} importantForAccessibility={sheetMode ? "no-hide-descendants" : "auto"} style={{ position: "absolute", bottom: 12, left: 18, right: 18, flexDirection: "row", alignItems: "center", gap: 16, zIndex: 3 }}>
      {floatingReminder ? <BusReminderPill reminder={floatingReminder} onPress={() => openReminderManagement(floatingReminder)} /> : <View pointerEvents="none" style={{ flex: 1 }} />}
      <View style={{ flexShrink: 0 }}><IconButton icon={LocateFixed} label="Show my location" onPress={() => { void locate(); }} style={[ui.shadow, { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.white, borderWidth: 0 }]} /></View>
    </View>}
    <DraggableSheet visible={!activeJourney && !searchOpen && Boolean(selected || sheetMode)} availableHeight={availableHeight} expandedHeight={expandedHeight} index={snapIndex} onSnap={setSnapIndex} snapPoints={snapPoints} compactHandle={routing && snapIndex === 0}>
      <View key="map-sheet-header" collapsable={false} collapsableChildren={false} style={[ui.between, { display: routing && snapIndex === 0 ? "none" : "flex", marginBottom: 8, gap: 10 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${sheetTitle}. ${snapIndex === 2 ? "Collapse" : "Expand"} details`} accessibilityState={{ expanded: snapIndex === 2 }} onPress={() => setSnapIndex(toggledSheetSnap(snapIndex))} style={{ flex: 1, minWidth: 0, minHeight: 36, justifyContent: "center" }}>
          <Typography numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, fontSize: 16, fontWeight: "600", fontFamily: fonts.semibold, color: colors.ink }}>{sheetTitle}</Typography>
        </Pressable>
        <View collapsable={false} pointerEvents={sheetMode === "shuttle" && shuttleReminderOpen ? "none" : "auto"} accessibilityElementsHidden={sheetMode === "shuttle" && shuttleReminderOpen} importantForAccessibility={sheetMode === "shuttle" && shuttleReminderOpen ? "no-hide-descendants" : "auto"} style={{ opacity: sheetMode === "shuttle" && shuttleReminderOpen ? 0 : 1 }}><CloseButton accessibilityLabel="Close map details" onPress={closeSheet} /></View>
      </View>
      <ScrollView ref={sheetScroll} key="map-sheet-scroll" removeClippedSubviews={false} scrollEnabled={snapIndex === 2} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: routing && snapIndex === 0 ? 0 : Math.max(22, inset.bottom + 16) }}>
        {sheetMode === "colocated" ? <ColocatedFacilities places={colocatedPlaces} onSelect={select} />
          : sheetMode === "announcement" && selectedAnnouncement ? <AnnouncementMapPreview announcement={selectedAnnouncement} compact={snapIndex === 0} onPlanRoute={planAnnouncementRoute} />
          : sheetMode === "traffic_details" ? snapIndex === 0 ? <View style={{ gap: 6 }}><Typography style={ui.heading}>{corridor.delay} min delay</Typography><DemoNote text="Simulated congestion · expand for traffic analysis" /></View> : <TrafficDetailsContent corridor={corridor} onPlanJourney={() => enterRouting()} onClose={closeSheet} />
          : routing ? <PlanJourneyContent mode={travelMode} onModeChange={(mode) => { setTravelMode(mode); setRouteId(undefined); }} options={options} selectedId={selectedOption?.id} onSelect={setRouteId} onStart={startJourney} onExpand={() => setSnapIndex(2)} compact={snapIndex === 0} expanded={snapIndex === 2} destination={destination} stickyStart loading={loading} routeMessage={routeMessage} />
          : sheetMode === "shuttle" ? <ShuttleContent initialRoute={params.route === "T102" ? "T102" : "S1"} managedReminder={managedReminder} onManageReminder={(id) => { setManagedReminderId(id); setSnapIndex(1); sheetScroll.current?.scrollTo({ y: 0, animated: false }); }} onReminderSaved={(id) => { if (managedReminderId) setManagedReminderId(id); else closeSheet(); }} reminderOpen={shuttleReminderOpen} onReminderOpenChange={changeShuttleReminder} compact={snapIndex === 0} stopName={selected?.name} stopId={selected?.id} onClose={closeSheet} onFocusBus={(route) => {
            const bus: Place = route === "S1" ? liveBusPlace : { id: "demo-shuttle-bus-t102", name: "Demo feeder bus T102", subtitle: "Simulated vehicle location", coordinate: [101.5099, 3.18133], kind: "transport" };
            setSelected(bus); setCenter(bus.coordinate); setSnapIndex(0); setCameraKey((key) => key + 1);
          }} />
          : cameraSelected ? <>
            {snapIndex > 0 && <Typography style={ui.muted}>{selected.subtitle}</Typography>}
            <CameraFeed key={selected.id} cameraId={selected.id} url={selected.streamUrl} compact={snapIndex === 0} onPlanJourney={() => enterRouting()} />
          </>
          : selected?.kind === "hazard" ? <View style={{ gap: 12 }}><Typography style={ui.muted}>{selected.subtitle}</Typography>{snapIndex > 0 && <><Typography style={ui.body}>{selected.detail}</Typography><Action label="Plan alternative journey" onPress={() => enterRouting()} /></>}</View>
          : selected ? <View style={{ gap: 12 }}>
            <Typography style={ui.muted}>{selected.address || `${selected.subtitle} · City of Elmina, Selangor (demo)`}</Typography>
            {snapIndex > 0 && <>
              <View style={ui.between}><Typography style={ui.heading}>{placeEstimate ? `${minutes(placeEstimate.duration)} min` : "At this location"}</Typography><Typography style={ui.body}>{placeEstimate ? distanceLabel(placeEstimate.distance) : "0 m"}</Typography></View>
              <Surface style={{ padding: 12, backgroundColor: colors.amberSoft }}><Typography style={[ui.muted, { color: colors.amber }]}>Sample road status: GCE bottleneck delay +12 min</Typography></Surface>
              <DemoNote text="Destination estimates use the demo starting point unless GPS is enabled." />
            </>}
            <View style={[ui.row, { gap: 8 }]}><View style={{ flex: 1 }}><Action label="Directions / Plan Journey" onPress={() => enterRouting(selected)} /></View>{selected.id !== "dropped-pin" && <IconButton icon={Bookmark} label={data.saved.includes(selected.id) ? "Unsave place" : "Save place"} color={data.saved.includes(selected.id) ? colors.red : colors.ink} onPress={() => update((d) => ({ ...d, saved: toggleItem(d.saved, selected.id) }))} />}</View>
          </View> : null}
      </ScrollView>
      <View key="map-sheet-footer" collapsable={false} collapsableChildren={false} style={{ display: routing && snapIndex > 0 && selectedOption ? "flex" : "none", paddingTop: 10, paddingBottom: Math.max(16, inset.bottom), borderTopWidth: 1, borderColor: colors.border }}>{routing && snapIndex > 0 && selectedOption && <Action label="Start Navigation" disableAnimation disabled={selectedOption.coordinates.length < 2} onPress={() => startJourney(selectedOption)} />}</View>
    </DraggableSheet>
    {searchOpen && <SearchOverlay query={searchText} onQueryChange={setSearchText} onClose={() => { setSearchOpen(false); Keyboard.dismiss(); router.setParams({ mode: "", voice: "" }); }} onSelect={(place) => { select(place); router.setParams({ mode: "", voice: "", place: "", sheet: "", arrived: "" }); }} />}
    {activeJourney && <JourneyOverlay journey={activeJourney} index={journeyIndex} onNext={() => setJourneyIndex((index) => Math.min(index + 1, activeJourney.steps.length - 1))} onExit={() => finishJourney()} />}
  </View>;
}
const s = StyleSheet.create({
  search: { marginHorizontal: 18, borderRadius: radius.field, backgroundColor: colors.white, paddingLeft: 16, paddingRight: 6, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 8 },
  routingSearch: { marginHorizontal: 18, padding: 10, paddingLeft: 16, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.white },
  originDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.red },
  searchInput: { flex: 1, minWidth: 0, minHeight: 40, paddingHorizontal: 4, paddingVertical: 6, fontFamily: fonts.medium, fontSize: 13, backgroundColor: "transparent", color: colors.ink, borderWidth: 0 },
});
