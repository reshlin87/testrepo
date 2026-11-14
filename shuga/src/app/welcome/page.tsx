import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "@/components/forms/ProfileForm";

export const metadata = { title: "Welcome" };

export default async function WelcomePage() {
  const user = await requireUser({ allowUnonboarded: true });
  if (user.onboarded) redirect("/");
  return (
    <main className="shell bare">
      <div className="topbar"><span className="wordmark">Shu<i>ga</i></span></div>
      <p className="eyebrow" style={{ marginTop: 24 }}>Three quick things</p>
      <h1>Welcome{user.name ? `, ${user.name.split(" ")[0]}` : ""}.</h1>
      <p className="lede">Let&rsquo;s set Shuga up around you. You can change any of this later.</p>
      <ProfileForm
        from="welcome"
        defaults={{ preferredName: user.name?.split(" ")[0] ?? "", diabetesType: user.diabetesType ?? "type2", targetLow: user.targetLow, targetHigh: user.targetHigh, takesMeds: user.takesMeds }}
      />
    </main>
  );
}
