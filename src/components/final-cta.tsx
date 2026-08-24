"use client";

import { ArrowRight, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { Container, Section } from "@/components/layout";
import { LinkButton } from "@/components/link-button";
import { Reveal } from "@/components/motion";
import { ScoreRing } from "@/components/score-ring";

export function FinalCTA() {
  // Mock session replay data for demonstration
  const sessionStats = [
    { icon: Clock, label: "Session Duration", value: "45 minutes", change: "+12%" },
    { icon: TrendingUp, label: "Improvement", value: "8 points", change: "+24%" },
    { icon: BarChart3, label: "Words Practiced", value: "328", change: "+15%" },
  ];

  return (
    <Section className="pb-28 pt-8">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card px-6 py-20 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
              <div className="bg-grid absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_50%_60%_at_50%_0%,black,transparent)]" />
              <div className="absolute left-1/2 top-[-40%] size-[480px] -translate-x-1/2 rounded-full bg-signal/10 blur-[100px]" />
            </div>

            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold leading-[1.08] sm:text-5xl">
              Your accent won&apos;t hold you back anymore.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
              Start a real conversation in your target accent, in your role, in your world — free
              today.
            </p>

            {/* Session replay summary */}
            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 text-left">
              {sessionStats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-lg bg-signal/10 text-signal">
                      <stat.icon className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold">{stat.value}</p>
                        <span className="rounded-full bg-signal/10 px-1.5 py-0.5 text-[10px] font-medium text-signal">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Confidence ring */}
            <div className="mt-8 flex flex-col items-center gap-2">
              <ScoreRing value={92} label="Overall Improvement" size={72} />
              <p className="text-sm font-medium text-foreground">Overall Improvement Score</p>
              <p className="text-xs text-muted-foreground">Based on your recent session performance</p>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton href="#pricing" variant="signal" size="lg" className="group">
                Start speaking free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </LinkButton>
              <LinkButton href="#how-it-works" variant="outline" size="lg">
                Book a demo
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}