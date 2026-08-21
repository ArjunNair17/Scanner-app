export const FREE_SCAN_LIMIT = 3;

export type ScanEntry = "consent" | "paywall" | "camera";

export type IdentifiedSavePlan =
  | { action: "save"; nextUsed: number; consume: boolean }
  | { action: "paywall"; nextUsed: number; consume: false }
  | { action: "skip"; nextUsed: number; consume: false };

export function remainingFreeScans(used: number): number {
  return Math.max(0, FREE_SCAN_LIMIT - Math.max(0, used));
}

/** Only a successful identified estimate consumes a lifetime free scan. */
export function shouldConsumeFreeScan(identified: boolean): boolean {
  return identified === true;
}

export function incrementFreeScans(used: number, identified: boolean): number {
  if (!shouldConsumeFreeScan(identified)) return used;
  return used + 1;
}

export function canUseFreeScan(used: number): boolean {
  return remainingFreeScans(used) > 0;
}

export function canScan(isPremium: boolean, used: number): boolean {
  return isPremium || canUseFreeScan(used);
}

/**
 * First-scan AI consent must run before camera/picker. Later scans skip it
 * once `ai_consent_accepted` is stored as `"1"`.
 *
 * Unresolved (`null`) is not accepted — never mount camera/picker until a
 * storage read confirms the flag. In-memory `true` is not enough.
 */
export function scanEntryRoute(input: {
  aiConsentAccepted: boolean | null;
  isPremium: boolean;
  freeScansUsed: number;
}): ScanEntry {
  if (input.aiConsentAccepted !== true) return "consent";
  if (!canScan(input.isPremium, input.freeScansUsed)) return "paywall";
  return "camera";
}

export function mayMountCamera(dest: ScanEntry): dest is "camera" {
  return dest === "camera";
}

/**
 * Identified Save (including stub / fixture Result) consumes one free scan.
 * Failed or unidentified plates do not. The 4th lifetime identified save
 * hits the paywall and must not persist the meal.
 */
export function planIdentifiedSave(input: {
  identified: boolean;
  isPremium: boolean;
  freeScansUsed: number;
}): IdentifiedSavePlan {
  if (!input.identified) {
    return { action: "skip", nextUsed: input.freeScansUsed, consume: false };
  }
  if (input.isPremium) {
    return { action: "save", nextUsed: input.freeScansUsed, consume: false };
  }
  if (!canUseFreeScan(input.freeScansUsed)) {
    return { action: "paywall", nextUsed: input.freeScansUsed, consume: false };
  }
  return {
    action: "save",
    nextUsed: incrementFreeScans(input.freeScansUsed, true),
    consume: true,
  };
}

export function isIdentifiedOnlyGate(identified: boolean, isPremium: boolean, used: number): {
  allowed: boolean;
  nextUsed: number;
} {
  const plan = planIdentifiedSave({ identified, isPremium, freeScansUsed: used });
  return { allowed: plan.action !== "paywall", nextUsed: plan.nextUsed };
}
