import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false },
};

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--surface)] px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-card">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--teal)]/10 text-2xl">
          ✉️
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--navy)]">
          Confirm your email
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We&apos;ve sent a confirmation link to your inbox. Click it to activate your account,
          then sign in to start exploring verified opportunities.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--navy-soft)]"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
