"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { EVENT_MODE, EVENT_TYPES } from "@snews/db";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { reviewEventWithAI } from "@/lib/services/event-review";

const eventSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().trim().min(50, "Description must be at least 50 characters").max(10000),
  type: z.enum(EVENT_TYPES),
  mode: z.enum(EVENT_MODE).default("online"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  applicationDeadline: z.coerce.date().optional(),
  venue: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  maxSeats: z.coerce.number().int().positive().max(100000).optional(),
  prizePool: z.string().trim().max(200).optional(),
  eligibility: z.string().trim().max(2000).optional(),
  sourceUrl: z.string().trim().url("Enter a valid source URL").optional().or(z.literal("")),
  tags: z.string().trim().max(400).optional(),
});

export type EventResult = { error: string } | { ok: true };

/**
 * Organizer submits a new event. The event enters the verification pipeline:
 * pending → rule checks + AI risk score → ai_reviewed → moderator → live.
 */
export async function submitEventAction(
  prevState: EventResult | null,
  formData: FormData,
): Promise<EventResult> {
  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    mode: formData.get("mode") ?? "online",
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    applicationDeadline: formData.get("applicationDeadline") || undefined,
    venue: formData.get("venue") || undefined,
    city: formData.get("city") || undefined,
    maxSeats: formData.get("maxSeats") || undefined,
    prizePool: formData.get("prizePool") || undefined,
    eligibility: formData.get("eligibility") || undefined,
    sourceUrl: formData.get("sourceUrl") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to post an event." };
  }

  const data = parsed.data;
  const slug = `${slugify(data.title)}-${Date.now().toString(36).slice(-6)}`;
  const tags = (data.tags ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      title: data.title,
      slug,
      description: data.description,
      type: data.type,
      mode: data.mode,
      status: "pending",
      organizer_id: user.id,
      source_url: data.sourceUrl || null,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate?.toISOString() ?? null,
      application_deadline: data.applicationDeadline?.toISOString() ?? null,
      venue: data.venue ?? null,
      city: data.city ?? null,
      max_seats: data.maxSeats ?? null,
      prize_pool: data.prizePool ?? null,
      eligibility: data.eligibility ?? null,
      tags,
    })
    .select("id, title")
    .single();

  if (error || !event) {
    return { error: "Could not save the event. Please try again." };
  }

  await processVerification(event.id, {
    title: data.title,
    description: data.description,
    sourceUrl: data.sourceUrl ?? null,
    startDate: data.startDate.toISOString(),
  });

  redirect(`/events/${slug}?submitted=1`);
}

/**
 * Runs rule checks + AI risk scoring for a submitted event.
 * Never a single point of failure: if the AI layer fails or no API key
 * is configured, the event still enters the manual review queue.
 */
async function processVerification(
  eventId: string,
  input: { title: string; description: string; sourceUrl: string | null; startDate: string },
) {
  const checksPassed: string[] = [];

  if (input.title.length >= 5) checksPassed.push("title");
  if (input.description.length >= 50) checksPassed.push("description");
  if (input.sourceUrl) checksPassed.push("source");
  if (new Date(input.startDate).getTime() > Date.now()) checksPassed.push("date_in_future");

  let aiRiskScore: number | null = null;
  let aiNotes = "AI review skipped — manual review required.";

  try {
    const review = await reviewEventWithAI(`${input.title}\n\n${input.description}`);
    if (review) {
      aiRiskScore = review.riskScore;
      aiNotes = review.notes;
      if (!review.isLikelyLegitimate) {
        checksPassed.push("ai_flag");
      }
    }
  } catch {
    aiNotes = "AI review failed — manual review required.";
  }

  const supabase = createServiceClient();
  await supabase.from("verifications").insert({
    event_id: eventId,
    checks_passed: checksPassed,
    ai_risk_score: aiRiskScore,
    ai_review_notes: aiNotes,
    result: "needs_changes",
  });

  await supabase
    .from("events")
    .update({ status: "ai_reviewed" })
    .eq("id", eventId);
}

/**
 * Admin approves an event → it goes live immediately (visible to everyone).
 */
export async function approveEventAction(eventId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return { error: "Only admins can approve events." };
  }

  const service = createServiceClient();
  await service
    .from("verifications")
    .update({
      result: "approved",
      reviewer_id: (await supabase.auth.getUser()).data.user!.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("event_id", eventId)
    .eq("result", "needs_changes");

  const { error } = await service
    .from("events")
    .update({ status: "live", last_verified_at: new Date().toISOString() })
    .eq("id", eventId);

  if (error) {
    return { error: "Could not approve the event." };
  }

  await service.from("audit_logs").insert({
    actor_id: (await supabase.auth.getUser()).data.user!.id,
    action: "event.approved",
    entity_type: "event",
    entity_id: eventId,
  });

  revalidatePath("/events");
  revalidatePath(`/admin/verifications`);
  return {};
}

/**
 * Admin rejects an event — it never becomes visible to students.
 */
export async function rejectEventAction(eventId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return { error: "Only admins can reject events." };
  }

  const service = createServiceClient();
  const { error } = await service.from("events").update({ status: "rejected" }).eq("id", eventId);

  if (error) {
    return { error: "Could not reject the event." };
  }

  await service
    .from("verifications")
    .update({
      result: "rejected",
      reviewer_id: (await supabase.auth.getUser()).data.user!.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("event_id", eventId)
    .eq("result", "needs_changes");

  await service.from("audit_logs").insert({
    actor_id: (await supabase.auth.getUser()).data.user!.id,
    action: "event.rejected",
    entity_type: "event",
    entity_id: eventId,
  });

  revalidatePath("/admin/verifications");
  return {};
}
