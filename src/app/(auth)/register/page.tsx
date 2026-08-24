"use client";

import { Suspense, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/client";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ENGLISH_LEVELS = [
  { code: "A1", label: "Beginner", desc: "Can understand and use basic phrases" },
  { code: "A2", label: "Elementary", desc: "Can communicate in simple, routine tasks" },
  { code: "B1", label: "Intermediate", desc: "Can deal with most travel situations" },
  { code: "B2", label: "Upper-Intermediate", desc: "Can interact with fluency and spontaneity" },
  { code: "C1", label: "Advanced", desc: "Can express ideas fluently on complex topics" },
  { code: "C2", label: "Proficient", desc: "Near-native command of the language" },
] as const;

const NATIVE_LANGUAGES = [
  "Mandarin Chinese",
  "Spanish",
  "Hindi",
  "Arabic",
  "Portuguese",
  "Bengali",
  "Japanese",
  "Korean",
  "French",
  "German",
  "Other",
] as const;

const GOALS = [
  { id: "business", label: "Business English", desc: "Professional meetings and emails" },
  { id: "interview", label: "Interview Prep", desc: "Job interview practice" },
  { id: "academic", label: "Academic Writing", desc: "Essays and research papers" },
  { id: "casual", label: "Casual Conversation", desc: "Everyday chat fluency" },
  { id: "travel", label: "Travel English", desc: "Navigating English-speaking countries" },
  { id: "test", label: "IELTS / TOEFL Prep", desc: "Test preparation" },
] as const;

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M3.75 4.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V4.75a.25.25 0 0 0-.25-.25H3.75ZM2 4.75C2 3.784 2.784 3 3.75 3h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 16.25 17H3.75A1.75 1.75 0 0 1 2 15.25V4.75Z" clipRule="evenodd" />
      <path d="M10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-1.5 3a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M3.75 4.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V4.75a.25.25 0 0 0-.25-.25H3.75ZM2 4.75C2 3.784 2.784 3 3.75 3h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 16.25 17H3.75A1.75 1.75 0 0 1 2 15.25V4.75Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M13.02 8.98a.75.75 0 0 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 1 0 1.06 1.06L10 7.06l1.97 1.97.05-.05ZM6.98 11.02a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06L10 12.94l-1.97-1.97-.05.05Z" clipRule="evenodd" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPasswordStrength(pw: string): { label: string; level: number; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: "Weak", level: 1, color: "bg-destructive" };
  if (score <= 2) return { label: "Fair", level: 2, color: "bg-orange-400" };
  if (score <= 3) return { label: "Medium", level: 3, color: "bg-yellow-500" };
  if (score <= 4) return { label: "Strong", level: 4, color: "bg-signal" };
  return { label: "Very strong", level: 5, color: "bg-signal" };
}

/* ------------------------------------------------------------------ */
/*  Progress indicator                                                 */
/* ------------------------------------------------------------------ */

function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Step <span className="font-medium text-foreground">{step}</span> of {total}
        </span>
        <span className="font-medium text-signal">{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-signal transition-all duration-500 ease-out"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  /* --- Step state --- */
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  /* --- Account (step 1) --- */
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  /* --- English profile (step 2) --- */
  const [level, setLevel] = useState<string | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState("");

  /* --- Goals (step 3) --- */
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  /* --- UI state --- */
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleGoal = useCallback((id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }, []);

  const strength = getPasswordStrength(password);

  /* --- Validation per step --- */
  function canProceed(): boolean {
    if (step === 1) {
      return displayName.trim().length > 0 && email.trim().length > 0 && password.length >= 8 && agreed;
    }
    if (step === 2) {
      return level !== null;
    }
    return true; // step 3 — goals are optional
  }

  /* --- Navigation --- */
  function goNext() {
    if (!canProceed()) return;
    setError(null);
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  /* --- Submit --- */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canProceed()) return;
    setError(null);
    setSubmitting(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          displayName,
          englishLevel: level,
          nativeLanguage,
          goals: selectedGoals,
        }),
      });
      router.push(next);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("An account with that email already exists. Try signing in instead.");
      } else {
        setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      }
      setStep(1); // bring user back to review account details
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Progress */}
      <Progress step={step} total={totalSteps} />

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {step === 1 && "Create your account"}
          {step === 2 && "Your English profile"}
          {step === 3 && "Your learning goals"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === 1 && "Start your free trial — no credit card required"}
          {step === 2 && "Tell us so we can personalize your experience"}
          {step === 3 && "Select all that apply — you can change these later"}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ---- STEP 1: Account ---- */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Full name */}
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              autoComplete="name"
              placeholder="Jane Smith"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm",
                "placeholder:text-muted-foreground/50",
                "transition-colors duration-200",
                "focus:border-transparent focus:ring-2 focus:ring-signal focus:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={submitting}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm",
                "placeholder:text-muted-foreground/50",
                "transition-colors duration-200",
                "focus:border-transparent focus:ring-2 focus:ring-signal focus:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={submitting}
            />
          </div>

          {/* Password + strength */}
          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full rounded-lg border border-border bg-background py-2.5 pl-3.5 pr-10 text-sm",
                  "placeholder:text-muted-foreground/50",
                  "transition-colors duration-200",
                  "focus:border-transparent focus:ring-2 focus:ring-signal focus:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                disabled={submitting}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
            {/* Strength indicator */}
            {password.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors duration-300",
                        i <= strength.level ? strength.color : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Password strength:{" "}
                  <span className={cn(
                    "font-medium",
                    strength.level <= 1 && "text-destructive",
                    strength.level === 2 && "text-orange-500",
                    strength.level === 3 && "text-yellow-600",
                    strength.level >= 4 && "text-signal"
                  )}>
                    {strength.label}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* TOS */}
          <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border text-signal focus:ring-2 focus:ring-signal focus:ring-offset-0"
              disabled={submitting}
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="font-medium text-signal transition-colors hover:text-signal/80">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-signal transition-colors hover:text-signal/80">
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>
      )}

      {/* ---- STEP 2: English Profile ---- */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Level cards */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Current English level</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ENGLISH_LEVELS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLevel(l.code)}
                  className={cn(
                    "group flex flex-col items-start gap-1 rounded-lg border-2 p-3.5 text-left transition-all duration-200",
                    level === l.code
                      ? "border-signal bg-signal/5"
                      : "border-border bg-background hover:border-foreground/20 hover:bg-muted/50",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  disabled={submitting}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-base font-bold",
                        level === l.code ? "text-signal" : "text-foreground"
                      )}
                    >
                      {l.code}
                    </span>
                    {level === l.code && <CheckIcon className="size-4 text-signal" />}
                  </span>
                  <span className="text-xs font-medium text-foreground/80">{l.label}</span>
                  <span className="text-xs leading-snug text-muted-foreground">{l.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Native language */}
          <div className="space-y-1.5">
            <label htmlFor="reg-language" className="text-sm font-medium text-foreground">
              Native language
            </label>
            <select
              id="reg-language"
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              className={cn(
                "w-full appearance-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm",
                "transition-colors duration-200",
                "focus:border-transparent focus:ring-2 focus:ring-signal focus:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={submitting}
            >
              <option value="">Select your native language</option>
              {NATIVE_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ---- STEP 3: Goals ---- */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {GOALS.map((goal) => {
              const selected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    "group flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all duration-200",
                    selected
                      ? "border-signal bg-signal/5"
                      : "border-border bg-background hover:border-foreground/20 hover:bg-muted/50",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  disabled={submitting}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-200",
                      selected
                        ? "border-signal bg-signal text-signal-foreground"
                        : "border-border bg-background"
                    )}
                  >
                    {selected && <CheckIcon className="size-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{goal.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{goal.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedGoals.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No worries — you can skip this and set goals later.
            </p>
          )}
        </div>
      )}

      {/* ---- Navigation buttons ---- */}
      <div className="flex items-center gap-3 pt-2">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={goBack}
            disabled={submitting}
            className="gap-1.5"
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>
        )}

        {step < totalSteps ? (
          <Button
            type="button"
            variant="signal"
            size="lg"
            className="flex-1"
            onClick={goNext}
            disabled={!canProceed() || submitting}
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            variant="signal"
            size="lg"
            className="flex-1"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <Spinner />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        )}
      </div>

      {/* Sign-in link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-signal transition-colors hover:text-signal/80"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
