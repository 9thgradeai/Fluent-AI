import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { template: "%s | FluentAI", default: "FluentAI" },
};

const FEATURES = [
  { icon: "accent", text: "Real-time pronunciation feedback" },
  { icon: "accent", text: "6 native English accents to practice" },
  { icon: "accent", text: "Personalized learning paths" },
  { icon: "accent", text: "Track progress with AI analytics" },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FluentAILogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 32"
      fill="none"
      className={className}
      aria-label="FluentAI"
    >
      <text
        x="0"
        y="25"
        fill="currentColor"
        fontFamily="var(--font-heading), sans-serif"
        fontWeight="700"
        fontSize="26"
        letterSpacing="-0.03em"
      >
        Fluent
      </text>
      <text
        x="78"
        y="25"
        fill="var(--signal-foreground)"
        fontFamily="var(--font-heading), sans-serif"
        fontWeight="700"
        fontSize="26"
        letterSpacing="-0.03em"
      >
        AI
      </text>
    </svg>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left panel — branding */}
      <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-primary px-8 py-10 md:flex md:w-[60%] lg:px-16">
        {/* Subtle grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-grid opacity-[0.04]"
          aria-hidden="true"
        />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <FluentAILogo className="h-8 w-auto text-primary-foreground" />
          </Link>
        </div>

        {/* Center: Tagline + features */}
        <div className="relative z-10 max-w-lg space-y-10">
          <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-primary-foreground lg:text-4xl">
            Master Real-World
            <br />
            English Communication
          </h1>

          <ul className="space-y-4">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 shrink-0 text-signal" />
                <span className="text-sm text-primary-foreground/70 lg:text-base">
                  {f.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: Social proof */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Stacked avatar circles */}
          <div className="flex -space-x-2" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="size-8 rounded-full border-2 border-primary bg-signal/20"
                style={{ zIndex: 4 - i }}
              />
            ))}
          </div>
          <p className="text-xs text-primary-foreground/50 lg:text-sm">
            Join <span className="font-medium text-primary-foreground/80">10,000+</span>{" "}
            learners worldwide
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-1 items-center justify-center px-6 py-10 md:w-[40%] md:px-8 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile-only branding */}
          <div className="mb-8 flex flex-col items-start gap-3 md:hidden">
            <Link href="/" className="inline-block">
              <FluentAILogo className="h-7 w-auto text-foreground" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Master real-world English
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
