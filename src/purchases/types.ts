export const YEARLY_PRODUCT_ID = "protein_yearly_39" as const;
export const MONTHLY_PRODUCT_ID = "protein_monthly_7" as const;
export const PREMIUM_ENTITLEMENT = "premium" as const;

export type ProductId = typeof YEARLY_PRODUCT_ID | typeof MONTHLY_PRODUCT_ID;

export type ProductInfo = {
  id: ProductId;
  title: string;
  /** StoreKit / RevenueCat localized price. Null when offerings failed. */
  priceString: string | null;
  period: "year" | "month";
  trialDays: number;
};

export type OfferingsResult = {
  status: "ready" | "failed";
  yearly: ProductInfo;
  monthly: ProductInfo;
};

export type PurchaseResult =
  | { ok: true; premium: true }
  | { ok: false; reason: "cancelled" | "unavailable" | "error"; message: string };

export type PurchasesAdapter = {
  readonly kind: "stub" | "native";
  init(): Promise<void>;
  getOfferings(): Promise<OfferingsResult>;
  purchase(id: ProductId): Promise<PurchaseResult>;
  restore(): Promise<{ premium: boolean }>;
  isPremium(): Promise<boolean>;
};

export const FALLBACK_YEARLY: ProductInfo = {
  id: YEARLY_PRODUCT_ID,
  title: "Protein Scanner Yearly",
  priceString: null,
  period: "year",
  trialDays: 3,
};

export const FALLBACK_MONTHLY: ProductInfo = {
  id: MONTHLY_PRODUCT_ID,
  title: "Protein Scanner Monthly",
  priceString: null,
  period: "month",
  trialDays: 0,
};
