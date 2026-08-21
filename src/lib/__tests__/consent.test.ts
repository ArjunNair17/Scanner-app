import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAiConsentAccepted, readAiConsentAccepted } from "../consent.ts";
import { mayMountCamera, scanEntryRoute } from "../scans.ts";
import { STORAGE_KEYS } from "../storage.ts";

describe("stored AI consent", () => {
  it("only the stored flag 1 counts as accepted", () => {
    assert.equal(parseAiConsentAccepted("1"), true);
    assert.equal(parseAiConsentAccepted(null), false);
    assert.equal(parseAiConsentAccepted(undefined), false);
    assert.equal(parseAiConsentAccepted(""), false);
    assert.equal(parseAiConsentAccepted("0"), false);
    assert.equal(parseAiConsentAccepted("true"), false);
    assert.equal(parseAiConsentAccepted("yes"), false);
  });

  it("reads the storage key and treats a missing flag as unset", async () => {
    const empty = { getItem: async () => null };
    assert.equal(await readAiConsentAccepted(empty), false);

    const stored = {
      getItem: async (key: string) => {
        assert.equal(key, STORAGE_KEYS.aiConsentAccepted);
        return "1";
      },
    };
    assert.equal(await readAiConsentAccepted(stored), true);
  });

  it("unresolved or unset consent never mounts camera or picker", () => {
    for (const accepted of [null, false] as const) {
      const dest = scanEntryRoute({
        aiConsentAccepted: accepted,
        isPremium: false,
        freeScansUsed: 0,
      });
      assert.equal(dest, "consent");
      assert.equal(mayMountCamera(dest), false);
    }
  });
});
