import Link from "next/link";
import { requireUser, displayName } from "@/lib/session";
import { AUDIENCES, loadPeriod, parseAudience, parsePeriod, summarise, whatsappText } from "@/lib/insights";
import { PeriodSwitch } from "@/components/PeriodSwitch";
import { CopyButton } from "@/components/CopyButton";
import { CheckIcon, WhatsAppIcon } from "@/components/icons";

export const metadata = { title: "Share" };

export default async function SharePage({ searchParams }: { searchParams: Promise<{ days?: string; to?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const days = parsePeriod(sp.days);
  const to = parseAudience(sp.to);
  const data = await loadPeriod(user.id, days);
  const summary = summarise(user, data, days);
  const text = whatsappText(to, displayName(user), summary, data);
  const waHref = `https://wa.me/?text=${encodeURIComponent(text)}`;

  return (
    <>
      <div className="topbar"><span className="wordmark">Shu<i>ga</i></span></div>
      <h1 style={{ marginTop: 18 }}>Share on WhatsApp</h1>
      <p className="lede">Keep the people in your corner up to date — you choose who, and how much.</p>

      <section className="section" style={{ marginTop: 26 }}>
        <h2 className="section-title">Who is it for?</h2>
        <div className="audiences">
          {AUDIENCES.map((a) => (
            <Link key={a.id} href={{ pathname: "/share", query: { to: a.id, days } }} className="audience" aria-current={a.id === to ? "true" : undefined} replace scroll={false}>
              <div><b>{a.label}</b><span>{a.blurb}</span></div>
              <span className="tick">{a.id === to && <CheckIcon />}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Period</h2>
        <PeriodSwitch path="/share" days={days} extra={{ to }} />
      </section>

      <section className="section">
        <h2 className="section-title">Preview</h2>
        <div className="wa-frame"><div className="bubble">{renderWhatsApp(text)}</div></div>
      </section>

      <div className="btn-row" style={{ marginTop: 22 }}>
        <a className="btn whatsapp block" href={waHref} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> Send on WhatsApp</a>
        <CopyButton text={text} />
      </div>
      <p className="muted small" style={{ textAlign: "center", marginTop: 18 }}>Nothing is sent until you pick a chat in WhatsApp.</p>
    </>
  );
}

/** Render WhatsApp's *bold* and _italic_ in the preview. */
function renderWhatsApp(text: string) {
  return text.split(/(\*[^*\n]+\*|_[^_\n]+_)/g).map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <b key={i}>{part.slice(1, -1)}</b>;
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) return <i key={i}>{part.slice(1, -1)}</i>;
    return part;
  });
}
