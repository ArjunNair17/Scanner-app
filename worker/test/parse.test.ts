import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractJson, normalizeFood, parseModelText } from "../src/parse.ts";
import { nextCount } from "../src/ratelimit.ts";

const identified = {
  identified: true,
  name: "Salmon bowl",
  ingredients: ["salmon", "rice"],
  calories: 610,
  protein_g: 38,
  fat_g: 22,
  carbs_g: 55,
  serving_description: "1 bowl",
  confidence: 81,
};

describe("parseModelText", () => {
  it("parses a clean identified payload", () => {
    const food = parseModelText(JSON.stringify(identified));
    assert.equal(food.identified, true);
    assert.equal(food.name, "Salmon bowl");
    assert.equal(food.protein_g, 38);
  });

  it("unwraps markdown fences", () => {
    const food = parseModelText("```json\n" + JSON.stringify(identified) + "\n```");
    assert.equal(food.identified, true);
    assert.equal(food.calories, 610);
  });

  it("identified=false zeros macros and stays valid", () => {
    const food = parseModelText(
      JSON.stringify({
        identified: false,
        name: "a shoe",
        ingredients: [],
        calories: 12,
        protein_g: 3,
        fat_g: 1,
        carbs_g: 2,
        serving_description: "",
        confidence: 9,
      }),
    );
    assert.equal(food.identified, false);
    assert.equal(food.calories, 0);
    assert.equal(food.protein_g, 0);
    assert.equal(food.fat_g, 0);
    assert.equal(food.carbs_g, 0);
  });

  it("throws model_parse-equivalent on garbage", () => {
    assert.throws(() => parseModelText("not json"), /no_json/);
    assert.throws(() => extractJson("hello"), /no_json/);
    assert.throws(() => normalizeFood({ name: "x" }), /identified/);
  });
});

describe("rate limit helper", () => {
  it("allows 40 then blocks", () => {
    let count = 0;
    for (let i = 0; i < 40; i += 1) {
      const step = nextCount(count);
      assert.equal(step.allowed, true);
      count = step.next;
    }
    assert.deepEqual(nextCount(count), { allowed: false, next: 40 });
  });
});
