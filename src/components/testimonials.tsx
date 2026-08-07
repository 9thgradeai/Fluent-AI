import { Star, Quote } from "lucide-react";
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
                    “{t.quote}”
                  </blockquote>
                </div>
                <figcaption className="flex items-center gap-3 border-t border-border pt-4">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full font-heading text-sm font-semibold ${
                      avatarTones[i % avatarTones.length]
                    }`}
                    aria-hidden="true"
                  >
                    {initials(t.name)}
                  </span>
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