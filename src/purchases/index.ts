import { NativeModules, Platform } from "react-native";
import { stubPurchases } from "./stub";
import { createNativePurchases } from "./native";
import type { PurchasesAdapter } from "./types";

export {
  FALLBACK_MONTHLY,
  FALLBACK_YEARLY,
  MONTHLY_PRODUCT_ID,
  PREMIUM_ENTITLEMENT,
  YEARLY_PRODUCT_ID,
} from "./types";
export type { OfferingsResult, ProductId, ProductInfo, PurchaseResult } from "./types";

function isPlaceholderKey(key: string): boolean {
  const trimmed = key.trim();
  if (!trimmed) return true;
  if (/^(placeholder|changeme|your_key|appl_xxxx)/i.test(trimmed)) return true;
  return false;
}

export function shouldUsePurchasesStub(key = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? ""): boolean {
  if (isPlaceholderKey(key)) return true;
  if (Platform.OS !== "ios") return true;
  const native = !!(NativeModules as { RNPurchases?: unknown }).RNPurchases;
  return !native;
}

let adapter: PurchasesAdapter | null = null;

export function getPurchases(): PurchasesAdapter {
  if (adapter) return adapter;
  const key = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? "";
  adapter = shouldUsePurchasesStub(key) ? stubPurchases : createNativePurchases(key);
  return adapter;
}

export function resetPurchasesAdapterForTests(): void {
  adapter = null;
}
