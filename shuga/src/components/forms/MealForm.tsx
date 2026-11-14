"use client";

import { useActionState } from "react";
import { logMeal } from "@/app/actions";
import { FOOD_TAGS, FULLNESS, HUNGER, MEAL_KINDS, PORTIONS, STARCH } from "@/lib/vocab";
import { RadioChips, Scale, TagChips } from "@/components/Chips";
import { SubmitButton } from "@/components/SubmitButton";
import { WhenField } from "./LogHeader";

export function MealForm({ now, defaultKind }: { now: string; defaultKind: string }) {
  const [state, action] = useActionState(logMeal, undefined);
  return (
    <form action={action}>
      <div className="field">
        <span className="label">Which meal?</span>
        <RadioChips name="kind" options={MEAL_KINDS} defaultValue={defaultKind} />
      </div>
      <div className="field">
        <span className="label">How big was it?</span>
        <RadioChips name="portion" options={PORTIONS} defaultValue="moderate" />
      </div>
      <div className="field">
        <span className="label">How much starch?<small>Pap, rice, bread, potato, pasta</small></span>
        <RadioChips name="starch" options={STARCH} defaultValue="some" />
      </div>
      <div className="field">
        <span className="label">On the plate<small>Optional — tap any that apply</small></span>
        <TagChips name="tags" options={FOOD_TAGS} />
      </div>
      <div className="field">
        <span className="label">Hunger before</span>
        <Scale name="hunger" labels={HUNGER} />
      </div>
      <div className="field">
        <span className="label">Fullness after</span>
        <Scale name="full" labels={FULLNESS} />
      </div>
      <WhenField now={now} />
      <details className="more" style={{ marginTop: 4 }}>
        <summary>Add a note</summary>
        <div><textarea name="note" maxLength={500} placeholder="Family lunch, ate late, tried brown rice…" /></div>
      </details>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <div className="sticky-save"><SubmitButton>Save meal</SubmitButton></div>
    </form>
  );
}
