import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canScan,
  FREE_SCAN_LIMIT,
  incrementFreeScans,
  isIdentifiedOnlyGate,
  planIdentifiedSave,
  remainingFreeScans,
  scanEntryRoute,
  shouldConsumeFreeScan,
} from "../scans.ts";

describe("first-scan AI consent gate", () => {
  it("unset consent sends Scan to /consent before camera/picker", () => {
    assert.equal(
      scanEntryRoute({ aiConsentAccepted: false, isPremium: false, freeScansUsed: 0 }),
      "consent",
    );
    assert.equal(
      scanEntryRoute({ aiConsentAccepted: false, isPremium: true, freeScansUsed: 3 }),
      "consent",
    );
  });

  it("unresolved in-memory consent must not race to camera", () => {
    assert.equal(
      scanEntryRoute({ aiConsentAccepted: null, isPremium: false, freeScansUsed: 0 }),
      "consent",
    );
  });

  it("accepted consent skips the gate and opens camera while scans remain", () => {
    assert.equal(
      scanEntryRoute({ aiConsentAccepted: true, isPremium: false, freeScansUsed: 0 }),
      "camera",
    );
    assert.equal(
      scanEntryRoute({ aiConsentAccepted: true, isPremium: false, freeScansUsed: 2 }),
      "camera",
    );
  });

  it("accepted consent with no free scans left hits the paywall", () => {
    assert.equal(
      scanEntryRoute({ aiConsentAccepted: true, isPremium: false, freeScansUsed: 3 }),
      "paywall",
    );
  });

  it("premium with consent skips paywall even after 3 identified saves", () => {
    assert.equal(
      scanEntryRoute({ aiConsentAccepted: true, isPremium: true, freeScansUsed: 3 }),
      "camera",
    );
  });
});

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

describe("identified Save consume", () => {
  it("identified stub/fixture Save decrements one free scan", () => {
    assert.deepEqual(planIdentifiedSave({ identified: true, isPremium: false, freeScansUsed: 0 }), {
      action: "save",
      nextUsed: 1,
      consume: true,
    });
    assert.deepEqual(planIdentifiedSave({ identified: true, isPremium: false, freeScansUsed: 1 }), {
      action: "save",
      nextUsed: 2,
      consume: true,
    });
    assert.equal(remainingFreeScans(planIdentifiedSave({
      identified: true,
      isPremium: false,
      freeScansUsed: 2,
    }).nextUsed), 0);
  });

  it("4th identified Save hits the paywall and does not consume", () => {
    assert.deepEqual(planIdentifiedSave({ identified: true, isPremium: false, freeScansUsed: 3 }), {
      action: "paywall",
      nextUsed: 3,
      consume: false,
    });
    assert.equal(canScan(false, 3), false);
  });

  it("failed or unidentified Save does not consume", () => {
    assert.deepEqual(planIdentifiedSave({ identified: false, isPremium: false, freeScansUsed: 0 }), {
      action: "skip",
      nextUsed: 0,
      consume: false,
    });
    assert.deepEqual(planIdentifiedSave({ identified: false, isPremium: false, freeScansUsed: 2 }), {
      action: "skip",
      nextUsed: 2,
      consume: false,
    });
  });

  it("premium identified Save does not decrement free_scans_used", () => {
    assert.deepEqual(planIdentifiedSave({ identified: true, isPremium: true, freeScansUsed: 3 }), {
      action: "save",
      nextUsed: 3,
      consume: false,
    });
  });
});
