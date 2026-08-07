import { howItWorks } from "@/lib/data";
import { Container, Section } from "@/components/layout";
import { SectionHeader } from "@/components/section-header";
import { StaggerGroup, StaggerItem } from "@/components/motion";

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <Container>
        <SectionHeader
          eyebrow="How it works"
          title="From first hello to fluent, in four steps"
          description="You'll be mid-conversation in under a minute. No setup, no homework, no scripts."
        />

        <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Connecting line (desktop) */}
          <div
            className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block"
            aria-hidden="true"
          />
          <StaggerGroup className="contents">
            {howItWorks.map((step) => (
              <StaggerItem key={step.step}>
                <li className="relative flex flex-col gap-4">
                  <span className="relative z-10 grid size-12 place-items-center rounded-2xl border border-border bg-background font-heading text-sm font-semibold text-signal shadow-sm">
                    {step.step}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </ol>
      </Container>
    </Section>
  );
}