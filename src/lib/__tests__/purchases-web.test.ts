import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getPurchases,
  resetPurchasesAdapterForTests,
  shouldUsePurchasesStub,
} from "../../purchases/index.web.ts";

describe("web purchases adapter", () => {
  it("always stubs and never loads react-native-purchases", async () => {
    resetPurchasesAdapterForTests();
    assert.equal(shouldUsePurchasesStub("appl_live_key_would_still_stub"), true);
    const purchases = getPurchases();
    assert.equal(purchases.kind, "stub");
    await purchases.init();
    assert.equal(await purchases.isPremium(), false);
    const buy = await purchases.purchase("protein_yearly_39");
    assert.equal(buy.ok, false);
    assert.equal(buy.reason, "unavailable");
  });
});
