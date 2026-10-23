import { useId, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { router } from "expo-router";
import { Star, Ticket } from "lucide-react-native";
import { Card, PressableFeedback, Typography } from "./Common";
import type { Voucher } from "../lib/rewards";
import { colors, fonts, ui } from "../lib/theme";
export function GoldTier({ dark = false }: { dark?: boolean }) {
  return <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 4, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: dark ? "#FBBF2420" : colors.amberSoft }}><Star size={11} color={dark ? "#FBBF24" : colors.amber} /><Typography style={{ color: dark ? "#FBBF24" : colors.amber, fontFamily: fonts.bold, fontSize: 10 }}>GOLD TIER</Typography></View>;
}
export function VoucherArtwork({ voucher }: { voucher: Voucher }) {
  const [failed, setFailed] = useState(false);
  const id = `voucher${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.ink }]}>
    {!failed ? <Image source={{ uri: voucher.image }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setFailed(true)} accessibilityLabel="Illustrative offer photography" /> : <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Ticket size={38} color={colors.white} /></View>}
    <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={StyleSheet.absoluteFill}><Defs><LinearGradient id={id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={colors.ink} stopOpacity={0.12} /><Stop offset="0.25" stopColor={colors.ink} stopOpacity={0.05} /><Stop offset="1" stopColor={colors.ink} stopOpacity={0.92} /></LinearGradient></Defs><Rect width="100" height="100" fill={`url(#${id})`} /></Svg>
  </View>;
}
export function VoucherCard({ voucher, claimed = false }: { voucher: Voucher; claimed?: boolean }) {
  return <PressableFeedback accessibilityLabel={`${voucher.merchant}: ${voucher.offer}, ${voucher.points} points${claimed ? ", claimed" : ""}`} onPress={() => router.push({ pathname: "/voucher/[id]", params: { id: voucher.id } })} style={{ flexBasis: "47%", flexGrow: 1, maxWidth: "49%" }}>
    <Card style={{ padding: 0, borderRadius: 16, overflow: "hidden", height: 218, backgroundColor: colors.ink, borderWidth: 0 }}>
      <VoucherArtwork voucher={voucher} />
      <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>
        <View style={{ alignSelf: "flex-start", backgroundColor: "#18181B88", borderRadius: 20, paddingHorizontal: 7, paddingVertical: 5 }}><Typography numberOfLines={1} style={{ color: colors.white, fontFamily: fonts.bold, fontSize: 9, lineHeight: 16, letterSpacing: 0.3 }}>{voucher.merchantIcon ? `${voucher.merchantIcon} ` : ""}{voucher.merchant}</Typography></View>
        <View style={{ gap: 6 }}><Typography style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.white }}>{voucher.offer}</Typography><Typography numberOfLines={2} style={{ color: colors.white, fontSize: 12, lineHeight: 17, minHeight: 34 }}>{voucher.title}</Typography><View style={[ui.between, { gap: 4 }]}><Typography style={{ fontFamily: fonts.bold, fontSize: 12, color: "#FBBF24" }}>{voucher.points} PTS</Typography><Typography style={{ color: colors.white, fontSize: 10 }}>{claimed ? "Claimed ✓" : "Redeem ›"}</Typography></View></View>
      </View>
    </Card>
  </PressableFeedback>;
}
