"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@snews/ui";
import { USER_ROLES } from "@snews/db";
import { registerAction, type AuthResult } from "@/lib/actions/auth";

const initialState: AuthResult | null = null;

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  college: "College / Institution",
  organizer: "Event Organizer",
};

export function RegisterForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(registerAction, initialState);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.push("/check-email");
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
      <Input id="fullName" name="fullName" label="Full name" autoComplete="name" required placeholder="Ananya Sharma" />
      <Input id="email" name="email" type="email" label="Email address" autoComplete="email" required placeholder="you@college.edu" />
      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        required
        hint="At least 8 characters."
        placeholder="••••••••"
      />
      <Select id="role" name="role" label="I am a" defaultValue="student">
        {USER_ROLES.filter((role) => role !== "admin").map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role] ?? role}
          </option>
        ))}
      </Select>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Create account
      </Button>
    </form>
  );
}
