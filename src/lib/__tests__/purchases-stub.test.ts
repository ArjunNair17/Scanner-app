import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { stubPurchases } from "../../purchases/stub.ts";

describe("RevenueCat stub", () => {
  it("never grants premium and never fakes a purchase", async () => {
    await stubPurchases.init();
    assert.equal(await stubPurchases.isPremium(), false);
    assert.deepEqual(await stubPurchases.restore(), { premium: false });
    const offerings = await stubPurchases.getOfferings();
    assert.equal(offerings.status, "failed");
    assert.equal(offerings.yearly.priceString, null);
    const buy = await stubPurchases.purchase("protein_yearly_39");
    assert.equal(buy.ok, false);
    assert.equal(buy.reason, "unavailable");
  });
});
