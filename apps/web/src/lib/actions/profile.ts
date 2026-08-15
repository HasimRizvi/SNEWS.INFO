"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100).optional(),
  phone: z
    .string()
    .trim()
    .max(20)
    .transform((v) => v || null)
    .optional(),
  bio: z
    .string()
    .trim()
    .max(500, "Bio must be under 500 characters")
    .transform((v) => v || null)
    .optional(),
  headline: z
    .string()
    .trim()
    .max(120, "Headline must be under 120 characters")
    .transform((v) => v || null)
    .optional(),
  branch: z
    .string()
    .trim()
    .max(100)
    .transform((v) => v || null)
    .optional(),
  year: z.coerce
    .number()
    .int()
    .min(1)
    .max(6)
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  skills: z
    .string()
    .trim()
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20),
    )
    .optional(),
  portfolioUrl: z
    .string()
    .trim()
    .url("Enter a valid URL (https://…)")
    .transform((v) => v || null)
    .optional()
    .or(z.literal("").transform(() => null)),
  avatarUrl: z
    .string()
    .trim()
    .url("Invalid avatar URL")
    .optional()
    .or(z.literal("").transform(() => null)),
});

export type UpdateProfileResult = { error: string } | { ok: true };

export async function updateProfile(
  prevState: UpdateProfileResult | null,
  formData: FormData,
): Promise<UpdateProfileResult> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName") ?? undefined,
    phone: formData.get("phone") ?? undefined,
    bio: formData.get("bio") ?? undefined,
    headline: formData.get("headline") ?? undefined,
    branch: formData.get("branch") ?? undefined,
    year: formData.get("year") || null,
    skills: formData.get("skills") ?? undefined,
    portfolioUrl: formData.get("portfolioUrl") ?? undefined,
    avatarUrl: formData.get("avatarUrl") ?? undefined,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first ? first.message : "Invalid input" };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const profileUpdate: Record<string, unknown> = {};
  if (data.fullName !== undefined) profileUpdate.full_name = data.fullName;
  if (data.phone !== undefined) profileUpdate.phone = data.phone;
  if (data.bio !== undefined) profileUpdate.bio = data.bio;
  if (data.avatarUrl !== undefined) profileUpdate.avatar_url = data.avatarUrl;

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id);
  if (profileError) {
    return { error: friendlyDbError(profileError.message) };
  }

  const studentUpdate: Record<string, unknown> = {};
  if (data.headline !== undefined) studentUpdate.headline = data.headline;
  if (data.branch !== undefined) studentUpdate.branch = data.branch;
  if (data.year !== undefined) studentUpdate.year = data.year;
  if (data.skills !== undefined) studentUpdate.skills = data.skills;
  if (data.portfolioUrl !== undefined) studentUpdate.portfolio_url = data.portfolioUrl;

  if (Object.keys(studentUpdate).length > 0) {
    const { error: studentError } = await supabase
      .from("student_profiles")
      .upsert({ user_id: user.id, ...studentUpdate });
    if (studentError) {
      return { error: friendlyDbError(studentError.message) };
    }
  }

  return { ok: true };
}

export async function updateAvatar(input: { url: string }): Promise<UpdateProfileResult> {
  if (!input.url || !input.url.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")) {
    return { error: "Invalid avatar URL." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase.from("profiles").update({ avatar_url: input.url }).eq("id", user.id);
  if (error) return { error: friendlyDbError(error.message) };
  return { ok: true };
}

export async function saveResume(
  input: { url: string; name: string },
): Promise<UpdateProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (!input.url || !input.name) return { error: "Missing resume details." };

  const { error } = await supabase.from("student_profiles").upsert({
    user_id: user.id,
    resume_url: input.url,
    resume_name: input.name,
  });
  if (error) return { error: friendlyDbError(error.message) };
  return { ok: true };
}

export async function removeResume(): Promise<UpdateProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("resume_url")
    .eq("user_id", user.id)
    .single();

  if (profile?.resume_url) {
    await supabase.storage.from("resumes").remove([profile.resume_url]);
  }

  const { error } = await supabase
    .from("student_profiles")
    .upsert({ user_id: user.id, resume_url: null, resume_name: null });
  if (error) return { error: friendlyDbError(error.message) };
  return { ok: true };
}

function friendlyDbError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("row-level security") || lower.includes("new row violates")) {
    return "You can only edit your own profile.";
  }
  if (lower.includes("violates not-null")) {
    return "Some required fields are missing.";
  }
  return message;
}
