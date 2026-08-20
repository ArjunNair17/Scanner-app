export const FOOD_SCHEMA = {
  type: "object",
  properties: {
    identified: { type: "boolean" },
    name: { type: "string" },
    ingredients: { type: "array", items: { type: "string" } },
    calories: { type: "number" },
    protein_g: { type: "number" },
    fat_g: { type: "number" },
    carbs_g: { type: "number" },
    serving_description: { type: "string" },
    confidence: { type: "number" },
  },
  required: [
    "identified",
    "name",
    "ingredients",
    "calories",
    "protein_g",
    "fat_g",
    "carbs_g",
    "serving_description",
    "confidence",
  ],
} as const;

export type FoodEstimate = {
  identified: boolean;
  name: string;
  ingredients: string[];
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  serving_description: string;
  confidence: number;
};

export const SCAN_PROMPT = `You estimate nutrition from a single photo of food.

Rules:
- Estimate the entire visible portion on the plate or in the container — not a generic restaurant serving and not per 100g unless that is clearly all that is shown.
- Protein is the most important number. Be careful with mixed plates, sauces, and hidden oils.
- Slightly overestimate calories rather than underestimate.
- If the image is not food, is unreadable, or you cannot identify an edible portion, set identified=false. Still return the full JSON object; put 0 for numeric fields.
- Never give medical advice, dosing, or drug guidance. Do not mention prescription medications.
- Return ONLY JSON matching the schema. No markdown.`;
