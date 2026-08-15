"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Textarea } from "@snews/ui";
import { updateProfile, type UpdateProfileResult } from "@/lib/actions/profile";

const initialState: UpdateProfileResult | null = null;

export interface ProfileFormData {
  fullName: string;
  phone: string;
  bio: string;
  headline: string;
  branch: string;
  year: number | null;
  skills: string[];
  portfolioUrl: string;
  avatarUrl: string;
}

export function ProfileForm({ profile }: { profile: ProfileFormData }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateProfile, initialState);

  const saved = state && "ok" in state && state.ok;

  return (
    <form action={action} className="space-y-5">
      {saved ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status">
          Profile saved.
        </p>
      ) : null}
      {state && "error" in state ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="fullName"
          name="fullName"
          label="Full name"
          defaultValue={profile.fullName}
          required
        />
        <Input
          id="headline"
          name="headline"
          label="Headline"
          placeholder="e.g. BCA student · Web dev · Hackathon hunter"
          hint="One line that describes you (max 120 chars)."
          defaultValue={profile.headline}
        />
      </div>

      <Input
        id="phone"
        name="phone"
        label="Phone"
        type="tel"
        placeholder="+91 98765 43210"
        defaultValue={profile.phone}
      />

      <Textarea
        id="bio"
        name="bio"
        label="About you"
        placeholder="A short introduction — what you study, what you build, what you're looking for."
        hint="Max 500 characters."
        defaultValue={profile.bio}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Input
          id="branch"
          name="branch"
          label="Branch / Course"
          placeholder="BCA, CSE, MBA…"
          defaultValue={profile.branch}
        />
        <Select id="year" name="year" label="Year" defaultValue={profile.year?.toString() ?? ""}>
          <option value="">Not studying yet</option>
          {[1, 2, 3, 4, 5, 6].map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </Select>
        <Input
          id="skills"
          name="skills"
          label="Skills"
          placeholder="Python, Figma, Public speaking…"
          hint="Comma-separated (max 20)."
          defaultValue={profile.skills.join(", ")}
        />
      </div>

      <Input
        id="portfolioUrl"
        name="portfolioUrl"
        label="Portfolio / LinkedIn URL"
        type="url"
        placeholder="https://linkedin.com/in/you"
        defaultValue={profile.portfolioUrl}
      />

      <input type="hidden" name="avatarUrl" value={profile.avatarUrl ?? ""} />

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" loading={pending}>
          Save profile
        </Button>
        {saved ? (
          <button
            type="button"
            onClick={() => router.refresh()}
            className="text-sm font-semibold text-[var(--accent-dark)] hover:underline"
          >
            View updated profile
          </button>
        ) : null}
      </div>
    </form>
  );
}
