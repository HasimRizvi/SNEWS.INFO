"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@snews/ui";
import { createClient } from "@/lib/supabase/client";

export function RegisterButton({
  eventId,
  slug,
  requiresLogin,
}: {
  eventId: string;
  slug: string;
  requiresLogin: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/events/${slug}`)}`);
      return;
    }

    const { error: regError } = await supabase
      .from("event_registrations")
      .insert({ event_id: eventId, user_id: user.id, status: "pending" });

    if (regError) {
      if (regError.code === "23505") {
        setError("You are already registered for this event.");
      } else {
        setError("Could not register right now. Please try again.");
      }
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button size="lg" className="w-full" loading={loading} onClick={handleRegister}>
        {requiresLogin ? "Sign in to register" : "Register now"}
      </Button>
      {error ? <p className="text-center text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
