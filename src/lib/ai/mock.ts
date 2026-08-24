// Deterministic local "coach" used when no provider key is configured.
// Lets the whole app run offline and be tested without external accounts.

import type { Accent, ConversationType } from "@prisma/client";

const ACCENT_OPENERS: Record<Accent, string> = {
  american: "Nice. So",
  british: "Lovely. So",
  australian: "Yeah, good one. So",
  canadian: "That's great. So",
  irish: "Ah sure, grand. So",
  indian: "Excellent. So",
};

const TYPE_FOLLOW_UP: Record<ConversationType, string> = {
  free: "tell me more about that — what makes you say so?",
  roleplay: "you're in the middle of the scenario — how would you handle the next step?",
  interview: "that's a solid answer — can you give a concrete example from your experience?",
  meeting: "how would you steer that point back to the meeting's agenda?",
  ielts: "let's extend that — do you also see a downside?",
  toefl: "good — now connect that to a specific example.",
  business: "and how would you phrase that to close the deal politely?",
};

export function mockCoachReply(opts: {
  accent: Accent;
  type: ConversationType;
  userContent: string;
}): string {
  const opener = ACCENT_OPENERS[opts.accent];
  const followUp = TYPE_FOLLOW_UP[opts.type];
  const sample = samplePhrase(opts.userContent);
  return `${opener} you've made a clear point there — “${sample}” works well in everyday ${opts.type} English. ${followUp} (This is FluentAI's local demo coach — add an OpenAI or Anthropic API key to get the full AI coach.)`;
}

function samplePhrase(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 8) return text.trim();
  return words.slice(0, 8).join(" ");
}
