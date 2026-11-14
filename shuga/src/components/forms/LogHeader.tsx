import Link from "next/link";
import { BackIcon } from "@/components/icons";

export function LogHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <div className="topbar"><Link href="/" className="back"><BackIcon /> Today</Link></div>
      <p className="eyebrow" style={{ marginTop: 14 }}>{eyebrow}</p>
      <h1>{title}</h1>
    </>
  );
}

export function WhenField({ now, label = "Different time?" }: { now: string; label?: string }) {
  return (
    <details className="more">
      <summary>{label}</summary>
      <div><input type="datetime-local" name="at" className="text-input" defaultValue={now} max={now} /></div>
    </details>
  );
}
