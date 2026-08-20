export type Glp1Answer = "sema" | "tirz" | "other_glp" | "none";
export type GoalAnswer = "recomp" | "protein" | "appetite" | "general";
export type MealsAnswer = "few" | "three" | "snacks";

export type QuizAnswers = {
  glp1: Glp1Answer;
  goal: GoalAnswer;
  meals: MealsAnswer;
};

export type Targets = {
  protein: number;
  calories: number;
};

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  date: string;
  slot: MealSlot;
  created_at: string;
  photo_uri: string | null;
  name: string;
  protein_g: number;
  calories: number;
  fat_g: number;
  carbs_g: number;
  portion: number;
  confidence: number;
};

export type DayRow = {
  date: string;
  protein_target: number;
  calorie_target: number;
};

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

export type ScanErrorCode =
  | "rate_limited"
  | "bad_image"
  | "model_parse"
  | "upstream"
  | "timeout"
  | "too_large"
  | "network";
