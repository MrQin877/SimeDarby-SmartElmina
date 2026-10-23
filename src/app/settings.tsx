import { View, Switch } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Check, Type } from "lucide-react-native";
import { DemoNote, Page, PressableFeedback, Surface, Typography } from "../components/Common";
import { useStore } from "../state/store";
import { colors, ui } from "../lib/theme";
import { version } from "../../package.json";
const titles: Record<string, string> = { appearance: "Appearance", support: "Help & Support", about: "About TownshipConnect", privacy: "Privacy Information", notifications: "Notifications" };
const group = [ui.card, { padding: 0, gap: 0, overflow: "hidden" as const }];
const row = { padding: 16, borderBottomWidth: 1, borderColor: colors.border, gap: 8 };
export default function Settings() {
  const { section = "about" } = useLocalSearchParams<{ section?: string }>();
  const { data, update } = useStore();
  return <Page title={titles[section] || "Settings"} back backTo="/profile">
    {section === "appearance" && <>
      <Typography style={ui.body}>Choose the text size that feels comfortable.</Typography>
      <Surface style={group}>
        {(["standard", "large"] as const).map((size, index) => <PressableFeedback key={size} accessibilityRole="radio" accessibilityState={{ checked: data.textSize === size }} onPress={() => update((d) => ({ ...d, textSize: size }))} style={[row, ui.row, { borderBottomWidth: index ? 0 : 1 }]}>
          <Type size={20} color={colors.muted} /><View style={{ flex: 1, gap: 5 }}><Typography style={[ui.heading, { fontSize: 15 }]}>{size === "standard" ? "Standard" : "AAA Senior Mode"}</Typography><Typography style={ui.muted}>{size === "standard" ? "Compact, everyday reading." : "Larger text and comfortable line spacing."}</Typography></View>{data.textSize === size && <Check size={20} color={colors.red} />}
        </PressableFeedback>)}
      </Surface>
      <DemoNote text="Senior Mode is a readability preference, not accessibility certification." />
    </>}
    {section === "notifications" && <>
      <Surface style={group}>
        {([['traffic', 'Traffic & road disruptions'], ['official', 'Official township notices'], ['community', 'Community activity']] as const).map(([key, label], index) => <View key={key} style={[row, ui.between, { borderBottomWidth: index === 2 ? 0 : 1 }]}><Typography style={[ui.body, { flex: 1 }]}>{label}</Typography><Switch accessibilityLabel={label} value={data.notifications[key]} onValueChange={(value) => update((d) => ({ ...d, notifications: { ...d.notifications, [key]: value } }))} trackColor={{ true: colors.red, false: colors.border }} /></View>)}
      </Surface>
      <DemoNote text="Local preferences only · push delivery is not connected." />
    </>}
    {section === "support" && <>
      <Surface style={group}>
        <View style={row}><Typography style={ui.heading}>Township emergency hotline</Typography><Typography style={ui.body}>Official contact details are pending verification.</Typography></View>
        <View style={row}><Typography style={ui.heading}>Auxiliary police</Typography><Typography style={ui.body}>Direct contact details will appear here once confirmed by township management.</Typography></View>
        <PressableFeedback onPress={() => router.push("/reports")} style={{ padding: 16, minHeight: 56, justifyContent: "center" }}><Typography style={[ui.body, { color: colors.red }]}>Report an issue / feedback →</Typography></PressableFeedback>
      </Surface>
      <DemoNote text="Support directory preview · no verified hotline is configured." />
    </>}
    {section === "about" && <Surface style={group}><View style={row}><Typography style={ui.heading}>Smart Elmina</Typography><Typography style={ui.body}>TownshipConnect resident experience for the City of Elmina.</Typography></View><View style={row}><Typography style={ui.body}>Sime Darby Property · Hackathon demonstration</Typography></View><View style={{ padding: 16 }}><Typography style={ui.muted}>App version {version}</Typography></View></Surface>}
    {section === "privacy" && <Surface style={group}><View style={row}><Typography style={ui.heading}>Your demo data</Typography><Typography style={ui.body}>This prototype saves profile edits, posts, reports, search history and preferences in local storage on this device. Map tiles and configured routing or video services may make network requests.</Typography></View><View style={row}><Typography style={ui.body}>The official resident data protection and PDPA policy has not been supplied. This screen is a placeholder for the approved policy.</Typography></View><View style={{ padding: 16 }}><DemoNote text="Demo information · not an official privacy policy or compliance claim." /></View></Surface>}
  </Page>;
}
