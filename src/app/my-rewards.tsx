import { useState } from "react";
import { Image, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { CalendarDays, Ticket } from "lucide-react-native";
import RewardScreen from "../components/RewardScreen";
import LineTabs from "../components/LineTabs";
import { Button, DemoNote, Input, PressableFeedback, Surface, Typography } from "../components/Common";
import { vouchers } from "../lib/data";
import { ownedVoucherStatus, rewardDate, voucherExpiry } from "../lib/rewards";
import { useStore } from "../state/store";
import { colors, fonts, ui } from "../lib/theme";
export default function MyRewards() {
  const { data } = useStore();
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const claimed = vouchers.filter(v => data.claimedVoucherIds.includes(v.id) && (tab === "active" ? ownedVoucherStatus(data, v.id) === "active" : ownedVoucherStatus(data, v.id) !== "active") && `${v.merchant} ${v.title} ${v.offer}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <RewardScreen title="My Rewards"><View style={{ padding: 18, paddingBottom: 8 }}><Input accessibilityLabel="Search vouchers" placeholder="Search vouchers" value={search} onChangeText={setSearch} style={{ borderRadius: 12, backgroundColor: colors.surfaceSecondary, borderWidth: 0 }} /></View><LineTabs value={tab} onChange={setTab} items={[{ value: "active", label: "My Voucher" }, { value: "history", label: "Voucher History" }]} /><ScrollView contentContainerStyle={{ padding: 18, gap: 14 }}>
    {claimed.map(voucher => { const status = ownedVoucherStatus(data, voucher.id); const expiry = voucherExpiry(data.pointTransactions, voucher.id, data.voucherClaimedAt); return <PressableFeedback key={voucher.id} accessibilityLabel={`${voucher.merchant}, ${voucher.offer}, ${status}`} onPress={() => router.push({ pathname: "/voucher/[id]", params: { id: voucher.id, owned: "1" } })}><Surface style={{ flexDirection: "row", alignItems: "center", padding: 12, gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 14, minHeight: 114 }}><Image source={{ uri: voucher.image }} accessibilityIgnoresInvertColors style={{ width: 52, height: 60, borderRadius: 8, opacity: status === "active" ? 1 : 0.45 }} /><View style={{ flex: 1, minWidth: 0, gap: 5 }}><Typography numberOfLines={1} style={{ fontFamily: fonts.bold, fontSize: 13, color: status === "active" ? colors.ink : colors.muted }}>{voucher.merchant}</Typography><Typography numberOfLines={2} style={[ui.muted, { fontSize: 11 }]}>{voucher.title}</Typography><View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}><CalendarDays size={12} color={colors.muted} /><Typography style={{ fontSize: 10, color: colors.muted, flex: 1 }}>{expiry ? `Until ${rewardDate(expiry)}` : "30 days from claiming"}</Typography></View></View><View style={{ width: 90, alignSelf: "stretch", borderLeftWidth: 1, borderColor: colors.border, paddingLeft: 10, justifyContent: "center", gap: 8 }}>{status !== "active" && <Typography style={{ alignSelf: "flex-end", borderRadius: 5, backgroundColor: colors.surfaceSecondary, color: colors.muted, fontSize: 10, padding: 4 }}>{status === "used" ? "Used" : "Expired"}</Typography>}<Typography style={{ fontFamily: fonts.bold, color: status === "active" ? colors.ink : colors.muted, fontSize: 16, textAlign: "center" }}>{voucher.offer}</Typography></View></Surface></PressableFeedback>; })}
    {!claimed.length && <View style={{ alignItems: "center", paddingVertical: 34, gap: 14 }}><Ticket size={32} color={colors.muted} /><Typography style={ui.heading}>{search ? "No matching vouchers" : tab === "history" ? "No past vouchers yet" : "Your next reward is waiting"}</Typography><Typography style={ui.muted}>{tab === "history" ? "Used and expired vouchers appear here." : "Claim a voucher to find it here."}</Typography>{tab === "active" && !search && <Button onPress={() => router.push("/rewards")}><Button.Label>Explore rewards</Button.Label></Button>}</View>}
    <DemoNote text="Demo vouchers · valid for 30 days from claiming" />
  </ScrollView></RewardScreen>;
}
