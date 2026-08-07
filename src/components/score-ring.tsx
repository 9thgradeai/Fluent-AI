import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Circular score indicator using a conic-gradient ring.
 * `value` is a 0–100 percentage. Reads fine in both themes.
 */
export function ScoreRing({
  value,
  label,
  size = 64,
  className,
}: {
  value: number;
  label: string;
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("grid shrink-0 place-items-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--signal) ${clamped}%, var(--border) ${clamped}% 100%)`,
        padding: Math.max(3, size * 0.05),
      }}
      role="img"
      aria-label={`${label}: ${value} percent`}
    >
      <span
        className="grid size-full place-items-center rounded-full bg-background"
        style={{ background: "var(--background)" }}
      >
        <span className="font-heading font-semibold leading-none" style={{ fontSize: size * 0.28 }}>
          {clamped}
          <span className="text-[0.65em] font-normal text-muted-foreground">%</span>
        </span>
      </span>
    </div>
  );
}