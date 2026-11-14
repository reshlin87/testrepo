# Shuga

Gentle diabetes tracking for South Africans who manage their diabetes with medication and lifestyle. Shuga is built mobile-first for people 40 and up, with large type, big tap targets and a calm, uncluttered layout.

- **Sign in** with Google or Facebook (Auth.js)
- **Log in seconds:** blood sugar (mmol/L, tagged fasting, before or after a meal, or bedtime), meals (portion, starch level and quick-tap South African foods; no weighing or counting) and a daily check-in (mood, energy, meds, movement)
- **Today:** your latest reading with its in-range status, three log buttons, at most two gentle nudges, and today's timeline
- **Insights:** 7, 14 or 30 days. Time in range, averages, a chart with your target band, averages by time of day, meal patterns, high after-meal readings with the meal that came before, and mood and habits
- **Share on WhatsApp:** one tap builds a ready-to-send message for **Family** (warm and short), your **Doctor** (day-by-day numbers, ranges and meds) or your **Dietitian** (meals, hunger and fullness, high after-meal readings)
- Works as an installable home-screen app (PWA) and supports dark mode. All times are shown in SAST.

## Run locally

```bash
cd shuga
npm install
cp .env.example .env        # then fill in the keys below
npx prisma db push          # creates the SQLite dev database
npm run dev                 # http://localhost:3000
```

### OAuth keys

| Provider | Where | Redirect URI |
|---|---|---|
| Google | console.cloud.google.com → APIs & Services → Credentials → OAuth client (Web) | `http://localhost:3000/api/auth/callback/google` |
| Facebook | developers.facebook.com → Create app → Facebook Login | `http://localhost:3000/api/auth/callback/facebook` |

Put the IDs and secrets in `.env` as `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` and `AUTH_FACEBOOK_ID` / `AUTH_FACEBOOK_SECRET`. Generate `AUTH_SECRET` with `npx auth secret`. When you deploy, add your production domain's callback URLs as well.

### Preview without OAuth

```bash
AUTH_DEMO_LOGIN=true npm run dev   # adds a "Preview with demo account" button (never in production)
npm run seed:demo                  # fills the demo account with two weeks of entries (after its first sign-in)
```

## Deploying

SQLite is for development only. For production, set `provider = "postgresql"` in `prisma/schema.prisma`, point `DATABASE_URL` at a Postgres database (Neon, Supabase, RDS…), run `npx prisma db push`, and deploy on Vercel or any Node host. Because the app handles health data, host the database in a region and under terms that suit POPIA.

## Stack

Next.js 15 (App Router, server actions), Auth.js v5, Prisma, and hand-written CSS with no UI framework. Fonts are Fraunces and Inter.

## Not built yet

- Push or WhatsApp reminders. Nudges currently appear in the app only. Real reminders would need Web Push or the WhatsApp Business API.
- mg/dL units (South Africa uses mmol/L)
- PDF export for clinic visits
