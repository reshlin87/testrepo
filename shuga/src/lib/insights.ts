import type { CheckIn, GlucoseReading, Meal, User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { DAY_MS, dayKey, daysAgoSA, fmtDate, fmtDayLong, fmtDayShort, fmtTime, hourSA, startOfDaySA } from "@/lib/time";
import {
  ENERGY, FULLNESS, HUNGER, MEAL_KINDS, MOODS, PORTIONS, STARCH,
  contextLabel, fmtMmol, label, labelOf, rangeStatus,
} from "@/lib/vocab";

/** 1 = today only (since midnight SAST). */
export type Period = 1 | 7 | 14 | 30;
export const PERIODS: Period[] = [1, 7, 14, 30];
export const parsePeriod = (v: unknown): Period => (v === "1" ? 1 : v === "14" ? 14 : v === "30" ? 30 : 7);
export const periodLabel = (days: number) => (days === 1 ? "Today" : `${days} days`);

export async function loadPeriod(userId: string, days: number) {
  const since = daysAgoSA(days - 1);
  const where = { userId };
  const [readings, meals, checkIns] = await Promise.all([
    prisma.glucoseReading.findMany({ where: { ...where, takenAt: { gte: since } }, orderBy: { takenAt: "asc" } }),
    prisma.meal.findMany({ where: { ...where, eatenAt: { gte: since } }, orderBy: { eatenAt: "asc" } }),
    prisma.checkIn.findMany({ where: { ...where, at: { gte: since } }, orderBy: { at: "asc" } }),
  ]);
  return { since, readings, meals, checkIns };
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const round1 = (n: number | null) => (n == null ? null : Math.round(n * 10) / 10);

export type Summary = ReturnType<typeof summarise>;

export function summarise(
  user: Pick<User, "targetLow" | "targetHigh">,
  data: { since: Date; readings: GlucoseReading[]; meals: Meal[]; checkIns: CheckIn[] },
  days: number,
) {
  const { readings, meals, checkIns } = data;
  const lo = user.targetLow;
  const hi = user.targetHigh;
  const values = readings.map((r) => r.value);
  const statuses = readings.map((r) => rangeStatus(r.value, lo, hi));
  const inRange = statuses.filter((s) => s === "in").length;
  const lows = statuses.filter((s) => s === "low").length;
  const highs = statuses.filter((s) => s === "high").length;

  const byContext = (id: string) => avg(readings.filter((r) => r.context === id).map((r) => r.value));

  const moods = checkIns.map((c) => c.mood);
  const energies = checkIns.flatMap((c) => (c.energy ? [c.energy] : []));

  // Meds: count days where a check-in answered the question, and days they said yes.
  const medDays = new Map<string, boolean>();
  for (const c of checkIns) {
    if (c.medsTaken == null) continue;
    const k = dayKey(c.at);
    medDays.set(k, (medDays.get(k) ?? false) || c.medsTaken);
  }
  const moveDays = new Set(checkIns.filter((c) => c.moved).map((c) => dayKey(c.at)));

  const tagCounts = new Map<string, number>();
  for (const m of meals) for (const t of m.tags.split(",").filter(Boolean)) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const count = <T extends string>(xs: T[]) => xs.reduce<Record<string, number>>((o, x) => ((o[x] = (o[x] ?? 0) + 1), o), {});

  const loggedDays = new Set([
    ...readings.map((r) => dayKey(r.takenAt)),
    ...meals.map((m) => dayKey(m.eatenAt)),
    ...checkIns.map((c) => dayKey(c.at)),
  ]);

  return {
    days,
    since: data.since,
    target: { lo, hi },
    readingCount: readings.length,
    average: round1(avg(values)),
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
    timeInRange: readings.length ? Math.round((inRange / readings.length) * 100) : null,
    lows,
    highs,
    contextAverages: {
      fasting: round1(byContext("fasting")),
      before_meal: round1(byContext("before_meal")),
      after_meal: round1(byContext("after_meal")),
      bedtime: round1(byContext("bedtime")),
    },
    mealCount: meals.length,
    portions: count(meals.map((m) => m.portion)),
    starch: count(meals.map((m) => m.starch)),
    topTags,
    hungerAvg: round1(avg(meals.flatMap((m) => (m.hungerBefore ? [m.hungerBefore] : [])))),
    fullAvg: round1(avg(meals.flatMap((m) => (m.fullAfter ? [m.fullAfter] : [])))),
    checkInCount: checkIns.length,
    moodAvg: round1(avg(moods)),
    energyAvg: round1(avg(energies)),
    medsAnswered: medDays.size,
    medsTakenDays: [...medDays.values()].filter(Boolean).length,
    movedDays: moveDays.size,
    loggedDays: loggedDays.size,
  };
}

/** Consecutive days (ending today or yesterday) with at least one entry of any kind. */
export async function loggingStreak(userId: string): Promise<number> {
  const since = daysAgoSA(60);
  const [r, m, c] = await Promise.all([
    prisma.glucoseReading.findMany({ where: { userId, takenAt: { gte: since } }, select: { takenAt: true } }),
    prisma.meal.findMany({ where: { userId, eatenAt: { gte: since } }, select: { eatenAt: true } }),
    prisma.checkIn.findMany({ where: { userId, at: { gte: since } }, select: { at: true } }),
  ]);
  const days = new Set([...r.map((x) => dayKey(x.takenAt)), ...m.map((x) => dayKey(x.eatenAt)), ...c.map((x) => dayKey(x.at))]);
  let cursor = startOfDaySA();
  if (!days.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

export type Nudge = { tone: "calm" | "care" | "cheer"; title: string; body: string; href?: string; cta?: string };

/** Gentle, never nagging: at most two nudges, most important first. */
export function todaysNudges(args: {
  user: Pick<User, "targetLow" | "targetHigh" | "takesMeds">;
  today: { readings: GlucoseReading[]; meals: Meal[]; checkIns: CheckIn[] };
  week: Summary;
  streak: number;
}): Nudge[] {
  const { user, today, week, streak } = args;
  const h = hourSA();
  const out: Nudge[] = [];
  const last = today.readings.at(-1);

  if (last && last.value < user.targetLow) {
    out.push({
      tone: "care",
      title: "Your last reading was low",
      body: "If you feel shaky or unwell, have something sugary (like half a glass of juice), then re-check in 15 minutes. Follow the plan your clinic gave you.",
      href: "/log/sugar",
      cta: "Log a re-check",
    });
  }

  if (!today.readings.length && h >= 6) {
    out.push({
      tone: "calm",
      title: h < 11 ? "A morning number sets the tone" : "No reading yet today",
      body: h < 11 ? "When you're ready, log your fasting reading." : "Whenever it suits you, a quick reading keeps the picture clear.",
      href: "/log/sugar",
      cta: "Log sugar",
    });
  }

  if (week.contextAverages.after_meal != null && week.contextAverages.after_meal > user.targetHigh) {
    out.push({
      tone: "calm",
      title: "After-meal numbers are running higher",
      body: "A 10-minute walk after eating helps many people. Worth mentioning to your dietitian too.",
    });
  }

  if (user.takesMeds && h >= 18 && !today.checkIns.some((c) => c.medsTaken != null)) {
    out.push({ tone: "calm", title: "Evening check-in", body: "How was today? Ten seconds — mood, energy and meds.", href: "/log/feel", cta: "Check in" });
  } else if (h >= 14 && !today.meals.length) {
    out.push({ tone: "calm", title: "Anything to eat today?", body: "Just a tap or two — no counting needed.", href: "/log/meal", cta: "Log a meal" });
  }

  const loggedToday = today.readings.length + today.meals.length + today.checkIns.length;
  if (h >= 18 && loggedToday >= 2) {
    out.push({ tone: "cheer", title: "Share today with family", body: "Send a short summary of your day on WhatsApp.", href: "/share?days=1&to=family", cta: "Share today" });
  }

  if (streak >= 3) {
    out.push({ tone: "cheer", title: `${streak} days in a row`, body: "Steady and consistent. That's exactly how this works." });
  }

  return out.slice(0, 2);
}

/* ------------------------------------------------------------------ */
/* WhatsApp summaries                                                  */
/* ------------------------------------------------------------------ */

export type Audience = "family" | "doctor" | "dietitian";
export const AUDIENCES: { id: Audience; label: string; blurb: string }[] = [
  { id: "family", label: "Family", blurb: "Warm and short — how things went." },
  { id: "doctor", label: "Doctor", blurb: "Numbers by day, ranges and meds." },
  { id: "dietitian", label: "Dietitian", blurb: "Meals, hunger and after-meal readings." },
];
export const parseAudience = (v: unknown): Audience => (v === "doctor" || v === "dietitian" ? v : "family");

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

export function whatsappText(
  audience: Audience,
  name: string,
  s: Summary,
  data: { readings: GlucoseReading[]; meals: Meal[]; checkIns?: CheckIn[] },
): string {
  if (s.days === 1 && audience === "family") return familyDayText(name, s, data);
  const range = s.days === 1 ? fmtDayLong(s.since) : `${fmtDate(s.since)} – ${fmtDate(new Date())}`;
  const span = s.days === 1 ? "today" : `${s.days} days`;
  const target = `${fmtMmol(s.target.lo)}–${fmtMmol(s.target.hi)} mmol/L`;
  const L: string[] = [];

  if (audience === "family") {
    L.push(`🌿 *${name}'s Shuga update*`);
    L.push(`_Last ${s.days} days_`, "");
    if (s.readingCount) {
      L.push(`Sugar: *${s.timeInRange}% in range* across ${s.readingCount} readings`);
      L.push(`Average: ${fmtMmol(s.average)} mmol/L`);
    } else L.push("No sugar readings logged this time.");
    if (s.moodAvg != null) L.push(`Mood: mostly *${label(MOODS, Math.round(s.moodAvg))?.toLowerCase()}*`);
    if (s.medsAnswered) L.push(`Meds: taken on ${s.medsTakenDays} of ${s.medsAnswered} days`);
    if (s.movedDays) L.push(`Moved / walked: ${s.movedDays} day${s.movedDays === 1 ? "" : "s"}`);
    L.push(`Showed up: ${s.loggedDays} of ${s.days} days`, "");
    L.push(s.timeInRange != null && s.timeInRange >= 70 ? "A good stretch. Thanks for cheering me on 💚" : "Taking it one day at a time. Thanks for being in my corner 💚");
    return L.join("\n");
  }

  if (audience === "doctor") {
    L.push(`*Glucose summary — ${name}*`, `${range} (${span})`, `Target: ${target}`, "");
    if (!s.readingCount) L.push("No readings logged in this period.");
    else {
      L.push(`Readings: ${s.readingCount}`);
      L.push(`Average: ${fmtMmol(s.average)} · Range: ${fmtMmol(s.min)}–${fmtMmol(s.max)}`);
      L.push(`In range: ${s.timeInRange}% · Below: ${s.lows} · Above: ${s.highs}`, "");
      L.push("*Averages by time*");
      const ca = s.contextAverages;
      if (ca.fasting != null) L.push(`Fasting: ${fmtMmol(ca.fasting)}`);
      if (ca.before_meal != null) L.push(`Before meals: ${fmtMmol(ca.before_meal)}`);
      if (ca.after_meal != null) L.push(`After meals: ${fmtMmol(ca.after_meal)}`);
      if (ca.bedtime != null) L.push(`Bedtime: ${fmtMmol(ca.bedtime)}`);
      L.push("", "*Day by day*");
      const byDay = new Map<string, GlucoseReading[]>();
      for (const r of data.readings) byDay.set(dayKey(r.takenAt), [...(byDay.get(dayKey(r.takenAt)) ?? []), r]);
      const keys = [...byDay.keys()].sort().reverse().slice(0, 14);
      for (const k of keys) {
        const rs = byDay.get(k)!;
        const flag = (v: number) => (v < s.target.lo ? "↓" : v > s.target.hi ? "↑" : "");
        L.push(`${fmtDayShort(rs[0].takenAt)}: ${rs.map((r) => `${fmtMmol(r.value)}${flag(r.value)} (${contextShort(r.context)} ${fmtTime(r.takenAt)})`).join(", ")}`);
      }
      if (byDay.size > keys.length) L.push(`…and ${byDay.size - keys.length} earlier days`);
    }
    if (s.medsAnswered) L.push("", `Medication taken: ${s.medsTakenDays}/${s.medsAnswered} days reported`);
    if (s.moodAvg != null) L.push(`Mood avg: ${s.moodAvg}/5 · Energy avg: ${s.energyAvg ?? "—"}/5`);
    L.push("", "_↑ above / ↓ below target. Self-logged via Shuga._");
    return L.join("\n");
  }

  // dietitian
  L.push(`*Food & glucose summary — ${name}*`, `${range} (${span})`, "");
  L.push(`Meals logged: ${s.mealCount}`);
  if (s.mealCount) {
    L.push(`Portions: ${PORTIONS.map((p) => `${p.label.toLowerCase()} ${pct(s.portions[p.id] ?? 0, s.mealCount)}%`).join(" · ")}`);
    L.push(`Starch: ${STARCH.map((p) => `${p.label.toLowerCase()} ${pct(s.starch[p.id] ?? 0, s.mealCount)}%`).join(" · ")}`);
    if (s.topTags.length) L.push(`Most often: ${s.topTags.map(([t, n]) => `${t} (${n})`).join(", ")}`);
    if (s.hungerAvg != null) L.push(`Hunger before eating: ${s.hungerAvg}/5 (${label(HUNGER, Math.round(s.hungerAvg))?.toLowerCase()})`);
    if (s.fullAvg != null) L.push(`Fullness after: ${s.fullAvg}/5 (${label(FULLNESS, Math.round(s.fullAvg))?.toLowerCase()})`);
  }
  L.push("");
  const ca = s.contextAverages;
  L.push("*Glucose*", `Target: ${target}`);
  if (ca.before_meal != null) L.push(`Before meals avg: ${fmtMmol(ca.before_meal)}`);
  if (ca.after_meal != null) L.push(`After meals avg: ${fmtMmol(ca.after_meal)}`);
  if (s.timeInRange != null) L.push(`In range overall: ${s.timeInRange}%`);

  const spikes = afterMealSpikes(data.readings, data.meals, s.target.hi).slice(0, 4);
  if (spikes.length) {
    L.push("", "*Higher after-meal readings*");
    for (const sp of spikes) {
      const m = sp.meal;
      const desc = m ? `${labelOf(PORTIONS, m.portion).toLowerCase()} ${m.kind}, ${labelOf(STARCH, m.starch).toLowerCase()} starch${m.tags ? ` — ${m.tags.split(",").join(", ")}` : ""}` : "meal not logged";
      L.push(`${fmtDayShort(sp.reading.takenAt)}: ${fmtMmol(sp.reading.value)} after ${desc}`);
    }
  }
  if (s.energyAvg != null) L.push("", `Energy avg: ${s.energyAvg}/5 (${label(ENERGY, Math.round(s.energyAvg))?.toLowerCase()})`);
  L.push("", "_Self-logged via Shuga._");
  return L.join("\n");
}

/** End-of-day message for family: everything logged today, in time order. */
function familyDayText(name: string, s: Summary, data: { readings: GlucoseReading[]; meals: Meal[]; checkIns?: CheckIn[] }): string {
  const L: string[] = [`🌿 *${name}'s day*`, `_${fmtDayLong(s.since)}_`, ""];
  const mark = (v: number) => (v < s.target.lo ? " (low)" : v > s.target.hi ? " (high)" : " ✓");

  if (data.readings.length) {
    L.push("*Sugar*");
    for (const r of data.readings) L.push(`${fmtTime(r.takenAt)} · ${fmtMmol(r.value)}${mark(r.value)} — ${contextLabel(r.context).toLowerCase()}`);
    if (data.readings.length > 1) L.push(`${s.timeInRange}% in range today`);
    L.push("");
  } else L.push("No sugar readings today.", "");

  if (data.meals.length) {
    L.push("*Meals*");
    for (const m of data.meals) {
      const tags = m.tags.split(",").filter(Boolean).join(", ").toLowerCase();
      L.push(`${labelOf(MEAL_KINDS, m.kind)}: ${labelOf(PORTIONS, m.portion).toLowerCase()}${tags ? ` — ${tags}` : ""}`);
    }
    L.push("");
  }

  const last = data.checkIns?.at(-1);
  if (last) {
    const bits = [`Feeling ${label(MOODS, last.mood)?.toLowerCase()}`];
    if (last.energy) bits.push(`energy ${label(ENERGY, last.energy)?.toLowerCase()}`);
    if (last.medsTaken != null) bits.push(last.medsTaken ? "meds taken" : "meds not yet");
    if (last.moved) bits.push("went for a walk / moved");
    L.push(bits.join(" · "), "");
  }

  const allIn = data.readings.length > 0 && data.readings.every((r) => r.value >= s.target.lo && r.value <= s.target.hi);
  L.push(allIn ? "A steady day. Thanks for checking in on me 💚" : "One day at a time. Thanks for being in my corner 💚");
  return L.join("\n");
}

const contextShort = (c: string) =>
  ({ fasting: "fasting", before_meal: "pre-meal", after_meal: "post-meal", bedtime: "bed", other: "" })[c] ?? contextLabel(c);

/** After-meal readings above target, paired with the most recent meal within 4 hours before. */
export function afterMealSpikes(readings: GlucoseReading[], meals: Meal[], hi: number) {
  return readings
    .filter((r) => r.context === "after_meal" && r.value > hi)
    .map((reading) => {
      const meal = [...meals]
        .reverse()
        .find((m) => m.eatenAt <= reading.takenAt && reading.takenAt.getTime() - m.eatenAt.getTime() < 4 * 3600_000);
      return { reading, meal };
    })
    .sort((a, b) => b.reading.value - a.reading.value);
}

export function defaultMealKind(): string {
  const h = hourSA();
  if (h < 10) return "breakfast";
  if (h >= 11 && h < 15) return "lunch";
  if (h >= 17 && h < 22) return "supper";
  return "snack";
}

export async function todayData(userId: string) {
  const since = startOfDaySA();
  const [readings, meals, checkIns] = await Promise.all([
    prisma.glucoseReading.findMany({ where: { userId, takenAt: { gte: since } }, orderBy: { takenAt: "asc" } }),
    prisma.meal.findMany({ where: { userId, eatenAt: { gte: since } }, orderBy: { eatenAt: "asc" } }),
    prisma.checkIn.findMany({ where: { userId, at: { gte: since } }, orderBy: { at: "asc" } }),
  ]);
  return { readings, meals, checkIns };
}
