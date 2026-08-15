"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}

function initials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
  return email.slice(0, 2).toUpperCase();
}

export function UserMenu({ fullName, email, avatarUrl }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
      router.push("/");
      router.refresh();
    }
  }

  const displayName = fullName || email;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${displayName}`}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--navy)] text-sm font-bold text-white ring-2 ring-transparent transition-shadow hover:ring-[var(--accent)]/40"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{initials(fullName, email)}</span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-11 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-white py-1.5 shadow-lg"
        >
          <div className="border-b border-[var(--border)] px-4 py-3">
            <p className="truncate text-sm font-semibold text-[var(--navy)]">{displayName}</p>
            <p className="truncate text-xs text-[var(--muted)]">{email}</p>
          </div>
          <MenuItem href="/profile" onClick={() => setOpen(false)}>
            My profile
          </MenuItem>
          <MenuItem href="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </MenuItem>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center px-4 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="block px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--surface)]"
    >
      {children}
    </Link>
  );
}
