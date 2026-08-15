"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@snews/ui";
import { resetPasswordAction, type AuthResult } from "@/lib/actions/auth";

const initialState: AuthResult | null = null;

export function ResetPasswordForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.push("/login");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-card">
      {state && "error" in state ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <Input
        id="password"
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        required
        placeholder="••••••••"
      />
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Save new password
      </Button>
    </form>
  );
}
