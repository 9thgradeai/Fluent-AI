import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * FluentAI wordmark + a minimal original voice-glyph (a rounded wave pulse).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="#top"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="FluentAI — back to top"
    >
      <span
        className="grid size-8 place-items-center rounded-xl bg-signal text-signal-foreground shadow-sm"
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="transition-transform duration-300 group-hover:scale-110"
        >
          <path
            d="M3 13h2.2l1.6-5 3 10 2.7-8 1.4 3H21"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">
        Fluent<span className="text-signal">AI</span>
      </span>
    </Link>
  );
}