import type { QuizAnswers, Targets } from "../types";

export const DEFAULT_TARGETS: Targets = { protein: 100, calories: 2000 };

export function targetsFromQuiz(quiz: Pick<QuizAnswers, "glp1" | "goal">): Targets {
  const onGlp1 = quiz.glp1 !== "none";

  if (onGlp1 && quiz.goal === "recomp") {
    return { protein: 100, calories: 1400 };
  }
  if (onGlp1 && quiz.goal === "appetite") {
    return { protein: 90, calories: 1600 };
  }
  if (!onGlp1 && quiz.goal === "protein") {
    return { protein: 140, calories: 2200 };
  }
  return { protein: 100, calories: 2000 };
}

export function isGlp1(quiz: Pick<QuizAnswers, "glp1"> | null | undefined): boolean {
  return !!quiz && quiz.glp1 !== "none";
}
