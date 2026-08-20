import type { DayRow, Meal, Targets } from "../types";
import {
  daysInRangeIn,
  emptyMemoryDb,
  ensureDayIn,
  insertMealIn,
  mealsForDateIn,
  mealsInRangeIn,
  todaySnapshotIn,
  totals,
  updateDayTargetsIn,
  type MemoryDb,
} from "./db-memory";

const STORAGE_KEY = "protein-scanner.web.db";

let cache: MemoryDb | null = null;

function canUseStorage(): boolean {
  return typeof localStorage !== "undefined";
}

function load(): MemoryDb {
  if (cache) return cache;
  if (!canUseStorage()) {
    cache = emptyMemoryDb();
    return cache;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cache = emptyMemoryDb();
      return cache;
    }
    const parsed = JSON.parse(raw) as Partial<MemoryDb>;
    cache = {
      days: Array.isArray(parsed.days) ? parsed.days : [],
      meals: Array.isArray(parsed.meals) ? parsed.meals : [],
    };
    return cache;
  } catch {
    cache = emptyMemoryDb();
    return cache;
  }
}

function persist(db: MemoryDb): void {
  cache = db;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Quota or private-mode — keep the in-memory copy for this session.
  }
}

export async function ensureDay(date: string, targets: Targets): Promise<DayRow> {
  const db = load();
  const row = ensureDayIn(db, date, targets);
  persist(db);
  return row;
}

export async function updateDayTargets(date: string, targets: Targets): Promise<void> {
  const db = load();
  updateDayTargetsIn(db, date, targets);
  persist(db);
}

export async function insertMeal(meal: Meal): Promise<void> {
  const db = load();
  insertMealIn(db, meal);
  persist(db);
}

export async function mealsForDate(date: string): Promise<Meal[]> {
  return mealsForDateIn(load(), date);
}

export async function mealsInRange(start: string, end: string): Promise<Meal[]> {
  return mealsInRangeIn(load(), start, end);
}

export async function daysInRange(start: string, end: string): Promise<DayRow[]> {
  return daysInRangeIn(load(), start, end);
}

export async function todaySnapshot(targets: Targets): Promise<{ day: DayRow; meals: Meal[] }> {
  const db = load();
  const snap = todaySnapshotIn(db, targets);
  persist(db);
  return snap;
}

export { totals };

export function resetWebDbForTests(): void {
  cache = emptyMemoryDb();
  if (canUseStorage()) localStorage.removeItem(STORAGE_KEY);
}
