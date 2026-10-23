export type PaymentMethodType = "tng" | "card";
export interface PaymentMethodItem {
  id: string;
  type: PaymentMethodType;
  title: string;
  details: string;
  badge: "TNG" | "VISA" | "CARD";
  linkedAt: string;
}
export interface PaymentState { paymentMethods: PaymentMethodItem[]; activePaymentMethodId: string | null }
type PaymentResult<T> = { ok: true; data: T } | { ok: false; data: T; error: string };
export const demoWallets = [
  { id: "tng-personal", title: "Touch ’n Go · Personal", details: "+60 12-••• 9842" },
  { id: "tng-family", title: "Touch ’n Go · Family", details: "+60 16-••• 2190" },
] as const;
export function restorePayments(value: Partial<PaymentState> & { linkedPaymentMethod?: unknown }): PaymentState {
  const seen = new Set<string>();
  const methods: PaymentMethodItem[] = [];
  if (Array.isArray(value.paymentMethods)) for (const candidate of value.paymentMethods) {
    if (!candidate || typeof candidate.id !== "string" || !candidate.id || seen.has(candidate.id) || !["tng", "card"].includes(candidate.type) || typeof candidate.title !== "string" || !candidate.title.trim() || typeof candidate.details !== "string" || typeof candidate.linkedAt !== "string" || !Number.isFinite(Date.parse(candidate.linkedAt))) continue;
    // Only masked account details belong in persistent local state.
    if (candidate.type === "card" ? !/^•••• \d{4}$/.test(candidate.details) : !/^\+60 \d{2}-••• \d{4}$/.test(candidate.details)) continue;
    seen.add(candidate.id);
    methods.push({ id: candidate.id, type: candidate.type, title: candidate.title.slice(0, 60), details: candidate.details, badge: candidate.type === "tng" ? "TNG" : candidate.badge === "VISA" ? "VISA" : "CARD", linkedAt: candidate.linkedAt });
    if (methods.length >= 20) break;
  }
  // Migrate the previous single-wallet model only if no new account array exists.
  if (!Array.isArray(value.paymentMethods) && (value.linkedPaymentMethod === "tng" || value.linkedPaymentMethod === "card")) {
    const isWallet = value.linkedPaymentMethod === "tng";
    methods.push({ id: isWallet ? "tng-personal" : "legacy-card", type: isWallet ? "tng" : "card", title: isWallet ? demoWallets[0].title : "Visa", details: isWallet ? demoWallets[0].details : "•••• 4821", badge: isWallet ? "TNG" : "VISA", linkedAt: "2026-10-22T00:00:00.000Z" });
  }
  return { paymentMethods: methods, activePaymentMethodId: methods.some(m => m.id === value.activePaymentMethodId) ? value.activePaymentMethodId! : methods[0]?.id ?? null };
}
export const activePaymentMethod = (state: PaymentState) => state.paymentMethods.find(m => m.id === state.activePaymentMethodId) ?? null;
export function linkDemoWallet<T extends PaymentState>(state: T, walletId: string, now = Date.now()): PaymentResult<T> {
  const wallet = demoWallets.find(w => w.id === walletId);
  if (!wallet) return { ok: false, data: state, error: "This demo wallet is unavailable." };
  if (state.paymentMethods.some(m => m.id === walletId)) return { ok: false, data: state, error: "This wallet is already linked." };
  if (state.paymentMethods.length >= 20) return { ok: false, data: state, error: "Remove an account before adding another method." };
  const method: PaymentMethodItem = { ...wallet, type: "tng", badge: "TNG", linkedAt: new Date(now).toISOString() };
  return { ok: true, data: { ...state, paymentMethods: [...state.paymentMethods, method], activePaymentMethodId: state.activePaymentMethodId ?? method.id } };
}
export interface CardDraft { title: string; number: string; expiry: string; cvv: string }
export function cardDraftError(card: CardDraft, now = Date.now()): string | null {
  const number = card.number.replace(/\s/g, "");
  if (!/^\d{16}$/.test(number)) return "Enter a 16-digit card number.";
  let sum = 0;
  for (let i = 0; i < number.length; i++) { let digit = Number(number[i]); if (i % 2 === 0) { digit *= 2; if (digit > 9) digit -= 9; } sum += digit; }
  if (sum % 10 !== 0) return "Check the card number.";
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(card.expiry.trim());
  if (!match || Date.UTC(2000 + Number(match[2]), Number(match[1]), 1) <= now) return "Enter a valid future expiry (MM/YY).";
  if (!/^\d{3,4}$/.test(card.cvv)) return "Enter a valid security code.";
  return null;
}
export function linkDemoCard<T extends PaymentState>(state: T, card: CardDraft, now = Date.now()): PaymentResult<T> {
  const error = cardDraftError(card, now);
  if (error) return { ok: false, data: state, error };
  const lastFour = card.number.replace(/\s/g, "").slice(-4);
  const id = `card-${lastFour}`;
  if (state.paymentMethods.some(m => m.id === id)) return { ok: false, data: state, error: "A card with these last four digits is already linked." };
  if (state.paymentMethods.length >= 20) return { ok: false, data: state, error: "Remove an account before adding another method." };
  // PAN, expiry and CVV are intentionally discarded; this is a local simulation.
  const method: PaymentMethodItem = { id, type: "card", title: card.title.trim().slice(0, 60) || "Credit / Debit Card", details: `•••• ${lastFour}`, badge: card.number.startsWith("4") ? "VISA" : "CARD", linkedAt: new Date(now).toISOString() };
  return { ok: true, data: { ...state, paymentMethods: [...state.paymentMethods, method], activePaymentMethodId: state.activePaymentMethodId ?? id } };
}
export function selectPaymentMethod<T extends PaymentState>(state: T, id: string): T {
  return state.paymentMethods.some(m => m.id === id) ? { ...state, activePaymentMethodId: id } : state;
}
export function removePaymentMethod<T extends PaymentState>(state: T, id: string): T {
  const paymentMethods = state.paymentMethods.filter(m => m.id !== id);
  return { ...state, paymentMethods, activePaymentMethodId: paymentMethods.some(m => m.id === state.activePaymentMethodId) ? state.activePaymentMethodId : paymentMethods[0]?.id ?? null };
}
