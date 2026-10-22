import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CalendarDays, Gift, MapPin } from "lucide-react-native";
import RewardScreen from "../../components/RewardScreen";
import { VoucherArtwork } from "../../components/RewardCards";
import { Button, DemoNote, Typography } from "../../components/Common";
import { vouchers } from "../../lib/data";
import { ownedVoucherStatus, rewardDate, voucherExpiry } from "../../lib/rewards";
import { useStore } from "../../state/store";
import { useAppToast } from "../../hooks/useAppToast";
import { colors, fonts, ui } from "../../lib/theme";
export default function VoucherDetails() {
  const { id, owned } = useLocalSearchParams<{ id: string; owned?: string }>();
  const { data, redeemVoucher, markVoucherUsed } = useStore();
  const notify = useAppToast();
  const voucher = vouchers.find(v => v.id === id);
  if (!voucher) return <RewardScreen title="Voucher details"><View style={{ padding: 18, gap: 16 }}><Typography style={ui.heading}>Voucher unavailable</Typography><Button onPress={() => router.replace("/rewards")}><Button.Label>Explore rewards</Button.Label></Button></View></RewardScreen>;
  const claimed = data.claimedVoucherIds.includes(voucher.id);
  const expiry = voucherExpiry(data.pointTransactions, voucher.id, data.voucherClaimedAt);
  const isOwned = owned === "1" && claimed;
  const status = ownedVoucherStatus(data, voucher.id);
  const expired = expiry !== null && expiry <= Date.now();
  return <RewardScreen title={isOwned ? "My Voucher" : "Voucher details"} footer={isOwned ? undefined : <View style={ui.between}><View><Typography style={[ui.muted, { fontSize: 10 }]}>Points required</Typography><Typography style={ui.heading}>{voucher.points} PTS</Typography></View><Button isDisabled={claimed || data.rewardPoints < voucher.points} onPress={() => { const result = redeemVoucher(voucher.id); notify(result.ok ? `Voucher claimed. ${voucher.points} points redeemed.` : result.error, result.ok ? "success" : "warning"); }}><Gift size={16} color={colors.white} /><Button.Label>{claimed ? expired ? "Expired" : "Claimed" : data.rewardPoints < voucher.points ? "Not enough points" : "Redeem voucher"}</Button.Label></Button></View>}>
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ height: 220, overflow: "hidden" }}><VoucherArtwork voucher={voucher} /><View style={{ position: "absolute", left: 20, right: 20, bottom: 20, gap: 8 }}><Typography style={{ color: colors.white, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 }}>{voucher.merchant}</Typography><Typography style={{ color: colors.white, fontFamily: fonts.bold, fontSize: 32 }}>{voucher.offer}</Typography></View></View>
      <View style={{ padding: 18, gap: 18 }}><Typography style={ui.heading}>{voucher.title}</Typography><Typography style={ui.muted}>{voucher.description}</Typography>
        <View style={[ui.row, { gap: 10 }]}><MapPin size={18} color={colors.muted} /><View style={{ flex: 1, gap: 4 }}><Typography style={ui.body}>{voucher.outlet}</Typography><Typography style={ui.muted}>Participating outlet</Typography></View></View>
        <View style={[ui.row, { gap: 10 }]}><CalendarDays size={18} color={colors.muted} /><View style={{ flex: 1, gap: 4 }}><Typography style={ui.body}>{expiry ? `${expired ? "Expired" : "Valid until"} ${rewardDate(expiry)}` : "Valid for 30 days after claiming"}</Typography><Typography style={ui.muted}>Single-use resident voucher</Typography></View></View>
        <Typography style={ui.heading}>Terms & conditions</Typography><View>{[...voucher.terms, "Illustrative offer only; no live merchant redemption."].map(term => <View key={term} style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border }}><Typography style={ui.muted}>• {term}</Typography></View>)}</View>
        {isOwned && <View style={{ gap: 12 }}><Typography style={{ color: status === "active" ? colors.green : colors.muted, fontFamily: fonts.semibold }}>{status === "active" ? "Ready to use" : status === "used" ? "Used" : "Expired"}</Typography>{status === "active" && <Button onPress={() => { const result = markVoucherUsed(voucher.id); notify(result.ok ? "Demo voucher marked as used." : result.error, result.ok ? "success" : "warning"); }}><Button.Label>Test voucher use</Button.Label></Button>}</View>}
        {claimed && !isOwned && <Button variant="secondary" onPress={() => router.push("/my-rewards")}><Button.Label>View My Rewards</Button.Label></Button>}<DemoNote text={isOwned ? "Demo voucher · saved on this device only" : "Points and claims are stored on this device only."} />
      </View>
    </ScrollView>
  </RewardScreen>;
}
