import Link from "next/link";
import { Badge } from "@snews/ui";
import { EVENT_TYPES, EVENT_TYPE_LABELS } from "@snews/db";

const PILLARS = [
  {
    title: "Hackathons & competitions",
    description: "Verified national and college-level hackathons with source links and deadlines.",
  },
  {
    title: "Internships & opportunities",
    description: "Internships and freelance gigs linked to official company pages only.",
  },
  {
    title: "Research paper library",
    description: "New and reference papers, searchable by category, with AI summaries.",
  },
  {
    title: "Startup ideas",
    description: "Pitch your idea, discover co-founders and upvote the best ones.",
  },
  {
    title: "CrewIn community",
    description: "Grow-together circles: skill groups, college chapters and startup crews.",
  },
  {
    title: "Funding & legal support",
    description: "Verified grants, scholarships and legal help resources for students.",
  },
] as const;

const PROCESS_STEPS = [
  { step: "01", title: "Discover", text: "Browse a verified feed — every listing has a source and last-checked date." },
  { step: "02", title: "Verify", text: "Events pass an AI risk score + moderator review before going live." },
  { step: "03", title: "Register", text: "Sign in once, register in seconds with identity verification." },
  { step: "04", title: "Grow", text: "Join CrewIn, find teammates, publish research and launch startups." },
] as const;

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--navy)]">
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="teal">Student Opportunity & Innovation Network</Badge>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              One home for every
              <span className="text-[var(--accent)]"> opportunity</span> you deserve.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              Hackathons, internships, research papers, startup ideas and a community that grows
              together — all verified, all in one professional place. Free for every student.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/events"
                className="rounded-lg bg-[var(--accent)] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
              >
                Explore events
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-white/25 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Join free
              </Link>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["12+", "opportunity categories"],
                ["100%", "free for students"],
                ["2-step", "verification on every event"],
                ["1", "trusted home"],
              ].map(([big, small]) => (
                <div key={small} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-extrabold text-white">{big}</p>
                  <p className="mt-1 text-xs text-slate-400">{small}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--navy)]">
            Twelve ways to engage
          </h2>
          <p className="mt-3 text-muted">
            Everything a student needs to compete, build and get discovered.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <Link
              key={pillar.title}
              href="/events"
              className="group rounded-xl border border-[var(--border)] bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:border-[var(--accent)]/40 hover:shadow-lg"
            >
              <span className="text-sm font-black text-[var(--accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-bold text-[var(--navy)]">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--navy)]">
              How SNEWS works
            </h2>
            <p className="mt-3 text-muted">
              A clear path from discovering an opportunity to growing with it.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {PROCESS_STEPS.map((p) => (
              <div key={p.step} className="relative rounded-xl bg-white p-6 shadow-card">
                <span className="text-3xl font-black text-[var(--accent)]/25">{p.step}</span>
                <h3 className="mt-2 text-lg font-bold text-[var(--navy)]">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--navy)]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your next big opportunity is already here.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Join thousands of students competing, building and launching from one verified platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-[var(--accent)] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
            >
              Create your account
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/25 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {EVENT_TYPES.slice(0, 6).map((type) => (
              <Badge key={type} variant="teal">
                {EVENT_TYPE_LABELS[type]}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
