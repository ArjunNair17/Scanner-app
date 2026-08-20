import type { DayRow, Meal, Targets } from "../types";
import { localDayKey } from "./day";

export type MemoryDb = {
  days: DayRow[];
  meals: Meal[];
};

export function emptyMemoryDb(): MemoryDb {
  return { days: [], meals: [] };
}

export function totals(meals: Meal[]): { protein: number; calories: number; fat: number; carbs: number } {
  return meals.reduce(
    (acc, meal) => ({
      protein: acc.protein + meal.protein_g,
      calories: acc.calories + meal.calories,
      fat: acc.fat + meal.fat_g,
      carbs: acc.carbs + meal.carbs_g,
    }),
    { protein: 0, calories: 0, fat: 0, carbs: 0 },
  );
}

export function ensureDayIn(db: MemoryDb, date: string, targets: Targets): DayRow {
  const existing = db.days.find((row) => row.date === date);
  if (existing) return existing;
  const row: DayRow = { date, protein_target: targets.protein, calorie_target: targets.calories };
  db.days.push(row);
  return row;
}

export function updateDayTargetsIn(db: MemoryDb, date: string, targets: Targets): void {
  const existing = db.days.find((row) => row.date === date);
  if (existing) {
    existing.protein_target = targets.protein;
    existing.calorie_target = targets.calories;
    return;
  }
  db.days.push({ date, protein_target: targets.protein, calorie_target: targets.calories });
}

export function insertMealIn(db: MemoryDb, meal: Meal): void {
  db.meals.push(meal);
}

export function mealsForDateIn(db: MemoryDb, date: string): Meal[] {
  return db.meals.filter((meal) => meal.date === date).sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function mealsInRangeIn(db: MemoryDb, start: string, end: string): Meal[] {
  return db.meals
    .filter((meal) => meal.date >= start && meal.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at));
}

export function daysInRangeIn(db: MemoryDb, start: string, end: string): DayRow[] {
  return db.days
    .filter((row) => row.date >= start && row.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function todaySnapshotIn(db: MemoryDb, targets: Targets): { day: DayRow; meals: Meal[] } {
  const date = localDayKey();
  const day = ensureDayIn(db, date, targets);
  return { day, meals: mealsForDateIn(db, date) };
}
