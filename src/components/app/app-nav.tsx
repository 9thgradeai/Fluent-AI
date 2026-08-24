"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, useAuth } from "@/lib/client";

const LINKS = [
  { href: "/conversations", label: "Conversations" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/review", label: "Review" },
  { href: "/settings", label: "Settings" },
];

/** Consistent session-aware header for the authenticated app. */
export function AppNav() {
  const { user } = useAuth();
  const router = useRouter();

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="font-bold tracking-tight">
          FluentAI
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-muted-foreground transition hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <span className="hidden text-muted-foreground sm:inline">{user.displayName}</span>
          )}
          <button
            type="button"
            onClick={() => void logout()}
            className="text-muted-foreground transition hover:text-foreground"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
