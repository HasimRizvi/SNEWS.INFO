"use client";

import { useActionState } from "react";
import { Button, Input, Select, Textarea } from "@snews/ui";
import { EVENT_MODE, EVENT_TYPES, EVENT_TYPE_LABELS } from "@snews/db";
import { submitEventAction, type EventResult } from "@/lib/actions/events";

const initialState: EventResult | null = null;

export function SubmitEventForm() {
  const [state, action, pending] = useActionState(submitEventAction, initialState);

  return (
    <form action={action} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-card">
      {state && "error" in state ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input id="title" name="title" label="Event title" required placeholder="National AI Hackathon 2026" />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            id="description"
            name="description"
            label="Description"
            required
            hint="At least 50 characters — what participants will do, what they gain, schedule highlights."
            placeholder="Describe the event, problem statements, judging criteria and what participants build…"
          />
        </div>
        <Select id="type" name="type" label="Category" defaultValue="hackathon" required>
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {EVENT_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
        <Select id="mode" name="mode" label="Mode" defaultValue="online" required>
          {EVENT_MODE.map((mode) => (
            <option key={mode} value={mode}>
              {mode === "online" ? "Online" : mode === "offline" ? "Offline" : "Hybrid"}
            </option>
          ))}
        </Select>
        <Input id="startDate" name="startDate" type="datetime-local" label="Starts at" required />
        <Input id="endDate" name="endDate" type="datetime-local" label="Ends at" />
        <Input id="applicationDeadline" name="applicationDeadline" type="datetime-local" label="Registration deadline" />
        <Input id="venue" name="venue" label="Venue (if offline)" placeholder="College auditorium, Building C" />
        <Input id="city" name="city" label="City" placeholder="Pune" />
        <Input id="maxSeats" name="maxSeats" type="number" min={1} label="Max seats" placeholder="200" />
        <Input id="prizePool" name="prizePool" label="Prize pool" placeholder="₹50,000 + internships" />
        <div className="sm:col-span-2">
          <Textarea id="eligibility" name="eligibility" label="Eligibility" placeholder="Open to all college students…" />
        </div>
        <div className="sm:col-span-2">
          <Input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            label="Official source URL"
            hint="A link to the official event page, brochure or announcement — helps our verification."
            placeholder="https://example.com/hackathon"
          />
        </div>
        <div className="sm:col-span-2">
          <Input id="tags" name="tags" label="Tags" hint="Comma-separated, max 8 — e.g. AI, Web Dev, Beginner friendly" placeholder="AI, Web Dev, Beginner friendly" />
        </div>
      </div>

      <div className="rounded-lg bg-[var(--surface)] p-4 text-sm leading-relaxed text-muted">
        <p className="font-semibold text-[var(--ink)]">What happens next</p>
        <p className="mt-1">
          Submit → rule checks + AI risk score → moderator review → live. Status stays
          <span className="font-medium text-[var(--accent-dark)]"> pending </span>
          until approved; you&apos;ll see it in your submissions.
        </p>
      </div>

      <Button type="submit" size="lg" loading={pending} className="w-full">
        Submit for verification
      </Button>
    </form>
  );
}
