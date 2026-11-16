import Link from "next/link";
import { requireUser } from "@/lib/session";
import { afterMealSpikes, loadPeriod, parsePeriod, summarise } from "@/lib/insights";
import { DAY_MS, dayKey, fmtDayShort } from "@/lib/time";
import { ENERGY, FULLNESS, HUNGER, MEAL_KINDS, MOODS, fmtMmol, label, labelOf, rangeStatus } from "@/lib/vocab";
import { GlucoseChart } from "@/components/GlucoseChart";
import { PeriodSwitch } from "@/components/PeriodSwitch";

export const metadata = { title: "Insights" };

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const user = await requireUser();
  const days = parsePeriod((await searchParams).days);
  const data = await loadPeriod(user.id, days);
  const s = summarise(user, data, days);
  const lo = user.targetLow, hi = user.targetHigh;

  const ctxRows = [
    ["Fasting", s.contextAverages.fasting],
    ["Before meals", s.contextAverages.before_meal],
    ["After meals", s.contextAverages.after_meal],
    ["Bedtime", s.contextAverages.bedtime],
  ] as const;
  const scaleMax = Math.max(14, ...ctxRows.map(([, v]) => v ?? 0));

  const moodByDay = Array.from({ length: days }, (_, i) => {
    const k = dayKey(new Date(data.since.getTime() + i * DAY_MS));
    const ms = data.checkIns.filter((c) => dayKey(c.at) === k).map((c) => c.mood);
    return ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : null;
  });

  const isToday = days === 1;
  const todayCheckIn = data.checkIns.at(-1);
  const spikes = afterMealSpikes(data.readings, data.meals, hi).slice(0, 3);

  return (
    <>
      <div className="topbar"><span className="wordmark">Shu<i>ga</i></span></div>
      <h1 style={{ marginTop: 18 }}>Insights</h1>
      <p className="lede">{isToday ? "A calm look back over today." : "A calm look at the bigger picture."}</p>
      <div style={{ marginTop: 22 }}><PeriodSwitch path="/insights" days={days} /></div>

      {!s.readingCount && !s.mealCount && !s.checkInCount ? (
        <div className="card empty" style={{ marginTop: 24 }}>
          <p className="h2" style={{ color: "var(--ink)" }}>{isToday ? "Nothing logged today yet" : "Nothing to show just yet"}</p>
          <p>{isToday ? "Log a reading, a meal or a check-in and today\u2019s picture will appear here." : "A few days of readings and Shuga will start drawing the picture for you."}</p>
          <Link className="btn" href="/log/sugar" style={{ marginTop: 10 }}>Log a reading</Link>
        </div>
      ) : (
        <>
          <div className="stats" style={{ marginTop: 22 }}>
            <div className="card stat"><span className="k">Time in range</span><span className="num">{s.timeInRange ?? "—"}<small>%</small></span></div>
            <div className="card stat"><span className="k">Average</span><span className="num">{fmtMmol(s.average)}<small>mmol/L</small></span></div>
            <div className="card stat"><span className="k">Readings</span><span className="num">{s.readingCount}</span></div>
            <div className="card stat"><span className="k">Below · Above</span><span className="num">{s.lows}<small>·</small> {s.highs}</span></div>
          </div>

          {s.readingCount > 0 && (
            <section className="section">
              <h2 className="section-title">Blood sugar</h2>
              <div className="card"><GlucoseChart readings={data.readings} since={data.since} days={days} lo={lo} hi={hi} /></div>
            </section>
          )}

          {ctxRows.some(([, v]) => v != null) && (
            <section className="section">
              <h2 className="section-title">{isToday ? "By moment" : "By time of day"}</h2>
              <div className="card bars">
                {ctxRows.map(([name, v]) => (
                  <div className="bar-row" key={name}>
                    <span>{name}</span>
                    <div className="bar-track">{v != null && <div className={`bar-fill ${rangeStatus(v, lo, hi)}`} style={{ width: `${(v / scaleMax) * 100}%` }} />}</div>
                    <span className="v">{fmtMmol(v)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="section">
            <h2 className="section-title">Meals</h2>
            <div className="card">
              {s.mealCount ? (
                <>
                  <p style={{ margin: 0 }}><span className="num" style={{ fontSize: 30 }}>{s.mealCount}</span> <span className="muted">{s.mealCount === 1 ? "meal" : "meals"} logged</span></p>
                  {s.hungerAvg != null && <p className="small" style={{ margin: "10px 0 0" }}>Usually <b>{label(HUNGER, Math.round(s.hungerAvg))?.toLowerCase()}</b> before eating{ s.fullAvg != null && <>, and <b>{label(FULLNESS, Math.round(s.fullAvg))?.toLowerCase()}</b> after</>}.</p>}
                  {s.topTags.length > 0 && <p className="small muted" style={{ margin: "8px 0 0" }}>Most often: {s.topTags.map(([t]) => t).join(", ")}</p>}
                  {spikes.length > 0 && (
                    <>
                      <hr className="divider" style={{ margin: "18px 0" }} />
                      <p className="small" style={{ margin: 0, fontWeight: 600 }}>Worth a look: higher after-meal readings</p>
                      <ul className="timeline">
                        {spikes.map(({ reading, meal }) => (
                          <li key={reading.id} style={{ gridTemplateColumns: "1fr auto" }}>
                            <div className="what"><b>{meal ? labelOf(MEAL_KINDS, meal.kind) : "After a meal"}</b><span>{fmtDayShort(reading.takenAt)}{meal?.tags ? ` · ${meal.tags.split(",").join(", ")}` : ""}</span></div>
                            <span className="num" style={{ color: "var(--high)", fontSize: 22 }}>{fmtMmol(reading.value)}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              ) : <p className="muted" style={{ margin: 0 }}>{isToday ? "No meals logged today." : "No meals logged in this period."}</p>}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">{isToday ? "How you felt" : "Mood & habits"}</h2>
            <div className="card">
              {isToday ? (
                todayCheckIn ? (
                  <>
                    <p style={{ margin: 0 }}>Feeling <b>{label(MOODS, todayCheckIn.mood)?.toLowerCase()}</b>{todayCheckIn.energy ? <>, energy <b>{label(ENERGY, todayCheckIn.energy)?.toLowerCase()}</b></> : null}</p>
                    <p className="small muted" style={{ margin: "8px 0 0" }}>
                      {[user.takesMeds ? (todayCheckIn.medsTaken === true ? "Meds taken" : todayCheckIn.medsTaken === false ? "Meds not yet" : null) : null, todayCheckIn.moved ? "Moved today" : todayCheckIn.moved === false ? "Not moved yet" : null].filter(Boolean).join(" · ") || "No meds or movement answer yet"}
                    </p>
                    {todayCheckIn.note && <p className="small" style={{ margin: "8px 0 0" }}>&ldquo;{todayCheckIn.note}&rdquo;</p>}
                  </>
                ) : (
                  <p className="muted" style={{ margin: 0 }}>No check-in yet today. <Link href="/log/feel" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Check in →</Link></p>
                )
              ) : s.moodAvg != null ? (
                <>
                  <p style={{ margin: "0 0 14px" }}>Mostly feeling <b>{label(MOODS, Math.round(s.moodAvg))?.toLowerCase()}</b></p>
                  <div className="mood-strip" aria-hidden>
                    {moodByDay.map((m, i) => <div key={i} className={m ? "has" : ""} style={{ height: m ? `${(m / 5) * 100}%` : undefined }} />)}
                  </div>
                </>
              ) : <p className="muted" style={{ margin: 0 }}>No check-ins yet in this period.</p>}
              {!isToday && <div className="stats" style={{ marginTop: 18 }}>
                {user.takesMeds && <div><span className="k muted small">Meds taken</span><span className="num" style={{ display: "block", fontSize: 28 }}>{s.medsTakenDays}<small className="muted small"> / {s.medsAnswered || "—"} days</small></span></div>}
                <div><span className="k muted small">Moved</span><span className="num" style={{ display: "block", fontSize: 28 }}>{s.movedDays}<small className="muted small"> days</small></span></div>
              </div>}
            </div>
          </section>

          <Link href={`/share?days=${days}${isToday ? "&to=family" : ""}`} className="btn ghost block" style={{ marginTop: 28 }}>{isToday ? "Share today on WhatsApp" : "Share this summary"}</Link>
        </>
      )}
      <p className="muted small" style={{ textAlign: "center", marginTop: 24 }}>Patterns, not diagnoses. Bring questions to your clinic.</p>
    </>
  );
}
