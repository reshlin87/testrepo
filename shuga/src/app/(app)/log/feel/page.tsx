import { requireUser } from "@/lib/session";
import { LogHeader } from "@/components/forms/LogHeader";
import { FeelForm } from "@/components/forms/FeelForm";

export const metadata = { title: "Check in" };

export default async function LogFeel() {
  const user = await requireUser();
  return (
    <>
      <LogHeader eyebrow="Check-in" title="How are you today?" />
      <FeelForm takesMeds={user.takesMeds} />
    </>
  );
}
