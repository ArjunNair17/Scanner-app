/** Local calendar day key YYYY-MM-DD. Never UTC — rings reset at local midnight. */
export function localDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map((n) => Number(n));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(key: string, delta: number): string {
  const date = parseDayKey(key);
  date.setDate(date.getDate() + delta);
  return localDayKey(date);
}

export function weekdayLabel(key: string): string {
  return parseDayKey(key).toLocaleDateString(undefined, { weekday: "short" });
}

export function prettyDate(key: string): string {
  return parseDayKey(key).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
