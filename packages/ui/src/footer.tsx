import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/events", label: "Events" },
      { href: "/research", label: "Research papers" },
      { href: "/startups", label: "Startup ideas" },
      { href: "/resources", label: "Internships & funding" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/crewin", label: "CrewIn" },
      { href: "/events?type=session", label: "Free sessions" },
      { href: "/support", label: "Chat support" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
      { href: "/forgot-password", label: "Forgot password" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-[var(--navy)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 font-black text-[var(--accent)]">
                S
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                SNEWS<span className="text-[var(--accent)]">.INFO</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              One trusted platform where students discover verified opportunities, learn, build,
              collaborate and launch.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/40">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/75 transition-colors hover:text-[var(--accent)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/40">
          <p>© {new Date().getFullYear()} SNEWS.INFO — Student Opportunity & Innovation Network.</p>
          <p className="mt-1">Every opportunity is verified before it is published. Your data stays private and secure.</p>
        </div>
      </div>
    </footer>
  );
}
