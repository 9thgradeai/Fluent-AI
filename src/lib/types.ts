// Shared client-side types mirroring the API responses.

export type UserProfile = {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  englishLevel: string;
  nativeLanguage: string;
  currentXp: number;
  level: number;
  timezone: string;
  emailVerified: boolean;
  streak: number;
};

export type Conversation = {
  id: string;
  type: string;
  accent: string;
  status: string;
  title: string;
  startedAt: string;
  endedAt?: string | null;
  summary?: string | null;
  _count?: { messages: number };
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  meta?: Record<string, unknown> | null;
};

export type Dashboard = {
  currentXp: number;
  level: number;
  streak: number;
  bestStreak: number;
  freezeAvailable: boolean;
  todayXp: number;
  recent: { date: string; skill: string; xp: number; minutes: number; messagesCount: number }[];
  totals: { vocab: number; mastered: number; conversations: number };
};

export type VocabularyItem = {
  id: string;
  term: string;
  definition: string | null;
  example: string | null;
  wordClass: string | null;
  level: string | null;
  status: string;
  intervalDays: number;
  dueAt: string;
  reviewCount: number;
};

export type Feedback = {
  overall: string;
  score: number;
  grammarIssues: { original: string; suggestion: string; explanation: string; severity: string }[];
  fluencyTips: string[];
  vocabSuggestions: { term: string; definition: string; example?: string; level?: string }[];
};
