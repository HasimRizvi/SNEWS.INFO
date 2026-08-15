import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/event-card";
import { EVENT_TYPES, EVENT_TYPE_LABELS } from "@snews/db";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Verified hackathons, competitions, sessions, internships and more — double-checked before they go live.",
};

export const revalidate = 60;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "live")
    .order("start_date", { ascending: true });

  if (params.type && EVENT_TYPES.includes(params.type as (typeof EVENT_TYPES)[number])) {
    query = query.eq("type", params.type);
  }

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }

  const { data: events, error } = await query.limit(50);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--navy)]">Something went wrong</h1>
        <p className="mt-2 text-muted">Could not load events right now. Please try again later.</p>
      </div>
    );
  }

  const now = Date.now();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--navy)]">Events</h1>
        <p className="mt-2 text-muted">
          Every event below passed an AI risk check and a human review before going live.
        </p>
      </div>

      <form className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search events…"
          className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-4 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Link
            href="/events"
            className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
              !params.type
                ? "bg-[var(--navy)] text-white"
                : "bg-[var(--surface)] text-muted hover:bg-[var(--border)]"
            }`}
          >
            All
          </Link>
          {EVENT_TYPES.map((type) => (
            <Link
              key={type}
              href={`/events?type=${type}`}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                params.type === type
                  ? "bg-[var(--navy)] text-white"
                  : "bg-[var(--surface)] text-muted hover:bg-[var(--border)]"
              }`}
            >
              {EVENT_TYPE_LABELS[type]}
            </Link>
          ))}
        </div>
      </form>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-20 text-center">
          <p className="text-lg font-semibold text-[var(--navy)]">No events found</p>
          <p className="mt-1 text-sm text-muted">Try a different filter — new events are added daily.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}
