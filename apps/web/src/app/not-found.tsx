import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-6xl font-black text-[var(--accent)]">404</p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[var(--navy)]">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-2 text-muted">
        The event may have been removed, or the link is wrong.
      </p>
      <Link
        href="/events"
        className="mt-8 rounded-lg bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--navy-soft)]"
      >
        Browse events
      </Link>
    </div>
  );
}
