export const PORTION_OPTIONS = [0.5, 1, 1.5, 2] as const;
export type PortionMultiplier = (typeof PORTION_OPTIONS)[number];

export type MacroSet = {
  protein_g: number;
  calories: number;
  fat_g: number;
  carbs_g: number;
};

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function applyPortion<T extends MacroSet>(macros: T, portion: number): T {
  return {
    ...macros,
    protein_g: round1(macros.protein_g * portion),
    calories: Math.round(macros.calories * portion),
    fat_g: round1(macros.fat_g * portion),
    carbs_g: round1(macros.carbs_g * portion),
  };
}

export function formatPortion(portion: number): string {
  if (portion === 0.5) return "0.5×";
  if (portion === 1) return "1×";
  if (portion === 1.5) return "1.5×";
  if (portion === 2) return "2×";
  return `${portion}×`;
}
