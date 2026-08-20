import {
  FALLBACK_MONTHLY,
  FALLBACK_YEARLY,
  type OfferingsResult,
  type PurchaseResult,
  type PurchasesAdapter,
} from "./types";

/**
 * Dev / Expo Go adapter. Offerings fail closed so the paywall shows
 * fallback list prices and never pretends StoreKit succeeded.
 */
export const stubPurchases: PurchasesAdapter = {
  kind: "stub",

  async init() {
    return;
  },

  async getOfferings(): Promise<OfferingsResult> {
    return {
      status: "failed",
      yearly: FALLBACK_YEARLY,
      monthly: FALLBACK_MONTHLY,
    };
  },

  async purchase(): Promise<PurchaseResult> {
    return {
      ok: false,
      reason: "unavailable",
      message:
        "Purchases aren’t available in this build. Use a dev client with a RevenueCat key — we never fake a purchase.",
    };
  },

  async restore() {
    return { premium: false };
  },

  async isPremium() {
    return false;
  },
};
