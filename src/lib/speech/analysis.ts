// Speech analysis pipeline.
// Analyzes speech transcripts and audio metrics for fluency, pronunciation, and delivery.

export interface SpeechMetrics {
  /** Words per minute */
  wordsPerMinute: number;
  /** Total speaking duration in ms */
  speakingDurationMs: number;
  /** Average pause duration in ms */
  avgPauseDurationMs: number;
  /** Pause frequency (pauses per minute) */
  pauseFrequency: number;
  /** Filler word count */
  fillerWordCount: number;
  /** Filler word rate (per minute) */
  fillerWordRate: number;
  /** Self-correction count */
  selfCorrectionCount: number;
  /** Repetition count */
  repetitionCount: number;
  /** Hesitation markers */
  hesitationCount: number;
}

export interface PronunciationAnalysis {
  /** Overall pronunciation confidence (0-1) */
  confidence: number;
  /** Word-level pronunciation scores */
  wordScores?: Array<{
    word: string;
    confidence: number;
    phonemes?: string[];
  }>;
  /** Difficult sounds identified */
  difficultSounds: string[];
  /** Recurring pronunciation errors */
  recurringErrors: Array<{
    sound: string;
    frequency: number;
    suggestion: string;
  }>;
}

export interface DeliveryAnalysis {
  /** Speaking pace assessment */
  pace: "too_slow" | "slow" | "optimal" | "fast" | "too_fast";
  /** Clarity score (0-100) */
  clarityScore: number;
  /** Consistency of delivery */
  consistencyScore: number;
  /** Excessive pause indicator */
  hasExcessivePauses: boolean;
  /** Confidence indicators (objective, not psychological) */
  deliveryIndicators: string[];
}

// Filler words in English
const FILLER_WORDS = new Set([
  "um", "uh", "ah", "er", "like", "you know", "basically", "actually",
  "literally", "sort of", "kind of", "I mean", "right", "so",
  "well", "oh", "hmm", "huh",
]);

// Common hesitation patterns
const HESITATION_PATTERNS = [
  /\bI\s+think\s+maybe\b/i,
  /\bwell\s*,?\s*um\b/i,
  /\bso\s*,?\s*like\b/i,
];

/**
 * Analyze speech metrics from a transcript and timing data.
 */
export function analyzeSpeechMetrics(transcript: string, durationMs: number): SpeechMetrics {
  const words = transcript.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Words per minute
  const durationMinutes = durationMs / 60_000;
  const wordsPerMinute = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0;

  // Filler words
  const fillerCount = words.filter((w) => FILLER_WORDS.has(w.toLowerCase().replace(/[.,!?]/g, ""))).length;
  const fillerWordRate = durationMinutes > 0 ? Math.round(fillerCount / durationMinutes) : 0;

  // Repetitions (consecutive identical words)
  let repetitionCount = 0;
  for (let i = 1; i < words.length; i++) {
    if (words[i]!.toLowerCase() === words[i - 1]!.toLowerCase()) {
      repetitionCount++;
    }
  }

  // Hesitations
  let hesitationCount = 0;
  for (const pattern of HESITATION_PATTERNS) {
    const matches = transcript.match(pattern);
    if (matches) hesitationCount += matches.length;
  }

  // Pause estimation (based on punctuation and filler patterns)
  const pauseIndicators = (transcript.match(/[.!?]\s+/g) ?? []).length +
    (transcript.match(/,\s+/g) ?? []).length * 0.3;
  const avgPauseDurationMs = pauseIndicators > 0
    ? Math.round(durationMs / pauseIndicators)
    : 0;
  const pauseFrequency = durationMinutes > 0
    ? Math.round(pauseIndicators / durationMinutes)
    : 0;

  return {
    wordsPerMinute,
    speakingDurationMs: durationMs,
    avgPauseDurationMs,
    pauseFrequency,
    fillerWordCount: fillerCount,
    fillerWordRate,
    selfCorrectionCount: 0, // Would need sequential transcript comparison
    repetitionCount,
    hesitationCount,
  };
}

/**
 * Analyze pronunciation from transcript (limited without audio).
 */
export function analyzePronunciation(transcript: string): PronunciationAnalysis {
  const words = transcript.split(/\s+/).filter(Boolean);

  // Identify potentially difficult words (long, multi-syllable)
  const difficultWords = words.filter((w) => w.length > 8 || /[tʃ][ʃ]/.test(w));

  return {
    confidence: 0.85, // Default without audio analysis
    difficultSounds: difficultWords.slice(0, 5).map((w) => w.toLowerCase()),
    recurringErrors: [],
  };
}

/**
 * Analyze delivery characteristics.
 */
export function analyzeDelivery(metrics: SpeechMetrics): DeliveryAnalysis {
  // Optimal speaking pace: 120-160 WPM for conversational English
  let pace: DeliveryAnalysis["pace"] = "optimal";
  if (metrics.wordsPerMinute < 80) pace = "too_slow";
  else if (metrics.wordsPerMinute < 120) pace = "slow";
  else if (metrics.wordsPerMinute > 200) pace = "too_fast";
  else if (metrics.wordsPerMinute > 160) pace = "fast";

  // Clarity score (based on filler words and repetitions)
  const clarityScore = Math.max(0, Math.min(100,
    100 - metrics.fillerWordRate * 2 - metrics.repetitionCount * 5
  ));

  // Consistency (inverse of pause frequency variance — simplified)
  const consistencyScore = Math.max(0, Math.min(100,
    100 - Math.abs(metrics.pauseFrequency - 10) * 3
  ));

  const hasExcessivePauses = metrics.pauseFrequency > 20 || metrics.avgPauseDurationMs > 3000;

  const deliveryIndicators: string[] = [];
  if (pace === "too_slow" || pace === "slow") {
    deliveryIndicators.push("Speaking pace is below the target range for conversational English.");
  }
  if (pace === "fast" || pace === "too_fast") {
    deliveryIndicators.push("Speaking pace is above the target range — slower pacing may improve clarity.");
  }
  if (metrics.fillerWordRate > 5) {
    deliveryIndicators.push("Filler word usage is above average — brief pauses are a cleaner alternative.");
  }
  if (hasExcessivePauses) {
    deliveryIndicators.push("Pause frequency is higher than typical for this conversation type.");
  }
  if (metrics.repetitionCount > 2) {
    deliveryIndicators.push("Word repetitions detected — try rephrasing rather than repeating.");
  }

  return {
    pace,
    clarityScore,
    consistencyScore,
    hasExcessivePauses,
    deliveryIndicators,
  };
}
