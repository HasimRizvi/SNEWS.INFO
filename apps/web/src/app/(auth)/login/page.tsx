import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to SNEWS.INFO to register for events and join the community.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const redirectTo = (await searchParams).redirect ?? "/dashboard";
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--surface)] px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--navy)]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to register for events and grow with the community.
          </p>
        </div>
        <LoginForm redirectTo={redirectTo} />
        <p className="mt-6 text-center text-sm text-muted">
          New to SNEWS?{" "}
          <Link href="/register" className="font-semibold text-[var(--accent)] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
