import { stubPurchases } from "./stub";
import type { PurchasesAdapter } from "./types";

export {
  FALLBACK_MONTHLY,
  FALLBACK_YEARLY,
  MONTHLY_PRODUCT_ID,
  PREMIUM_ENTITLEMENT,
  YEARLY_PRODUCT_ID,
} from "./types";
export type { OfferingsResult, ProductId, ProductInfo, PurchaseResult } from "./types";

/** Web never loads react-native-purchases (native module). */
export function shouldUsePurchasesStub(_key = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? ""): boolean {
  return true;
}

let adapter: PurchasesAdapter | null = null;

export function getPurchases(): PurchasesAdapter {
  if (!adapter) adapter = stubPurchases;
  return adapter;
}

export function resetPurchasesAdapterForTests(): void {
  adapter = null;
}
