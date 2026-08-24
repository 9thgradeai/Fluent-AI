"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/client";
import { AppNav } from "@/components/app/app-nav";
import type { Conversation } from "@/lib/types";

export default function ConversationsPage() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ items: Conversation[] }>("/api/conversations")
      .then((res) => setItems(res.items))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load."));
  }, []);

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Conversations</h1>
        <Link
          href="/conversations/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          New
        </Link>
      </header>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {items.length === 0 && !error ? (
        <p className="mt-10 text-muted-foreground">
          No conversations yet.{" "}
          <Link href="/conversations/new" className="underline">
            Start your first one
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                href={`/conversations/${c.id}`}
                className="flex items-center justify-between rounded-2xl border p-4 transition hover:border-primary"
              >
                <div>
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {c.type} · {c.accent} · {c._count?.messages ?? 0} messages
                  </div>
                </div>
                <span className="text-sm capitalize text-muted-foreground">{c.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      </main>
    </div>
  );
}
