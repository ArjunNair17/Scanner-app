import type { MealSlot } from "../types";

export function slotFromHour(hour: number): MealSlot {
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

export function currentSlot(date: Date = new Date()): MealSlot {
  return slotFromHour(date.getHours());
}

export function slotLabel(slot: MealSlot): string {
  switch (slot) {
    case "breakfast":
      return "Breakfast";
    case "lunch":
      return "Lunch";
    case "dinner":
      return "Dinner";
    case "snack":
      return "Snack";
  }
}
