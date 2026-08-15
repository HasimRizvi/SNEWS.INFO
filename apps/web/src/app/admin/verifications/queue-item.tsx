"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@snews/ui";
import { approveEventAction, rejectEventAction } from "@/lib/actions/events";

export function QueueItem({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      const result = await approveEventAction(eventId);
      if (result.error) {
        alert(result.error);
      }
      router.refresh();
    });
  }

  function reject() {
    startTransition(async () => {
      const result = await rejectEventAction(eventId);
      if (result.error) {
        alert(result.error);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex shrink-0 gap-2">
      <Button size="sm" variant="success" loading={pending} onClick={approve} disabled={pending}>
        Approve & publish
      </Button>
      <Button size="sm" variant="danger" onClick={reject} disabled={pending}>
        Reject
      </Button>
    </div>
  );
}
