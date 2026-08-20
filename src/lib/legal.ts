import type { ProductInfo } from "../purchases/types";
import { paywall } from "../strings";

export function displayPrice(product: ProductInfo, fallback: string): string {
  return product.priceString ?? fallback;
}

export function autoRenewLegalBlock(yearly: ProductInfo, monthly: ProductInfo): string {
  const yearlyPrice = displayPrice(yearly, paywall.yearlyFallback);
  const monthlyPrice = displayPrice(monthly, paywall.monthlyFallback);

  return [
    `${yearly.title} is an auto-renewable subscription.`,
    `Length: 1 year. Price: ${yearlyPrice}. 3-day free trial.`,
    `${monthly.title} is an auto-renewable subscription.`,
    `Length: 1 month. Price: ${monthlyPrice}.`,
    "Payment will be charged to your Apple ID account at confirmation of purchase.",
    "Subscription automatically renews unless it is canceled at least 24 hours before the end of the current period.",
    "Your account will be charged for renewal within 24 hours prior to the end of the current period at the then-current rate.",
    "You can manage and cancel your subscriptions by going to your App Store account settings after purchase.",
    "Any unused portion of a free trial period will be forfeited when you purchase a subscription.",
  ].join(" ");
}
