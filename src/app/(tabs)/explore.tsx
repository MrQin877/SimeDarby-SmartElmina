import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import {
  Search,
  Mic,
  CarFront,
  BusFront,
  TriangleAlert,
  Video,
  LocateFixed,
  Bookmark,
  MapPin,
  Compass,
} from "lucide-react-native";
import {
  CENTER,
  filters,
  places,
  visiblePlaces,
  type Coordinate,
  type MapFilter,
  type Place,
} from "../../lib/data";
import TownshipMap from "../../components/TownshipMap";
import CameraFeed from "../../components/CameraFeed";
import {
  Alert,
  AnimatedSheet,
  Badge,
  CloseButton,
  DemoNote,
  Description,
  FilterChip,
  IconButton,
  PressableFeedback,
  Surface,
  Typography,
} from "../../components/Common";
import Action from "../../components/Action";
import {
  TrafficDetailsContent,
  PlanJourneyContent,
  ShuttleContent,
} from "../../components/MobilitySheets";
import { colors, fonts, radius, ui } from "../../lib/theme";
import { useStore } from "../../state/store";
import { toggleItem } from "../../lib/model";
const filterIcons = {
  Traffic: CarFront,
  Transport: BusFront,
  Hazards: TriangleAlert,
  CCTV: Video,
};

type SheetMode = "place" | "traffic_details" | "plan_journey" | "shuttle";

export default function Explore() {
  const inset = useSafeAreaInsets();
  const params = useLocalSearchParams<{ place?: string; sheet?: string }>();
  const { data, update } = useStore();
  const [filter, setFilter] = useState<MapFilter>("Traffic");
  const [selected, setSelected] = useState<Place | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode | null>(null);
  const [center, setCenter] = useState<Coordinate>(CENTER);
  const [user, setUser] = useState<Coordinate>();
  const [cameraKey, setCameraKey] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (params.sheet === "traffic_details") {
      setSheetMode("traffic_details");
      const b = places.find((p) => p.id === "bottleneck-gce");
      if (b) {
        setSelected(b);
        setCenter(b.coordinate);
        setFilter("Hazards");
      }
    } else if (params.sheet === "plan_journey") {
      setSheetMode("plan_journey");
      setSelected({
        id: "journey-planner",
        name: "Plan Your Journey",
        subtitle: "Multi-modal options",
        coordinate: CENTER,
        kind: "place",
      });
    } else if (params.sheet === "shuttle") {
      setSheetMode("shuttle");
      const s = places.find((p) => p.id === "stop-1");
      if (s) {
        setSelected(s);
        setCenter(s.coordinate);
        setFilter("Transport");
      }
    }
  }, [params.sheet]);
  useEffect(() => {
    if (!params.place) return;
    const p = places.find((p) => p.id === params.place);
    if (p) {
      setSelected(p);
      setCenter(p.coordinate);
      setFilter(
        p.kind === "camera"
          ? "CCTV"
          : p.kind === "transport"
            ? "Transport"
            : p.kind === "hazard"
              ? "Hazards"
              : "Traffic",
      );
    }
  }, [params.place]);
  const select = (p: Place) => {
    setSelected(p);
    setCenter(p.coordinate);
    if (p.id === "bottleneck-gce") {
      setSheetMode("traffic_details");
    } else if (p.kind === "transport" || p.id === "stop-1" || p.id === "stop-2") {
      setSheetMode("shuttle");
    } else {
      setSheetMode("place");
    }
  };
  async function locate() {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setMessage(
          "Location permission is off. You can still explore the map.",
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const point: Coordinate = [
        location.coords.longitude,
        location.coords.latitude,
      ];
      setUser(point);
      setCenter(point);
      setCameraKey((k) => k + 1);
      setMessage("");
    } catch {
      setMessage("Your location is unavailable. Please try again.");
    }
  }
  const markers = visiblePlaces(filter);
  if (selected && !markers.some((p) => p.id === selected.id))
    markers.push(selected);
  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary }}>
      <TownshipMap
        markers={markers}
        selectedId={selected?.id}
        center={center}
        userCoordinate={user}
        cameraKey={cameraKey}
        traffic={filter === "Traffic"}
        onSelect={select}
        onMapPress={(coordinate) =>
          select({
            id: "dropped-pin",
            name: "Selected location",
            subtitle: `${coordinate[1].toFixed(5)}, ${coordinate[0].toFixed(5)}`,
            coordinate,
            kind: "place",
          })
        }
      />
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: inset.top + 14,
          left: 0,
          right: 0,
          gap: 8,
        }}
      >
        <Surface style={[s.search, ui.shadow]}>
          <PressableFeedback
            accessibilityLabel="Search destination"
            onPress={() => router.push("/search")}
            style={[ui.row, { flex: 1, paddingVertical: 12 }]}
          >
            <Search size={19} color={colors.red} strokeWidth={2.2} />
            <Description style={{ fontSize: 15, color: colors.muted }}>
              Where are you heading?
            </Description>
          </PressableFeedback>
          <IconButton
            icon={Mic}
            label="Voice destination search"
            onPress={() => router.push("/search?voice=1")}
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.md,
              borderWidth: 0,
              shadowOpacity: 0,
              elevation: 0,
              backgroundColor: colors.surfaceSecondary,
            }}
          />
        </Surface>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ overflow: "visible" }}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingVertical: 6,
            gap: 8,
          }}
        >
          {filters.map((f) => (
            <FilterChip
              key={f}
              label={f}
              icon={filterIcons[f]}
              selected={filter === f}
              activeColor={colors.red}
              inactiveBg={colors.white}
              elevated
              onPress={() => {
                setFilter(f);
                setSelected(null);
                router.setParams({ place: "" });
              }}
            />
          ))}
        </ScrollView>
        <Surface
          style={{
            alignSelf: "flex-start",
            marginHorizontal: 18,
            backgroundColor: "#FFFFFFF2",
            borderRadius: radius.sm,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <DemoNote text="DEMO OVERLAYS · NOT LIVE TRAFFIC" />
        </Surface>
        {message ? (
          <View style={{ marginHorizontal: 18 }}>
            <PressableFeedback onPress={() => setMessage("")}>
              <Alert status="warning" style={ui.shadow}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{message}</Alert.Description>
                </Alert.Content>
              </Alert>
            </PressableFeedback>
          </View>
        ) : null}
      </View>
      {!selected && !sheetMode && (
        <View
          style={{
            position: "absolute",
            bottom: 24,
            left: 16,
            right: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 56 }}
          >
            <PressableFeedback
              onPress={() => {
                setSheetMode("traffic_details");
                const b = places.find((p) => p.id === "bottleneck-gce");
                if (b) {
                  setSelected(b);
                  setCenter(b.coordinate);
                }
              }}
              style={{
                backgroundColor: colors.white,
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.red,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                shadowColor: "#09090B",
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: colors.red,
                }}
              />
              <Typography
                style={{
                  fontSize: 12,
                  fontFamily: fonts.bold,
                  fontWeight: "700",
                  color: colors.red,
                }}
              >
                GCE Delay (12m)
              </Typography>
            </PressableFeedback>

            <PressableFeedback
              onPress={() => {
                setSheetMode("plan_journey");
                setSelected({
                  id: "journey-planner",
                  name: "Plan Your Journey",
                  subtitle: "Multi-modal options",
                  coordinate: CENTER,
                  kind: "place",
                });
              }}
              style={{
                backgroundColor: colors.white,
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                shadowColor: "#09090B",
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Compass size={14} color={colors.ink} />
              <Typography
                style={{
                  fontSize: 12,
                  fontFamily: fonts.bold,
                  fontWeight: "700",
                  color: colors.ink,
                }}
              >
                Plan Journey
              </Typography>
            </PressableFeedback>

            <PressableFeedback
              onPress={() => {
                setSheetMode("shuttle");
                const s = places.find((p) => p.id === "stop-1");
                if (s) {
                  setSelected(s);
                  setCenter(s.coordinate);
                }
              }}
              style={{
                backgroundColor: colors.white,
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                shadowColor: "#09090B",
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <BusFront size={14} color={colors.ink} />
              <Typography
                style={{
                  fontSize: 12,
                  fontFamily: fonts.bold,
                  fontWeight: "700",
                  color: colors.ink,
                }}
              >
                Bus S1 (6m)
              </Typography>
            </PressableFeedback>
          </ScrollView>

          <IconButton
            icon={LocateFixed}
            label="Show my location"
            onPress={() => {
              void locate();
            }}
          />
        </View>
      )}

      {(selected || sheetMode) && (
        <AnimatedSheet style={[s.sheet, ui.shadow]}>
          <View style={s.handle} />
          <View style={[ui.between, { marginBottom: 6 }]}>
            <Badge
              tone={
                sheetMode === "traffic_details"
                  ? "red"
                  : sheetMode === "shuttle"
                    ? "red"
                    : sheetMode === "plan_journey"
                      ? "neutral"
                      : selected?.kind === "hazard"
                        ? "amber"
                        : "green"
              }
            >
              {sheetMode === "traffic_details"
                ? "TRAFFIC ANALYSIS"
                : sheetMode === "plan_journey"
                  ? "COMMUTER MODE"
                  : sheetMode === "shuttle"
                    ? "COMMUNITY SHUTTLE"
                    : selected?.kind === "camera"
                      ? "ROAD CAMERA"
                      : selected?.kind === "transport"
                        ? "PROPOSED SERVICE"
                        : selected?.kind === "hazard"
                          ? "SAMPLE HAZARD"
                          : "EXPLORE ELMINA"}
            </Badge>
            <CloseButton
              accessibilityLabel="Close map details"
              onPress={() => {
                setSelected(null);
                setSheetMode(null);
                router.setParams({ place: "", sheet: "" });
              }}
            />
          </View>

          <ScrollView
            style={{ maxHeight: 420 }}
            contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {sheetMode === "traffic_details" ? (
              <TrafficDetailsContent
                onPlanJourney={() => setSheetMode("plan_journey")}
                onClose={() => {
                  setSelected(null);
                  setSheetMode(null);
                  router.setParams({ place: "", sheet: "" });
                }}
              />
            ) : sheetMode === "plan_journey" ? (
              <PlanJourneyContent
                onSelectOption={() => {}}
                onClose={() => {
                  setSelected(null);
                  setSheetMode(null);
                  router.setParams({ place: "", sheet: "" });
                }}
              />
            ) : sheetMode === "shuttle" ? (
              <ShuttleContent
                onFocusBus={() => {
                  setCenter([101.51425, 3.17901]);
                  setCameraKey((k) => k + 1);
                }}
                onClose={() => {
                  setSelected(null);
                  setSheetMode(null);
                  router.setParams({ place: "", sheet: "" });
                }}
              />
            ) : selected?.kind === "camera" ? (
              <>
                <Typography.Heading type="h2" style={ui.heading}>
                  {selected.name}
                </Typography.Heading>
                <View style={[ui.row, { gap: 5 }]}>
                  <MapPin size={12} color={colors.muted} />
                  <Description style={ui.muted}>{selected.subtitle}</Description>
                </View>
                <CameraFeed url={selected.streamUrl} />
              </>
            ) : selected?.kind === "hazard" ? (
              <>
                <Typography.Heading type="h2" style={ui.heading}>
                  {selected.name}
                </Typography.Heading>
                <View style={[ui.row, { gap: 5 }]}>
                  <MapPin size={12} color={colors.muted} />
                  <Description style={ui.muted}>{selected.subtitle}</Description>
                </View>
                <Typography style={ui.body}>{selected.detail}</Typography>
                <Action
                  label="Plan Alternative Journey"
                  onPress={() => setSheetMode("plan_journey")}
                />
              </>
            ) : selected ? (
              <>
                <Typography.Heading type="h2" style={ui.heading}>
                  {selected.name}
                </Typography.Heading>
                <View style={[ui.row, { gap: 5 }]}>
                  <MapPin size={12} color={colors.muted} />
                  <Description style={ui.muted}>{selected.subtitle}</Description>
                </View>
                <View style={ui.row}>
                  <View style={{ flex: 1 }}>
                    <Action
                      label="Get directions"
                      onPress={() =>
                        router.push({
                          pathname: "/route",
                          params: {
                            place: selected.id,
                            name: selected.name,
                            lng: String(selected.coordinate[0]),
                            lat: String(selected.coordinate[1]),
                          },
                        })
                      }
                    />
                  </View>
                  {selected.id !== "dropped-pin" && (
                    <IconButton
                      icon={Bookmark}
                      color={
                        data.saved.includes(selected.id) ? colors.red : colors.ink
                      }
                      label={
                        data.saved.includes(selected.id)
                          ? "Unsave place"
                          : "Save place"
                      }
                      onPress={() =>
                        update((d) => ({
                          ...d,
                          saved: toggleItem(d.saved, selected.id),
                        }))
                      }
                    />
                  )}
                </View>
              </>
            ) : null}
          </ScrollView>
        </AnimatedSheet>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  search: {
    marginHorizontal: 18,
    borderRadius: radius.field,
    backgroundColor: colors.white,
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legend: {
    position: "absolute",
    bottom: 49,
    left: 18,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.card,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 22,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 6,
  },
});
