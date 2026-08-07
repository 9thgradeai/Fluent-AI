import { trustedBy } from "@/lib/data";
import { Container } from "@/components/layout";
import { Reveal } from "@/components/motion";

export function TrustedBy() {
  return (
    <Container className="pb-6 pt-2">
      <Reveal>
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Helping confident communicators at modern teams
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {trustedBy.map((name) => (
            <li
              key={name}
              className="font-heading text-lg font-semibold tracking-tight text-foreground/50 transition-colors hover:text-foreground"
            >
              {name}
            </li>
          ))}
        </ul>
      </Reveal>
    </Container>
  );
}