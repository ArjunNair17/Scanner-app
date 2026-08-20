import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slotFromHour } from "../slot.ts";

describe("meal slot", () => {
  it("maps local hours to breakfast|lunch|dinner|snack", () => {
    assert.equal(slotFromHour(8), "breakfast");
    assert.equal(slotFromHour(12), "lunch");
    assert.equal(slotFromHour(18), "dinner");
    assert.equal(slotFromHour(22), "snack");
  });
});
