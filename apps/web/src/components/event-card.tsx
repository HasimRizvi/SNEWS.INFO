import Link from "next/link";
import { Badge } from "@snews/ui";
import { EVENT_TYPE_LABELS, type EventType } from "@snews/db";
import { formatDate, timeUntil } from "@/lib/utils";
import type { Database } from "@/types/database";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export function EventCard({ event, now }: { event: EventRow; now: number }) {
  const label = EVENT_TYPE_LABELS[event.type as EventType] ?? event.type;
  const expired = event.application_deadline
    ? new Date(event.application_deadline).getTime() < now
    : false;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col rounded-xl border border-[var(--border)] bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:border-[var(--accent)]/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge variant={expired ? "neutral" : "teal"}>{label}</Badge>
        <span className="text-xs font-semibold text-[var(--accent)]">
          {event.is_ai_sourced ? "AI sourced" : "Verified"}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold leading-snug text-[var(--navy)] group-hover:text-[var(--accent-dark)]">
        {event.title}
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
        {event.description}
      </p>
      <div className="mt-5 space-y-1.5 border-t border-[var(--border)] pt-4 text-xs text-muted">
        <p>
          📅 <span className="font-medium text-[var(--ink)]">{formatDate(event.start_date)}</span>
          {event.city ? (
            <>
              {" "}
              · 📍 <span className="font-medium text-[var(--ink)]">{event.city}</span>
            </>
          ) : null}
        </p>
        <p className="font-semibold text-[var(--accent)]">
          {event.application_deadline ? timeUntil(event.application_deadline, now) : "Open"}
        </p>
      </div>
    </Link>
  );
}
