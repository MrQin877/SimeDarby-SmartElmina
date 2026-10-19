import { useEffect, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, MapPin } from "lucide-react-native";
import TownshipMap from "../components/TownshipMap";
import {
  Alert,
  AnimatedSheet,
  Badge,
  DemoNote,
  Description,
  IconButton,
  Spinner,
  Typography,
} from "../components/Common";
import Action from "../components/Action";
import PreviewTabs from "../components/PreviewTabs";
import { CENTER, type Coordinate, type Place } from "../lib/data";
import {
  distanceLabel,
  minutes,
  requestRoute,
  setJourney,
  validCoordinate,
  type Journey,
} from "../lib/routing";
import { colors, radius, ui } from "../lib/theme";
export default function RoutePreview() {
  const p = useLocalSearchParams<{ lng: string; lat: string; name: string }>();
  const insets = useSafeAreaInsets();
  const [route, setRoute] = useState<Journey | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const lng = Number(p.lng),
    lat = Number(p.lat);
  const coordinate: Coordinate = validCoordinate([lng, lat])
    ? [lng, lat]
    : CENTER;
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setRoute(null);
    setError("");
    requestRoute([lng, lat], p.name || "Selected location", controller.signal)
      .then((result) => {
        if (active) setRoute(result);
      })
      .catch((e) => {
        if (active)
          setError(
            e.name === "AbortError"
              ? "Route request timed out. Please check your connection."
              : e.message,
          );
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [lng, lat, p.name, attempt]);
  const place: Place = {
    id: "destination",
    name: p.name || "Destination",
    coordinate,
    subtitle: "Selected destination",
    kind: "place",
  };
  return (
    <View style={{ flex: 1 }}>
      <TownshipMap
        markers={[place]}
        center={coordinate}
        route={route?.coordinates}
        selectedId="destination"
      />
      <View style={{ position: "absolute", top: insets.top + 15, left: 18 }}>
        <IconButton
          icon={ArrowLeft}
          label="Back to map"
          onPress={() => router.back()}
        />
      </View>
      <AnimatedSheet
        style={[
          ui.shadow,
          {
            position: "absolute",
            bottom: 64 + insets.bottom,
            left: 0,
            right: 0,
            backgroundColor: colors.white,
            padding: 24,
            paddingBottom: 24,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            borderTopWidth: 1,
            borderColor: colors.border,
            gap: 14,
          },
        ]}
      >
        <Badge tone="green">ROUTE PREVIEW</Badge>
        <View style={ui.row}>
          <MapPin size={24} color={colors.green} />
          <Typography.Heading type="h2" style={[ui.heading, { flex: 1 }]}>
            {place.name}
          </Typography.Heading>
        </View>
        {route ? (
          <>
            <Typography.Heading type="h1" style={[ui.title, { fontSize: 25 }]}>
              {minutes(route.duration)} min{" "}
              <Description style={{ color: colors.muted, fontSize: 16 }}>
                · {distanceLabel(route.distance)}
              </Description>
            </Typography.Heading>
            <DemoNote text="From the demo starting point · estimate excludes live traffic" />
            <Action
              label="Start demo journey"
              onPress={() => {
                setJourney(route);
                router.replace("/journey");
              }}
            />
            <DemoNote text="Journey mode demonstrates turn instructions. It is not GPS navigation." />
          </>
        ) : error ? (
          <>
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description style={{ color: colors.red }}>
                  {error}
                </Alert.Description>
              </Alert.Content>
            </Alert>
            <Action
              label="Try again"
              onPress={() => setAttempt((n) => n + 1)}
            />
          </>
        ) : (
          <View style={[ui.row, { paddingVertical: 15 }]}>
            <Spinner color="danger" size="sm" />
            <Description style={ui.muted}>Finding a driving route…</Description>
          </View>
        )}
      </AnimatedSheet>
      <PreviewTabs />
    </View>
  );
}
