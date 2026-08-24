"use client";

import { useState } from "react";
import { features } from "@/lib/data";
import { Container, Section } from "@/components/layout";
import { SectionHeader } from "@/components/section-header";
import { StaggerGroup, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";

export function Features() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <Section id="features" className="bg-muted/30">
      <Container>
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to sound natural"
          description="A complete coaching loop — listen, speak, correct, and track — all inside one calm workspace."
        />

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <StaggerItem key={feature.title}>
              <article
                className={cn(
                  "group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300",
                  "hover:-translate-y-1 hover:border-signal/30 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]",
                  "active:scale-95 active:border-signal/50 active:shadow-[0_12px_30px_-24px_rgba(0,0,0,0.35)]",
                  activeFeature === index && "border-signal/50 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]"
                )}
                onClick={() => setActiveFeature(activeFeature === index ? null : index)}
                role="button"
                tabIndex={0}
                aria-pressed={activeFeature === index}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveFeature(activeFeature === index ? null : index);
                  }
                }}
              >
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-signal-soft text-signal-soft-foreground transition-all duration-300 group-hover:bg-signal group-hover:text-signal-foreground group-hover:scale-110">
                  <feature.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold transition-colors group-hover:text-signal">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                {/* Expanded content when active */}
                {activeFeature === index && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-sm text-foreground">
                      Try this feature free for 7 days with Pro access. No credit card required.
                    </p>
                  </div>
                )}
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}