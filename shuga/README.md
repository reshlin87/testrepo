# Shuga

Gentle diabetes tracking for South Africans who manage their diabetes with medication and lifestyle. Shuga is built mobile-first for people 40 and up, with large type, big tap targets and a calm, uncluttered layout.

- **Sign in** with Google or Facebook (Auth.js)
- **Log in seconds:** blood sugar (mmol/L, tagged fasting, before or after a meal, or bedtime), meals (portion, starch level and quick-tap South African foods; no weighing or counting) and a daily check-in (mood, energy, meds, movement)
- **Today:** your latest reading with its in-range status, three log buttons, at most two gentle nudges, and today's timeline
- **Insights:** 7, 14 or 30 days. Time in range, averages, a chart with your target band, averages by time of day, meal patterns, high after-meal readings with the meal that came before, and mood and habits
- **Share on WhatsApp:** one tap builds a ready-to-send message for **Family** (warm and short), your **Doctor** (day-by-day numbers, ranges and meds) or your **Dietitian** (meals, hunger and fullness, high after-meal readings)
- Works as an installable home-screen app (PWA) and supports dark mode. All times are shown in SAST.

## Go live (Vercel + Neon + your domain)

1. **Database:** create a free Postgres project at [neon.tech](https://neon.tech) (choose a region near South Africa, e.g. Frankfurt) and copy the connection string.
2. **Hosting:** at [vercel.com](https://vercel.com), sign in with GitHub, choose **Add New → Project**, and import this repo. Set **Root Directory** to `shuga`.
3. **Environment variables** (Vercel → Project → Settings → Environment Variables):
   `DATABASE_URL`, `AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_FACEBOOK_ID`, `AUTH_FACEBOOK_SECRET`.
   Then deploy. The build creates the database tables automatically.
4. **Domain:** in Vercel → Settings → Domains, add `yourdomain.co.za` and follow the DNS records it shows (usually an `A` record to `76.76.21.21` and a `CNAME` for `www` to `cname.vercel-dns.com`), added at your domain registrar.
5. **OAuth redirect URIs:** add your domain to both providers:
   - Google: `https://yourdomain.co.za/api/auth/callback/google` (also add `https://yourdomain.co.za` as an authorised JavaScript origin)
   - Facebook: `https://yourdomain.co.za/api/auth/callback/facebook` (also add the domain under App Domains)

### OAuth keys

| Provider | Where |
|---|---|
| Google | console.cloud.google.com → APIs & Services → OAuth consent screen (External), then Credentials → Create OAuth client (Web application) |
| Facebook | developers.facebook.com → My Apps → Create app → "Authenticate and request data from users with Facebook Login" |

While each app is in testing/development mode, only you and the testers you add can sign in. Publish the apps when you're ready for the public. Facebook requires a privacy policy URL before it will let you go live.

## Run locally

```bash
cd shuga
npm install
cp .env.example .env        # fill in DATABASE_URL (a Neon dev branch works) and the keys
npx prisma db push
npm run dev                 # http://localhost:3000
```

For local OAuth, also add `http://localhost:3000/api/auth/callback/google` and `/facebook` as redirect URIs.

### Preview without OAuth (local only)

```bash
AUTH_DEMO_LOGIN=true npm run dev   # adds a "Preview with demo account" button (never in production)
npm run seed:demo                  # fills the demo account with two weeks of entries
```

## Stack

Next.js 15 (App Router, server actions), Auth.js v5, Prisma, and hand-written CSS with no UI framework. Fonts are Fraunces and Inter.

## Not built yet

- Push or WhatsApp reminders. Nudges currently appear in the app only. Real reminders would need Web Push or the WhatsApp Business API.
- mg/dL units (South Africa uses mmol/L)
- PDF export for clinic visits
