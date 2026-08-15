import Link from "next/link";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/research", label: "Research" },
  { href: "/startups", label: "Startups" },
  { href: "/crewin", label: "CrewIn" },
  { href: "/resources", label: "Opportunities" },
] as const;

export interface NavbarProps {
  user?: { fullName: string | null; email: string; avatarUrl: string | null } | null;
  userMenu?: ReactNode;
}

export function Navbar({ user = null, userMenu }: NavbarProps) {
  const isSignedIn = Boolean(user) && Boolean(userMenu);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="SNEWS home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--navy)] font-black text-[var(--accent)]">
            S
          </span>
          <span className="text-lg font-extrabold tracking-tight text-[var(--navy)]">
            SNEWS<span className="text-[var(--accent)]">.INFO</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--navy)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/events/new"
            className="rounded-lg border border-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-dark)] transition-colors hover:bg-[var(--accent)]/10"
          >
            + Post event
          </Link>
          {isSignedIn ? (
            userMenu
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-[var(--navy)] transition-colors hover:text-[var(--accent)]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
              >
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
