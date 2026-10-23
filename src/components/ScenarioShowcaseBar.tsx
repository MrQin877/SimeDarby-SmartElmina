import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import {
  AlertTriangle,
  ArrowRight,
  Bus,
  Car,
  Camera,
  Clock,
  Sparkles,
} from "lucide-react-native";
import { Button, Card, PressableFeedback, Typography } from "./Common";
import { useStore } from "../state/store";
import { colors, fonts, radius, ui } from "../lib/theme";

export interface ScenarioItem {
  id: "s1" | "s2" | "s3" | "s4";
  number: number;
  persona: string;
  ageRole: string;
  time: string;
  title: string;
  problem: string;
  solution: string;
  icon: any;
  tone: "red" | "green" | "amber" | "blue";
  onTrigger: (update: any) => void;
}

export const SCENARIOS: ScenarioItem[] = [
  {
    id: "s1",
    number: 1,
    persona: "Aiman",
    ageRole: "28 · Office Worker",
    time: "7:30 AM",
    title: "Morning Commute Road Closure",
    problem: "Persiaran Elmina closed for resurfacing (7–11 AM).",
    solution: "View official advisory & AI Journey Planner detour via West Bypass.",
    icon: Car,
    tone: "red",
    onTrigger: () => {
      router.push("/announcement?id=notice-resurfacing-persiaran-elmina");
    },
  },
  {
    id: "s2",
    number: 2,
    persona: "Farah",
    ageRole: "23 · Student",
    time: "10:00 AM",
    title: "Travelling Without Private Car",
    problem: "Needs affordable, car-free transit to mall & MRT.",
    solution: "Community Shuttle T102 at 10:10 AM + Boarding QR (+25 pts) + Bask Bear coffee voucher.",
    icon: Bus,
    tone: "amber",
    onTrigger: (update) => {
      // Set points to Farah's baseline of 75 pts for the demo
      update((d: any) => ({ ...d, rewardPoints: 75 }));
      router.push({ pathname: "/explore", params: { sheet: "shuttle", route: "T102" } });
    },
  },
  {
    id: "s3",
    number: 3,
    persona: "Daniel",
    ageRole: "35 · Resident",
    time: "5:30 PM",
    title: "Road Safety Hazard Report",
    problem: "Notices dangerous pothole near Central Park crossing.",
    solution: "Report issue with category, location pin, and photo, tracked in My Reports.",
    icon: AlertTriangle,
    tone: "blue",
    onTrigger: () => {
      router.push({ pathname: "/report", params: { scenario: "3", prefill: "scenario3" } });
    },
  },
  {
    id: "s4",
    number: 4,
    persona: "Jason",
    ageRole: "30 · Daily Commuter",
    time: "7:45 AM",
    title: "Check Traffic Before Leaving",
    problem: "Unsure of morning peak congestion at Elmina Interchange.",
    solution: "Check GCE Approach live CCTV observation (32 vehicles queued, Heavy traffic).",
    icon: Camera,
    tone: "red",
    onTrigger: () => {
      router.push({ pathname: "/explore", params: { sheet: "traffic_details", corridor: "gce" } });
    },
  },
];

export default function ScenarioShowcaseBar() {
  const { update } = useStore();
  const [activeScenario, setActiveScenario] = useState<"s1" | "s2" | "s3" | "s4">("s1");
  const current = SCENARIOS.find((s) => s.id === activeScenario) || SCENARIOS[0];
  const Icon = current.icon;

  return (
    <View style={{ gap: 10 }}>
      <View style={ui.between}>
        <View style={[ui.row, { gap: 6 }]}>
          <Sparkles size={15} color={colors.red} />
          <Typography style={[ui.label, { color: colors.red }]}>HACKATHON DEMO SCENARIOS</Typography>
        </View>
        <Typography style={[ui.muted, { fontSize: 11 }]}>All 4 Live in App</Typography>
      </View>

      {/* 4 Scenario Selector Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {SCENARIOS.map((s) => {
          const selected = s.id === activeScenario;
          const SIcon = s.icon;
          return (
            <PressableFeedback
              key={s.id}
              accessibilityLabel={`Scenario ${s.number}: ${s.persona}`}
              onPress={() => setActiveScenario(s.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
                backgroundColor: selected ? colors.ink : colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: selected ? colors.ink : colors.border,
              }}
            >
              <SIcon size={14} color={selected ? colors.white : colors.muted} />
              <Typography
                style={{
                  fontFamily: selected ? fonts.bold : fonts.medium,
                  fontSize: 12,
                  color: selected ? colors.white : colors.ink,
                }}
              >
                S{s.number}: {s.persona}
              </Typography>
            </PressableFeedback>
          );
        })}
      </ScrollView>

      {/* Selected Scenario Showcase Card */}
      <Card
        style={{
          padding: 14,
          gap: 10,
          borderLeftWidth: 4,
          borderLeftColor: colors[current.tone],
          backgroundColor: colors.white,
        }}
      >
        <View style={ui.between}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors[`${current.tone}Soft`],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={15} color={colors[current.tone]} />
            </View>
            <View>
              <Typography style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.ink }}>
                Scenario {current.number} · {current.persona} ({current.ageRole})
              </Typography>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Clock size={12} color={colors.muted} />
            <Typography style={{ fontSize: 11, color: colors.muted, fontFamily: fonts.medium }}>
              {current.time}
            </Typography>
          </View>
        </View>

        <Typography style={{ fontFamily: fonts.semibold, fontSize: 13, color: colors.ink }}>
          {current.title}
        </Typography>

        <View style={{ gap: 4, backgroundColor: colors.surfaceSecondary, padding: 10, borderRadius: radius.card }}>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Typography style={{ fontSize: 11, color: colors.muted, fontFamily: fonts.bold, width: 56 }}>
              PROBLEM:
            </Typography>
            <Typography style={{ flex: 1, fontSize: 11, color: colors.ink, lineHeight: 16 }}>
              {current.problem}
            </Typography>
          </View>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Typography style={{ fontSize: 11, color: colors[current.tone], fontFamily: fonts.bold, width: 56 }}>
              SMART ELMINA:
            </Typography>
            <Typography style={{ flex: 1, fontSize: 11, color: colors.ink, lineHeight: 16 }}>
              {current.solution}
            </Typography>
          </View>
        </View>

        <Button
          size="sm"
          onPress={() => current.onTrigger(update)}
          style={{
            backgroundColor: colors[current.tone],
            borderRadius: radius.card,
            paddingVertical: 10,
          }}
        >
          <Button.Label style={{ color: colors.white, fontSize: 12, fontFamily: fonts.semibold }}>
            Test Scenario {current.number} Live Flow
          </Button.Label>
          <ArrowRight size={14} color={colors.white} />
        </Button>
      </Card>
    </View>
  );
}
