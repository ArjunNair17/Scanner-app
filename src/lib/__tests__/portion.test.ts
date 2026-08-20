import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyPortion, formatPortion, PORTION_OPTIONS } from "../portion.ts";

const plate = { protein_g: 30, calories: 400, fat_g: 12, carbs_g: 20 };

describe("applyPortion", () => {
  it("exposes 0.5× 1× 1.5× 2×", () => {
    assert.deepEqual([...PORTION_OPTIONS], [0.5, 1, 1.5, 2]);
  });

  it("1× is identity (calories rounded, macros 1 decimal)", () => {
    assert.deepEqual(applyPortion(plate, 1), plate);
  });

  it("2× doubles macros", () => {
    assert.deepEqual(applyPortion(plate, 2), {
      protein_g: 60,
      calories: 800,
      fat_g: 24,
      carbs_g: 40,
    });
  });

  it("0.5× halves and rounds", () => {
    assert.deepEqual(applyPortion({ protein_g: 25, calories: 333, fat_g: 7, carbs_g: 11 }, 0.5), {
      protein_g: 12.5,
      calories: 167,
      fat_g: 3.5,
      carbs_g: 5.5,
    });
  });

  it("1.5× scales and rounds protein to 1 decimal", () => {
    assert.equal(applyPortion(plate, 1.5).protein_g, 45);
    assert.equal(applyPortion(plate, 1.5).calories, 600);
  });

  it("formats labels", () => {
    assert.equal(formatPortion(0.5), "0.5×");
    assert.equal(formatPortion(1), "1×");
    assert.equal(formatPortion(1.5), "1.5×");
    assert.equal(formatPortion(2), "2×");
  });
});
