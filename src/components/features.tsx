import { features } from "@/lib/data";
import { Container, Section } from "@/components/layout";
import { SectionHeader } from "@/components/section-header";
import { StaggerGroup, StaggerItem } from "@/components/motion";

export function Features() {
  return (
    <Section id="features" className="bg-muted/30">
      <Container>
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to sound natural"
          description="A complete coaching loop — listen, speak, correct, and track — all inside one calm workspace."
        />

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <article className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-signal/30 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]">
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-signal-soft text-signal-soft-foreground transition-colors duration-300 group-hover:bg-signal group-hover:text-signal-foreground">
                  <feature.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}