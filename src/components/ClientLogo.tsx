"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ClientLogo({ initials, colorClass }: { initials: string; colorClass: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full font-heading text-sm font-semibold transition-all duration-300",
        colorClass,
        isHovered && "scale-105"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}