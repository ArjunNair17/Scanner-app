export const FREE_SCAN_LIMIT = 3;

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

export function isIdentifiedOnlyGate(identified: boolean, isPremium: boolean, used: number): {
  allowed: boolean;
  nextUsed: number;
} {
  if (!identified) {
    return { allowed: true, nextUsed: used };
  }
  if (isPremium) {
    return { allowed: true, nextUsed: used };
  }
  if (!canUseFreeScan(used)) {
    return { allowed: false, nextUsed: used };
  }
  return { allowed: true, nextUsed: incrementFreeScans(used, true) };
}
