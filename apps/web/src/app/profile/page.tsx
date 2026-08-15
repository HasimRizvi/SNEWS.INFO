import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, CardBody, CardHeader } from "@snews/ui";
import { USER_ROLE_LABELS } from "@snews/db";
import { formatDate } from "@/lib/utils";
import { AvatarUpload } from "@/components/avatar-upload";
import { ProfileForm, type ProfileFormData } from "@/components/profile-form";
import { ResumeCard } from "@/components/resume-card";

export const metadata: Metadata = {
  title: "My profile",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profile }, { data: student }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("student_profiles").select("*").eq("user_id", user.id).single(),
  ]);

  let resumeDownloadUrl: string | null = null;
  if (student?.resume_url) {
    const { data: signed } = await supabase.storage
      .from("resumes")
      .createSignedUrl(student.resume_url, 3600);
    resumeDownloadUrl = signed?.signedUrl ?? null;
  }

  const fullName = profile?.full_name ?? null;
  const email = profile?.email ?? user.email ?? "";

  const formData: ProfileFormData = {
    fullName: fullName ?? "",
    phone: profile?.phone ?? "",
    bio: profile?.bio ?? "",
    headline: student?.headline ?? "",
    branch: student?.branch ?? "",
    year: student?.year ?? null,
    skills: student?.skills ?? [],
    portfolioUrl: student?.portfolio_url ?? "",
    avatarUrl: profile?.avatar_url ?? "",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--navy)]">My profile</h1>
          <p className="mt-1 text-sm text-muted">
            How you appear on SNEWS — keep it up to date, it travels with every registration.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-[var(--accent-dark)] transition-colors hover:text-[var(--accent)]"
        >
          ← Back to dashboard
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardBody className="flex flex-col items-center gap-3 py-6">
              <AvatarUpload
                userId={user.id}
                avatarUrl={profile?.avatar_url ?? null}
                fullName={fullName}
                email={email}
              />
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--navy)]">{fullName ?? "Student"}</p>
                <p className="text-sm text-[var(--muted)]">{email}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge variant="navy">{USER_ROLE_LABELS[profile?.role as keyof typeof USER_ROLE_LABELS] ?? profile?.role ?? "Student"}</Badge>
                <Badge variant={profile?.is_verified ? "success" : "warning"}>
                  {profile?.is_verified ? "Verified" : "Verification pending"}
                </Badge>
              </div>
              {profile?.phone ? (
                <p className="text-sm text-[var(--muted)]">{profile.phone}</p>
              ) : null}
              {student?.portfolio_url ? (
                <a
                  href={student.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-full truncate text-sm font-semibold text-[var(--accent-dark)] hover:underline"
                >
                  {student.portfolio_url.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
              <p className="text-xs text-[var(--muted)]">
                Member since {formatDate(profile?.created_at ?? user.created_at)}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-bold text-[var(--navy)]">My resume</h2>
            </CardHeader>
            <CardBody>
              <ResumeCard
                userId={user.id}
                resumeUrl={student?.resume_url ?? null}
                resumeName={student?.resume_name ?? null}
                downloadUrl={resumeDownloadUrl}
              />
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-[var(--navy)]">Edit profile</h2>
          </CardHeader>
          <CardBody>
            <ProfileForm profile={formData} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
