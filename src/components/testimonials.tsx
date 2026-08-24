"use client";

import { Star, Quote } from "lucide-react";
import Image from "next/image";
import { ClientLogo } from "@/components/ClientLogo";
import { testimonials } from "@/lib/data";
import { Container, Section } from "@/components/layout";
import { SectionHeader } from "@/components/section-header";
import { StaggerGroup, StaggerItem } from "@/components/motion";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

const avatarTones = [
  "bg-signal/15 text-signal-soft-foreground",
  "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
];

export function Testimonials() {
  return (
    <Section id="testimonials">
      <Container>
        <SectionHeader
          eyebrow="Loved by learners"
          title="Confidence, out loud"
          description="From job seekers to founders, people use FluentAI to speak up — and it shows."
        />

        {/* Client logos */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
          {testimonials.slice(0, 3).map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <Image
                src={`https://placehold.co/40x40/${initials(t.name)}`}
                alt={`${t.name} avatar`}
                width={40}
                height={40}
                className="rounded-full object-cover"
                aria-hidden="true"
              />
              <span className="text-xs font-medium">{t.name.split(",")[0]}</span>
            </div>
          ))}
        </div>

        <StaggerGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <StaggerItem key={t.name}>
              <figure className="flex h-full flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]">
                <div>
                  <div className="mb-3 flex items-center gap-1" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} className="size-4 fill-signal text-signal" aria-hidden="true" />
                    ))}
                  </div>
                  <Quote className="mb-3 size-5 text-signal/50" aria-hidden="true" />
                  <blockquote className="text-sm leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="flex items-center gap-3 border-t border-border pt-4">
                  <ClientLogo
                    initials={initials(t.name)}
                    colorClass={avatarTones[i % avatarTones.length]}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}