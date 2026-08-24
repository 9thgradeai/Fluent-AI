"use client";

import { useEffect, useState } from "react";
import { api, ApiError, useAuth } from "@/lib/client";
import { AppNav } from "@/components/app/app-nav";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

const LEVELS = [
  { value: "A1", label: "A1 — Beginner", desc: "Can understand and use familiar everyday expressions" },
  { value: "A2", label: "A2 — Elementary", desc: "Can communicate in simple and routine tasks" },
  { value: "B1", label: "B1 — Intermediate", desc: "Can deal with most situations while traveling" },
  { value: "B2", label: "B2 — Upper-Intermediate", desc: "Can interact with a degree of fluency and spontaneity" },
  { value: "C1", label: "C1 — Advanced", desc: "Can use language flexibly for social and professional purposes" },
  { value: "C2", label: "C2 — Proficient", desc: "Can understand virtually everything heard or read" },
];

const LANGUAGES = [
  { code: "bn", label: "Bengali" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "ko", label: "Korean" },
  { code: "ru", label: "Russian" },
  { code: "tr", label: "Turkish" },
  { code: "vi", label: "Vietnamese" },
  { code: "th", label: "Thai" },
  { code: "id", label: "Indonesian" },
];

const GOALS = [
  { id: "business", label: "Business English", desc: "Professional meetings, emails, and presentations", icon: "💼" },
  { id: "interview", label: "Interview Prep", desc: "Job interview practice and confidence building", icon: "🎯" },
  { id: "academic", label: "Academic Writing", desc: "Essays, research papers, and scholarly communication", icon: "📚" },
  { id: "casual", label: "Casual Conversation", desc: "Everyday chat fluency and natural expression", icon: "💬" },
  { id: "travel", label: "Travel English", desc: "Navigating English-speaking countries with ease", icon: "✈️" },
  { id: "test", label: "IELTS/TOEFL Prep", desc: "Test preparation strategies and practice", icon: "📝" },
];

const TABS = ["Profile", "Learning Goals", "About"] as const;
type Tab = (typeof TABS)[number];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Profile");

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your account and learning preferences.</p>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 overflow-x-auto rounded-lg border bg-muted/50 p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all",
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : activeTab === "Profile" ? (
            <ProfileTab user={user} />
          ) : activeTab === "Learning Goals" ? (
            <GoalsTab />
          ) : (
            <AboutTab />
          )}
        </div>
      </main>
    </div>
  );
}

function ProfileTab({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  const [displayName, setDisplayName] = useState("");
  const [englishLevel, setEnglishLevel] = useState("B1");
  const [nativeLanguage, setNativeLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Seed form from async profile (runs once)
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
      setNotice("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative group">
          <div className="flex size-20 items-center justify-center rounded-full bg-signal/10 text-2xl font-bold text-signal">
            {user ? getInitials(user.displayName) : "…"}
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-xs font-medium text-white">Change</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">{user?.displayName}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
      </div>

      {/* Form fields */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <Field label="Display name">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-transparent focus:ring-2 focus:ring-signal focus:outline-none"
          />
        </Field>

        <Field label="Email">
          <input
            value={user?.email ?? ""}
            disabled
            className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground"
          />
        </Field>

        <Field label="English level">
          <select
            value={englishLevel}
            onChange={(e) => setEnglishLevel(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-signal focus:outline-none"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Native language">
          <select
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-signal focus:outline-none"
          >
            <option value="">Select language</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Timezone">
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-signal focus:outline-none"
          />
        </Field>
      </div>

      {notice && (
        <div className="rounded-lg border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">{notice}</div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <Button type="submit" variant="signal" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

function GoalsTab() {
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  async function save() {
    setSaving(true);
    try {
      await api("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ goals: selected }),
      });
      setNotice("Learning goals updated.");
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Select the areas you want to focus on. Your AI coach will personalize conversations based on your goals.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {GOALS.map((goal) => {
          const active = selected.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggle(goal.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                active
                  ? "border-signal/30 bg-signal/5 ring-1 ring-signal/20"
                  : "hover:border-muted-foreground/30 hover:bg-muted/50"
              )}
            >
              <span className="text-2xl">{goal.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{goal.label}</div>
                <div className="text-xs text-muted-foreground">{goal.desc}</div>
              </div>
              {active && (
                <svg className="mt-0.5 size-5 shrink-0 text-signal" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {notice && (
        <div className="rounded-lg border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">{notice}</div>
      )}

      <Button variant="signal" onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save goals"}
      </Button>
    </div>
  );
}

function AboutTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">FluentAI</h3>
        <div className="mt-4 space-y-3 text-sm">
          <Row label="Version" value="1.0.0" />
          <Row label="AI Provider" value={process.env.NEXT_PUBLIC_AI_PROVIDER ?? "Groq (Qwen QwQ 32B)"} />
          <Row label="Framework" value="Next.js 15 + React 19" />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">Links</h3>
        <div className="mt-4 space-y-2">
          <LinkRow label="Terms of Service" href="#" />
          <LinkRow label="Privacy Policy" href="#" />
          <LinkRow label="Help Center" href="#" />
          <LinkRow label="GitHub" href="https://github.com/9thgradeai/Fluent-AI" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
    >
      <span className="text-muted-foreground">{label}</span>
      <svg className="size-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z" clipRule="evenodd" />
      </svg>
    </a>
  );
}
