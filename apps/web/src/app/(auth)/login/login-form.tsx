"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@snews/ui";
import { loginAction, type AuthResult } from "@/lib/actions/auth";

const initialState: AuthResult | null = null;

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.push(redirectTo);
      router.refresh();
    }
  }, [state, router, redirectTo]);

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-card">
      <input type="hidden" name="redirect" value={redirectTo} />
      {state && "error" in state ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <Input id="email" name="email" type="email" label="Email address" autoComplete="email" required placeholder="you@college.edu" />
      <Input id="password" name="password" type="password" label="Password" autoComplete="current-password" required placeholder="••••••••" />
      <div className="flex items-center justify-between text-sm">
        <a href="/forgot-password" className="font-medium text-[var(--accent)] hover:underline">
          Forgot password?
        </a>
      </div>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
