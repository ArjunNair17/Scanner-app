import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isGlp1, targetsFromQuiz } from "../targets.ts";
import type { QuizAnswers } from "../../types.ts";

const base: QuizAnswers = { glp1: "none", goal: "general", meals: "three" };

describe("targetsFromQuiz", () => {
  it("GLP-1 + recomp → 100 / 1400", () => {
    assert.deepEqual(targetsFromQuiz({ ...base, glp1: "sema", goal: "recomp" }), {
      protein: 100,
      calories: 1400,
    });
    assert.deepEqual(targetsFromQuiz({ ...base, glp1: "tirz", goal: "recomp" }), {
      protein: 100,
      calories: 1400,
    });
    assert.deepEqual(targetsFromQuiz({ ...base, glp1: "other_glp", goal: "recomp" }), {
      protein: 100,
      calories: 1400,
    });
  });

  it("GLP-1 + appetite → 90 / 1600", () => {
    assert.deepEqual(targetsFromQuiz({ ...base, glp1: "sema", goal: "appetite" }), {
      protein: 90,
      calories: 1600,
    });
  });

  it("no GLP-1 + protein → 140 / 2200", () => {
    assert.deepEqual(targetsFromQuiz({ ...base, glp1: "none", goal: "protein" }), {
      protein: 140,
      calories: 2200,
    });
  });

  it("else → 100 / 2000", () => {
    assert.deepEqual(targetsFromQuiz({ ...base, glp1: "none", goal: "recomp" }), {
      protein: 100,
      calories: 2000,
    });
    assert.deepEqual(targetsFromQuiz({ ...base, glp1: "none", goal: "appetite" }), {
      protein: 100,
      calories: 2000,
    });
    assert.deepEqual(targetsFromQuiz({ ...base, glp1: "sema", goal: "protein" }), {
      protein: 100,
      calories: 2000,
    });
    assert.deepEqual(targetsFromQuiz({ ...base, glp1: "none", goal: "general" }), {
      protein: 100,
      calories: 2000,
    });
  });

  it("isGlp1 treats none as false", () => {
    assert.equal(isGlp1({ glp1: "none" }), false);
    assert.equal(isGlp1({ glp1: "sema" }), true);
    assert.equal(isGlp1(null), false);
  });
});
