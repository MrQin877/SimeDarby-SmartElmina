import test from "node:test";
import assert from "node:assert/strict";
import { activePaymentMethod, cardDraftError, linkDemoCard, linkDemoWallet, removePaymentMethod, restorePayments, selectPaymentMethod } from "../src/lib/payments";
import { initialData, restoreData } from "../src/lib/model";
import { boardingToken, recordBoarding, recordPayment } from "../src/lib/rewards";
const now = Date.parse("2026-10-22T09:00:00Z");
const card = { title: "Maybank Visa", number: "4242 4242 4242 4242", expiry: "12/30", cvv: "123" };

test("a legacy linked method migrates while an explicitly empty multi-wallet state stays empty", () => {
  for (const type of ["tng", "card"] as const) {
    const restored = restoreData(JSON.stringify({ ...initialData, paymentMethods: undefined, linkedPaymentMethod: type }));
    assert.equal(restored.paymentMethods.length, 1);
    assert.equal(activePaymentMethod(restored)?.type, type);
  }
  assert.deepEqual(restorePayments({ paymentMethods: [], linkedPaymentMethod: "tng" }), { paymentMethods: [], activePaymentMethodId: null });
});

test("personal, family and card methods coexist, switch in one action, and survive reload", () => {
  const personal = linkDemoWallet(initialData, "tng-personal", now).data;
  const family = linkDemoWallet(personal, "tng-family", now).data;
  const withCard = linkDemoCard(family, card, now).data;
  assert.equal(withCard.paymentMethods.length, 3);
  assert.equal(linkDemoWallet(withCard, "tng-personal", now).ok, false);
  assert.equal(linkDemoCard(withCard, card, now).ok, false);
  assert.equal(linkDemoWallet(withCard, "unknown", now).ok, false);
  const selected = selectPaymentMethod(withCard, "card-4242");
  assert.equal(activePaymentMethod(selected)?.title, "Maybank Visa");
  assert.equal(selectPaymentMethod(selected, "unknown"), selected);
  const restored = restoreData(JSON.stringify(selected));
  assert.deepEqual(restored.paymentMethods, selected.paymentMethods);
  assert.equal(restored.activePaymentMethodId, "card-4242");
  assert.equal(initialData.paymentMethods.length, 0);
});

test("removing an inactive method preserves selection; removing the last resets to transit only", () => {
  const personal = linkDemoWallet(initialData, "tng-personal", now).data;
  const family = linkDemoWallet(personal, "tng-family", now).data;
  assert.equal(removePaymentMethod(family, "tng-family").activePaymentMethodId, "tng-personal");
  const removed = removePaymentMethod(family, "tng-personal");
  assert.equal(removed.activePaymentMethodId, "tng-family");
  const empty = removePaymentMethod(removed, "tng-family");
  assert.equal(empty.activePaymentMethodId, null);
  assert.equal(recordPayment(empty, boardingToken(now), 1400, now).ok, false);
  assert.equal(recordBoarding(empty, boardingToken(now), now).ok, true);
});

test("checkout snapshots the selected account and cannot replay after switching wallets", () => {
  const linked = linkDemoCard(linkDemoWallet(initialData, "tng-personal", now).data, card, now).data;
  const selected = selectPaymentMethod(linked, "card-4242");
  const paid = recordPayment(selected, boardingToken(now), 1400, now).data;
  assert.equal(paid.pointTransactions[0].paymentMethodId, "card-4242");
  assert.equal(paid.pointTransactions[0].paymentMethodDetails, "•••• 4242");
  const switched = selectPaymentMethod(paid, "tng-personal");
  assert.equal(recordPayment(switched, boardingToken(now), 1400, now).ok, false);
  assert.equal(removePaymentMethod(paid, "card-4242").pointTransactions[0].paymentMethodTitle, "Maybank Visa");
});

test("card entry validates number, expiry and CVV and persists only a masked summary", () => {
  for (const invalid of [{ ...card, number: "123" }, { ...card, number: "4242424242424241" }, { ...card, expiry: "13/30" }, { ...card, expiry: "09/26" }, { ...card, cvv: "12" }]) {
    assert.ok(cardDraftError(invalid, now));
    assert.equal(linkDemoCard(initialData, invalid, now).ok, false);
  }
  assert.equal(cardDraftError({ ...card, expiry: "10/26" }, now), null);
  const linked = linkDemoCard(initialData, card, now).data;
  const stored = JSON.stringify(linked);
  assert.ok(!stored.includes("4242424242424242"));
  assert.ok(!stored.includes(card.number));
  assert.ok(!stored.includes('"cvv"'));
  assert.ok(!stored.includes('"expiry"'));
  assert.equal(linked.paymentMethods[0].details, "•••• 4242");
});

test("corrupt and duplicate account records cannot restore an invalid active method", () => {
  const valid = linkDemoWallet(initialData, "tng-personal", now).data.paymentMethods[0];
  const restored = restorePayments({ paymentMethods: [null, valid, valid, { ...valid, id: "bad", type: "unknown" }, { ...valid, id: "unmasked", details: "601212345678" }, { ...valid, id: "date", linkedAt: "bad" }] as never, activePaymentMethodId: "unknown" });
  assert.deepEqual(restored.paymentMethods, [valid]);
  assert.equal(restored.activePaymentMethodId, valid.id);
});
