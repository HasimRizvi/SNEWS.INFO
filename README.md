# SNEWS.INFO — Student Opportunity & Innovation Network

One trusted platform where students discover verified hackathons, internships, research
papers, startup ideas, communities (CrewIn), funding and more. 100% free stack.

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
│       └── 0001_init.sql     # ENTIRE database: tables, enums, triggers, RLS policies
│                             # Run this once in the Supabase SQL editor.
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
│                             # Navbar, Footer — professional look, no UI framework
│
└── apps/
    └── web/                  # the actual website (Next.js 15 App Router)
        └── src/
            ├── middleware.ts           # Edge auth: refresh session + protect /dashboard
            ├── app/
            │   ├── layout.tsx          # root layout: Navbar + Footer + metadata/SEO
            │   ├── page.tsx            # landing page (public, no login needed)
            │   ├── globals.css         # design tokens (colors) as CSS variables
            │   ├── not-found.tsx       # 404 page
            │   ├── (auth)/             # login, register, forgot-password,
            │   │                        # reset-password, check-email
            │   ├── events/             # events list (search + type filters) + detail
            │   │   └── [slug]/         # event detail: register button, trust info
            │   ├── dashboard/          # protected: my registrations
            │   ├── research/           # research papers (Phase 2)
            │   ├── startups/           # startup ideas (Phase 3)
            │   ├── crewin/             # CrewIn community (Phase 3)
            │   ├── resources/          # internships/funding/legal (Phase 2)
            │   └── support/            # chat support (Phase 4)
            ├── lib/
            │   ├── actions/auth.ts     # server actions: login/register/forgot/reset
            │   ├── supabase/
            │   │   ├── client.ts       # browser client (anon key)
            │   │   └── server.ts       # server client (cookies, RLS) + service client
            │   └── utils.ts            # cn, formatDate, slugify, timeUntil
            ├── components/
            │   ├── event-card.tsx      # event card for listings
            │   └── coming-soon.tsx     # placeholder for upcoming modules
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

---

## Setup (Phase 0 — 15 minutes)

1. Create free accounts: GitHub, Vercel, Supabase, Resend, Cloudflare, Google AI Studio (Gemini).
2. `npm install` at the repo root.
3. Create a Supabase project → open **SQL Editor** → paste and run
   `supabase/migrations/0001_init.sql`.
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
