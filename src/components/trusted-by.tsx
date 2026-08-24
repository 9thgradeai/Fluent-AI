import Image from "next/image";
import { trustedBy } from "@/lib/data";
import { Container } from "@/components/layout";
import { Reveal } from "@/components/motion";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TrustedBy() {
  return (
    <Container className="pb-6 pt-2">
      <Reveal>
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Helping confident communicators at modern teams
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {trustedBy.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <Image
                src={`https://placehold.co/60x40/${initials(name)}`}
                alt={name}
                width={60}
                height={40}
                className="object-contain"
                aria-hidden="true"
              />
              <span className="font-heading text-lg font-semibold tracking-tight text-foreground/70 transition-colors hover:text-foreground">
                {name}
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </Container>
  );
}