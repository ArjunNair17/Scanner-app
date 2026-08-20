import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
} from "../db-memory.ts";
import type { Meal } from "../../types.ts";

function meal(partial: Partial<Meal> & Pick<Meal, "id" | "date">): Meal {
  return {
    slot: "lunch",
    created_at: "2026-08-20T12:00:00.000Z",
    photo_uri: null,
    name: "Chicken",
    protein_g: 42,
    calories: 520,
    fat_g: 14,
    carbs_g: 48,
    portion: 1,
    confidence: 78,
    ...partial,
  };
}

describe("web memory db", () => {
  it("saves a meal and reads it back for Today and History", () => {
    const db = emptyMemoryDb();
    const targets = { protein: 100, calories: 1400 };
    const day = ensureDayIn(db, "2026-08-20", targets);
    assert.equal(day.protein_target, 100);

    insertMealIn(db, meal({ id: "m1", date: "2026-08-20" }));
    const today = mealsForDateIn(db, "2026-08-20");
    assert.equal(today.length, 1);
    assert.equal(totals(today).protein, 42);

    const history = mealsInRangeIn(db, "2026-08-01", "2026-08-20");
    assert.equal(history.length, 1);
    assert.equal(daysInRangeIn(db, "2026-08-01", "2026-08-20").length, 1);
  });

  it("updates targets without dropping the day row", () => {
    const db = emptyMemoryDb();
    ensureDayIn(db, "2026-08-20", { protein: 100, calories: 1400 });
    updateDayTargetsIn(db, "2026-08-20", { protein: 140, calories: 2200 });
    assert.deepEqual(db.days[0], {
      date: "2026-08-20",
      protein_target: 140,
      calorie_target: 2200,
    });
  });

  it("todaySnapshot creates today if missing", () => {
    const db = emptyMemoryDb();
    const snap = todaySnapshotIn(db, { protein: 90, calories: 1600 });
    assert.equal(snap.meals.length, 0);
    assert.equal(snap.day.protein_target, 90);
    assert.equal(db.days.length, 1);
  });
});
