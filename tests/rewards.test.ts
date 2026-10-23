import test from "node:test";
import assert from "node:assert/strict";
import createQrCode from "qrcode-generator";
import { initialData, restoreData } from "../src/lib/model";
import { boardingToken, defaultRewardState, recordBoarding, redeemReward, restoreRewards, voucherExpiry } from "../src/lib/rewards";
import { vouchers } from "../src/lib/data";
const now = Date.parse("2026-10-22T09:00:00Z");

test("old profiles gain rewards without resetting existing profile fields", () => {
  const restored = restoreData(JSON.stringify({ name: "Resident", saved: ["mall"] }));
  assert.equal(restored.rewardPoints, 730);
  assert.equal(restored.name, "Resident");
  assert.deepEqual(restored.saved, ["mall"]);
  assert.deepEqual(restored.claimedVoucherIds, []);
  assert.equal(restoreRewards({ rewardPoints: -1 }).rewardPoints, 730);
  assert.equal(restoreRewards({ rewardPoints: 0 }).rewardPoints, 0);
});

test("redemption uses catalog price, records a dated claim, and prevents duplicate charges", () => {
  const result = redeemReward(initialData, "jaya", now);
  assert.equal(result.ok, true);
  assert.equal(result.data.rewardPoints, 580);
  assert.equal(initialData.rewardPoints, 730);
  assert.deepEqual(result.data.claimedVoucherIds, ["jaya"]);
  assert.equal(result.data.pointTransactions[0].points, -150);
  assert.equal(voucherExpiry(result.data.pointTransactions, "jaya"), now + 30 * 86400000);
  const repeated = redeemReward(result.data, "jaya", now + 1);
  assert.equal(repeated.ok, false);
  assert.equal(repeated.data, result.data);
  assert.equal(redeemReward({ ...initialData, rewardPoints: 149 }, "jaya", now).ok, false);
  assert.equal(redeemReward(initialData, "unknown", now).ok, false);
});

test("boarding credits one valid token once, rejects stale tokens, and accepts the next refreshed token", () => {
  const token = boardingToken(now);
  const scan = recordBoarding(initialData, token, now);
  assert.equal(scan.ok, true);
  assert.equal(scan.data.rewardPoints, 755);
  assert.equal(scan.data.pointTransactions[0].tokenId, token);
  const duplicate = recordBoarding(scan.data, token, now + 1000);
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.data.rewardPoints, 755);
  assert.equal(recordBoarding(scan.data, token, now + 60000).ok, false);
  const next = recordBoarding(scan.data, boardingToken(now + 60000), now + 60000);
  assert.equal(next.ok, true);
  assert.equal(next.data.rewardPoints, 780);
});

test("claims, point history, and boarding replay protection survive app reload", () => {
  const scan = recordBoarding(initialData, boardingToken(now), now);
  const claim = redeemReward(scan.data, "komugi", now);
  const restored = restoreData(JSON.stringify(claim.data));
  assert.equal(restored.rewardPoints, 635);
  assert.deepEqual(restored.claimedVoucherIds, ["komugi"]);
  assert.deepEqual(restored.pointTransactions, claim.data.pointTransactions);
  assert.equal(recordBoarding(restored, boardingToken(now), now).ok, false);
  assert.equal(redeemReward(restored, "komugi", now).ok, false);
  assert.deepEqual(restoreRewards({ claimedVoucherIds: ["jaya", "unknown", "jaya"], pointTransactions: [] }).claimedVoucherIds, ["jaya"]);
  assert.deepEqual(restoreRewards({ pointTransactions: [] }).pointTransactions, []);
  assert.equal(voucherExpiry(defaultRewardState.pointTransactions, "jaya"), null);
});

test("each offer is valid and the refreshing demo token generates a vector QR matrix", () => {
  for (const voucher of vouchers) { assert.ok(voucher.points > 0 && Number.isInteger(voucher.points)); assert.match(voucher.image, /^https:\/\//); assert.ok(voucher.terms.length); }
  const code = createQrCode(0, "M");
  code.addData(boardingToken(now)); code.make();
  assert.ok(code.getModuleCount() >= 21);
  assert.equal(code.isDark(0, 0), true);
});

test("voucher validity persists even after old transactions leave the activity log", () => {
  const claimed = redeemReward(initialData, "jaya", now).data;
  const restored = restoreData(JSON.stringify({ ...claimed, pointTransactions: [] }));
  assert.equal(voucherExpiry(restored.pointTransactions, "jaya", restored.voucherClaimedAt), now + 30 * 86400000);
});

test("one resident token works for boarding and a linked demo checkout, with independent replay checks", async () => {
  const { recordPayment } = await import("../src/lib/rewards");
  const token = boardingToken(now);
  assert.equal(recordPayment(initialData, token, 1400, now).ok, false);
  const linked = { ...initialData, ...restoreRewards({ ...initialData, paymentMethods: undefined, linkedPaymentMethod: "tng" }) };
  const boarded = recordBoarding(linked, token, now).data;
  const paid = recordPayment(boarded, token, 1400, now);
  assert.equal(paid.ok, true);
  assert.equal(paid.data.rewardPoints, 769);
  assert.equal(paid.data.pointTransactions[0].amountCents, 1400);
  assert.equal(paid.data.pointTransactions[0].paymentMethod, "tng");
  assert.equal(recordPayment(paid.data, token, 1400, now).ok, false);
  const restored = restoreData(JSON.stringify(paid.data));
  assert.equal(restored.paymentMethods[0].type, "tng");
  assert.equal(recordPayment(restored, token, 1400, now).ok, false);
  assert.equal(recordBoarding({ ...restored, paymentMethods: [], activePaymentMethodId: null }, boardingToken(now + 60000), now + 60000).ok, true);
});

test("demo checkout rejects invalid amounts and stale codes, and awards whole ringgit points", async () => {
  const { recordPayment } = await import("../src/lib/rewards");
  const linked = { ...initialData, ...restoreRewards({ ...initialData, paymentMethods: undefined, linkedPaymentMethod: "card" }) };
  for (const amount of [-1, 0, NaN, Infinity, 1.5, 1000001]) assert.equal(recordPayment(linked, boardingToken(now), amount, now).ok, false);
  assert.equal(recordPayment(linked, boardingToken(now - 60000), 1400, now).ok, false);
  assert.equal(recordPayment(linked, boardingToken(now), 1499, now).data.rewardPoints, 744);
  assert.equal(recordPayment(linked, boardingToken(now), 99, now).data.rewardPoints, 730);
  assert.equal(restoreRewards({ linkedPaymentMethod: "unknown" }).activePaymentMethodId, null);
});

test("owned vouchers move into history on use or expiry and never charge points twice", async () => {
  const { ownedVoucherStatus, consumeRewardVoucher } = await import("../src/lib/rewards");
  const claimed = redeemReward(initialData, "jaya", now).data;
  assert.equal(ownedVoucherStatus(claimed, "jaya", now), "active");
  const used = consumeRewardVoucher(claimed, "jaya", now);
  assert.equal(used.ok, true);
  assert.equal(used.data.rewardPoints, claimed.rewardPoints);
  assert.equal(ownedVoucherStatus(used.data, "jaya", now), "used");
  assert.equal(consumeRewardVoucher(used.data, "jaya", now).ok, false);
  assert.equal(ownedVoucherStatus(claimed, "jaya", now + 30 * 86400000), "expired");
  assert.equal(consumeRewardVoucher(claimed, "jaya", now + 30 * 86400000).ok, false);
  assert.equal(consumeRewardVoucher(initialData, "jaya", now).ok, false);
  assert.equal(ownedVoucherStatus(restoreData(JSON.stringify(used.data)), "jaya", now), "used");
});
