"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/client";
import { AppNav } from "@/components/app/app-nav";
import type { VocabularyItem } from "@/lib/types";

const GRADES = [
  { q: 0, label: "Again", hint: "reviews today" },
  { q: 2, label: "Hard", hint: "shorter interval" },
  { q: 4, label: "Good", hint: "normal interval" },
  { q: 5, label: "Easy", hint: "longer interval" },
];

export default function ReviewPage() {
  const [cards, setCards] = useState<VocabularyItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: VocabularyItem[] }>("/api/flashcards/due");
      setCards(res.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load due cards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Mount-time fetch; setState happens only after the async response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function grade(q: number) {
    const card = cards[index];
    if (!card) return;
    try {
      await api(`/api/flashcards/${card.id}/review`, {
        method: "POST",
        body: JSON.stringify({ quality: q }),
      });
      if (index + 1 >= cards.length) {
        setDone(true);
      } else {
        setIndex(index + 1);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save your review.");
    }
  }

  if (loading) return <Shell><p className="py-24 text-center">Loading…</p></Shell>;
  if (error) return <Shell><p className="py-24 text-center text-red-500">{error}</p></Shell>;

  if (done) {
    return (
      <Shell>
        <div className="mx-auto mt-20 max-w-md rounded-2xl border p-8 text-center">
          <h1 className="text-2xl font-bold">Review complete 🎉</h1>
          <p className="mt-2 text-muted-foreground">
            You reviewed {cards.length} card{cards.length === 1 ? "" : "s"}. Great work.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCards([]);
                setIndex(0);
                setDone(false);
                void load();
              }}
              className="rounded-md border px-4 py-2 text-sm font-medium"
            >
              Review again
            </button>
            <Link
              href="/dashboard"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const card = cards[index];
  if (!card) {
    return (
      <Shell>
        <div className="mx-auto mt-20 max-w-md rounded-2xl border p-8 text-center">
          <h1 className="text-2xl font-bold">Nothing due right now</h1>
          <p className="mt-2 text-muted-foreground">
            All caught up. Add words in Vocabulary to build your deck.
          </p>
          <Link
            href="/vocabulary"
            className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Add words
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto mt-10 max-w-lg">
        <p className="text-center text-sm text-muted-foreground">
          Card {index + 1} of {cards.length}
        </p>
        <div className="mt-4 rounded-2xl border p-8 text-center">
          <p className="text-3xl font-bold">{card.term}</p>
          {card.definition && (
            <p className="mt-3 text-muted-foreground">{card.definition}</p>
          )}
        </div>
        <div className="mt-6 grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button
              key={g.q}
              type="button"
              onClick={() => void grade(g.q)}
              className="rounded-md border px-3 py-2 text-sm font-medium transition hover:border-primary"
            >
              <div>{g.label}</div>
              <div className="text-xs font-normal text-muted-foreground">{g.hint}</div>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="px-6 pb-20">{children}</main>
    </div>
  );
}
