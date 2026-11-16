# mindfrombooks

**Books teach. Daily action changes you.**

A daily-action course platform. Each day a learner gets one small task inspired by a book and
writes a short response. Respond on every day and still not happy? One-click automatic refund.

Built with Next.js 16 (App Router, TypeScript strict), Supabase (Postgres, Auth, Storage, RLS),
Stripe Checkout, Resend, Tailwind CSS v4 and Vercel.

---

## How the product rules work

| Rule                 | Behaviour                                                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Start date**       | A course always starts **the day after** enrollment, in the learner's timezone — even when they enroll at 12:01 am. Every day is a full day.                                                            |
| **All Access**       | Buying the bundle unlocks all courses, but each one only begins when the learner taps **Start this course** (Day 1 is then the next morning).                                                           |
| **Days**             | Day N opens at 00:00 and closes at 23:59:59 local time. Only the open day accepts a response. Missed days stay missed.                                                                                  |
| **Refund guarantee** | Paid enrollment + a response on every day (minus grace days) + course finished + within the refund window → the refund button appears and refunds through Stripe automatically.                         |
| **Grace days**       | Set per course in the admin (`Courses → edit → Grace days`). The number is **copied onto the enrollment at purchase**, so changing a course later never changes the deal for people who already bought. |
| **Bundle refunds**   | Each course in a bundle is refundable on its own for an equal share of what was paid.                                                                                                                   |
| **Free access**      | Admin grants and 100% coupons are never refundable.                                                                                                                                                     |

The rules live in three places that agree with each other and are tested:

- `lib/course-days.ts`, `lib/refunds.ts`, `lib/coupons.ts`, `lib/pricing.ts` — pure functions (unit tests in `tests/`)
- `supabase/migrations/…_functions.sql` — `enrollment_progress()`, the check the refund API runs before any money moves (`supabase/tests/rules.sql`)
- `app/api/*` — the server always recomputes day numbers, prices and eligibility; nothing from the browser is trusted

---

## Setup

### 1. Install

```bash
npm install
```

```bash
cp .env.example .env.local
```

You can run `npm run dev` straight away: until Supabase is connected the public site renders
from the seed data so you can look at it. Sign-in, checkout and the dashboard need the steps below.

### 2. Supabase

1. Create a project at supabase.com.
2. **SQL Editor** → run each file in `supabase/migrations/` in order (or `supabase db push` with the CLI).
   The last file, `20261116000001_course_content.sql`, loads the full day-by-day content for all six
   courses and sets grace days and sample days; run it after the seed on a database that was seeded
   earlier (it is harmless on a fresh one).
3. **Project Settings → API**: copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`, the **publishable key** (`sb_publishable_…`) into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and the **secret key** (`sb_secret_…`) into `SUPABASE_SECRET_KEY`. (Older projects: the legacy `anon` and `service_role` keys work in the same two variables.)
4. **Authentication → URL Configuration**: set _Site URL_ to your domain and add
   `https://YOUR-DOMAIN/auth/callback` (and `http://localhost:3000/auth/callback`) to _Redirect URLs_.
5. **Authentication → Sign In / Providers → Google** (optional): switch it on and paste a Google OAuth
   client ID and secret. Create them in Google Cloud Console → APIs & Services → Credentials →
   OAuth client ID (type: Web application), and add the callback URL that Supabase shows on that
   screen (`https://YOUR-PROJECT.supabase.co/auth/v1/callback`) as an authorised redirect URI.
   Until Google is enabled, the app hides the "Continue with Google" button automatically.
6. Recommended: **Authentication → Emails → SMTP** → use Resend's SMTP so confirmation and
   password-reset emails come from your domain.

### 3. Seed

Set `ADMIN_EMAIL` in `.env.local`, then:

```bash
npm run seed
```

This creates the 6 courses (phases, books, placeholder tasks and real Days 1–3), the All Access
bundle, the `TEST100` coupon (100% off, 5 uses), the email templates, and makes `ADMIN_EMAIL` an
admin (inviting that address if it has no account yet). It is safe to re-run: existing rows are
never overwritten. `supabase/seed.sql` contains the same data if you prefer the SQL editor.

### 4. Stripe

1. Copy your secret and publishable keys into `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. **Developers → Webhooks → Add endpoint**: `https://YOUR-DOMAIN/api/webhooks/stripe`,
   events `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `charge.refunded`.
   Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Local testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Prices are created on the fly from the database (`price_data`), so there are no Stripe products to
keep in sync. Use **test-mode** keys in Vercel's _Preview_ environment and **live** keys in
_Production_ (each needs its own webhook endpoint and secret).

### 5. Resend

1. Add and verify your domain at resend.com (DNS records).
2. Put the API key in `RESEND_API_KEY` and a sender on that domain in `EMAIL_FROM`.
3. Set `UNSUBSCRIBE_TOKEN_SECRET` to a long random string:

```bash
openssl rand -hex 32
```

The free tier sends 100 emails a day. All mail goes through `sendEmail()` in `lib/email.ts`, which
logs every attempt to `email_log` and never breaks a purchase or cron run if sending fails.

### 6. Vercel

1. Import the repo. Add every variable from `.env.example` (Production and Preview).
2. Set `NEXT_PUBLIC_SITE_URL` to your real domain and `CRON_SECRET` to a long random string —
   Vercel sends it automatically to the cron routes.
3. `vercel.json` schedules three hourly jobs (Vercel Pro):

| Route                            | Minute | Does                                                                     |
| -------------------------------- | ------ | ------------------------------------------------------------------------ |
| `/api/cron/missed-yesterday`     | :00    | "You missed yesterday" email, at the learner's reminder hour             |
| `/api/cron/daily-reminders`      | :10    | Daily reminder, at the learner's reminder hour                           |
| `/api/cron/complete-enrollments` | :20    | Closes finished courses, issues certificates, sends the completion email |

A learner gets at most one of the two daily emails per day.

4. Enable **Web Analytics** in the Vercel project.

---

## Test the whole flow

1. Log in as the admin → `/admin`.
2. **Users → Create user & grant access** → the tester gets an email to set a password.
3. As a normal user, open a course and enter `TEST100` → enrolled free, no Stripe.
4. The course starts **tomorrow**. To test without waiting, open **Admin → Users → that user** and
   use **Jump to day** on the enrollment: pick any day (or "Starts tomorrow" / "Finished
   yesterday") and press Apply. "Mark earlier days as answered" fills the days before it with
   test responses, so you can see the on-track and refund-eligible states; "Delete all responses"
   resets the course.
5. Create a coupon that leaves a US$1 price (e.g. US$8.99 off Fix Your Money), buy the course with
   a real card, jump that enrollment to **Finished yesterday** with earlier days marked as answered,
   then press **Claim refund** on the Purchases page.

Setting a course to fewer days hides the later tasks but keeps their content, so you can set it back.

---

## Ratings and testimonials

- When a learner finishes a course, the completion page asks for a 1–5 star rating and an optional
  comment. They choose whether the comment may be shown, and with which name and country.
- Shared comments wait in **Admin → Testimonials** until you publish them. Comments a learner did
  not agree to share can never be published (the database enforces it).
- You can also add quotes that reached you elsewhere (Instagram DMs, email). Each one records where
  it came from and needs a tick confirming it is a real customer's words, used with permission.
- Course pages show up to 8 of these in a column under the enroll box, plus the average rating once
  a course has at least 3 ratings.

Run migrations `20261117000001_ratings_testimonials.sql` and `20261118000001_remove_dev_samples.sql`.

---

## Course content

All 217 days are written in `scripts/content/`, one file per course. Every day cites the book its
idea comes from, paraphrased in our own words. To change content for a live site, either edit it in
the admin task editor, or edit the content files and regenerate the SQL:

```bash
npm run content:sql
```

That rewrites `supabase/migrations/20261116000001_course_content.sql`, which updates courses in
place by slug. Grace days and public sample days follow course length: under 25 days → 2 and 2,
25–50 days → 3 and 3, over 50 days → 4 grace days and 3 samples.

---

## Commands

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run test
```

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm run seed
```

Database rule checks (run against a scratch database with migrations + seed applied):

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rules.sql
```

---

## Project layout

```
app/
  (marketing)/      public pages (cached, refreshed every 5 min and on admin saves)
  (auth)/           login, signup, password reset
  dashboard/        learner area
  admin/            admin portal (pages + server actions in actions.ts)
  api/              checkout, coupons, responses, refunds, webhooks, cron, og images
  c/[certificateId] public certificate
components/         ui/ (shadcn-style), marketing/, dashboard/, admin/, shared/
emails/             email layout, default copy, tiny safe markdown renderer
lib/                business rules, Supabase clients, Stripe, email, queries, validators
proxy.ts            session refresh, /dashboard + /admin protection, attribution cookie
supabase/           migrations, seed.sql, rule tests
scripts/            seed.ts + seed-data.ts
tests/              Vitest unit tests
```

### Notes

- **`proxy.ts`** is what earlier Next.js versions called `middleware.ts`; Next.js 16 renamed it.
- **Admin writes** are Server Actions in `app/admin/actions.ts`; each one calls `requireAdmin()`.
  Image upload and task export are route handlers under `app/api/admin/`.
- **Security**: RLS is on for every table. Learners can read only their own rows and can update
  only their name, timezone and reminder settings. Enrollments, responses, orders and refunds are
  written only by server code with the secret key (`lib/supabase/admin.ts`, server-only).
  Full task content is never readable with the public key — only sample days are.
- **Rate limits** on coupon checks, checkout, responses and refunds are in memory per server
  instance (`lib/rate-limit.ts`). Swap in Redis/Upstash if you need a strict global limit.
- **Analytics**: every event goes through `track()` in `lib/track.ts` — add PostHog there later.
  Attribution is a first-touch `mfb_attr` cookie (30 days) copied to the profile on signup.
- **Books**: courses are "inspired by" the books. Cards render the title and author as text; never
  upload an official publisher cover.
- **Legal pages** (`/terms`, `/privacy`, `/refund-policy`) are placeholders marked on the page —
  replace them with reviewed wording before launch.
