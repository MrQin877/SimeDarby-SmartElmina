import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowUp,
  ArrowUpRight,
  ArrowUpLeft,
  Flag,
  ChevronRight,
} from "lucide-react-native";
import TownshipMap from "../components/TownshipMap";
import {
  DemoNote,
  Description,
  Page,
  PressableFeedback,
  Surface,
  Typography,
} from "../components/Common";
import Action from "../components/Action";
import {
  clearJourney,
  distanceLabel,
  getJourney,
  minutes,
} from "../lib/routing";
import { colors, radius, ui } from "../lib/theme";
export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const [journey] = useState(getJourney);
  const [index, setIndex] = useState(0);
  if (!journey)
    return (
      <Page title="Choose a destination first" back>
        <Action
          label="Explore the map"
          onPress={() => router.replace("/explore")}
        />
      </Page>
    );
  const step = journey.steps[index];
  const arrived = index === journey.steps.length - 1;
  const remaining = journey.steps.slice(index);
  const duration = remaining.reduce((s, x) => s + x.duration, 0);
  const distance = remaining.reduce((s, x) => s + x.distance, 0);
  const Icon = arrived
    ? Flag
    : step.instruction.includes("right")
      ? ArrowUpRight
      : step.instruction.includes("left")
        ? ArrowUpLeft
        : ArrowUp;
  return (
    <View style={{ flex: 1 }}>
      <TownshipMap
        markers={[]}
        route={journey.coordinates}
        center={step.coordinate}
        userCoordinate={step.coordinate}
        bearing={step.bearing}
      />
      <View
        style={{
          position: "absolute",
          top: insets.top + 14,
          left: 18,
          right: 18,
          gap: 8,
        }}
      >
        <Surface
          style={[
            ui.row,
            ui.shadow,
            { backgroundColor: colors.ink, padding: 20, borderRadius: radius.card },
          ]}
        >
          <Surface
            style={{
              width: 52,
              height: 52,
              borderRadius: radius.md,
              backgroundColor: colors.red,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={28} color={colors.white} />
          </Surface>
          <View style={{ flex: 1, gap: 4 }}>
            <Typography.Heading
              type="h2"
              style={{ fontSize: 24, fontWeight: "700", color: colors.white }}
            >
              {arrived ? "You’ve arrived" : distanceLabel(step.distance)}
            </Typography.Heading>
            <Typography
              style={{ fontSize: 14, color: "#D4D4D8", lineHeight: 20 }}
            >
              {step.instruction}
            </Typography>
          </View>
        </Surface>
        <Surface
          style={{
            alignSelf: "flex-start",
            backgroundColor: colors.white,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <DemoNote text="DEMO JOURNEY · NOT LIVE GPS GUIDANCE" />
        </Surface>
      </View>
      <View
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: insets.bottom + 18,
          gap: 10,
        }}
      >
        {!arrived && (
          <PressableFeedback
            onPress={() =>
              setIndex((i) => Math.min(i + 1, journey.steps.length - 1))
            }
          >
            <Surface
              style={[
                ui.between,
                { backgroundColor: "#fff", borderRadius: radius.card, padding: 15 },
              ]}
            >
              <Description style={ui.muted}>
                Preview next instruction
              </Description>
              <ChevronRight size={18} color={colors.ink} />
            </Surface>
          </PressableFeedback>
        )}
        <Surface
          style={[
            ui.between,
            ui.shadow,
            { backgroundColor: "#fff", borderRadius: radius.card, padding: 20 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Typography.Heading type="h3" style={[ui.heading, { fontSize: 21 }]}>
              {arrived
                ? "Destination reached"
                : `${minutes(duration)} min remaining`}
            </Typography.Heading>
            <Description style={ui.muted}>
              {distanceLabel(distance)} · {journey.destination}
            </Description>
          </View>
          <Action
            label="End"
            onPress={() => {
              clearJourney();
              router.replace("/explore");
            }}
          />
        </Surface>
      </View>
    </View>
  );
}
