"use client";

import { Check, PenLine, BookOpen, ThumbsUp, Loader2 } from "lucide-react";
import { Container, Section } from "@/components/layout";
import { SectionHeader } from "@/components/section-header";
import { Reveal } from "@/components/motion";
import { VoiceWaveform } from "@/components/voice-waveform";
import { ScoreRing } from "@/components/score-ring";

export function ConversationPreview() {
  return (
    <Section id="conversation">
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        {/* Copy */}
        <div className="flex flex-col gap-5">
          <SectionHeader
            align="left"
            eyebrow="Live coaching"
            title="Feedback that reads like a coach, not a robot"
            description="Every response is scored and annotated as you speak — so improvement happens in the moment, not at the end of a course."
          />
          <ul className="mt-2 space-y-3">
            {[
              "Grammar fixes explained, never just corrected",
              "Better vocabulary suggested in context",
              "Confidence, fluency & pronunciation scored live",
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

        {/* Transcript panel */}
        <Reveal direction="up">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.35)] sm:p-6">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-signal/15 text-signal">
                  <ThumbsUp className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium">Interview with FluentAI</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="relative flex size-1.5" aria-hidden="true">
                      <span className="pulse-soft absolute inline-flex size-full rounded-full bg-signal" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-signal" />
                    </span>
                    Streaming response
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                AI
              </span>
            </div>

            {/* Bubbles */}
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                  I&apos;ve been working on this project for the last few years, it&apos;s quite complex
                  honestly.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed">
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <PenLine className="size-3" aria-hidden="true" /> Grammar
                  </div>
                  <p className="mb-1 text-foreground">
                    Use <span className="rounded bg-signal/15 px-1 py-0.5 font-medium text-signal-soft-foreground">&ldquo;for the past few years&rdquo;</span>{" "}
                    instead of <s className="text-muted-foreground">for the last few years</s> — a
                    stronger, more idiomatic choice here.
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <BookOpen className="size-3" aria-hidden="true" /> Vocabulary
                  </div>
                  <p className="text-foreground">
                    Consider{" "}
                    <span className="rounded bg-signal/15 px-1 py-0.5 font-medium text-signal-soft-foreground">&ldquo;a fairly intricate system&rdquo;</span>{" "}
                    — it sounds more natural in an interview.
                  </p>
                </div>
              </div>
            </div>

            {/* Waveform */}
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <VoiceWaveform bars={22} className="h-6 text-signal" />
                <span className="text-xs text-muted-foreground">Analyzing your voice…</span>
              </div>
              <span className="text-xs font-medium text-signal">Live</span>
            </div>

            {/* Scores */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3">
                <ScoreRing value={92} label="Confidence" size={56} />
                <span className="text-[11px] text-muted-foreground">Confidence</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3">
                <ScoreRing value={84} label="Pronunciation" size={56} />
                <span className="text-[11px] text-muted-foreground">Pronunciation</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3">
                <ScoreRing value={78} label="Fluency" size={56} />
                <span className="text-[11px] text-muted-foreground">Fluency</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}