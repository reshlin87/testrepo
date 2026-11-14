export const READING_CONTEXTS = [
  { id: "fasting", label: "Fasting", short: "Fasting", hint: "On waking, before food" },
  { id: "before_meal", label: "Before a meal", short: "Before meal" },
  { id: "after_meal", label: "After a meal", short: "After meal", hint: "About 2 hours after" },
  { id: "bedtime", label: "Bedtime", short: "Bedtime" },
  { id: "other", label: "Other", short: "Other" },
] as const;

export const contextLabel = (id: string) =>
  READING_CONTEXTS.find((c) => c.id === id)?.short ?? "Reading";

export const MEAL_KINDS = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "supper", label: "Supper" },
  { id: "snack", label: "Snack" },
] as const;

export const PORTIONS = [
  { id: "light", label: "Light" },
  { id: "moderate", label: "Moderate" },
  { id: "hearty", label: "Hearty" },
] as const;

export const STARCH = [
  { id: "little", label: "A little" },
  { id: "some", label: "Some" },
  { id: "lots", label: "Lots" },
] as const;

/** Everyday South African plates. Tap what was on yours — no weighing, no counting. */
export const FOOD_TAGS = [
  "Pap", "Rice", "Bread", "Potato", "Samp & beans", "Pasta",
  "Chicken", "Red meat", "Fish", "Eggs", "Beans & lentils", "Braai",
  "Vegetables", "Salad", "Fruit", "Dairy", "Something sweet", "Juice or fizzy",
  "Takeaway",
] as const;

export const HUNGER = ["Not hungry", "Peckish", "Hungry", "Very hungry", "Ravenous"] as const;
export const FULLNESS = ["Still hungry", "Satisfied", "Comfortably full", "Very full", "Overfull"] as const;
export const MOODS = ["Low", "Flat", "Okay", "Good", "Great"] as const;
export const ENERGY = ["Drained", "Tired", "Steady", "Lively", "Energised"] as const;

export const DIABETES_TYPES = [
  { id: "type2", label: "Type 2" },
  { id: "type1", label: "Type 1" },
  { id: "prediabetes", label: "Pre-diabetes" },
  { id: "other", label: "Other / not sure" },
] as const;

export const label = (list: readonly string[], n: number | null | undefined) =>
  n == null ? null : list[n - 1] ?? null;

export const labelOf = (list: readonly { id: string; label: string }[], id: string) =>
  list.find((x) => x.id === id)?.label ?? id;

export type RangeStatus = "low" | "in" | "high";

export function rangeStatus(v: number, low: number, high: number): RangeStatus {
  if (v < low) return "low";
  if (v > high) return "high";
  return "in";
}

export const STATUS_LABEL: Record<RangeStatus, string> = {
  low: "Below range",
  in: "In range",
  high: "Above range",
};

export const fmtMmol = (v: number | null | undefined) => (v == null ? "—" : v.toFixed(1));
