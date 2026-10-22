import { useEffect, useRef, useState } from "react";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ArrowUp, Clock3, Flame, Gift, QrCode, Star, Ticket, TrendingUp } from "lucide-react-native";
import RewardScreen from "../components/RewardScreen";
import BoardingQrModal from "../components/BoardingQrModal";
import { VoucherCard } from "../components/RewardCards";
import { Button, DemoNote, IconButton, PressableFeedback, Surface, Typography } from "../components/Common";
import LineTabs from "../components/LineTabs";
import { voucherCategories, vouchers } from "../lib/data";
import { rewardDate, type VoucherCategory } from "../lib/rewards";
import { useStore } from "../state/store";
import { colors, fonts, ui } from "../lib/theme";
export default function Rewards() {
  const { data } = useStore();
  const [balanceSize, setBalanceSize] = useState({ width: 0, height: 0 });
  const [qrOpen, setQrOpen] = useState(false);
  const [category, setCategory] = useState<VoucherCategory>("explore");
  const [showTop, setShowTop] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const voucherY = useRef(0);
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => { const animation = Animated.timing(opacity, { toValue: showTop ? 1 : 0, duration: 160, useNativeDriver: true }); animation.start(); return () => animation.stop(); }, [showTop, opacity]);
  const deals = () => scroll.current?.scrollTo({ y: voucherY.current, animated: true });
  const visible = vouchers.filter(v => category === "explore" || v.category === category);
  return <RewardScreen title="Eco-Pass rewards" backTo="/home" right={<IconButton icon={QrCode} label="Show resident pass QR" onPress={() => setQrOpen(true)} style={{ borderWidth: 0, backgroundColor: "transparent" }} />}>
    <ScrollView ref={scroll} stickyHeaderIndices={[1]} scrollEventThrottle={16} showsVerticalScrollIndicator={false} onScroll={event => { const y = event.nativeEvent.contentOffset.y; setShowTop(previous => y > 220 ? true : y < 180 ? false : previous); }} contentContainerStyle={{ paddingBottom: 70 }}>
      <View onLayout={event => { voucherY.current = event.nativeEvent.layout.height; }} style={{ padding: 18, gap: 10 }}>
        <Surface onLayout={event => { const { width, height } = event.nativeEvent.layout; setBalanceSize(previous => previous.width === width && previous.height === height ? previous : { width, height }); }} style={{ padding: 20, borderRadius: 20, backgroundColor: "#D71921", overflow: "hidden", gap: 14 }}>
          <Svg pointerEvents="none" accessible={false} width={balanceSize.width} height={balanceSize.height} style={StyleSheet.absoluteFillObject}>
            <Defs><LinearGradient id="rewardsBalanceSunrise" x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="0%" stopColor="#D71921" /><Stop offset="33%" stopColor="#F15922" /><Stop offset="67%" stopColor="#F5821E" /><Stop offset="100%" stopColor="#FDAF18" /></LinearGradient></Defs>
            <Rect width="100%" height="100%" fill="url(#rewardsBalanceSunrise)" />
          </Svg>
          <View style={ui.between}><View style={{ flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 22, paddingHorizontal: 9, paddingVertical: 10, backgroundColor: "#18181B33" }}><Star size={12} color="#FFF5C2" /><Typography style={{ fontFamily: fonts.bold, fontSize: 10, lineHeight: 16, color: "#FFF5C2" }}>GOLD TIER</Typography></View><Button size="sm" onPress={deals} style={{ borderRadius: 24, backgroundColor: colors.white }}><Button.Label style={{ color: colors.ink, fontSize: 12 }}>Redeem now ↗</Button.Label></Button></View>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}><Typography style={{ fontFamily: fonts.bold, color: colors.white, fontSize: 42, lineHeight: 48, letterSpacing: -1 }}>{data.rewardPoints}</Typography><Typography style={{ color: colors.white, fontSize: 16 }}>points</Typography></View>
          <Typography style={{ color: colors.white, fontSize: 10, lineHeight: 16 }}>Last updated {rewardDate(data.rewardsUpdatedAt)}, {new Date(data.rewardsUpdatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kuala_Lumpur" })}</Typography>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#FFF3C4", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 12 }}><Clock3 size={14} color="#9A3412" /><Typography style={{ flex: 1, color: "#9A3412", fontSize: 11, lineHeight: 16 }}>25 demo points expire by 31 Jan 2027</Typography></View>
        </Surface>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>{[
          { label: "Hot Deals", Icon: Flame, onPress: deals },
          { label: "My Rewards", Icon: Ticket, onPress: () => router.push("/my-rewards") },
          { label: "Perks", Icon: Gift, onPress: () => router.push("/perks") },
          { label: "Point History", Icon: TrendingUp, onPress: () => router.push("/point-history") },
        ].map(({ label, Icon, onPress }) => <PressableFeedback key={label} onPress={onPress} accessibilityLabel={label} style={{ flex: 1, alignItems: "center", gap: 7, paddingVertical: 8 }}><Surface style={{ width: 46, height: 46, borderRadius: 14, padding: 0, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}><Icon size={20} color={colors.red} /></Surface><Typography style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.ink, textAlign: "center" }}>{label}</Typography></PressableFeedback>)}</View>
      </View>
      <View style={{ backgroundColor: colors.background }}><ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={{ width: 540, paddingHorizontal: 12 }}><LineTabs value={category} onChange={value => setCategory(value as VoucherCategory)} items={[...voucherCategories]} /></View></ScrollView></View>
      <View style={{ padding: 18, gap: 12 }}><Typography style={[ui.heading, { fontSize: 16 }]}>A little reward for greener journeys</Typography><Typography style={ui.muted}>Resident offers, right here in Elmina.</Typography><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>{visible.map(voucher => <VoucherCard key={voucher.id} voucher={voucher} claimed={data.claimedVoucherIds.includes(voucher.id)} />)}</View><DemoNote text="Illustrative merchants, offers and photography · no live merchant redemption" /></View>
    </ScrollView>
    <Animated.View pointerEvents={showTop ? "auto" : "none"} accessibilityElementsHidden={!showTop} importantForAccessibility={showTop ? "auto" : "no-hide-descendants"} style={{ position: "absolute", bottom: 16, right: 18, opacity }}><Button size="sm" onPress={() => scroll.current?.scrollTo({ y: 0, animated: true })} style={{ borderRadius: 24 }}><ArrowUp size={15} color={colors.white} /><Button.Label>Top</Button.Label></Button></Animated.View>
    <BoardingQrModal open={qrOpen} onClose={() => setQrOpen(false)} />
  </RewardScreen>;
}
