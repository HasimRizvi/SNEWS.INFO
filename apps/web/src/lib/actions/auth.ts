"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { USER_ROLES } from "@snews/db";
import type { UserRole } from "@snews/db";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  role: z.enum(USER_ROLES as unknown as [UserRole, ...UserRole[]]).default("student"),
});

const forgotSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export type AuthResult = { error: string } | { ok: true };

type AuthErrorLike = {
  message?: string;
  status?: number | string;
  code?: string;
};

function friendlyAuthError(err: AuthErrorLike | null): string | null {
  if (!err) return null;
  const status = String(err.status ?? "");
  const message = err.message ?? "";
  const lower = message.toLowerCase();

  if (status === "429" || lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts from this device. Supabase limits signups per IP for ~1 hour — please wait and try again.";
  }
  if (lower.includes("invalid login credentials") || lower.includes("invalid email or password")) {
    return "Incorrect email or password. Try again.";
  }
  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return "Your email is not confirmed yet. Click the confirmation link we sent you (check spam too), or turn off 'Confirm email' in Supabase → Authentication → Email.";
  }
  if (lower.includes("already registered") || lower.includes("already exists") || lower.includes("user_already_exists")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (lower.includes("user not found")) {
    return "No account found with this email.";
  }
  if (lower.includes("database error saving new user")) {
    return "Signup succeeded, but the profile setup failed. Contact the team (check the 'handle_new_user' trigger in your SQL).";
  }
  if (status === "403" || status === "400" && lower.includes("signup")) {
    return "Signups are restricted on this project. Enable them in Supabase → Authentication → Providers → Email.";
  }
  return message;
}

export async function loginAction(prevState: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: friendlyAuthError(error) ?? "Incorrect email or password. Try again." };
  }

  const redirectTo = formData.get("redirect")?.toString() ?? "/dashboard";
  const safeRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard";
  redirect(safeRedirect);
}

export async function registerAction(prevState: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "student",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    },
  });

  if (error) {
    return { error: friendlyAuthError(error) ?? "Could not create your account. Try again." };
  }

  return { ok: true };
}

export async function forgotPasswordAction(
  prevState: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function resetPasswordAction(
  prevState: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const password = formData.get("password")?.toString() ?? "";
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}
