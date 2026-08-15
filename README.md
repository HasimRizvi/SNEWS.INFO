# SNEWS.INFO — Student Opportunity & Innovation Network

**Live site:** [https://snews-info.vercel.app](https://snews-info.vercel.app)
**GitHub:** [HasimRizvi/SNEWS.INFO](https://github.com/HasimRizvi/SNEWS.INFO)

One trusted platform where students discover verified hackathons, internships, research
papers, startup ideas, communities (CrewIn), funding and more. 100% free stack.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-EF4444?logo=turborepo&logoColor=white)
![Supabase](https://img.shields.io/badge/Database-Supabase-3FCF8E?logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS-38BDF8?logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=googlegemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

---

## What makes SNEWS different

Most opportunity boards just collect links. SNEWS is the only student network where
**every listing is verified twice** — an AI risk check plus a human moderator review —
before it ever goes public. Students get a single trusted feed with source links,
deadlines and last-checked dates, plus an identity-verified profile and resume that
travel with every registration.

- **12+ opportunity categories** — hackathons, internships, research, startups, funding, legal help.
- **2-step verification on every event** — `pending → ai_reviewed → in_review → live`.
- **AI-assisted sourcing** — Gemini classifies and risk-scores opportunities automatically.
- **CrewIn** — grow-together circles: skill groups, college chapters and startup crews.
- **One profile, everywhere** — avatar, bio, skills and resume, used across the whole platform.
- **100% free stack** — zero paid services; runs entirely on free tiers.

---

## Tech stack

| Layer | Technology | Why it was chosen |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Server components + server actions, edge middleware, built-in SEO |
| UI | **React 19 + Tailwind CSS 3** | Fast design-system-first UI, no heavy UI framework |
| Language | **TypeScript 5** | Full end-to-end typing, including the database schema |
| Monorepo | **Turborepo + npm workspaces** | Shared `ui`, `db`, `ai`, `config` packages across apps |
| Database & Auth | **Supabase (Postgres + RLS)** | Row-Level Security protects every table at the DB layer |
| AI | **Google Gemini (REST)** | Opportunity classification + risk scoring, no heavy SDK |
| Email | **Resend** | Transactional auth emails on the free tier |
| Bot protection | **Cloudflare Turnstile** | Login/registration protection |
| Rate limiting | **Upstash Redis** | Serverless-friendly rate limits |
| Hosting | **Vercel** | Zero-config deploys, HTTPS, edge functions |

---

## Project structure — where everything lives

```
snews.info/
├── package.json              # npm workspaces + turbo scripts (dev/build/typecheck)
├── turbo.json                # turbo pipeline config
├── .env.example              # copy to .env.local and fill free-tier keys
│
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql     # ENTIRE database: tables, enums, triggers, RLS policies
│       ├── 0002_seed.sql     # sample events for development
│       └── 0003_profile_resume.sql  # profile bio/avatar + resume upload + storage buckets
│
├── packages/                 # shared libraries (workspaces @snews/*)
│   ├── config/               # TypeScript base configs used by every package
│   ├── db/                   # DB types + constants (roles, event types, statuses)
│   │   └── src/
│   │       ├── constants.ts  # user roles, event types/modes/statuses, labels
│   │       └── types.ts      # TypeScript types mirroring the SQL schema
│   ├── ai/                   # Modular AI layer (Gemini REST, no heavy SDK)
│   │   └── src/
│   │       ├── client.ts     # generateText / generateJson with retries + validation
│   │       └── classify.ts   # classifyOpportunity → typed event draft + risk score
│   └── ui/                   # Design system components
│       └── src/              # Button, Input, Select, Textarea, Card, Badge,
│                             # Navbar (with user menu), Footer — no UI framework
│
└── apps/
    └── web/                  # the actual website (Next.js 16 App Router)
        └── src/
            ├── middleware.ts           # Edge auth: refresh session + protect
            │                           # /dashboard and /profile
            ├── app/
            │   ├── layout.tsx          # root layout: Navbar (auth-aware) + Footer + SEO
            │   ├── page.tsx            # landing page (public, no login needed)
            │   ├── globals.css         # design tokens (colors) as CSS variables
            │   ├── not-found.tsx       # 404 page
            │   ├── (auth)/             # login, register, forgot-password,
            │   │                        # reset-password, check-email
            │   ├── events/             # events list (search + type filters) + detail
            │   │   └── [slug]/         # event detail: register button, trust info
            │   ├── dashboard/          # protected: my registrations
            │   ├── profile/            # protected: avatar, bio, skills, resume upload
            │   ├── admin/verifications # admin review queue
            │   ├── research/           # research papers (Phase 2)
            │   ├── startups/           # startup ideas (Phase 3)
            │   ├── crewin/             # CrewIn community (Phase 3)
            │   ├── resources/          # internships/funding/legal (Phase 2)
            │   └── support/            # chat support (Phase 4)
            ├── lib/
            │   ├── actions/            # server actions: auth, profile, resume
            │   ├── supabase/
            │   │   ├── client.ts       # browser client (anon key)
            │   │   └── server.ts       # server client (cookies, RLS) + service client
            │   └── utils.ts            # cn, formatDate, slugify, timeUntil
            ├── components/
            │   ├── user-menu.tsx       # navbar avatar + dropdown (profile/dashboard/sign out)
            │   ├── avatar-upload.tsx   # profile photo → Supabase Storage
            │   ├── profile-form.tsx    # edit profile fields
            │   ├── resume-card.tsx     # resume upload/download/remove
            │   └── event-card.tsx      # event card for listings
            └── types/
                └── database.ts         # typed Supabase Database generics
```

---

## How the security model works (important to know)

1. **Row-Level Security (RLS)** is enabled on every table in `0001_init.sql`.
   The database itself refuses access unless a policy allows it — the app code
   can never leak another user's data.
2. The **browser** only ever sees the anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. The **service role key** lives only on the server (`SUPABASE_SERVICE_ROLE_KEY`)
   for cron/admin operations and bypasses RLS on purpose.
4. Events follow the double-check workflow: `pending → ai_reviewed → in_review → live`
   (AI risk score + moderator review) and are only visible publicly when `live`.
5. New auth users get a `profiles` row automatically via the
   `handle_new_user()` trigger.
6. Resumes are stored in a **private** storage bucket — only the owner can
   download them (signed URLs); avatars are public images only.

---

## Setup (Phase 0 — 15 minutes)

1. Create free accounts: GitHub, Vercel, Supabase, Resend, Cloudflare, Google AI Studio (Gemini).
2. `npm install` at the repo root.
3. Create a Supabase project → open **SQL Editor** → paste and run
   `supabase/migrations/0001_init.sql`, then `0002_seed.sql` and `0003_profile_resume.sql`.
4. Copy `.env.example` → `.env.local`, fill in the Supabase URL + keys.
5. `npm run dev` → open http://localhost:3000
6. Deploy: push to GitHub → import repo in Vercel (free) → add env vars → deploy.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | start the web app in development |
| `npm run build` | production build (all packages) |
| `npm run typecheck` | type-check every package |
| `npm run lint` | lint the web app |
| `npm run db:init` | apply the SQL schema to Supabase |
| `npm run check:setup` | verify env keys and DB connection |
