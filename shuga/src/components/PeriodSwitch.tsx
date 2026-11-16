import Link from "next/link";
import { PERIODS, periodLabel } from "@/lib/insights";

export function PeriodSwitch({ path, days, extra = {} }: { path: string; days: number; extra?: Record<string, string> }) {
  return (
    <div className="segment" role="tablist" aria-label="Period">
      {PERIODS.map((p) => (
        <Link key={p} href={{ pathname: path, query: { ...extra, days: p } }} aria-current={p === days ? "true" : undefined} replace scroll={false}>
          {periodLabel(p)}
        </Link>
      ))}
    </div>
  );
}
