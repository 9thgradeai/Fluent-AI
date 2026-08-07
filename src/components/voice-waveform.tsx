import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Animated "voice" equalizer bars. Pure CSS, honors reduced-motion globally.
 */
export function VoiceWaveform({
  bars = 24,
  className,
  barClassName,
}: {
  bars?: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div
      className={cn("flex h-6 items-center gap-[3px]", className)}
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn("eq-bar w-[3px] rounded-full bg-current", barClassName)}
          style={{ height: `${38 + ((i * 37) % 62)}%`, opacity: 1 - 0.4 * (i % 4 === 3 ? 1 : 0) }}
        />
      ))}
    </div>
  );
}