import * as SQLite from "expo-sqlite";
import type { DayRow, Meal, Targets } from "../types";
import { localDayKey } from "./day";

const DB_NAME = "protein-scanner.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS days (
          date TEXT PRIMARY KEY NOT NULL,
          protein_target INTEGER NOT NULL,
          calorie_target INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS meals (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          slot TEXT NOT NULL,
          created_at TEXT NOT NULL,
          photo_uri TEXT,
          name TEXT NOT NULL,
          protein_g REAL NOT NULL,
          calories REAL NOT NULL,
          fat_g REAL NOT NULL,
          carbs_g REAL NOT NULL,
          portion REAL NOT NULL,
          confidence INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS meals_date_idx ON meals(date);
      `);
      return db;
    })();
  }
  return dbPromise;
}

export async function ensureDay(date: string, targets: Targets): Promise<DayRow> {
  const db = await getDb();
  const existing = await db.getFirstAsync<DayRow>("SELECT * FROM days WHERE date = ?", date);
  if (existing) return existing;
  await db.runAsync(
    "INSERT INTO days (date, protein_target, calorie_target) VALUES (?, ?, ?)",
    date,
    targets.protein,
    targets.calories,
  );
  return { date, protein_target: targets.protein, calorie_target: targets.calories };
}

export async function updateDayTargets(date: string, targets: Targets): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO days (date, protein_target, calorie_target) VALUES (?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET protein_target = excluded.protein_target, calorie_target = excluded.calorie_target`,
    date,
    targets.protein,
    targets.calories,
  );
}

export async function insertMeal(meal: Meal): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO meals (id, date, slot, created_at, photo_uri, name, protein_g, calories, fat_g, carbs_g, portion, confidence)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    meal.id,
    meal.date,
    meal.slot,
    meal.created_at,
    meal.photo_uri,
    meal.name,
    meal.protein_g,
    meal.calories,
    meal.fat_g,
    meal.carbs_g,
    meal.portion,
    meal.confidence,
  );
}

export async function mealsForDate(date: string): Promise<Meal[]> {
  const db = await getDb();
  return db.getAllAsync<Meal>("SELECT * FROM meals WHERE date = ? ORDER BY created_at ASC", date);
}

export async function mealsInRange(start: string, end: string): Promise<Meal[]> {
  const db = await getDb();
  return db.getAllAsync<Meal>(
    "SELECT * FROM meals WHERE date >= ? AND date <= ? ORDER BY date ASC, created_at ASC",
    start,
    end,
  );
}

export async function daysInRange(start: string, end: string): Promise<DayRow[]> {
  const db = await getDb();
  return db.getAllAsync<DayRow>(
    "SELECT * FROM days WHERE date >= ? AND date <= ? ORDER BY date ASC",
    start,
    end,
  );
}

export async function todaySnapshot(targets: Targets): Promise<{ day: DayRow; meals: Meal[] }> {
  const date = localDayKey();
  const day = await ensureDay(date, targets);
  const meals = await mealsForDate(date);
  return { day, meals };
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
