"use client";

import * as React from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { nav } from "@/lib/data";
import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/link-button";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
    >
      <Sun className="size-[18px] dark:hidden" aria-hidden="true" />
      <Moon className="hidden size-[18px] dark:block" aria-hidden="true" />
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll when the mobile menu is open.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the mobile menu with Escape.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-8"
      >
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <LinkButton href="#" variant="ghost" size="sm">
            Sign in
          </LinkButton>
          <ThemeToggle />
          <LinkButton href="#pricing" variant="signal" size="md">
            Start free
          </LinkButton>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle className="max-lg:flex" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "overflow-hidden border-border bg-background transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[26rem] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
            <LinkButton href="#" variant="outline" className="w-full">
              Sign in
            </LinkButton>
            <LinkButton href="#pricing" variant="signal" className="w-full">
              Start free
            </LinkButton>
          </div>
        </div>
      </div>
    </header>
  );
}