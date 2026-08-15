import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, CardBody, CardHeader } from "@snews/ui";
import { EVENT_TYPE_LABELS, type EventType } from "@snews/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("*, events(*)")
    .eq("user_id", user.id)
    .order("registered_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--navy)]">
        Hello, {profile?.full_name?.split(" ")[0] ?? "student"}
      </h1>
      <p className="mt-2 text-muted">Here&apos;s everything you&apos;re registered for.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {[
          [String(registrations?.length ?? 0), "Event registrations"],
          [String(profile?.is_verified ? "Verified" : "Pending"), "Account status"],
          ["0", "Saved opportunities"],
        ].map(([big, small]) => (
          <Card key={small}>
            <CardBody>
              <p className="text-2xl font-extrabold text-[var(--navy)]">{big}</p>
              <p className="mt-1 text-sm text-muted">{small}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-bold text-[var(--navy)]">Your registrations</h2>
      <div className="mt-4 space-y-3">
        {registrations?.length === 0 ? (
          <Card>
            <CardBody className="text-center py-8">
              <p className="font-semibold text-[var(--navy)]">No registrations yet</p>
              <p className="mt-1 text-sm text-muted">
                Browse events and register — everything shows up here.
              </p>
            </CardBody>
          </Card>
        ) : (
          registrations?.map((reg) => {
            const event = reg.events as unknown as {
              title: string;
              type: string;
              start_date: string;
              status: string;
            } | null;
            if (!event) return null;
            return (
              <Card key={reg.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-[var(--navy)]">{event.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {EVENT_TYPE_LABELS[event.type as EventType] ?? event.type} ·{" "}
                        {formatDate(event.start_date)}
                      </p>
                    </div>
                    <Badge variant={reg.status === "confirmed" ? "success" : "warning"}>
                      {reg.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
