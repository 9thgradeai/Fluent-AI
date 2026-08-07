import { Flame, BookOpen, Clock, Trophy, TrendingUp, Check } from "lucide-react";
import { Container, Section } from "@/components/layout";
import { SectionHeader } from "@/components/section-header";
import { Reveal } from "@/components/motion";

const week = [
  { day: "M", min: 22 },
  { day: "T", min: 34 },
  { day: "W", min: 18 },
  { day: "T", min: 41 },
  { day: "F", min: 30 },
  { day: "S", min: 52 },
  { day: "S", min: 26 },
];

const points = "0,64 30,52 60,42 90,46 120,30 150,22 180,26 210,14 240,8";
const area = `0,64 30,52 60,42 90,46 120,30 150,22 180,26 210,14 240,8 240,80 0,80`;

export function Analytics() {
  const max = Math.max(...week.map((d) => d.min));
  return (
    <Section id="analytics" className="bg-muted/30">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* Dashboard mock */}
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.35)] sm:p-6">
            {/* Stat tiles */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Flame, label: "Streak", value: "14 days" },
                { icon: BookOpen, label: "Words", value: "1,240" },
                { icon: Clock, label: "Time", value: "8.5 hrs" },
                { icon: Trophy, label: "Level", value: "B2" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-muted/40 p-3">
                  <s.icon className="mb-2 size-4 text-signal" aria-hidden="true" />
                  <p className="font-heading text-lg font-semibold leading-tight">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Confidence chart */}
            <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="size-4 text-signal" aria-hidden="true" />
                  Speaking confidence
                </p>
                <span className="rounded-full bg-signal/15 px-2 py-0.5 text-[11px] font-medium text-signal-soft-foreground">
                  +24%
                </span>
              </div>
              <svg viewBox="0 0 240 80" className="h-24 w-full" role="img" aria-label="Speaking confidence growing steadily over time">
                <defs>
                  <linearGradient id="confArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#confArea)" />
                <path
                  d={points}
                  fill="none"
                  stroke="var(--signal)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="240" cy="8" r="3.5" fill="var(--signal)" />
              </svg>
            </div>

            {/* Weekly practice bars */}
            <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-4">
              <p className="mb-3 text-sm font-medium">This week</p>
              <div className="flex items-end justify-between gap-2">
                {week.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{d.min}m</span>
                    <div
                      className="w-full rounded-t-md bg-signal/40"
                      style={{ height: `${(d.min / max) * 56}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <div className="order-first flex flex-col gap-5 lg:order-none">
          <SectionHeader
            align="left"
            eyebrow="Your progress"
            title="Watch fluency become a habit you can measure"
            description="FluentAI tracks everything that matters — streaks, vocabulary growth, practice time, and confidence — so motivation never has to guess."
          />
          <ul className="mt-2 space-y-3">
            {[
              "A streak that rewards consistency, not punishment",
              "Vocabulary and fluency trends mapped over time",
              "Achievements that feel earned, not cosmetic",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-muted-foreground">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-signal/15 text-signal">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                <span className="text-base">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}