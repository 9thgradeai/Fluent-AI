"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/client";
import { AppNav } from "@/components/app/app-nav";

const TYPES = ["free", "roleplay", "interview", "meeting", "ielts", "toefl", "business"];
const ACCENTS = ["american", "british", "australian", "canadian", "irish", "indian"];

export default function NewConversationPage() {
  const router = useRouter();
  const [type, setType] = useState("free");
  const [accent, setAccent] = useState("american");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api<{ id: string }>("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ type, accent, title: title || undefined }),
      });
      router.push(`/conversations/${res.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start conversation.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-lg px-6 py-14">
        <h1 className="text-3xl font-bold">Start a conversation</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a scenario and accent, then just start speaking.
        </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm text-muted-foreground">Scenario</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-muted-foreground">Accent</span>
          <select
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {ACCENTS.map((a) => (
              <option key={a} value={a} className="capitalize">
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-muted-foreground">Title (optional)</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mock tech interview"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {submitting ? "Starting…" : "Begin"}
        </button>
      </form>
      </main>
    </div>
  );
}
