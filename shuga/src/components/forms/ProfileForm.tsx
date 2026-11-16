"use client";

import { useActionState } from "react";
import { saveProfile } from "@/app/actions";
import { DIABETES_TYPES } from "@/lib/vocab";
import { RadioChips } from "@/components/Chips";
import { SubmitButton } from "@/components/SubmitButton";

type Props = {
  from: "welcome" | "settings";
  defaults: { preferredName: string; diabetesType: string; targetLow: number; targetHigh: number; takesMeds: boolean };
};

export function ProfileForm({ from, defaults }: Props) {
  const [state, action] = useActionState(saveProfile, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="from" value={from} />
      <div className="field">
        <label className="label" htmlFor="preferredName">What should we call you?</label>
        <input id="preferredName" name="preferredName" className="text-input" defaultValue={defaults.preferredName} autoComplete="given-name" maxLength={40} />
      </div>

      <div className="field">
        <span className="label">Which best describes you?</span>
        <RadioChips name="diabetesType" options={DIABETES_TYPES} defaultValue={defaults.diabetesType} />
      </div>

      <div className="field">
        <span className="label">
          Your target range
          <small>Many clinics use 4.0 – 10.0 mmol/L. Use the range your doctor gave you.</small>
        </span>
        <div className="range-row">
          <input aria-label="Low" name="targetLow" className="text-input short" inputMode="decimal" defaultValue={defaults.targetLow.toFixed(1)} />
          <span className="muted">to</span>
          <input aria-label="High" name="targetHigh" className="text-input short" inputMode="decimal" defaultValue={defaults.targetHigh.toFixed(1)} />
          <span className="muted small">mmol/L</span>
        </div>
      </div>

      <div className="field">
        <span className="label">Do you take diabetes medication?<small>Tablets or insulin. We&rsquo;ll include a simple yes/no in check-ins.</small></span>
        <RadioChips name="takesMeds" options={[{ id: "yes", label: "Yes" }, { id: "no", label: "No" }]} defaultValue={defaults.takesMeds ? "yes" : "no"} />
      </div>

      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <div className="sticky-save">
        <SubmitButton>{from === "welcome" ? "Let’s begin" : "Save changes"}</SubmitButton>
      </div>
    </form>
  );
}
