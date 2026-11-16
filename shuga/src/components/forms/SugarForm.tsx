"use client";

import { useActionState } from "react";
import { logReading } from "@/app/actions";
import { READING_CONTEXTS } from "@/lib/vocab";
import { RadioChips } from "@/components/Chips";
import { SubmitButton } from "@/components/SubmitButton";
import { WhenField } from "./LogHeader";

export function SugarForm({ now, defaultContext, target }: { now: string; defaultContext: string; target: string }) {
  const [state, action] = useActionState(logReading, undefined);
  return (
    <form action={action}>
      <div className="field">
        <label className="label" htmlFor="value">Reading<small>Target {target} mmol/L</small></label>
        <div className="big-input">
          <input id="value" name="value" inputMode="decimal" placeholder="0.0" autoComplete="off" autoFocus required pattern="[0-9]+([.,][0-9])?" />
          <span>mmol/L</span>
        </div>
      </div>
      <div className="field">
        <span className="label">When was this?</span>
        <RadioChips name="context" options={READING_CONTEXTS} defaultValue={defaultContext} />
      </div>
      <WhenField now={now} />
      <details className="more" style={{ marginTop: 4 }}>
        <summary>Add a note</summary>
        <div><textarea name="note" maxLength={500} placeholder="Felt shaky, big lunch, skipped walk…" /></div>
      </details>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <div className="sticky-save"><SubmitButton>Save reading</SubmitButton></div>
    </form>
  );
}
