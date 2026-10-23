import { useEffect, useState } from "react";
import { View } from "react-native";
import { BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { ArrowLeft, Check, ChevronRight, Plus, Settings, Trash2 } from "lucide-react-native";
import { Button, DemoNote, IconButton, Label, PressableFeedback, Typography } from "./Common";
import { demoWallets, type CardDraft, type PaymentMethodItem } from "../lib/payments";
import { useStore } from "../state/store";
import { useAppToast } from "../hooks/useAppToast";
import { colors, fonts, ui } from "../lib/theme";

type Mode = "switcher" | "manage" | "add" | "wallet" | "card";
const emptyCard: CardDraft = { title: "", number: "", expiry: "", cvv: "" };
export function PaymentBadge({ method }: { method: PaymentMethodItem }) {
  return <View style={{ width: 40, height: 30, borderRadius: 6, backgroundColor: method.type === "tng" ? "#005BAB" : colors.ink, justifyContent: "center", alignItems: "center" }}><Typography style={{ color: colors.white, fontFamily: fonts.bold, fontSize: 10, lineHeight: 14 }}>{method.badge}</Typography></View>;
}
// Render inside the existing HeroUI sheet so switching views never stacks native modals.
export default function PaymentMethodSheet({ open, initialView = "switcher", onBack }: { open: boolean; initialView?: "switcher" | "manage"; onBack: () => void }) {
  const { data, addWallet, addCard, selectPaymentAccount, removePaymentAccount } = useStore();
  const [mode, setMode] = useState<Mode>(initialView);
  const [card, setCard] = useState<CardDraft>(emptyCard);
  const notify = useAppToast();
  useEffect(() => { if (!open) { setMode(initialView); setCard(emptyCard); } }, [open, initialView]);
  const back = () => {
    setCard(emptyCard);
    if (mode === initialView) onBack();
    else if (mode === "wallet" || mode === "card") setMode("add");
    else setMode(initialView);
  };
  const linked = () => { setCard(emptyCard); setMode(initialView); notify("Demo payment method linked.", "success"); };
  const addActions = <View style={{ gap: 2 }}>
    <PressableFeedback onPress={() => setMode("wallet")} style={styles.row}><View style={styles.blueBadge}><Typography style={{ color: colors.white, fontFamily: fonts.bold, fontSize: 10 }}>TNG</Typography></View><Typography style={[ui.body, { flex: 1 }]}>Link Touch ’n Go eWallet</Typography><ChevronRight size={18} color={colors.muted} /></PressableFeedback>
    <PressableFeedback onPress={() => setMode("card")} style={styles.row}><View style={[styles.blueBadge, { backgroundColor: colors.ink }]}><Typography style={{ color: colors.white, fontFamily: fonts.bold, fontSize: 9 }}>CARD</Typography></View><Typography style={[ui.body, { flex: 1 }]}>Add Credit / Debit Card</Typography><ChevronRight size={18} color={colors.muted} /></PressableFeedback>
  </View>;
  return <View style={{ flex: 1 }}>
    <View collapsable={false} collapsableChildren={false} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderColor: colors.border }}><IconButton icon={ArrowLeft} label="Back" onPress={back} style={styles.icon} /><Typography.Heading numberOfLines={1} style={{ flex: 1, textAlign: "center", color: colors.ink, fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24 }}>{mode === "switcher" ? "Payment Method" : mode === "manage" ? "Payment Methods / Wallets" : mode === "card" ? "Add Card" : mode === "wallet" ? "Link Touch ’n Go" : "Add Payment Method"}</Typography.Heading>{mode === "switcher" ? <IconButton icon={Settings} label="Manage payment methods" onPress={() => setMode("manage")} style={styles.icon} /> : <View style={{ width: 40 }} />}</View>
    <BottomSheetScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: 16, paddingBottom: 24, gap: 16 }}>
      {(mode === "switcher" || mode === "manage") && <>
        <Typography style={ui.label}>{mode === "manage" ? "CURRENTLY LINKED ACCOUNTS" : "PAY WITH"}</Typography>
        {data.paymentMethods.length === 0 && <Typography style={ui.muted}>No linked accounts. Your resident pass still works for free shuttle boarding.</Typography>}
        {data.paymentMethods.map(method => mode === "switcher" ? <PressableFeedback key={method.id} accessibilityRole="radio" accessibilityState={{ checked: data.activePaymentMethodId === method.id }} accessibilityLabel={`${method.title}, ${method.details}`} onPress={() => { selectPaymentAccount(method.id); notify("Active demo payment method updated.", "success"); onBack(); }} style={styles.row}><PaymentBadge method={method} /><View style={{ flex: 1, gap: 4 }}><Typography style={ui.body}>{method.details}</Typography><Typography style={ui.muted}>{method.title}</Typography></View><View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: data.activePaymentMethodId === method.id ? colors.red : colors.border, alignItems: "center", justifyContent: "center" }}>{data.activePaymentMethodId === method.id && <Check size={14} color={colors.red} />}</View></PressableFeedback> : <View key={method.id} style={styles.row}><PaymentBadge method={method} /><View style={{ flex: 1, gap: 4 }}><Typography style={ui.body}>{method.title}</Typography><Typography style={ui.muted}>{method.details}{data.activePaymentMethodId === method.id ? " · Active" : ""}</Typography></View><Button variant="tertiary" size="sm" accessibilityLabel={`Remove ${method.title} ${method.details}`} onPress={() => { removePaymentAccount(method.id); notify("Payment method removed.", "success"); }} style={{ paddingHorizontal: 6 }}><Trash2 size={15} color={colors.red} /><Button.Label style={{ color: colors.red, fontSize: 12 }}>Remove</Button.Label></Button></View>)}
      </>}
      {mode === "switcher" && <PressableFeedback onPress={() => setMode("add")} style={styles.row}><Plus size={20} color={colors.red} /><Typography style={{ flex: 1, color: colors.red, fontFamily: fonts.semibold, fontSize: 14 }}>Add Payment Method</Typography><ChevronRight size={18} color={colors.muted} /></PressableFeedback>}
      {(mode === "manage" || mode === "add") && <><Typography style={ui.label}>ADD PAYMENT METHOD</Typography>{addActions}</>}
      {mode === "wallet" && <><Typography style={ui.muted}>Choose a sample account to simulate authorizing a Touch ’n Go payment mandate.</Typography>{demoWallets.map(wallet => <PressableFeedback key={wallet.id} accessibilityState={{ disabled: data.paymentMethods.some(m => m.id === wallet.id) }} isDisabled={data.paymentMethods.some(m => m.id === wallet.id)} onPress={() => { const result = addWallet(wallet.id); if (result.ok) linked(); else notify(result.error, "warning"); }} style={styles.row}><View style={{ flex: 1, gap: 4 }}><Typography style={ui.body}>{wallet.title}</Typography><Typography style={ui.muted}>{wallet.details}</Typography></View><Typography style={{ color: colors.red, fontSize: 12 }}>{data.paymentMethods.some(m => m.id === wallet.id) ? "Linked" : "Authorize demo"}</Typography></PressableFeedback>)}</>}
      {mode === "card" && <>
        <Typography style={ui.muted}>Demo only. Use 4242 4242 4242 4242, a future expiry and a sample CVV. No payment is made.</Typography>
        {([{ field: "title", label: "Card name", placeholder: "Maybank Visa", keyboardType: "default", maxLength: 60 }, { field: "number", label: "Card number", placeholder: "4242 4242 4242 4242", keyboardType: "number-pad", maxLength: 23 }, { field: "expiry", label: "Expiry", placeholder: "MM/YY", keyboardType: "numbers-and-punctuation", maxLength: 5 }, { field: "cvv", label: "CVV", placeholder: "123", keyboardType: "number-pad", maxLength: 4 }] as const).map(field => <View key={field.field} style={{ gap: 7 }}><Label><Label.Text>{field.label}</Label.Text></Label><BottomSheetTextInput accessibilityLabel={field.label} value={card[field.field]} onChangeText={text => setCard(previous => ({ ...previous, [field.field]: text }))} placeholder={field.placeholder} placeholderTextColor={colors.muted} keyboardType={field.keyboardType} secureTextEntry={field.field === "cvv"} autoCorrect={false} autoComplete="off" maxLength={field.maxLength} style={{ minHeight: 48, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.surfaceSecondary, color: colors.ink, fontFamily: fonts.medium, fontSize: 14 }} /></View>)}
        <Button onPress={() => { const result = addCard(card); if (result.ok) linked(); else notify(result.error, "warning"); }}><Button.Label>Link demo card</Button.Label></Button>
      </>}
      <DemoNote text="Local simulation · no external account connection or debit. Only masked account details are saved." />
    </BottomSheetScrollView>
  </View>;
}
const styles = {
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.border } as const,
  blueBadge: { width: 40, height: 30, borderRadius: 6, backgroundColor: "#005BAB", alignItems: "center", justifyContent: "center" } as const,
  icon: { borderWidth: 0, backgroundColor: "transparent" },
};
