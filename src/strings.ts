import type { Glp1Answer, GoalAnswer, MealsAnswer } from "./types";

export const app = {
  publicName: "Protein Scanner: AI Calories",
  expoName: "Protein Scanner",
  supportEmail: "support@proteinsnap.app",
  privacyUrl: "https://proteinsnap.app/privacy",
  supportUrl: "https://proteinsnap.app/support",
  termsUrl: "https://proteinsnap.app/terms",
  eulaUrl: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
};

export const welcome = {
  h1: "Hit your protein without weighing chicken",
  sub: "Photograph the plate. Get calories and protein in seconds.",
  rows: [
    "AI photo logging",
    "Built for GLP-1 & high-protein",
    "See your day at a glance",
  ],
  cta: "Continue",
};

export const quiz = {
  q1: {
    title: "Are you taking a GLP-1 medication?",
    options: [
      { id: "sema" as Glp1Answer, label: "Semaglutide" },
      { id: "tirz" as Glp1Answer, label: "Tirzepatide" },
      { id: "other_glp" as Glp1Answer, label: "Another GLP-1" },
      { id: "none" as Glp1Answer, label: "I’m not taking a GLP-1" },
    ],
  },
  q2: {
    title: "What’s your main goal right now?",
    options: [
      { id: "recomp" as GoalAnswer, label: "Recomp — lose fat, keep muscle" },
      { id: "protein" as GoalAnswer, label: "Hit a high protein target" },
      { id: "appetite" as GoalAnswer, label: "Manage appetite" },
      { id: "general" as GoalAnswer, label: "General health" },
    ],
  },
  q3: {
    title: "How do you usually eat?",
    options: [
      { id: "few" as MealsAnswer, label: "A few meals a day" },
      { id: "three" as MealsAnswer, label: "Three meals" },
      { id: "snacks" as MealsAnswer, label: "Meals plus snacks" },
    ],
  },
};

export const preparing = {
  lines: [
    "Setting your protein floor…",
    "Calibrating portion estimates…",
    "Almost ready…",
  ],
  footer: "Estimates are AI-generated. Not medical advice.",
};

export const paywall = {
  headlineGlp1: "Log protein on a tiny appetite",
  headlineElse: "Photograph food. Stay on protein.",
  benefits: [
    "Unlimited photo scans",
    "Protein & calorie rings",
    "History stays on this iPhone",
  ],
  continueFree: "Continue with 3 free scans",
  yearlyTitle: "Protein Scanner Yearly",
  monthlyTitle: "Protein Scanner Monthly",
  yearlyFallback: "$39.99/year",
  monthlyFallback: "$6.99/mo",
  trial: "3-day free trial",
  offeringsFailed: "Prices couldn’t be loaded from the App Store. Showing list prices. Purchases are unavailable until offerings load.",
  loadingPrices: "Loading prices…",
  ctaTrial: "Start 3-day free trial",
  ctaSubscribe: "Subscribe",
  restore: "Restore purchases",
  restoreNone: "No subscription found for this Apple ID.",
  restoreOk: "Premium restored.",
  purchaseUnavailable: "Purchases aren’t available in this build. Use a dev client with a RevenueCat key — we never fake a purchase.",
};

export const consent = {
  title: "One-time AI consent",
  body: "Photos are sent to identify your food. Gemini third-party. We don't keep the photo after the scan.",
  accept: "I understand — continue",
  decline: "Not now",
};

export const today = {
  empty: "Nothing logged yet. Scan your first meal.",
  scan: "Scan",
  firstSaveTip: "Saved to Today. Meals stay on this iPhone — nothing is uploaded after the scan.",
};

export const camera = {
  tip: "Fit the whole plate in frame.",
  library: "Choose a photo",
  permission: "Camera access is needed to photograph your plate.",
  webTitle: "Scan a plate",
  webHint: "Desktop preview — the camera is stubbed. Choose a JPEG or use the sample plate.",
  sample: "Use sample plate",
};

export const analyzing = {
  lines: [
    "Reading the plate…",
    "Estimating portions…",
    "Counting protein…",
  ],
};

export const result = {
  rough: "Rough estimate",
  disclaimer: "Estimates only. Not medical advice.",
  save: "Save to Today",
  retry: "Retake",
  unidentified: "We couldn’t identify food in that photo. Try again with the whole plate in frame. This didn’t use a free scan.",
};

export const settings = {
  caption:
    "Not affiliated with Novo Nordisk, Eli Lilly, or any pharmacy. Not a medical device.",
  targets: "Daily targets",
  protein: "Protein (g)",
  calories: "Calories",
  scansLeft: "Free scans remaining",
  premium: "Premium",
  legal: "Legal",
  privacy: "Privacy Policy",
  terms: "Terms of Use",
  eula: "Apple Standard EULA",
  support: "Support",
};

export const errors: Record<string, string> = {
  rate_limited: "Daily scan limit reached. Try again tomorrow.",
  bad_image: "That photo couldn’t be read. Try another shot of the plate.",
  model_parse: "We couldn’t read the estimate. Please try again.",
  upstream: "The estimator is unavailable. Please try again shortly.",
  timeout: "That took too long. Check your connection and try again.",
  too_large: "That photo is too large. We’ll resize next time — try again.",
  network: "Couldn’t reach the scanner. Check your connection.",
};
