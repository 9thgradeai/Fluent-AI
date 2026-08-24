"use client";

import { useEffect, useState } from "react";
import { api, ApiError, useAuth } from "@/lib/client";
import { AppNav } from "@/components/app/app-nav";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LANGUAGES = ["en", "hi", "ar", "es", "fr", "zh", "ja", "de"];

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [englishLevel, setEnglishLevel] = useState("B1");
  const [nativeLanguage, setNativeLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Seed the form from the asynchronously-loaded profile (runs once when it arrives).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setEnglishLevel(user.englishLevel);
      setNativeLanguage(user.nativeLanguage);
      setTimezone(user.timezone);
    }
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      await api("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName, englishLevel, nativeLanguage, timezone }),
      });
      setNotice("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-lg px-6 py-10">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Update your learning profile.</p>

        {loading ? (
          <p className="mt-8 text-muted-foreground">Loading…</p>
        ) : (
          <form onSubmit={save} className="mt-6 space-y-5 rounded-2xl border p-6">
            <label className="block">
              <span className="text-sm text-muted-foreground">Display name</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted-foreground">English level</span>
              <select
                value={englishLevel}
                onChange={(e) => setEnglishLevel(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-muted-foreground">Native language</span>
              <select
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-muted-foreground">Timezone</span>
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            {notice && <p className="text-sm text-green-600">{notice}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
