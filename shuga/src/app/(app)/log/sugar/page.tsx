import { requireUser } from "@/lib/session";
import { hourSA, toLocalInput } from "@/lib/time";
import { fmtMmol } from "@/lib/vocab";
import { LogHeader } from "@/components/forms/LogHeader";
import { SugarForm } from "@/components/forms/SugarForm";

export const metadata = { title: "Log sugar" };

export default async function LogSugar() {
  const user = await requireUser();
  const h = hourSA();
  const ctx = h < 10 ? "fasting" : h >= 21 ? "bedtime" : "after_meal";
  return (
    <>
      <LogHeader eyebrow="Blood sugar" title="What does your meter say?" />
      <SugarForm now={toLocalInput()} defaultContext={ctx} target={`${fmtMmol(user.targetLow)}–${fmtMmol(user.targetHigh)}`} />
    </>
  );
}
