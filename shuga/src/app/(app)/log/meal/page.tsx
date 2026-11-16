import { requireUser } from "@/lib/session";
import { defaultMealKind } from "@/lib/insights";
import { toLocalInput } from "@/lib/time";
import { LogHeader } from "@/components/forms/LogHeader";
import { MealForm } from "@/components/forms/MealForm";

export const metadata = { title: "Log a meal" };

export default async function LogMeal() {
  await requireUser();
  return (
    <>
      <LogHeader eyebrow="Meal" title="What did you eat?" />
      <p className="lede">Roughly is perfect. No weighing, no counting.</p>
      <MealForm now={toLocalInput()} defaultKind={defaultMealKind()} />
    </>
  );
}
