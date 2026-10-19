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
import { colors, radius, ui } from "../../lib/theme";
import { useStore } from "../../state/store";
import { toggleItem } from "../../lib/model";
const filterIcons = {
  Traffic: CarFront,
  Transport: BusFront,
  Hazards: TriangleAlert,
  CCTV: Video,
};
export default function Explore() {
  const inset = useSafeAreaInsets();
  const params = useLocalSearchParams<{ place?: string }>();
  const { data, update } = useStore();
  const [filter, setFilter] = useState<MapFilter>("Traffic");
  const [selected, setSelected] = useState<Place | null>(null);
  const [center, setCenter] = useState<Coordinate>(CENTER);
  const [user, setUser] = useState<Coordinate>();
  const [cameraKey, setCameraKey] = useState(0);
  const [message, setMessage] = useState("");
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
      {!selected && (
        <View style={{ position: "absolute", bottom: 48, right: 18 }}>
          <IconButton
            icon={LocateFixed}
            label="Show my location"
            onPress={() => {
              void locate();
            }}
          />
        </View>
      )}
      {!selected && filter === "Traffic" && (
        <Surface style={[s.legend, ui.shadow]}>
          {[
            [colors.green, "Clear"],
            [colors.amber, "Moderate"],
            [colors.red, "Heavy"],
          ].map(([color, label]) => (
            <View key={label} style={[ui.row, { gap: 6 }]}>
              <View
                style={{
                  height: 6,
                  width: 14,
                  borderRadius: 3,
                  backgroundColor: color,
                }}
              />
              <Typography
                style={{ fontSize: 11, fontWeight: "600", color: colors.ink }}
              >
                {label}
              </Typography>
            </View>
          ))}
        </Surface>
      )}
      {selected && (
        <AnimatedSheet style={[s.sheet, ui.shadow]}>
          <View style={s.handle} />
          <ScrollView
            style={{ maxHeight: 350 }}
            contentContainerStyle={{ gap: 12 }}
          >
            <View style={ui.between}>
              <Badge tone={selected.kind === "hazard" ? "amber" : "green"}>
                {selected.kind === "camera"
                  ? "ROAD CAMERA"
                  : selected.kind === "transport"
                    ? "PROPOSED SERVICE"
                    : selected.kind === "hazard"
                      ? "SAMPLE HAZARD"
                      : "EXPLORE ELMINA"}
              </Badge>
              <CloseButton
                accessibilityLabel="Close map details"
                onPress={() => {
                  setSelected(null);
                  router.setParams({ place: "" });
                }}
              />
            </View>
            <Typography.Heading type="h2" style={ui.heading}>
              {selected.name}
            </Typography.Heading>
            <View style={[ui.row, { gap: 5 }]}>
              <MapPin size={12} color={colors.muted} />
              <Description style={ui.muted}>{selected.subtitle}</Description>
            </View>
            {selected.kind === "camera" ? (
              <CameraFeed url={selected.streamUrl} />
            ) : selected.kind === "transport" ? (
              <>
                <Typography style={ui.body}>{selected.detail}</Typography>
                <Surface
                  variant="secondary"
                  style={[
                    ui.row,
                    {
                      padding: 14,
                      backgroundColor: colors.surfaceSecondary,
                      borderRadius: radius.card,
                    },
                  ]}
                >
                  <BusFront size={22} color={colors.green} />
                  <View>
                    <Typography
                      style={{ fontWeight: "600", color: colors.ink }}
                    >
                      Weekday timetable · sample
                    </Typography>
                    <Description style={ui.muted}>
                      08:00 · 09:00 · 10:00 · 11:00
                    </Description>
                  </View>
                </Surface>
                <DemoNote text="Not an operating service · no bookings available" />
              </>
            ) : selected.kind === "hazard" ? (
              <>
                <Typography style={ui.body}>{selected.detail}</Typography>
                <Action
                  label="Report another issue"
                  onPress={() =>
                    router.push({
                      pathname: "/report",
                      params: { location: selected.subtitle },
                    })
                  }
                />
              </>
            ) : (
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
            )}
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
