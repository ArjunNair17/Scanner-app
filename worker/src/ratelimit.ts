export const DAILY_LIMIT = 40;

export function rateKey(deviceId: string, day: string): string {
  return `scan:${deviceId}:${day}`;
}

export function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function nextCount(current: number, limit = DAILY_LIMIT): { allowed: boolean; next: number } {
  if (current >= limit) return { allowed: false, next: current };
  return { allowed: true, next: current + 1 };
}
