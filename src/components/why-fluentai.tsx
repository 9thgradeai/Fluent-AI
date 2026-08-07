import { Check, X } from "lucide-react";
import { Container, Section } from "@/components/layout";
import { SectionHeader } from "@/components/section-header";
import { Reveal } from "@/components/motion";

const traditional = [
  "Grammar-heavy drills with no real dialogue",
  "Little chance to actually speak out loud",
  "One-size-fits-all content, never your career",
  "No feedback on accent or pronunciation",
  "Static, scripted practice that feels flat",
];

const fluentai = [
  "Natural, unscripted conversations with AI",
  "Voice practice with instant, specific feedback",
  "Scenarios tuned to your profession and goals",
  "Six accents to build real-world flexibility",
  "Live coaching on grammar, fluency & confidence",
];

export function WhyFluentAI() {
  return (
    <Section id="why">
      <Container>
        <SectionHeader
          eyebrow="Why FluentAI"
          title="Most learners never speak. You will."
          description="Traditional courses teach rules and lists. FluentAI is built the other way — around real conversation, delivered in the real world."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-2 lg:gap-8">
          <Reveal>
            <div className="h-full rounded-3xl border border-border bg-muted/30 p-7 sm:p-8">
              <h3 className="mb-6 font-heading text-lg font-semibold text-muted-foreground">
                The old way
              </h3>
              <ul className="space-y-4">
                {traditional.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                      <X className="size-3" aria-hidden="true" />
                    </span>
                    <span className="text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-3xl border border-signal/30 bg-gradient-to-b from-signal-soft to-card p-7 md:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-signal/10 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-signal px-3 py-1 text-xs font-semibold text-signal-foreground">
                  With FluentAI
                </span>
                <ul className="space-y-4">
                  {fluentai.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-foreground">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-signal text-signal-foreground">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                      <span className="text-base font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}