import type { FoodEstimate } from "./schema.ts";

export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("no_json");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return n;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeFood(raw: unknown): FoodEstimate {
  if (!raw || typeof raw !== "object") {
    throw new Error("not_object");
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.identified !== "boolean") {
    throw new Error("identified");
  }
  const ingredients = Array.isArray(o.ingredients)
    ? o.ingredients.filter((x): x is string => typeof x === "string")
    : [];
  const confidence = Math.max(0, Math.min(100, num(o.confidence)));
  const food: FoodEstimate = {
    identified: o.identified,
    name: str(o.name),
    ingredients,
    calories: Math.max(0, num(o.calories)),
    protein_g: Math.max(0, num(o.protein_g)),
    fat_g: Math.max(0, num(o.fat_g)),
    carbs_g: Math.max(0, num(o.carbs_g)),
    serving_description: str(o.serving_description),
    confidence,
  };
  if (!food.identified) {
    return {
      ...food,
      name: food.name || "",
      calories: 0,
      protein_g: 0,
      fat_g: 0,
      carbs_g: 0,
    };
  }
  return food;
}

export function parseModelText(text: string): FoodEstimate {
  return normalizeFood(extractJson(text));
}
