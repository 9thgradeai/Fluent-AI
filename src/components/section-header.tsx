import * as React from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";

/**
 * Consistent eyebrow → heading → lede block. Centered or left-aligned.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
  id?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start text-left"
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground">
        <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
        {eyebrow}
      </span>
      <h2
        id={id}
        className="max-w-2xl text-balance text-3xl font-semibold leading-[1.08] sm:text-4xl md:text-[2.75rem]"
      >
        {title}
      </h2>
      {description ? (
        <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}