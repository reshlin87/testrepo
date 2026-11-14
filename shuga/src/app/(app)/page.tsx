import Link from "next/link";
import { requireUser, displayName } from "@/lib/session";
import { loadPeriod, loggingStreak, summarise, todayData, todaysNudges } from "@/lib/insights";
import { prisma } from "@/lib/db";
import { fmtDayLong, fmtTime, greeting, timeAgo } from "@/lib/time";
import {
  ENERGY, FULLNESS, MEAL_KINDS, MOODS, PORTIONS, STARCH, STATUS_LABEL,
  contextLabel, fmtMmol, label, labelOf, rangeStatus,
} from "@/lib/vocab";
import { deleteEntry } from "@/app/actions";
import { BowlIcon, DropIcon, HeartIcon, XIcon } from "@/components/icons";
import { Toast } from "@/components/Toast";

type Entry = { id: string; kind: "reading" | "meal" | "checkin"; at: Date; title: React.ReactNode; detail: string };

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { saved } = await searchParams;
  const [today, week, streak, latest] = await Promise.all([
    todayData(user.id),
    loadPeriod(user.id, 7),
    loggingStreak(user.id),
    prisma.glucoseReading.findFirst({ where: { userId: user.id }, orderBy: { takenAt: "desc" } }),
  ]);
  const weekSummary = summarise(user, week, 7);
  const nudges = todaysNudges({ user, today, week: weekSummary, streak });
  const status = latest ? rangeStatus(latest.value, user.targetLow, user.targetHigh) : null;

  const entries: Entry[] = [
    ...today.readings.map((r) => ({
      id: r.id, kind: "reading" as const, at: r.takenAt,
      title: <><b className="num">{fmtMmol(r.value)}</b> <span style={{ display: "inline" }} className="muted">mmol/L</span></>,
      detail: [contextLabel(r.context), r.note].filter(Boolean).join(" · "),
    })),
    ...today.meals.map((m) => ({
      id: m.id, kind: "meal" as const, at: m.eatenAt,
      title: <b>{labelOf(MEAL_KINDS, m.kind)}</b>,
      detail: [`${labelOf(PORTIONS, m.portion)}, ${labelOf(STARCH, m.starch).toLowerCase()} starch`, m.tags.split(",").filter(Boolean).join(", "), label(FULLNESS, m.fullAfter)].filter(Boolean).join(" · "),
    })),
    ...today.checkIns.map((c) => ({
      id: c.id, kind: "checkin" as const, at: c.at,
      title: <b>Feeling {label(MOODS, c.mood)?.toLowerCase()}</b>,
      detail: [label(ENERGY, c.energy), c.medsTaken === true ? "Meds taken" : c.medsTaken === false ? "Meds not yet" : null, c.moved ? "Moved" : null, c.note].filter(Boolean).join(" · "),
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <>
      <Toast kind={saved} />
      <div className="topbar">
        <span className="wordmark">Shu<i>ga</i></span>
      </div>

      <p className="eyebrow" style={{ marginTop: 18 }}>{fmtDayLong(new Date())}</p>
      <h1>{greeting()}, {displayName(user)}.</h1>

      <section className="card hero" style={{ marginTop: 24 }} aria-label="Latest reading">
        {latest && status ? (
          <>
            <p className="eyebrow">Latest reading</p>
            <div className="reading">
              <span className="num">{fmtMmol(latest.value)}</span>
              <span className="unit">mmol/L</span>
            </div>
            <div className="hero-meta">
              <span className={`pill ${status}`}>{STATUS_LABEL[status]}</span>
              <span>{contextLabel(latest.context)} · {timeAgo(latest.takenAt)}</span>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">Your first reading</p>
            <p className="h2" style={{ marginTop: 8 }}>Whenever you&rsquo;re ready.</p>
            <p className="lede small">Your target is {fmtMmol(user.targetLow)}–{fmtMmol(user.targetHigh)} mmol/L.</p>
          </>
        )}
      </section>

      <div className="section" style={{ marginTop: 28 }}>
        <h2 className="section-title">Log</h2>
        <div className="actions">
          <Link className="action" href="/log/sugar"><span className="ico"><DropIcon /></span><b>Sugar</b></Link>
          <Link className="action" href="/log/meal"><span className="ico"><BowlIcon /></span><b>Meal</b></Link>
          <Link className="action" href="/log/feel"><span className="ico"><HeartIcon /></span><b>Feeling</b></Link>
        </div>
      </div>

      {nudges.length > 0 && (
        <div className="section stack">
          {nudges.map((n) => (
            <div key={n.title} className={`card flat nudge ${n.tone}`}>
              <span className="mark" />
              <div>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                {n.href && <Link href={n.href}>{n.cta} →</Link>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section">
        <h2 className="section-title">Today</h2>
        <div className="card">
          {entries.length ? (
            <ul className="timeline">
              {entries.map((e) => (
                <li key={e.id}>
                  <time dateTime={e.at.toISOString()}>{fmtTime(e.at)}</time>
                  <div className="what">
                    <div>{e.title}</div>
                    {e.detail && <span>{e.detail}</span>}
                  </div>
                  <form action={deleteEntry}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="kind" value={e.kind} />
                    <button className="icon-btn" aria-label="Remove entry" title="Remove"><XIcon /></button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty" style={{ padding: "18px 0" }}>Nothing logged yet today. One small entry is a good start.</p>
          )}
        </div>
      </div>
    </>
  );
}
