import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmitEventForm } from "./submit-event-form";

export const metadata: Metadata = {
  title: "Post an event",
  description:
    "Submit a hackathon, competition, session or internship — it is verified before going live.",
};

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/events/new");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--navy)]">Post an event</h1>
        <p className="mt-2 text-muted">
          Your event goes through our double-check process: rule checks + AI risk score, then a
          moderator approval — only verified events reach students.
        </p>
      </div>
      <SubmitEventForm />
    </div>
  );
}
