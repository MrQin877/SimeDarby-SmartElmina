import { ScrollView, View } from "react-native";
import { BusFront, CreditCard, Ticket } from "lucide-react-native";
import RewardScreen from "../components/RewardScreen";
import { DemoNote, Surface, Typography } from "../components/Common";
import { rewardDate } from "../lib/rewards";
import { useStore } from "../state/store";
import { colors, fonts, ui } from "../lib/theme";
export default function PointHistory() {
  const { data } = useStore();
  return <RewardScreen title="Point History"><ScrollView contentContainerStyle={{ padding: 18, gap: 16 }}>
    <Typography style={ui.heading}>Recent activity</Typography><Typography style={ui.muted}>Your greener journeys and redeemed rewards.</Typography>
    <Surface style={[ui.card, { padding: 0, gap: 0, overflow: "hidden" }]}>{data.pointTransactions.map((item, index) => { const Icon = item.amountCents !== undefined ? CreditCard : item.points > 0 ? BusFront : Ticket; return <View key={item.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderTopWidth: index ? 1 : 0, borderColor: colors.border }}><Icon size={19} color={colors.red} /><View style={{ flex: 1, gap: 4 }}><Typography style={{ fontFamily: fonts.semibold, color: colors.ink, fontSize: 13 }}>{item.title}</Typography><Typography style={[ui.muted, { fontSize: 11 }]}>{item.amountCents !== undefined ? `RM${(item.amountCents / 100).toFixed(2)} · ${item.paymentMethodTitle || (item.paymentMethod === "tng" ? "TNG" : "Visa")} · ` : ""}{rewardDate(item.createdAt)} · {new Date(item.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kuala_Lumpur" })}</Typography></View><Typography style={{ fontFamily: fonts.bold, color: item.points > 0 ? colors.green : colors.ink, fontSize: 13 }}>{item.points > 0 ? "+" : ""}{item.points} pts</Typography></View>; })}{!data.pointTransactions.length && <Typography style={[ui.muted, { padding: 18 }]}>Your points activity will appear here.</Typography>}</Surface>
    <DemoNote text="Preview activity · saved on this device" />
  </ScrollView></RewardScreen>;
}
