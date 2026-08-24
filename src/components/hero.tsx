"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Mic } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { VoiceWaveform } from "@/components/voice-waveform";
import { ScoreRing } from "@/components/score-ring";
import { cn } from "@/lib/utils";

const accentOptions = ["American", "British", "Australian"] as const;

/** A single simulated conversation message. */
function Message({
  role,
  children,
  delay = 0,
}: {
  role: "user" | "ai";
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex", role === "user" ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          role === "user"
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm border border-border bg-card text-foreground"
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const [accent, setAccent] = React.useState<(typeof accentOptions)[number]>("American");

  return (
    <section id="top" className="relative overflow-hidden pb-20 pt-32 sm:pt-36 lg:pb-28">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="bg-grid absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="absolute left-1/2 top-[-20%] h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-signal/10 blur-[120px]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-12">
        {/* Copy */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
          className="flex max-w-xl flex-col items-start gap-7"
        >
          <motion.span
            variants={{ hidden: { opacity: 0, y: reduce ? 0 : 14 }, show: { opacity: 1, y: 0 } }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <Sparkles className="size-3.5 text-signal" aria-hidden="true" />
            AI-powered English coaching
          </motion.span>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: reduce ? 0 : 18 }, show: { opacity: 1, y: 0 } }}
            className="text-balance text-[2.6rem] font-semibold leading-[1.04] sm:text-6xl md:text-[4rem]"
          >
            Speak English that <span className="text-signal">lands</span>.
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: reduce ? 0 : 16 }, show: { opacity: 1, y: 0 } }}
            className="text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            FluentAI turns real-world conversation into practice — coaching your speaking,
            listening, and pronunciation across six accents, tuned to your profession and goals.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: reduce ? 0 : 14 }, show: { opacity: 1, y: 0 } }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <LinkButton href="#pricing" variant="signal" size="lg" className="group">
              Start speaking free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </LinkButton>
            <LinkButton href="#how-it-works" variant="outline" size="lg">
              <Play className="size-4 text-signal" aria-hidden="true" />
              See how it works
            </LinkButton>
          </motion.div>

          <motion.p
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            className="text-sm text-muted-foreground"
          >
            Free to start · No credit card · 1,000+ professionals learning today
          </motion.p>
        </motion.div>

        {/* Visual: the voice-orbit conversation panel */}
        <motion.div
          initial={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Glow behind the panel */}
          <div
            className="absolute inset-0 -z-10 scale-90 rounded-[2.5rem] bg-gradient-to-br from-signal/15 to-transparent blur-2xl"
            aria-hidden="true"
          />

          <div className="relative rounded-[2rem] border border-border bg-card p-5 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.35)] sm:p-6">
            {/* Panel header: accent selector + listening indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 p-1">
                {accentOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAccent(opt)}
                    aria-pressed={accent === opt}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      accent === opt
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="relative flex size-2.5" aria-hidden="true">
                  <span className="pulse-soft absolute inline-flex size-full rounded-full bg-signal" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-signal" />
                </span>
                {accent} coach listening
              </div>
            </div>

            {/* Conversation transcript */}
            <div className="flex flex-col gap-3 py-5">
              <Message role="ai" delay={0.1}>
                Morning! Ready to run that system-design interview in {accent}? Let&apos;s talk about
                scalability first.
              </Message>
              <Message role="user" delay={0.35}>
                Absolutely — I&apos;d say we start with the load balancer and think through&hellip;
              </Message>
              <Message role="ai" delay={0.6}>
                Great flow. Minor tip: try &ldquo;load balancer&rdquo; with stress on the first syllable.
              </Message>
            </div>

            {/* Live feedback row */}
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-signal/15 text-signal">
                    <Mic className="size-4" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-foreground">Your voice — live</span>
                    <VoiceWaveform bars={18} className="h-5 text-signal" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">Fluency</p>
                  <p className="font-heading text-lg font-semibold text-signal">86%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating stat cards */}
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="absolute -left-3 -top-5 sm:-left-6"
          >
            <div className="animate-drift flex items-center gap-3 rounded-2xl border border-border bg-background p-3 shadow-xl shadow-black/5">
              <ScoreRing value={92} label="Pronunciation" size={52} />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">Pronunciation</span>
                <span className="text-[11px] text-muted-foreground">+12% this week</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute -bottom-6 -right-2 sm:-right-5"
          >
            <div className="animate-drift-slow flex items-center gap-3 rounded-2xl border border-border bg-background p-3 shadow-xl shadow-black/5">
              <span className="grid size-10 place-items-center rounded-full bg-signal/15 font-heading text-sm font-semibold text-signal">
                14
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">Day streak</span>
                <span className="text-[11px] text-muted-foreground">On a roll 🎉</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
