/** South Africa runs on SAST (UTC+2) all year, with no daylight saving. */
export const TZ = "Africa/Johannesburg";
const OFFSET_MS = 2 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight (SAST) at the start of the day containing `d`, as a real Date. */
export function startOfDaySA(d: Date = new Date()): Date {
  const shifted = new Date(d.getTime() + OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - OFFSET_MS);
}

export function daysAgoSA(n: number): Date {
  return new Date(startOfDaySA().getTime() - n * DAY_MS);
}

/** YYYY-MM-DD in SAST. */
export function dayKey(d: Date): string {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

export function hourSA(d: Date = new Date()): number {
  return new Date(d.getTime() + OFFSET_MS).getUTCHours();
}

/** Value for <input type="datetime-local"> in SAST. */
export function toLocalInput(d: Date = new Date()): string {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 16);
}

/** Parse a datetime-local value as SAST. Falls back to now. */
export function fromLocalInput(v: FormDataEntryValue | null): Date {
  if (typeof v !== "string" || !v) return new Date();
  const d = new Date(`${v}:00+02:00`);
  if (Number.isNaN(d.getTime()) || d.getTime() > Date.now() + 5 * 60 * 1000) return new Date();
  return d;
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-ZA", { timeZone: TZ, ...opts });
const timeF = fmt({ hour: "2-digit", minute: "2-digit", hour12: false });
const dayLongF = fmt({ weekday: "long", day: "numeric", month: "long" });
const dayShortF = fmt({ weekday: "short", day: "numeric", month: "short" });
const dateF = fmt({ day: "numeric", month: "short" });

export const fmtTime = (d: Date) => timeF.format(d);
export const fmtDayLong = (d: Date) => dayLongF.format(d);
export const fmtDayShort = (d: Date) => dayShortF.format(d);
export const fmtDate = (d: Date) => dateF.format(d);

export function greeting(d: Date = new Date()): string {
  const h = hourSA(d);
  if (h < 5) return "Hello";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function timeAgo(d: Date): string {
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export { DAY_MS };
