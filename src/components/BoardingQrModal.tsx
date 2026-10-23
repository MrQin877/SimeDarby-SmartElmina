import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import createQrCode from "qrcode-generator";
import { router } from "expo-router";
import { ChevronRight, CreditCard } from "lucide-react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import MenuSheet from "./MenuSheet";
import { Button, DemoNote, PressableFeedback, Typography } from "./Common";
import { GoldTier } from "./RewardCards";
import PaymentMethodSheet, { PaymentBadge } from "./PaymentMethodSheet";
import { boardingToken, recordBoarding } from "../lib/rewards";
import { activePaymentMethod } from "../lib/payments";
import { useStore } from "../state/store";
import { colors, fonts, ui } from "../lib/theme";
export default function BoardingQrModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, update } = useStore();
  const activeMethod = activePaymentMethod(data);
  const [mode, setMode] = useState<"pass" | "payment">("pass");
  useEffect(() => { if (!open) setMode("pass"); }, [open]);
  const [now, setNow] = useState(Date.now());
  const [reducedMotion, setReducedMotion] = useState(true);
  const [boardedSuccess, setBoardedSuccess] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => { let alive = true; void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReducedMotion(value); }); const listener = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion); return () => { alive = false; listener.remove(); }; }, []);
  useEffect(() => { if (!open) return; setNow(Date.now()); const interval = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(interval); }, [open]);
  useEffect(() => { if (!open || reducedMotion) { pulse.setValue(1); return; } const animation = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }), Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true })])); animation.start(); return () => animation.stop(); }, [open, reducedMotion, pulse]);
  const token = boardingToken(now);
  const qr = useMemo(() => { const code = createQrCode(0, "M"); code.addData(token); code.make(); const size = code.getModuleCount(); let path = ""; for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (code.isDark(y, x)) path += `M${x + 4},${y + 4}h1v1h-1z`; return { path, size: size + 8 }; }, [token]);

  const handleSimulateBoarding = () => {
    const result = recordBoarding(data, token, now);
    if (result.ok) {
      update(() => result.data);
      setBoardedSuccess(true);
    } else {
      setBoardedSuccess(true);
    }
  };
  return <MenuSheet open={open} onOpenChange={(next) => { if (!next) onClose(); }} label={mode === "pass" ? "Resident pass" : "Payment method"} showHeader={mode === "pass"} scrollable snapPoint="85%">
    {mode === "payment" ? <PaymentMethodSheet open={open} onBack={() => setMode("pass")} /> : <BottomSheetScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 14, paddingTop: 14, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
      <View style={{ gap: 6 }}><Typography style={ui.heading}>{data.name}</Typography><Typography style={ui.muted}>Unit ID · {data.unitId}</Typography><GoldTier /></View>
      <View accessible accessibilityLabel="Demo resident QR for boarding and merchant checkout" style={{ width: 210, height: 210, alignSelf: "center", backgroundColor: colors.white }}><Svg width="100%" height="100%" viewBox={`0 0 ${qr.size} ${qr.size}`}><Rect width={qr.size} height={qr.size} fill={colors.white} /><Path d={qr.path} fill={colors.ink} /></Svg></View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}><Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green, opacity: pulse }} /><Typography style={{ fontFamily: fonts.medium, color: colors.green, fontSize: 12 }}>Dynamic demo QR token active</Typography></View>
      <Typography style={[ui.muted, { textAlign: "center" }]}>One pass for free resident shuttle boarding and checkout at participating merchants. Non-Elmina residents please tap Touch ’n Go card at bus entrance validator (RM1.50).</Typography>
      <View style={{ gap: 8, paddingVertical: 4 }}>
        <Button
          size="sm"
          onPress={handleSimulateBoarding}
          style={{ backgroundColor: boardedSuccess ? colors.green : colors.red, borderRadius: 24, paddingVertical: 10 }}
        >
          <Button.Label style={{ color: colors.white, fontSize: 13, fontFamily: fonts.semibold }}>
            {boardedSuccess ? `✓ Boarding Verified (+25 pts) · Balance: ${data.rewardPoints} PTS` : "⚡ Simulate Boarding Scan (+25 pts)"}
          </Button.Label>
        </Button>
        {boardedSuccess && (
          <Button
            size="sm"
            variant="secondary"
            onPress={() => { onClose(); router.push("/rewards"); }}
            style={{ borderRadius: 24 }}
          >
            <Button.Label style={{ fontSize: 12 }}>Redeem Voucher at Lakeside Mall ↗</Button.Label>
          </Button>
        )}
      </View>
      <PressableFeedback accessibilityLabel="Link or change demo payment method" onPress={() => setMode("payment")} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border }}>
        {activeMethod ? <PaymentBadge method={activeMethod} /> : <CreditCard size={18} color={colors.muted} />}
        <View style={{ flex: 1, gap: 4 }}><Typography style={{ fontFamily: fonts.medium, color: colors.ink, fontSize: 13 }}>{activeMethod ? activeMethod.details : "Link to Payment Method/Wallet"}</Typography>{activeMethod && <Typography style={ui.muted}>{activeMethod.title}</Typography>}</View>{activeMethod ? <Typography style={{ color: colors.red, fontSize: 12 }}>Change</Typography> : <ChevronRight size={18} color={colors.muted} />}

      </PressableFeedback>
      <DemoNote text={`Sample token · refreshes in ${60 - Math.floor(now / 1000) % 60}s · no real boarding or payments`} />
    </BottomSheetScrollView>}
  </MenuSheet>;
}
