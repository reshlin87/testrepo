import Link from "next/link";
import { requireUser, displayName } from "@/lib/session";
import { deleteAllData, signOutAction } from "@/app/actions";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { prisma } from "@/lib/db";

export const metadata = { title: "You" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; confirm?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const accounts = await prisma.account.findMany({ where: { userId: user.id }, select: { provider: true } });
  const via = accounts.map((a) => a.provider[0].toUpperCase() + a.provider.slice(1)).join(" & ") || "Demo";

  return (
    <>
      {sp.saved && <div className="toast" role="status">Saved.</div>}
      <div className="topbar"><span className="wordmark">Shu<i>ga</i></span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
        {user.image ? <img className="avatar" src={user.image} alt="" referrerPolicy="no-referrer" /> : <span className="avatar">{displayName(user)[0]}</span>}
        <div>
          <h1 style={{ margin: 0, fontSize: 30 }}>{displayName(user)}</h1>
          <p className="muted small" style={{ margin: 0 }}>Signed in with {via}{user.email && !user.email.endsWith(".local") ? ` · ${user.email}` : ""}</p>
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">Your settings</h2>
        <ProfileForm
          from="settings"
          defaults={{ preferredName: user.preferredName ?? "", diabetesType: user.diabetesType ?? "type2", targetLow: user.targetLow, targetHigh: user.targetHigh, takesMeds: user.takesMeds }}
        />
      </section>

      <section className="section">
        <form action={signOutAction}><button className="btn ghost block">Sign out</button></form>
      </section>

      <section className="section">
        <details className="more" open={!!sp.confirm}>
          <summary>Delete my account and data</summary>
          <form action={deleteAllData} className="card flat" style={{ marginTop: 10 }}>
            <p className="small" style={{ marginTop: 0 }}>This permanently removes every reading, meal and check-in. Type <b>delete</b> to confirm.</p>
            <input name="confirm" className="text-input" autoComplete="off" aria-label="Type delete to confirm" />
            <button className="btn danger block" style={{ marginTop: 12 }}>Delete everything</button>
          </form>
        </details>
      </section>
      <p className="muted small" style={{ textAlign: "center", marginTop: 30 }}>Shuga supports your care; it doesn&rsquo;t replace it.<br />If you feel very unwell, contact your clinic or call 10177.<br /><Link href="/privacy" className="legal-link">Privacy</Link></p>
    </>
  );
}
