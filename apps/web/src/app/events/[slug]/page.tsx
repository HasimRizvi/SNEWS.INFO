import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card, CardBody, CardHeader } from "@snews/ui";
import { createClient } from "@/lib/supabase/server";
import { EVENT_TYPE_LABELS, type EventType } from "@snews/db";
import { formatDate } from "@/lib/utils";
import { RegisterButton } from "./register-button";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) };
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { slug } = await params;
  const { submitted } = await searchParams;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .in("status", ["live", "completed", "stale"])
    .single();

  if (error || !event) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isOwnerOrAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isOwnerOrAdmin = profile?.role === "admin" || event.organizer_id === user.id;
  }

  let alreadyRegistered = false;
  if (user) {
    const { data: existing } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .maybeSingle();
    alreadyRegistered = Boolean(existing);
  }

  const expired =
    event.application_deadline && new Date(event.application_deadline).getTime() < Date.now();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {submitted ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-amber-800">
            ✅ Event submitted for verification
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Our team will review it and publish it as soon as it passes. You&apos;ll see its status
            here when signed in.
          </p>
        </div>
      ) : null}
      <Link href="/events" className="text-sm font-semibold text-[var(--accent)] hover:underline">
        ← All events
      </Link>

      {isOwnerOrAdmin && event.status !== "live" ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800">
            This event is {event.status.replace(/-/g, " ")} — only you can see this page right now.
            It becomes public once approved.
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Badge variant="teal">{EVENT_TYPE_LABELS[event.type as EventType] ?? event.type}</Badge>
        <Badge variant={event.mode === "online" ? "navy" : "accent"}>
          {event.mode === "online" ? "Online" : event.mode === "hybrid" ? "Hybrid" : "Offline"}
        </Badge>
        {event.is_ai_sourced ? <Badge variant="neutral">AI sourced</Badge> : null}
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--navy)] sm:text-4xl">
        {event.title}
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-[var(--navy)]">About this event</h2>
            </CardHeader>
            <CardBody>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ink)]">
                {event.description}
              </p>
              {event.eligibility ? (
                <div className="mt-5 rounded-lg bg-[var(--surface)] p-4">
                  <h3 className="text-sm font-bold text-[var(--navy)]">Eligibility</h3>
                  <p className="mt-1 text-sm text-[var(--ink)]">{event.eligibility}</p>
                </div>
              ) : null}
              {event.tags.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="neutral">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-[var(--navy)]">Trust & verification</h2>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2 text-sm text-[var(--ink)]">
                <li>
                  <span className="font-semibold text-[var(--teal-dark)]">✓</span> Passed AI risk
                  check and moderator review
                </li>
                <li>
                  <span className="font-semibold text-[var(--teal-dark)]">✓</span>{" "}
                  {event.last_verified_at
                    ? `Last verified ${formatDate(event.last_verified_at)}`
                    : "Verified on publish"}
                </li>
                {event.source_url ? (
                  <li>
                    <span className="font-semibold text-[var(--teal-dark)]">✓</span>{" "}
                    <a
                      href={event.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline"
                    >
                      Official source link
                    </a>
                  </li>
                ) : null}
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="lg:sticky lg:top-24">
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Registrations</span>
                <span className="text-lg font-extrabold text-[var(--navy)]">
                  {event.max_seats ? `${event.max_seats} seats` : "Open"}
                </span>
              </div>
              <div className="border-t border-[var(--border)] pt-4 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-muted">Starts</span>
                  <span className="font-semibold text-[var(--ink)]">{formatDate(event.start_date)}</span>
                </div>
                {event.end_date ? (
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Ends</span>
                    <span className="font-semibold text-[var(--ink)]">{formatDate(event.end_date)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between py-1">
                  <span className="text-muted">Deadline</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {event.application_deadline ? formatDate(event.application_deadline) : "—"}
                  </span>
                </div>
                {event.venue ? (
                  <div className="flex justify-between gap-3 py-1">
                    <span className="text-muted">Venue</span>
                    <span className="text-right font-semibold text-[var(--ink)]">{event.venue}</span>
                  </div>
                ) : null}
                {event.prize_pool ? (
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Prize pool</span>
                    <span className="font-semibold text-[var(--accent-dark)]">{event.prize_pool}</span>
                  </div>
                ) : null}
              </div>

              {alreadyRegistered ? (
                <Button variant="secondary" size="lg" className="w-full" disabled>
                  You&apos;re registered ✓
                </Button>
              ) : expired || event.status !== "live" ? (
                <Button variant="outline" size="lg" className="w-full" disabled>
                  Registration closed
                </Button>
              ) : (
                <RegisterButton eventId={event.id} slug={event.slug} requiresLogin={!user} />
              )}

              <p className="text-center text-xs text-muted">
                {user
                  ? "Registration is instant and tracked in your dashboard."
                  : "You'll be asked to sign in when you register."}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
