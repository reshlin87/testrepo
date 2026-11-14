"use client";

import { useActionState } from "react";
import { logCheckIn } from "@/app/actions";
import { ENERGY, MOODS } from "@/lib/vocab";
import { RadioChips, Scale } from "@/components/Chips";
import { SubmitButton } from "@/components/SubmitButton";

const YES_NO = [{ id: "yes", label: "Yes" }, { id: "no", label: "Not yet" }];

export function FeelForm({ takesMeds }: { takesMeds: boolean }) {
  const [state, action] = useActionState(logCheckIn, undefined);
  return (
    <form action={action}>
      <div className="field">
        <span className="label">Mood</span>
        <Scale name="mood" labels={MOODS} />
      </div>
      <div className="field">
        <span className="label">Energy</span>
        <Scale name="energy" labels={ENERGY} />
      </div>
      {takesMeds && (
        <div className="field">
          <span className="label">Taken today&rsquo;s medication?</span>
          <RadioChips name="meds" options={YES_NO} />
        </div>
      )}
      <div className="field">
        <span className="label">Moved your body today?<small>A walk, gardening, dancing — it all counts</small></span>
        <RadioChips name="moved" options={YES_NO} />
      </div>
      <details className="more">
        <summary>Anything on your mind?</summary>
        <div><textarea name="note" maxLength={500} placeholder="A sentence is plenty." /></div>
      </details>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <div className="sticky-save"><SubmitButton>Save check-in</SubmitButton></div>
    </form>
  );
}
