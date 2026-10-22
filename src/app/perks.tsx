import { ScrollView, View } from "react-native";
import { BusFront, CalendarDays, CarFront, Sprout, Star, Zap } from "lucide-react-native";
import RewardScreen from "../components/RewardScreen";
import { DemoNote, Surface, Typography } from "../components/Common";
import { residentPerks } from "../lib/data";
import { colors, fonts, ui } from "../lib/theme";
const icons = { bus: BusFront, calendar: CalendarDays, car: CarFront, sprout: Sprout, zap: Zap };
export default function Perks() {
  return <RewardScreen title="Resident perks"><ScrollView contentContainerStyle={{ padding: 18, gap: 18 }}>
    <Surface style={{ padding: 20, backgroundColor: colors.amberSoft, borderRadius: 16, gap: 10 }}><Star size={21} color={colors.amber} /><Typography style={ui.heading}>Your Gold Tier privileges</Typography><Typography style={ui.muted}>More ways to enjoy life in Elmina.</Typography></Surface>
    <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>{residentPerks.map((perk, index) => { const Icon = icons[perk.icon]; return <View key={perk.icon} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderTopWidth: index ? 1 : 0, borderColor: colors.border }}><Icon size={20} color={colors.red} /><View style={{ flex: 1, gap: 5 }}><Typography style={{ fontFamily: fonts.semibold, color: colors.ink, fontSize: 13 }}>{perk.title}</Typography><Typography style={[ui.muted, { fontSize: 12 }]}>{perk.detail}</Typography></View></View>; })}</Surface>
    <DemoNote text="Illustrative resident privileges · not connected to live operators or bookings" />
  </ScrollView></RewardScreen>;
}
