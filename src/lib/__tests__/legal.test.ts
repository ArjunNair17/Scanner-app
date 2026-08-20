import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { autoRenewLegalBlock, displayPrice } from "../legal.ts";
import { FALLBACK_MONTHLY, FALLBACK_YEARLY } from "../../purchases/types.ts";

describe("3.1.2 legal block", () => {
  it("includes title, length, price, trial, auto-renew, and cancel path", () => {
    const yearly = { ...FALLBACK_YEARLY, priceString: "$39.99" };
    const monthly = { ...FALLBACK_MONTHLY, priceString: "$6.99" };
    const text = autoRenewLegalBlock(yearly, monthly);
    assert.match(text, /Protein Scanner Yearly/);
    assert.match(text, /Protein Scanner Monthly/);
    assert.match(text, /1 year/);
    assert.match(text, /1 month/);
    assert.match(text, /\$39\.99/);
    assert.match(text, /\$6\.99/);
    assert.match(text, /3-day free trial/);
    assert.match(text, /Apple ID/);
    assert.match(text, /automatically renews/);
    assert.match(text, /24 hours/);
    assert.match(text, /App Store account settings/);
    assert.match(text, /unused portion of a free trial/i);
    assert.doesNotMatch(text, /eBay/i);
    assert.doesNotMatch(text, /sold price/i);
  });

  it("falls back when priceString is missing", () => {
    assert.equal(displayPrice(FALLBACK_YEARLY, "$39.99/year"), "$39.99/year");
  });
});
