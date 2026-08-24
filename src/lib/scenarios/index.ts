// Scenario engine types and registry.
// Defines conversation scenarios with personas, difficulty, goals, and evaluation criteria.

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type ScenarioCategory =
  | "general"
  | "job-interview"
  | "technical-interview"
  | "software-engineering"
  | "sales"
  | "customer-support"
  | "business"
  | "leadership"
  | "management"
  | "meetings"
  | "presentation"
  | "negotiation"
  | "networking"
  | "healthcare"
  | "finance"
  | "marketing"
  | "product-management"
  | "entrepreneurship"
  | "academic"
  | "travel"
  | "workplace"
  | "custom";

export interface ScenarioPersona {
  name: string;
  role: string;
  personality: string;
  communicationStyle: string;
  backgroundContext?: string;
}

export interface ScenarioGoal {
  id: string;
  description: string;
  weight: number; // 0-1, how important this goal is
  evaluationCriteria: string[];
}

export interface Scenario {
  id: string;
  category: ScenarioCategory;
  title: string;
  description: string;
  industry?: string;
  role?: string;
  difficulty: DifficultyLevel;
  persona: ScenarioPersona;
  goals: ScenarioGoal[];
  openingPrompt: string;
  constraints?: string[];
  knowledgeSources?: string[];
  maxTurns?: number;
  estimatedDurationMinutes?: number;
  tags: string[];
}

// --- Predefined scenarios ---

export const SCENARIOS: Scenario[] = [
  {
    id: "software-engineering-behavioral",
    category: "job-interview",
    title: "Software Engineering Behavioral Interview",
    description: "Practice answering behavioral interview questions for a software engineering role.",
    industry: "technology",
    role: "Software Engineer",
    difficulty: "intermediate",
    persona: {
      name: "Sarah",
      role: "Senior Engineering Manager",
      personality: "Professional, encouraging, detail-oriented",
      communicationStyle: "Asks follow-up questions, probes for specifics",
    },
    goals: [
      {
        id: "star-method",
        description: "Use the STAR method to structure responses",
        weight: 0.3,
        evaluationCriteria: ["Situation described", "Task identified", "Action explained", "Result shared"],
      },
      {
        id: "technical-communication",
        description: "Communicate technical concepts clearly",
        weight: 0.3,
        evaluationCriteria: ["Uses appropriate terminology", "Explains complex ideas simply", "Avoids jargon overload"],
      },
      {
        id: "specificity",
        description: "Provide specific examples rather than generic answers",
        weight: 0.2,
        evaluationCriteria: ["Mentions specific projects", "Includes measurable outcomes", "Names technologies used"],
      },
      {
        id: "confidence",
        description: "Demonstrate confident but not arrogant communication",
        weight: 0.2,
        evaluationCriteria: ["Speaks clearly", "Takes ownership", "Acknowledges learning"],
      },
    ],
    openingPrompt: "Hi, I'm Sarah, the engineering manager here. Thanks for coming in today. Let's start with a classic one — can you tell me about a time you had to solve a particularly challenging technical problem?",
    constraints: [
      "Respond in 2-3 paragraphs",
      "Include specific technical details",
      "Mention the impact of your solution",
    ],
    maxTurns: 12,
    estimatedDurationMinutes: 30,
    tags: ["behavioral", "STAR", "technical", "leadership"],
  },
  {
    id: "sales-objection-handling",
    category: "sales",
    title: "Sales Objection Handling",
    description: "Practice handling common sales objections in a B2B SaaS context.",
    industry: "technology",
    role: "Account Executive",
    difficulty: "advanced",
    persona: {
      name: "Michael",
      role: "VP of Engineering at a mid-size company",
      personality: "Skeptical, data-driven, busy",
      communicationStyle: "Direct, challenges claims, wants proof",
    },
    goals: [
      {
        id: "objection-response",
        description: "Address objections empathetically and with evidence",
        weight: 0.35,
        evaluationCriteria: ["Acknowledges concern", "Provides evidence", "Reframes positively"],
      },
      {
        id: "value-proposition",
        description: "Clearly articulate the value proposition",
        weight: 0.25,
        evaluationCriteria: ["Connects to pain points", "Quantifies benefits", "Differentiates from competitors"],
      },
      {
        id: "relationship-building",
        description: "Build rapport while maintaining professionalism",
        weight: 0.2,
        evaluationCriteria: ["Active listening", "Asks clarifying questions", "Shows genuine interest"],
      },
      {
        id: "closing",
        description: "Move toward a clear next step",
        weight: 0.2,
        evaluationCriteria: ["Proposes specific action", "Creates urgency", "Summarizes agreed points"],
      },
    ],
    openingPrompt: "Look, I appreciate the demo, but we've already got a solution in place and honestly, switching costs are really high. What makes you think we should even consider changing?",
    maxTurns: 10,
    estimatedDurationMinutes: 25,
    tags: ["objections", "B2B", "SaaS", "persuasion"],
  },
  {
    id: "general-travel",
    category: "travel",
    title: "Travel Planning Conversation",
    description: "Practice making hotel reservations and asking for recommendations.",
    difficulty: "beginner",
    persona: {
      name: "Receptionist",
      role: "Hotel Front Desk",
      personality: "Friendly, helpful, patient",
      communicationStyle: "Clear, simple vocabulary, willing to repeat",
    },
    goals: [
      {
        id: "clarity",
        description: "Communicate needs clearly",
        weight: 0.3,
        evaluationCriteria: ["States dates clearly", "Specifies room type", "Mentions special requirements"],
      },
      {
        id: "politeness",
        description: "Use polite and appropriate language",
        weight: 0.3,
        evaluationCriteria: ["Uses please/thank you", "Appropriate greetings", "Polite requests"],
      },
      {
        id: "comprehension",
        description: "Understand and respond to information",
        weight: 0.4,
        evaluationCriteria: ["Asks clarifying questions", "Confirms details", "Understands pricing"],
      },
    ],
    openingPrompt: "Good afternoon! Welcome to the Grand Plaza Hotel. How can I help you today?",
    maxTurns: 8,
    estimatedDurationMinutes: 15,
    tags: ["travel", "hotel", "booking", "beginner"],
  },
];

/**
 * Get a scenario by ID.
 */
export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

/**
 * List scenarios by category, difficulty, or tags.
 */
export function listScenarios(filters?: {
  category?: ScenarioCategory;
  difficulty?: DifficultyLevel;
  tags?: string[];
}): Scenario[] {
  return SCENARIOS.filter((s) => {
    if (filters?.category && s.category !== filters.category) return false;
    if (filters?.difficulty && s.difficulty !== filters.difficulty) return false;
    if (filters?.tags && !filters.tags.some((t) => s.tags.includes(t))) return false;
    return true;
  });
}

/**
 * Get adaptive difficulty based on performance.
 */
export function getAdaptiveDifficulty(
  currentDifficulty: DifficultyLevel,
  recentScores: number[],
): DifficultyLevel {
  if (recentScores.length < 3) return currentDifficulty;

  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  const levels: DifficultyLevel[] = ["beginner", "intermediate", "advanced", "expert"];
  const currentIndex = levels.indexOf(currentDifficulty);

  if (avgScore >= 85 && currentIndex < levels.length - 1) {
    return levels[currentIndex + 1]!;
  }
  if (avgScore < 60 && currentIndex > 0) {
    return levels[currentIndex - 1]!;
  }
  return currentDifficulty;
}
