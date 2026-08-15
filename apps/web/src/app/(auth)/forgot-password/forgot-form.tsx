"use client";

import { useActionState } from "react";
import { Button, Input } from "@snews/ui";
import { forgotPasswordAction, type AuthResult } from "@/lib/actions/auth";

const initialState: AuthResult | null = null;

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-card">
      {state && "ok" in state && state.ok ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status">
          If that email exists, a reset link is on its way. Check your inbox.
        </p>
      ) : null}
      {state && "error" in state ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <Input id="email" name="email" type="email" label="Email address" autoComplete="email" required placeholder="you@college.edu" />
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
