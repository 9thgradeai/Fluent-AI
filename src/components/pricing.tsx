"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { pricing } from "@/lib/data";
import { Container, Section } from "@/components/layout";
import { SectionHeader } from "@/components/section-header";
import { LinkButton } from "@/components/link-button";
import { StaggerGroup, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";

export function Pricing() {
  const [annual, setAnnual] = React.useState(true);

  return (
    <Section id="pricing" className="bg-muted/30">
      <Container>
        <SectionHeader
          eyebrow="Pricing"
          title="Simple, honest pricing"
          description="Start free. Upgrade when your spoken confidence becomes a career advantage."
        />

        {/* Billing toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={cn("text-sm", !annual ? "font-medium text-foreground" : "text-muted-foreground")}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            aria-label="Toggle annual billing"
            onClick={() => setAnnual((v) => !v)}
            className={cn(
              "relative h-7 w-12 rounded-full border border-border transition-colors",
              annual ? "bg-signal" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-[22px] rounded-full bg-background shadow transition-all",
                annual ? "left-[22px]" : "left-0.5"
              )}
            />
          </button>
          <span className={cn("text-sm", annual ? "font-medium text-foreground" : "text-muted-foreground")}>
            Annual{" "}
            <span className="ml-1 rounded-full bg-signal/15 px-2 py-0.5 text-xs font-medium text-signal-soft-foreground">
              −20%
            </span>
          </span>
        </div>

        <StaggerGroup className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pricing.map((plan) => {
            const displayed =
              typeof plan.price === "number"
                ? annual && plan.name === "Pro"
                  ? Math.round(plan.price * 0.8)
                  : annual && plan.name === "Teams"
                  ? Math.round(plan.price * 0.8)
                  : plan.price
                : plan.price;
            return (
              <StaggerItem key={plan.name} className="h-full">
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-3xl border p-6 transition-all duration-300",
                    plan.featured
                      ? "border-signal bg-card shadow-[0_24px_70px_-30px_rgba(16,185,129,0.45)] ring-1 ring-signal"
                      : "border-border bg-card hover:-translate-y-1"
                  )}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-signal px-3 py-1 text-[11px] font-semibold text-signal-foreground">
                      Recommended
                    </span>
                  )}
                  <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 min-h-10 text-sm text-muted-foreground">{plan.description}</p>

                  <div className="mt-4 flex items-end gap-1.5">
                    {typeof displayed === "number" ? (
                      <>
                        <span className="font-heading text-4xl font-semibold tracking-tight">
                          ${displayed}
                        </span>
                        <span className="pb-1 text-sm text-muted-foreground">/{plan.cadence}</span>
                      </>
                    ) : (
                      <span className="font-heading text-4xl font-semibold tracking-tight">{displayed}</span>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <LinkButton
                      href="#"
                      variant={plan.featured ? "signal" : "outline"}
                      size="md"
                      className="w-full"
                    >
                      {plan.cta}
                    </LinkButton>
                    <span className="text-center text-[11px] text-muted-foreground">
                      {plan.price === 0 ? "No card required" : plan.featured ? "Cancel anytime" : plan.cadence}
                    </span>
                  </div>

                  <ul className="mt-6 flex flex-col gap-2.5 border-t border-border pt-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </Container>
    </Section>
  );
}