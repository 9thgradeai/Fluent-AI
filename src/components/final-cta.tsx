import { ArrowRight } from "lucide-react";
import { Container, Section } from "@/components/layout";
import { LinkButton } from "@/components/link-button";
import { Reveal } from "@/components/motion";

export function FinalCTA() {
  return (
    <Section className="pb-28 pt-8">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card px-6 py-20 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
              <div className="bg-grid absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_50%_60%_at_50%_0%,black,transparent)]" />
              <div className="absolute left-1/2 top-[-40%] size-[480px] -translate-x-1/2 rounded-full bg-signal/10 blur-[100px]" />
            </div>

            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold leading-[1.08] sm:text-5xl">
              Your accent won&apos;t hold you back anymore.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
              Start a real conversation in your target accent, in your role, in your world — free
              today.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton href="#pricing" variant="signal" size="lg" className="group">
                Start speaking free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </LinkButton>
              <LinkButton href="#how-it-works" variant="outline" size="lg">
                Book a demo
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}