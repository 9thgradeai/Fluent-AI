"use client";

import * as React from "react";

type Theme = "light" | "dark";

const ThemeContext = React.createContext<{
  theme: Theme;
  toggle: () => void;
} | null>(null);

const storageKey = "fluentai-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(storageKey);
  if (stored === "light" || stored === "dark") return stored;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer (guarded for SSR) — the pre-paint inline script in <head>
  // already applied the correct class, so this just syncs state without a flash.
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  const value = React.useMemo(
    () => ({ theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** Little island that renders an inline theme-color so the browser chrome matches. */
export function ThemeStyle() {
  return (
    <style>{`
      :root { color-scheme: light; }
      .dark { color-scheme: dark; }
    `}</style>
  );
}
