import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addDays, localDayKey, parseDayKey } from "../day.ts";

describe("localDayKey", () => {
  it("formats local YYYY-MM-DD, not UTC", () => {
    const date = new Date(2026, 7, 20, 23, 30, 0);
    assert.equal(localDayKey(date), "2026-08-20");
  });

  it("does not roll forward a late-evening local day via toISOString", () => {
    const date = new Date(2026, 0, 1, 23, 0, 0);
    const utc = date.toISOString().slice(0, 10);
    const local = localDayKey(date);
    assert.equal(local, "2026-01-01");
    assert.notEqual(local.includes("T"), true);
    if (date.getTimezoneOffset() < 0) {
      assert.notEqual(local, utc);
    }
  });

  it("pads month and day", () => {
    assert.equal(localDayKey(new Date(2026, 0, 5)), "2026-01-05");
  });

  it("addDays stays on the local calendar", () => {
    assert.equal(addDays("2026-08-31", 1), "2026-09-01");
    assert.equal(addDays("2026-01-01", -1), "2025-12-31");
  });

  it("parseDayKey round-trips", () => {
    assert.equal(localDayKey(parseDayKey("2026-08-20")), "2026-08-20");
  });
});
