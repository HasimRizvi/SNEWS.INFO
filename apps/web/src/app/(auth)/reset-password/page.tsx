import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-form";

export const metadata: Metadata = {
  title: "Set new password",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--surface)] px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--navy)]">
            Choose a new password
          </h1>
          <p className="mt-2 text-sm text-muted">Make it at least 8 characters.</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
