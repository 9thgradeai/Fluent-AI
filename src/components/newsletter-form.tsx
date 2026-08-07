"use client";

import * as React from "react";
import { Check } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);
  const id = "newsletter";

  return (
    <form
      className="flex w-full max-w-sm items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setDone(true);
      }}
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input
        id={id}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={done ? "You're on the list!" : "Get fluency tips weekly"}
        disabled={done}
        className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={done}
        className="grid h-11 shrink-0 place-items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-70"
      >
        {done ? <Check className="size-4" aria-hidden="true" /> : "Join"}
      </button>
    </form>
  );
}