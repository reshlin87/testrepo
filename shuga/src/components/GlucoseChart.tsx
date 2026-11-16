import type { GlucoseReading } from "@prisma/client";
import { DAY_MS, dayKey, fmtDate } from "@/lib/time";
import { rangeStatus } from "@/lib/vocab";

/** Readings as dots over the period, with the target range as a soft band and a daily-average line. */
export function GlucoseChart({ readings, since, days, lo, hi }: { readings: GlucoseReading[]; since: Date; days: number; lo: number; hi: number }) {
  const W = 340, H = 190, L = 26, R = 20, T = 8, B = 24;
  const maxV = Math.max(14, Math.ceil(Math.max(...readings.map((r) => r.value), hi) + 1));
  const minV = 2;
  const end = since.getTime() + days * DAY_MS;
  const x = (t: number) => L + ((t - since.getTime()) / (end - since.getTime())) * (W - L - R);
  const y = (v: number) => T + (1 - (v - minV) / (maxV - minV)) * (H - T - B);

  const daily = new Map<string, number[]>();
  for (const r of readings) daily.set(dayKey(r.takenAt), [...(daily.get(dayKey(r.takenAt)) ?? []), r.value]);
  const avgPts = [...daily.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, vs]) => [x(new Date(`${k}T12:00:00+02:00`).getTime()), y(vs.reduce((a, b) => a + b, 0) / vs.length)] as const);

  const ticks = [4, 7, 10, 13].filter((v) => v < maxV);
  const labelEvery = days <= 7 ? 1 : days <= 14 ? 3 : 7;

  return (
    <>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={days === 1 ? "Blood sugar readings today" : `Blood sugar readings over the last ${days} days`}>
        <rect className="band" x={L} width={W - L - R} y={y(hi)} height={y(lo) - y(hi)} rx="4" />
        {ticks.map((v) => (
          <g key={v}>
            <line className="grid" x1={L} x2={W - R} y1={y(v)} y2={y(v)} strokeDasharray="2 4" />
            <text className="axis" x={L - 6} y={y(v) + 4} textAnchor="end">{v}</text>
          </g>
        ))}
        {days === 1 && [6, 12, 18].map((h) => (
          <text key={h} className="axis" x={x(since.getTime() + h * 3600_000)} y={H - 6} textAnchor="middle">{`${String(h).padStart(2, "0")}:00`}</text>
        ))}
        {days > 1 && Array.from({ length: days }, (_, i) => i).filter((i) => (days - 1 - i) % labelEvery === 0).map((i) => {
          const t = since.getTime() + i * DAY_MS + DAY_MS / 2;
          return <text key={i} className="axis" x={x(t)} y={H - 6} textAnchor="middle">{days <= 7 ? new Intl.DateTimeFormat("en-ZA", { weekday: "short", timeZone: "Africa/Johannesburg" }).format(new Date(t)) : fmtDate(new Date(t))}</text>;
        })}
        {avgPts.length > 1 && <polyline className="line" points={avgPts.map((p) => p.join(",")).join(" ")} />}
        {readings.map((r) => (
          <circle key={r.id} className={`pt ${rangeStatus(r.value, lo, hi)}`} cx={x(r.takenAt.getTime())} cy={y(r.value)} r="4.5" />
        ))}
      </svg>
      <div className="legend">
        <span><i style={{ background: "var(--in)" }} />In range</span>
        <span><i style={{ background: "var(--high)" }} />Above</span>
        <span><i style={{ background: "var(--low)" }} />Below</span>
        <span><i style={{ background: "var(--in-soft)", borderRadius: 2 }} />Target {lo.toFixed(1)}–{hi.toFixed(1)}</span>
      </div>
    </>
  );
}
