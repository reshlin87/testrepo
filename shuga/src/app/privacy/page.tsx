import Link from "next/link";
import { BackIcon } from "@/components/icons";

export const metadata = {
  title: "Privacy",
  description: "How Shuga collects, uses and protects your personal and health information.",
};

const UPDATED = "16 November 2026";

export default function PrivacyPage() {
  const contact = process.env.CONTACT_EMAIL?.trim();
  const Contact = () =>
    contact ? <a href={`mailto:${contact}`}>{contact}</a> : <span>the contact address shown on this page</span>;

  return (
    <main className="shell bare prose">
      <div className="topbar">
        <Link href="/" className="back"><BackIcon /> Shuga</Link>
      </div>
      <p className="eyebrow" style={{ marginTop: 14 }}>Last updated {UPDATED}</p>
      <h1>Privacy</h1>
      <p className="lede">Shuga holds some of the most personal information there is: your health. This page explains, in plain language, what we keep, why, and how you stay in control. It is written with South Africa&rsquo;s Protection of Personal Information Act (POPIA) in mind.</p>

      <h2>The short version</h2>
      <ul>
        <li>Your entries are private to you. Nobody else can see them.</li>
        <li>We never sell your information or use it for advertising.</li>
        <li>Information leaves Shuga only when <em>you</em> tap to share it on WhatsApp.</li>
        <li>You can delete your account and everything in it at any time, from inside the app.</li>
      </ul>

      <h2>Who is responsible</h2>
      <p>Shuga (shuga.africa) is the responsible party for your information. {contact ? <>You can reach us at <Contact />.</> : <>Contact details for privacy questions will be published here.</>}</p>

      <h2>What we collect</h2>
      <h3>When you sign in</h3>
      <p>We use Google or Facebook to sign you in. From them we receive your name, email address, profile photo and an account identifier. We never see or store your Google or Facebook password.</p>
      <h3>What you choose to log</h3>
      <ul>
        <li>Blood sugar readings, with the time and moment (for example, fasting or after a meal)</li>
        <li>Meals: which meal, portion size, starch level, food types, hunger and fullness</li>
        <li>Check-ins: mood, energy, whether you took your medication and whether you moved</li>
        <li>Any notes you add</li>
        <li>Your settings: the name you prefer, diabetes type, target range and whether you take medication</li>
      </ul>
      <h3>Technical information</h3>
      <p>A cookie keeps you signed in. Shuga has no advertising, no ad trackers and no third-party analytics.</p>

      <h2>Your health information</h2>
      <p>Under POPIA, information about your health is <em>special personal information</em> and gets extra protection. We process it only because you choose to give it to us, and only to provide Shuga to you. By creating an account and logging entries, you consent to this. You can withdraw that consent at any time by deleting your account.</p>

      <h2>How we use it</h2>
      <ul>
        <li>To show your entries, your Today screen and your insights</li>
        <li>To give you gentle reminders and nudges inside the app</li>
        <li>To prepare the WhatsApp summaries you ask for</li>
      </ul>
      <p>We do not share your information with medical aids, insurers, employers or advertisers, and we do not use it to make decisions about you.</p>

      <h2>When you share on WhatsApp</h2>
      <p>The Share screen builds a message and shows you a preview. Nothing is sent unless you tap <b>Send on WhatsApp</b> and choose a chat yourself. Once sent, that message is handled by WhatsApp and the people you sent it to, under WhatsApp&rsquo;s own privacy terms.</p>

      <h2>Who helps us run Shuga</h2>
      <p>We use a small number of trusted service providers, who may only process your information on our instructions:</p>
      <ul>
        <li><b>Vercel</b>: hosts the Shuga app</li>
        <li><b>Neon</b>: stores the Shuga database, in Frankfurt, Germany</li>
        <li><b>Google and Facebook</b>: sign you in. They learn that you signed in to Shuga, but never see your entries.</li>
      </ul>
      <p>Because our database is in Germany, your information is transferred outside South Africa. Germany is covered by the EU&rsquo;s General Data Protection Regulation, which gives protection comparable to POPIA.</p>

      <h2>Keeping it safe</h2>
      <p>All connections to Shuga are encrypted (https). Access to the database is restricted and protected by credentials that are never shared. No system is perfectly secure, but we take reasonable, appropriate steps to protect your information. If a breach ever affects you, we will tell you and the Information Regulator as POPIA requires.</p>

      <h2 id="delete">Deleting your data</h2>
      <p>We keep your information for as long as your account is open. To delete everything:</p>
      <ol>
        <li>Open Shuga and tap <b>You</b> at the bottom.</li>
        <li>Choose <b>Delete my account and data</b>, type <b>delete</b>, and confirm.</li>
      </ol>
      <p>Your account and every reading, meal and check-in are removed from our database straight away. Copies may remain in our database provider&rsquo;s short-term backups until those are overwritten. If you can no longer sign in, write to us at <Contact /> and we will delete your account for you.</p>
      <p>If you signed in with Facebook, you can also remove Shuga from your Facebook account under <b>Settings &amp; privacy → Settings → Apps and websites</b>. This stops sign-in but does not delete your Shuga entries, so please also follow the steps above.</p>

      <h2>Your rights</h2>
      <p>You may ask to see the information we hold about you, ask us to correct or delete it, or object to how we use it. Most of this you can do yourself in the app. For anything else, contact us at <Contact />.</p>
      <p>If you are unhappy with how we handle your information, you may complain to the Information Regulator of South Africa at <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer">inforegulator.org.za</a>.</p>

      <h2>Shuga is not medical advice</h2>
      <p>Shuga helps you keep track. It does not diagnose, treat or replace advice from your doctor, nurse or dietitian. If you feel very unwell, contact your clinic or call <b>10177</b> (or <b>112</b> from a mobile phone).</p>

      <h2>Who Shuga is for</h2>
      <p>Shuga is for adults aged 18 and over.</p>

      <h2>Changes to this page</h2>
      <p>If we change how we handle your information, we will update this page and the date at the top. For significant changes, we will let you know in the app.</p>
    </main>
  );
}
