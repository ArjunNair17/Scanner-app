import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canScan,
  FREE_SCAN_LIMIT,
  incrementFreeScans,
  isIdentifiedOnlyGate,
  remainingFreeScans,
  shouldConsumeFreeScan,
} from "../scans.ts";

describe("free-scan increment", () => {
  it("lifetime limit is 3", () => {
    assert.equal(FREE_SCAN_LIMIT, 3);
    assert.equal(remainingFreeScans(0), 3);
    assert.equal(remainingFreeScans(3), 0);
    assert.equal(remainingFreeScans(4), 0);
  });

  it("identified=true consumes one scan", () => {
    assert.equal(shouldConsumeFreeScan(true), true);
    assert.equal(incrementFreeScans(0, true), 1);
    assert.equal(incrementFreeScans(2, true), 3);
  });

  it("identified=false does not consume", () => {
    assert.equal(shouldConsumeFreeScan(false), false);
    assert.equal(incrementFreeScans(0, false), 0);
    assert.equal(incrementFreeScans(2, false), 2);
  });

  it("failed / unidentified leave remaining scans unchanged", () => {
    const used = 1;
    assert.equal(incrementFreeScans(used, false), used);
    assert.deepEqual(isIdentifiedOnlyGate(false, false, used), {
      allowed: true,
      nextUsed: used,
    });
  });

  it("blocks a 4th identified free scan", () => {
    assert.equal(canScan(false, 3), false);
    assert.deepEqual(isIdentifiedOnlyGate(true, false, 3), {
      allowed: false,
      nextUsed: 3,
    });
  });

  it("premium never increments free_scans_used", () => {
    assert.equal(canScan(true, 3), true);
    assert.deepEqual(isIdentifiedOnlyGate(true, true, 3), {
      allowed: true,
      nextUsed: 3,
    });
  });
});
