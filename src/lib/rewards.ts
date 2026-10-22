import { activePaymentMethod, restorePayments, type PaymentState, type PaymentMethodType } from "./payments";
import { vouchers } from "./data";
export type VoucherCategory = "explore" | "transit" | "food" | "groceries" | "lifestyle";
export interface Voucher { id: string; merchant: string; merchantIcon?: string; title: string; offer: string; points: number; category: Exclude<VoucherCategory, "explore">; image: string; outlet: string; description: string; terms: string[] }
export interface PointTransaction { id: string; title: string; points: number; createdAt: string; voucherId?: string; tokenId?: string; amountCents?: number; paymentMethod?: PaymentMethod; paymentMethodId?: string; paymentMethodTitle?: string; paymentMethodDetails?: string }
export type PaymentMethod = PaymentMethodType;
export type { PaymentMethodItem } from "./payments";
export interface RewardState extends PaymentState { paidTokenIds: string[]; voucherUsedAt: Record<string, string>; rewardPoints: number; claimedVoucherIds: string[]; pointTransactions: PointTransaction[]; rewardsUpdatedAt: string; boardedTokenIds: string[]; voucherClaimedAt: Record<string, string> }
export const initialPointTransactions: PointTransaction[] = [
  { id: "reward-seed-1", title: "Feeder Bus S1", points: 25, createdAt: "2026-10-22T00:42:00.000Z" },
  { id: "reward-seed-2", title: "Central Park buggy", points: 25, createdAt: "2026-10-21T08:35:00.000Z" },
];
export const defaultRewardState: RewardState = { paymentMethods: [], activePaymentMethodId: null, paidTokenIds: [], voucherUsedAt: {}, rewardPoints: 730, claimedVoucherIds: [], pointTransactions: initialPointTransactions, rewardsUpdatedAt: "2026-10-22T09:15:00.000Z", boardedTokenIds: [], voucherClaimedAt: {} };
export function restoreRewards(value: Partial<RewardState> & { linkedPaymentMethod?: unknown }): RewardState {
  const transactions = Array.isArray(value.pointTransactions) ? value.pointTransactions.filter(t => t && typeof t.id === "string" && typeof t.title === "string" && Number.isSafeInteger(t.points) && typeof t.createdAt === "string" && Number.isFinite(Date.parse(t.createdAt))).slice(0, 300) : initialPointTransactions;
  return {
    ...restorePayments(value),
    paidTokenIds: Array.isArray(value.paidTokenIds) ? value.paidTokenIds.filter(id => typeof id === "string").slice(0, 200) : [],
    voucherUsedAt: Object.fromEntries(vouchers.flatMap(v => { const date = value.voucherUsedAt?.[v.id]; return typeof date === "string" && Number.isFinite(Date.parse(date)) ? [[v.id, date]] : []; })),
    rewardPoints: Number.isSafeInteger(value.rewardPoints) && value.rewardPoints! >= 0 ? value.rewardPoints! : 730,
    claimedVoucherIds: Array.isArray(value.claimedVoucherIds) ? [...new Set(value.claimedVoucherIds.filter(id => vouchers.some(v => v.id === id)))] : [],
    pointTransactions: transactions,
    voucherClaimedAt: Object.fromEntries(vouchers.flatMap(v => { const date = value.voucherClaimedAt?.[v.id] || transactions.find(t => t.voucherId === v.id)?.createdAt; return typeof date === "string" && Number.isFinite(Date.parse(date)) ? [[v.id, date]] : []; })),
    rewardsUpdatedAt: typeof value.rewardsUpdatedAt === "string" && Number.isFinite(Date.parse(value.rewardsUpdatedAt)) ? value.rewardsUpdatedAt : defaultRewardState.rewardsUpdatedAt,
    boardedTokenIds: Array.isArray(value.boardedTokenIds) ? value.boardedTokenIds.filter(id => typeof id === "string").slice(0, 200) : [],
  };
}
export type RewardResult<T> = { ok: true; data: T } | { ok: false; error: string; data: T };
export function redeemReward<T extends RewardState>(state: T, voucherId: string, now = Date.now()): RewardResult<T> {
  const voucher = vouchers.find(v => v.id === voucherId);
  if (!voucher) return { ok: false, error: "This voucher is unavailable.", data: state };
  if (state.claimedVoucherIds.includes(voucherId)) return { ok: false, error: "This voucher is already in My Rewards.", data: state };
  if (state.rewardPoints < voucher.points) return { ok: false, error: "You need more points to redeem this voucher.", data: state };
  const createdAt = new Date(now).toISOString();
  return { ok: true, data: { ...state, rewardPoints: state.rewardPoints - voucher.points, claimedVoucherIds: [...state.claimedVoucherIds, voucherId], voucherClaimedAt: { ...state.voucherClaimedAt, [voucherId]: createdAt }, rewardsUpdatedAt: createdAt, pointTransactions: [{ id: `claim-${voucherId}-${now}`, title: `${voucher.merchant} voucher`, points: -voucher.points, createdAt, voucherId }, ...state.pointTransactions].slice(0, 300) } };
}
export const boardingToken = (now: number) => `SMART-ELMINA-DEMO:${Math.floor(now / 60000)}`;
export function recordBoarding<T extends RewardState>(state: T, tokenId: string, now = Date.now()): RewardResult<T> {
  if (tokenId !== boardingToken(now)) return { ok: false, error: "This demo token expired. Use the refreshed QR code.", data: state };
  if (state.boardedTokenIds.includes(tokenId)) return { ok: false, error: "Boarding already recorded for this token.", data: state };
  const createdAt = new Date(now).toISOString();
  return { ok: true, data: { ...state, rewardPoints: state.rewardPoints + 25, rewardsUpdatedAt: createdAt, boardedTokenIds: [tokenId, ...state.boardedTokenIds].slice(0, 200), pointTransactions: [{ id: `boarding-${now}`, title: "Feeder Bus S1 · test boarding", points: 25, createdAt, tokenId }, ...state.pointTransactions].slice(0, 300) } };
}
export function voucherExpiry(transactions: PointTransaction[], id: string, claimedAt: Record<string, string> = {}): number | null {
  const date = claimedAt[id] || transactions.find(t => t.voucherId === id)?.createdAt;
  return date ? Date.parse(date) + 30 * 86400000 : null;
}
export const rewardDate = (value: string | number) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kuala_Lumpur" });

// This local demo simulates settlement; no payment credentials or real debit are involved.
export function recordPayment<T extends RewardState>(state: T, tokenId: string, amountCents: number, now = Date.now()): RewardResult<T> {
  const method = activePaymentMethod(state);
  if (!method) return { ok: false, error: "Link a demo payment method first.", data: state };
  if (tokenId !== boardingToken(now)) return { ok: false, error: "This demo token expired. Use the refreshed QR code.", data: state };
  if (state.paidTokenIds.includes(tokenId)) return { ok: false, error: "Checkout already recorded for this token.", data: state };
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0 || amountCents > 1000000) return { ok: false, error: "Invalid demo purchase amount.", data: state };
  const points = Math.floor(amountCents / 100);
  const createdAt = new Date(now).toISOString();
  return { ok: true, data: { ...state, rewardPoints: state.rewardPoints + points, rewardsUpdatedAt: createdAt, paidTokenIds: [tokenId, ...state.paidTokenIds].slice(0, 200), pointTransactions: [{ id: `payment-${now}`, title: "Bask Bear · simulated purchase", points, createdAt, tokenId, amountCents, paymentMethod: method.type, paymentMethodId: method.id, paymentMethodTitle: method.title, paymentMethodDetails: method.details }, ...state.pointTransactions].slice(0, 300) } };
}
export function ownedVoucherStatus(state: RewardState, id: string, now = Date.now()): "active" | "used" | "expired" {
  if (state.voucherUsedAt[id]) return "used";
  const expiry = voucherExpiry(state.pointTransactions, id, state.voucherClaimedAt);
  return expiry !== null && expiry <= now ? "expired" : "active";
}
export function consumeRewardVoucher<T extends RewardState>(state: T, id: string, now = Date.now()): RewardResult<T> {
  if (!state.claimedVoucherIds.includes(id) || ownedVoucherStatus(state, id, now) !== "active") return { ok: false, error: "This voucher is unavailable for use.", data: state };
  return { ok: true, data: { ...state, voucherUsedAt: { ...state.voucherUsedAt, [id]: new Date(now).toISOString() } } };
}
