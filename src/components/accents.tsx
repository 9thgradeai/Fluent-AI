import { AudioLines } from "lucide-react";
import { accents } from "@/lib/data";
import { Container, Section } from "@/components/layout";
import { SectionHeader } from "@/components/section-header";
import { StaggerGroup, StaggerItem } from "@/components/motion";

export function Accents() {
  return (
    <Section id="accents" className="bg-muted/30">
      <Container>
        <SectionHeader
          eyebrow="One ear, six worlds"
          title="Train your ear across real accents"
          description="Real-world English isn't one accent. Build the listening flexibility to understand — and be understood — anywhere."
        />

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accents.map((accent) => (
            <StaggerItem key={accent.name}>
              <article className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-signal/30 ">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-full bg-signal-soft text-signal-soft-foreground transition-colors group-hover:bg-signal group-hover:text-signal-foreground">
                    <AudioLines className="size-5" aria-hidden="true" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="relative flex size-2" aria-hidden="true">
                      <span className="pulse-soft absolute inline-flex size-full rounded-full bg-signal" />
                      <span className="relative inline-flex size-2 rounded-full bg-signal" />
                    </span>
                    Demo
                  </span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold">{accent.name}</h3>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {accent.region}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {accent.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}