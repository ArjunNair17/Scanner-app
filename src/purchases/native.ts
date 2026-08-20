import { NativeModules } from "react-native";
import { stubPurchases } from "./stub";
import {
  FALLBACK_MONTHLY,
  FALLBACK_YEARLY,
  MONTHLY_PRODUCT_ID,
  PREMIUM_ENTITLEMENT,
  YEARLY_PRODUCT_ID,
  type OfferingsResult,
  type ProductInfo,
  type PurchaseResult,
  type PurchasesAdapter,
} from "./types";

type PurchasesModule = typeof import("react-native-purchases");

function hasNativeModule(): boolean {
  return !!(NativeModules as { RNPurchases?: unknown }).RNPurchases;
}

function mapProduct(
  fallback: ProductInfo,
  raw: { identifier?: string; priceString?: string; title?: string } | undefined,
): ProductInfo {
  if (!raw) return fallback;
  return {
    ...fallback,
    title: raw.title || fallback.title,
    priceString: raw.priceString ?? null,
  };
}

async function loadPurchases(): Promise<PurchasesModule | null> {
  if (!hasNativeModule()) return null;
  try {
    return require("react-native-purchases") as PurchasesModule;
  } catch {
    return null;
  }
}

function hasPremium(info: { entitlements: { active: Record<string, unknown> } }): boolean {
  return !!info.entitlements.active[PREMIUM_ENTITLEMENT];
}

export function createNativePurchases(apiKey: string): PurchasesAdapter {
  let Purchases: PurchasesModule | null = null;
  let configured = false;

  return {
    kind: "native",

    async init() {
      Purchases = await loadPurchases();
      if (!Purchases) return;
      if (!configured) {
        Purchases.configure({ apiKey });
        configured = true;
      }
    },

    async getOfferings(): Promise<OfferingsResult> {
      if (!Purchases) {
        return stubPurchases.getOfferings();
      }
      try {
        const offerings = await Purchases.getOfferings();
        const current = offerings.current;
        const available = current?.availablePackages ?? [];
        const yearlyPkg = available.find((p) => p.product.identifier === YEARLY_PRODUCT_ID);
        const monthlyPkg = available.find((p) => p.product.identifier === MONTHLY_PRODUCT_ID);
        if (!yearlyPkg && !monthlyPkg) {
          return { status: "failed", yearly: FALLBACK_YEARLY, monthly: FALLBACK_MONTHLY };
        }
        return {
          status: "ready",
          yearly: mapProduct(FALLBACK_YEARLY, yearlyPkg?.product),
          monthly: mapProduct(FALLBACK_MONTHLY, monthlyPkg?.product),
        };
      } catch {
        return { status: "failed", yearly: FALLBACK_YEARLY, monthly: FALLBACK_MONTHLY };
      }
    },

    async purchase(id): Promise<PurchaseResult> {
      if (!Purchases) {
        return stubPurchases.purchase(id);
      }
      try {
        const offerings = await Purchases.getOfferings();
        const pkg = offerings.current?.availablePackages.find((p) => p.product.identifier === id);
        if (!pkg) {
          return {
            ok: false,
            reason: "unavailable",
            message: "That product isn’t available on the App Store right now.",
          };
        }
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        if (hasPremium(customerInfo)) {
          return { ok: true, premium: true };
        }
        return {
          ok: false,
          reason: "error",
          message: "Purchase finished but the premium entitlement is not active.",
        };
      } catch (error) {
        const err = error as { userCancelled?: boolean; message?: string };
        if (err.userCancelled) {
          return { ok: false, reason: "cancelled", message: "Purchase cancelled." };
        }
        return {
          ok: false,
          reason: "error",
          message: err.message || "Purchase failed.",
        };
      }
    },

    async restore() {
      if (!Purchases) return { premium: false };
      try {
        const info = await Purchases.restorePurchases();
        return { premium: hasPremium(info) };
      } catch {
        return { premium: false };
      }
    },

    async isPremium() {
      if (!Purchases) return false;
      try {
        const info = await Purchases.getCustomerInfo();
        return hasPremium(info);
      } catch {
        return false;
      }
    },
  };
}
