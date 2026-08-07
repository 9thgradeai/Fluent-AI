import * as React from "react";
import { cn } from "@/lib/utils";

/** Centered content wrapper with a consistent horizontal rhythm. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6 sm:px-8", className)}>
      {children}
    </div>
  );
}

/** Vertical rhythm wrapper for a page section. */
export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-24 sm:py-32", className)}>
      {children}
    </section>
  );
}