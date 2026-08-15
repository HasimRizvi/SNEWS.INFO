import Link from "next/link";

export function ComingSoon({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="rounded-full bg-[var(--accent)]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent-dark)]">
        Coming soon
      </span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[var(--navy)] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>
      <Link
        href={cta.href}
        className="mt-8 rounded-lg bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--navy-soft)]"
      >
        {cta.label}
      </Link>
    </div>
  );
}
