"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/client";
import { AppNav } from "@/components/app/app-nav";
import type { VocabularyItem } from "@/lib/types";

export default function VocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [wordClass, setWordClass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: VocabularyItem[] }>("/api/vocabulary");
      setItems(res.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load vocabulary.");
    }
  }, []);

  useEffect(() => {
    // Mount-time fetch; setState happens only after the async response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      await api("/api/vocabulary", {
        method: "POST",
        body: JSON.stringify({ term, definition, wordClass }),
      });
      setTerm("");
      setDefinition("");
      setWordClass("");
      setNotice(`Added “${term.trim()}”.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save word.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold">Vocabulary</h1>
        <p className="mt-1 text-muted-foreground">
          Words you&apos;ve saved or picked up in conversations. Review them to build lasting recall.
        </p>

        <form onSubmit={add} className="mt-6 rounded-2xl border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Word *"
              className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              value={wordClass}
              onChange={(e) => setWordClass(e.target.value)}
              placeholder="Part of speech (noun, verb…)"
              className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="Definition"
            rows={2}
            className="mt-3 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="mt-3 flex items-center justify-between">
            {notice ? <p className="text-sm text-green-600">{notice}</p> : <span />}
            <button
              type="submit"
              disabled={saving || !term.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add word"}
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        {items.length === 0 ? (
          <p className="mt-8 text-muted-foreground">
            No words yet. Add one above, or pick some up during a conversation.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between rounded-xl border p-3"
              >
                <div>
                  <div className="font-semibold">
                    {item.term}{" "}
                    {item.wordClass && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {item.wordClass}
                      </span>
                    )}
                  </div>
                  {item.definition && (
                    <p className="text-sm text-muted-foreground">{item.definition}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm capitalize text-muted-foreground">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
