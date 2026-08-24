"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError, useAuth } from "@/lib/client";
import { AppNav } from "@/components/app/app-nav";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import type { Dashboard, VocabularyItem } from "@/lib/types";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getInsights(d: Dashboard): string[] {
  const insights: string[] = [];
  if (d.streak >= 3) insights.push(`You're on a ${d.streak}-day streak! Consistency is building real fluency.`);
  if (d.streak === 0) insights.push("Start a conversation today to begin your streak!");
  if (d.todayXp > 0) insights.push(`Great start today with ${d.todayXp} XP earned.`);
  if (d.totals.mastered > 10) insights.push(`You've mastered ${d.totals.mastered} words — your vocabulary is growing fast.`);
  if (d.recent.length >= 3) insights.push("You've been active this week. Keep the momentum going!");
  if (insights.length === 0) insights.push("Start your first conversation to unlock personalized AI insights.");
  return insights.slice(0, 3);
}

const SCENARIOS = [
  {
    title: "Software Engineering Interview",
    description: "Practice behavioral and technical interview questions",
    icon: (
      <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>
    ),
    href: "/conversations/new?scenario=software-engineering-interview",
  },
  {
    title: "Business Meeting",
    description: "Lead meetings, present ideas, and discuss strategy",
    icon: (
      <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    href: "/conversations/new?scenario=business-meeting",
  },
  {
    title: "Casual Chat",
    description: "Relaxed conversation about everyday topics",
    icon: (
      <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
    href: "/conversations/new?scenario=casual-chat",
  },
];

const DAILY_GOAL_XP = 200;

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

  if (loading) return <DashboardSkeleton />;
  if (error) return <Centered>{error}</Centered>;
  if (!dashboard) return <DashboardSkeleton />;

  const insights = getInsights(dashboard);
  const goalProgress = Math.min(100, Math.round((dashboard.todayXp / DAILY_GOAL_XP) * 100));

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              {getGreeting()}, {user?.displayName?.split(" ")[0]}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {dashboard.streak > 0
                ? `You're on a ${dashboard.streak}-day streak. Keep it going!`
                : "Start a conversation today to begin your streak."}
            </p>
          </div>
          <Link href="/conversations/new">
            <Button variant="signal" size="lg">
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              New Conversation
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Current Level"
            value={`Level ${dashboard.level}`}
            icon={<svg className="size-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4Zm5.694 8.13c.464-.264.91-.597 1.306-.993a2.89 2.89 0 0 1 1.306.993c.304.305.566.658.78 1.046.217.393.376.822.464 1.276a5.028 5.028 0 0 1 0 .996c-.088.454-.247.883-.464 1.276-.214.388-.476.74-.78 1.045-.396.397-.842.73-1.307.994a5.077 5.077 0 0 1-1.988 0c-.465-.264-.911-.597-1.307-.994a4.508 4.508 0 0 1-.78-1.045 4.493 4.493 0 0 1-.464-1.276 5.028 5.028 0 0 1 0-.996c.088-.454.247-.883.464-1.276.214-.388.476-.74.78-1.046ZM10 14c-1.296 0-2.492.36-3.452.974a6.04 6.04 0 0 0-.995.747c-.396.397-.842.73-1.307.994a5.077 5.077 0 0 1-1.988 0c-.465-.264-.911-.597-1.307-.994a6.04 6.04 0 0 0-.995-.747C-.494 14.36 0 14 0 14V7c0 .494.494 1.36 1.956 1.974.396.397.842.73 1.307.994.465.264.91.597 1.307.994.395.396.84.74.995.747C7.508 12.36 8.704 12 10 12s2.492.36 3.452.974c.155.007.6.35.995.747.396.397.842.73 1.307.994.465.264.91.597 1.307.994C18.506 16.36 20 15.494 20 15V7l-.005-.292C19.995 6.442 18.506 7.36 17.044 7.974c-.396.397-.842.73-1.307.994-.465.264-.91.597-1.307.994a4.508 4.508 0 0 1-1.988 0c-.465-.264-.911-.597-1.307-.994a5.975 5.975 0 0 1-1.307-.994A4.483 4.483 0 0 1 7.743 7.974 5.975 5.975 0 0 1 6.436 6.98c-.396-.397-.842-.73-1.307-.994C3.664 5.722 2.21 5.39 0 5.39" /></svg>}
            accent
          />
          <StatCard
            label="Total XP"
            value={dashboard.currentXp.toLocaleString()}
            suffix={`today +${dashboard.todayXp}`}
            icon={<svg className="size-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 0 0-.788 0l-7 3a1 1 0 0 0 0 1.84L5.25 8.051a.999.999 0 0 1 .356-.257l4-1.714a1 1 0 1 1 .788 1.838l-2.328.999 3.54 1.512a1 1 0 0 0 .788 0l7-3a1 1 0 0 0 0-1.838l-7-3Z" /><path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 0 0-1.05-.174 1 1 0 0 1-.89-.89 11.115 11.115 0 0 1 .25-3.762Z" /></svg>}
          />
          <StatCard
            label="Daily Streak"
            value={`${dashboard.streak}`}
            suffix="days"
            icon={<svg className="size-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.311-.262-3.541 3.783.848-.848-.326-.267a.75.75 0 0 1 1.035-1.107l3.418 2.978a.75.75 0 0 1 .127.968Zm-1.624-7.848a7.001 7.001 0 0 0-12.863 3.426.75.75 0 0 1-1.374-.458A8.501 8.501 0 0 1 15.312 3.58a.75.75 0 0 1 .624 1.374l-.224.62Z" clipRule="evenodd" /></svg>}
          />
          <StatCard
            label="Words Learned"
            value={dashboard.totals.vocab.toString()}
            suffix={`${dashboard.totals.mastered} mastered`}
            icon={<svg className="size-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 0 0-.788 0l-7 3a1 1 0 0 0 0 1.84L5.25 8.051a.999.999 0 0 1 .356-.257l4-1.714a1 1 0 1 1 .788 1.838l-2.328.999 3.54 1.512a1 1 0 0 0 .788 0l7-3a1 1 0 0 0 0-1.838l-7-3ZM3.31 9.397L5 10.12v4.102a8.969 8.969 0 0 0-1.05-.174 1 1 0 0 1-.89-.89 11.115 11.115 0 0 1 .25-3.762ZM9.3 16.573A9.026 9.026 0 0 0 7 14.935v-3.957l1.818.78a3 3 0 0 0 2.364 0l5.508-2.361a11.026 11.026 0 0 1 .25 3.762 1 1 0 0 1-.89.89 8.968 8.968 0 0 0-5.35 2.524 1 1 0 0 1-1.4 0Z" /></svg>}
          />
        </section>

        {/* Daily goal progress */}
        <section className="mt-8 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">Daily Goal</h2>
              <p className="text-sm text-muted-foreground">
                {dashboard.todayXp} / {DAILY_GOAL_XP} XP today
              </p>
            </div>
            <span className="text-2xl font-bold text-signal">{goalProgress}%</span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-signal transition-all duration-700"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          {goalProgress >= 100 ? (
            <p className="mt-3 text-sm font-medium text-signal">Daily goal reached! Great work!</p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Complete your daily goal to maintain your streak.
            </p>
          )}
        </section>

        {/* Two-column: AI Insights + Quick Start */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* AI Insights */}
          <section className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-signal/10">
                <svg className="size-5 text-signal" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 5.05 4.112L5.05 3.05Zm9.9 0a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.06ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-6.75 3a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm12 0a.75.75 0 0 1 .75-.75h-1.5a.75.75 0 0 1 0 1.5h1.5a.75.75 0 0 1-.75-.75ZM5.05 14.95a.75.75 0 0 1 0-1.06l1.06-1.062a.75.75 0 0 1 1.062 1.061l-1.061 1.06Zm9.9 0a.75.75 0 0 1-1.06 0l-1.062-1.06a.75.75 0 0 1 1.061-1.062l1.06 1.06ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15Z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="font-heading text-lg font-semibold text-foreground">AI Insights</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <svg className="mt-0.5 size-4 shrink-0 text-signal" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                  {insight}
                </li>
              ))}
            </ul>
          </section>

          {/* Quick Start */}
          <section className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">Quick Start</h2>
            <div className="mt-4 space-y-3">
              {SCENARIOS.map((s) => (
                <Link
                  key={s.title}
                  href={s.href}
                  className="group flex items-center gap-4 rounded-lg border p-4 transition-all hover:border-signal/30 hover:bg-signal/5"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-signal/10 group-hover:text-signal">
                    {s.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  </div>
                  <svg className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-signal" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Two-column: Recent + Vocabulary */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Recent conversations */}
          <section className="rounded-xl border bg-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-foreground">Recent Conversations</h2>
              {dashboard.recent.length > 0 && (
                <Link href="/conversations" className="text-sm font-medium text-signal hover:underline">
                  View all
                </Link>
              )}
            </div>
            {dashboard.recent.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <svg className="size-6 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
                <Link href="/conversations/new">
                  <Button variant="signal" size="sm">Start your first one</Button>
                </Link>
              </div>
            ) : (
              <ul className="mt-4 divide-y">
                {dashboard.recent.slice(0, 5).map((r, i) => (
                  <li key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">{r.skill}</div>
                      <div className="text-xs text-muted-foreground">{r.date} &middot; {r.minutes}min &middot; {r.messagesCount} messages</div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">+{r.xp} XP</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Vocabulary review */}
          <section className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">Vocabulary</h2>
            {due.length > 0 ? (
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-signal/10 text-sm font-bold text-signal">
                    {due.length}
                  </span>
                  <span className="text-sm text-muted-foreground">words due for review</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {due.slice(0, 5).map((item) => (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.term}</span>
                      <span className="text-xs text-muted-foreground">{item.status}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/review" className="mt-4 block">
                  <Button variant="signal" size="sm" className="w-full">Review now</Button>
                </Link>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-signal/10">
                  <svg className="size-5 text-signal" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground">Check back later for new words.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  icon,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "group rounded-xl border p-5 transition-all hover:scale-[1.02]",
        accent ? "border-signal/20 bg-signal/5" : "bg-card"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            accent ? "bg-signal/20 text-signal" : "bg-muted text-muted-foreground"
          )}
        >
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
      {suffix && (
        <div className="mt-2 text-xs text-muted-foreground">{suffix}</div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 h-16 border-b bg-background/80 backdrop-blur-md" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="mt-8 h-32 animate-pulse rounded-xl bg-muted" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
        </div>
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-4xl px-6 py-24 text-center">{children}</main>;
}
