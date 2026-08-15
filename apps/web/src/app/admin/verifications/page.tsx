import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge, Card, CardBody, CardHeader } from "@snews/ui";
import { createClient } from "@/lib/supabase/server";
import { EVENT_TYPE_LABELS, type EventType } from "@snews/db";
import { formatDate } from "@/lib/utils";
import { QueueItem } from "./queue-item";

export const metadata: Metadata = {
  title: "Verification queue",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function VerificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    notFound();
  }

  const { data: events, error } = await supabase
    .from("events")
    .select("*, verifications(*)")
    .in("status", ["pending", "ai_reviewed", "in_review"])
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--navy)]">
          Verification queue
        </h1>
        <p className="mt-2 text-muted">
          Every event must pass your review before it goes live to students.
        </p>
      </div>

      {error || events.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center">
            <p className="text-lg font-semibold text-[var(--navy)]">Queue is empty 🎉</p>
            <p className="mt-1 text-sm text-muted">New submissions will appear here.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const verification = event.verifications?.[0] as
              | { ai_risk_score: number | null; ai_review_notes: string | null; checks_passed: string[] }
              | undefined;

            return (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={event.status === "ai_reviewed" ? "warning" : "neutral"}>
                          {event.status}
                        </Badge>
                        <Badge variant="teal">
                          {EVENT_TYPE_LABELS[event.type as EventType] ?? event.type}
                        </Badge>
                        {verification?.ai_risk_score !== null && verification?.ai_risk_score !== undefined ? (
                          <Badge variant={verification.ai_risk_score < 30 ? "success" : "danger"}>
                            AI risk {verification.ai_risk_score}/100
                          </Badge>
                        ) : (
                          <Badge variant="neutral">No AI review</Badge>
                        )}
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-[var(--navy)]">{event.title}</h2>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(event.start_date)} · submitted {formatDate(event.created_at)} ·{" "}
                        {event.organizer_id ? `by ${event.organizer_id.slice(0, 8)}…` : "no organizer"}
                      </p>
                    </div>
                    <QueueItem eventId={event.id} />
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="line-clamp-3 text-sm leading-relaxed text-[var(--ink)]">
                    {event.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {verification?.checks_passed?.map((check) => (
                      <Badge key={check} variant="success">
                        ✓ {check}
                      </Badge>
                    ))}
                  </div>
                  {verification?.ai_review_notes ? (
                    <p className="mt-3 rounded-lg bg-[var(--surface)] px-4 py-3 text-xs leading-relaxed text-muted">
                      🤖 {verification.ai_review_notes}
                    </p>
                  ) : null}
                  {event.source_url ? (
                    <a
                      href={event.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
                    >
                      Open source link →
                    </a>
                  ) : null}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
