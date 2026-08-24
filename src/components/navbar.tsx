"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon, Search } from "lucide-react";
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
        "grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted",
        className
      )}
    >
      <Sun className="size-[18px] dark:hidden" aria-hidden="true" />
      <Moon className="hidden size-[18px] dark:block" aria-hidden="true" />
    </button>
  );
}

function SearchBar() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Array<{ title: string; url: string }>>([]);

  const handleSearch = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API or filter data
    setResults([
      { title: "How to improve pronunciation", url: "#" },
      { title: "Mastering business English", url: "#" },
      { title: "Accent reduction techniques", url: "#" }
    ]);
  }, []);

  return (
    <div className="relative w-64">
      <form onSubmit={handleSearch} className="w-full">
        <input
          type="text"
          placeholder="Search FluentAI..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full px-4 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-signal/50"
          aria-label="Search FluentAI content"
        />
        <button
          type="submit"
          className="absolute left-2 top-1/2 -translate-y-1/2 text-signal/50 pointer-events-none"
          aria-hidden="true"
        >
          <Search className="size-4" />
        </button>
      </form>
      {results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
          {results.map((result, index) => (
            <div key={index} className="px-3 py-2 hover:bg-muted/50 cursor-pointer">
              <Link href={result.url} className="block text-sm font-medium">
                {result.title}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
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

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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

        {/* Search bar */}
        <div className="hidden items-center gap-2 lg:flex">
          <SearchBar />
        </div>

        <div className="hidden items-center gap-2 lg:flex">
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
          <LinkButton href="/login" variant="ghost" size="sm">Sign in</LinkButton>
          <ThemeToggle className="max-lg:flex" />
          <LinkButton href="/register" variant="signal" size="md">Start free</LinkButton>
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
            <LinkButton href="/login" variant="outline" className="w-full">
              Sign in
            </LinkButton>
            <LinkButton href="/register" variant="signal" className="w-full">
              Start free
            </LinkButton>
          </div>
        </div>
      </div>
    </header>
  );
}