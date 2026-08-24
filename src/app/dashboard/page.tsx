"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError, useAuth } from "@/lib/client";
import { AppNav } from "@/components/app/app-nav";
import type { Dashboard, VocabularyItem } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [due, setDue] = useState<VocabularyItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [d, v] = await Promise.all([
          api<{ dashboard: Dashboard }>("/api/progress/dashboard"),
          api<{ items: VocabularyItem[] }>("/api/flashcards/due"),
        ]);
        setDashboard(d.dashboard);
        setDue(v.items);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to load dashboard.");
      }
    }
    if (!loading && user) void load();
  }, [loading, user]);

  if (loading) return <Centered>Loading…</Centered>;
  if (error) return <Centered>{error}</Centered>;
  if (!dashboard) return <Centered>Loading your progress…</Centered>;

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hi, {user?.displayName} 👋</h1>
            <p className="text-muted-foreground">{"Let's keep the streak going."}</p>
          </div>
          <Link
            href="/conversations/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            New conversation
          </Link>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Level" value={dashboard.level} />
        <Stat label="XP" value={dashboard.currentXp} />
        <Stat label="Streak" value={`${dashboard.streak} days`} />
        <Stat label="XP today" value={dashboard.todayXp} />
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="Best streak" v={`${dashboard.bestStreak} days`} />
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Vocabulary</dt>
              <dd>
                <Link href="/vocabulary" className="font-medium hover:underline">
                  {dashboard.totals.vocab} words ({dashboard.totals.mastered} mastered)
                </Link>
              </dd>
            </div>
            <Row k="Conversations" v={dashboard.totals.conversations} />
          </dl>
        </div>

        <div className="rounded-2xl border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Due for review</h2>
            {due.length > 0 && (
              <Link href="/review" className="text-sm font-medium text-primary hover:underline">
                Review {due.length} →
              </Link>
            )}
          </div>
          {due.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nothing due right now. Nice work!</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {due.slice(0, 6).map((item) => (
                <li key={item.id} className="flex items-center justify-between">
                  <span className="font-medium">{item.term}</span>
                  <span className="text-muted-foreground">{item.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        {dashboard.recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Start a conversation to begin tracking progress.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {dashboard.recent.slice(0, 7).map((r, i) => (
              <li key={i} className="flex justify-between border-b py-2">
                <span className="text-muted-foreground">{r.date} · {r.skill}</span>
                <span>+{r.xp} XP</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-4xl px-6 py-24 text-center">{children}</main>;
}
