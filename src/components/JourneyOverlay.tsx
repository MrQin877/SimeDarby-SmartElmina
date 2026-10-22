import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowUp, ArrowUpLeft, ArrowUpRight, Flag, ChevronRight } from "lucide-react-native";
import { DemoNote, PressableFeedback, Surface, Typography } from "./Common";
import Action from "./Action";
import type { Journey } from "../lib/routing";
import { distanceLabel, minutes } from "../lib/routing";
import { colors, ui } from "../lib/theme";

export default function JourneyOverlay({ journey, index, onNext, onExit }: { journey: Journey; index: number; onNext: () => void; onExit: () => void }) {
  const insets = useSafeAreaInsets();
  const step = journey.steps[index];
  const arrived = index === journey.steps.length - 1;
  const remaining = journey.steps.slice(index);
  const Icon = arrived ? Flag : step.instruction.includes("right") ? ArrowUpRight : step.instruction.includes("left") ? ArrowUpLeft : ArrowUp;
  return <>
    <View style={{ position: "absolute", top: insets.top + 14, left: 18, right: 18, gap: 8, zIndex: 5 }}>
      <Surface style={[ui.row, ui.shadow, { backgroundColor: colors.ink, padding: 20 }]}>
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" }}><Icon size={28} color={colors.white} /></View>
        <View style={{ flex: 1, gap: 4 }}><Typography style={[ui.heading, { color: colors.white, fontSize: 24 }]}>{arrived ? "You’ve arrived" : distanceLabel(step.distance)}</Typography><Typography style={[ui.body, { color: "#D4D4D8" }]}>{step.instruction}</Typography></View>
      </Surface>
      <Surface style={{ alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6 }}><DemoNote text="DEMO JOURNEY · NOT LIVE GPS GUIDANCE" /></Surface>
    </View>
    <View style={{ position: "absolute", bottom: insets.bottom + 18, left: 18, right: 18, gap: 10, zIndex: 5 }}>
      {!arrived && <PressableFeedback accessibilityLabel="Simulate next instruction" onPress={onNext}><Surface style={[ui.between, { padding: 15 }]}><Typography style={ui.muted}>Simulate next instruction</Typography><ChevronRight size={18} color={colors.ink} /></Surface></PressableFeedback>}
      <Surface style={[ui.between, ui.shadow, { padding: 20 }]}><View style={{ flex: 1, gap: 4 }}><Typography style={ui.heading}>{arrived ? "Destination reached" : `${minutes(remaining.reduce((sum, item) => sum + item.duration, 0))} min remaining`}</Typography><Typography style={ui.muted}>{distanceLabel(remaining.reduce((sum, item) => sum + item.distance, 0))} · {journey.destination}</Typography></View><Action label="Exit" onPress={onExit} /></Surface>
    </View>
  </>;
}
