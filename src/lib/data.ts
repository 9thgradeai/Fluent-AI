import {
  MessagesSquare,
  Mic,
  Languages,
  AudioLines,
  SpellCheck,
  BookOpen,
  TrendingUp,
  Compass,
  Briefcase,
  FileText,
  type LucideIcon,
} from "lucide-react";

export const site = {
  name: "FluentAI",
  url: "https://fluentai.app",
  tagline: "Master Real-World English Communication with AI.",
};

export const nav = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: MessagesSquare,
    title: "AI Conversations",
    description:
      "Hold natural, unscripted conversations with an AI that thinks on its feet — never a scripted chatbot.",
  },
  {
    icon: Mic,
    title: "Voice Practice",
    description:
      "Speak out loud and get immediate voice-driven coaching tuned to how you actually sound.",
  },
  {
    icon: Languages,
    title: "Accent Switching",
    description:
      "Move between American, British, Australian and more to build real-world listening flexibility.",
  },
  {
    icon: AudioLines,
    title: "Pronunciation Analysis",
    description:
      "Pinpoint the exact sounds, stress, and rhythm that need work — with guidance to fix them.",
  },
  {
    icon: SpellCheck,
    title: "Grammar Correction",
    description:
      "Real-time syntax and word-choice corrections that explain the 'why' behind every fix.",
  },
  {
    icon: BookOpen,
    title: "Vocabulary Builder",
    description:
      "Grow the words and phrases your career and goals actually demand, learned in context.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Watch confidence, fluency, and accuracy climb with clear, motivating metrics.",
  },
  {
    icon: Compass,
    title: "Learning Plans",
    description:
      "A personal roadmap built around your level, goals, and the time you have to practice.",
  },
  {
    icon: Briefcase,
    title: "Professional Roleplay",
    description:
      "Rehearse interviews, meetings, and calls with a coach that plays the other side fluently.",
  },
  {
    icon: FileText,
    title: "Session Summaries",
    description:
      "End every session with a clean recap, strengths, and exactly what to practice next.",
  },
];

export const howItWorks = [
  {
    step: "01",
    title: "Choose your accent",
    description:
      "Pick the English accent you want to sound natural in — American, British, Australian and more.",
  },
  {
    step: "02",
    title: "Choose your profession",
    description:
      "Tell FluentAI your role and goals, so every scenario feels relevant to your real life.",
  },
  {
    step: "03",
    title: "Start speaking",
    description:
      "Jump into a natural, unscripted conversation. Your AI partner listens, responds, and adapts.",
  },
  {
    step: "04",
    title: "Receive feedback",
    description:
      "Get instant, specific coaching on grammar, pronunciation, vocabulary, and fluency — plus a recap to keep.",
  },
];

export type Accent = {
  name: string;
  region: string;
  description: string;
};

export const accents: Accent[] = [
  {
    name: "American",
    region: "North America",
    description:
      "Clear, neutral delivery that is the global default for tech, business, and media.",
  },
  {
    name: "British",
    region: "United Kingdom",
    description:
      "Precise articulation and formal rhythm, ideal for finance, legal, and academia.",
  },
  {
    name: "Australian",
    region: "Australia",
    description:
      "Relaxed, warm and direct — popular for startups, hospitality, and everyday chat.",
  },
  {
    name: "Canadian",
    region: "Canada",
    description:
      "Friendly and measured, blending clarity with an approachable, professional tone.",
  },
  {
    name: "Irish",
    region: "Ireland",
    description:
      "Expressive and melodic, widely used in European tech and customer success teams.",
  },
  {
    name: "Indian",
    region: "India",
    description:
      "Confident and articulate — central to global IT, support, and engineering teams.",
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "I stopped dreading English meetings. After two months of roleplay interviews, I walked into a real one and the words just came out.",
    name: "Riya Sharma",
    role: "Software Engineer, Bengaluru",
    rating: 5,
  },
  {
    quote:
      "The accent switching is the killer feature. CS callers no longer throw me — I finally understand Australian customers.",
    name: "Diego Reyes",
    role: "Customer Support Lead",
    rating: 5,
  },
  {
    quote:
      "FluentAI plugged into my demo and made me sound senior. The pronunciation line by line is like having a voice coach on retainer.",
    name: "Anna Nowak",
    role: "Business Development",
    rating: 5,
  },
  {
    quote:
      "Went from fearing IELTS speaking to a Band 7.5. The daily practice plan did what months of classes never could.",
    name: "Tariq Aliyev",
    role: "Student, IELTS Candid",
    rating: 5,
  },
  {
    quote:
      "My team uses the Teams tier for onboarding, hires. Speaking confidence is up across the board.",
    name: "Linh Tran",
    role: "Engineering Manager",
    rating: 5,
  },
  {
    quote:
      "As a freelancer, I needed to sell in English. The sales-call scenarios gave me lines I use to close every week.",
    name: "Mateo Silva",
    role: "Freelance Designer",
    rating: 5,
  },
];

export type Plan = {
  name: string;
  description: string;
  price: number | "Custom";
  cadence: string;
  cta: string;
  featured?: boolean;
  features: string[];
};

export const pricing: Plan[] = [
  {
    name: "Free",
    description: "Explore the product and build a daily habit.",
    price: 0,
    cadence: "forever",
    cta: "Start for free",
    features: [
      "1 accent",
      "5 minutes of daily AI conversation",
      "Basic pronunciation feedback",
      "Community learning plans",
    ],
  },
  {
    name: "Pro",
    description: "Serious improvement for ambitious learners.",
    price: 19,
    cadence: "per month",
    cta: "Start 7-day trial",
    featured: true,
    features: [
      "All accents",
      "Unlimited AI conversations",
      "Full pronunciation & fluency analysis",
      "Professional roleplay scenarios",
      "Progress analytics & daily streaks",
      "Session summaries",
    ],
  },
  {
    name: "Teams",
    description: "For managers who level up entire teams.",
    price: 49,
    cadence: "per seat · month",
    cta: "Talk to sales",
    features: [
      "Everything in Pro",
      "Team reports & benchmarking",
      "Role-based learning plans",
      "SSO & advanced security",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    description: "Bespoke programs, security, and scale.",
    price: "Custom",
    cadence: "custom",
    cta: "Contact us",
    features: [
      "Everything in Teams",
      "Custom AI voice & accents",
      "LMS / SSO integrations",
      "Dedicated success manager",
      "SLA & onboarding",
    ],
  },
];

export const faqs = [
  {
    q: "How does FluentAI adapt to my level?",
    a: "Before you start, you answer a short skill check. FluentAI calibrates vocabulary, pacing, and feedback to your current level, then continuously nudges difficulty up as you improve.",
  },
  {
    q: "Which accents can I practice with?",
    a: "All our accents — American, British, Australian, Canadian, Irish, and Indian — come standard. Every accent is tuned with natural pacing and region-specific expressions so practice mirrors how people actually speak.",
  },
  {
    q: "Do I need a microphone?",
    a: "Not necessarily, but you'll get the most out of speaking out loud. Voice practice uses your device microphone on desktop and mobile. Everything is processed privately and never shared.",
  },
  {
    q: "Is it really relevant to my profession?",
    a: "Yes. Pick your role — software engineer, customer support, medical, sales, and many others — and FluentAI runs realistic scenarios like interviews, meetings, and tough calls, using the vocabulary you'll actually need.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Your Pro or Teams trial comes first, and you can cancel in one click — no calls to customer support. Your progress data is always exportable.",
  },
  {
    q: "Do you support reduced motion and accessibility?",
    a: "We genuinely care about it. FluentAI honors your system's reduced-motion setting, ships keyboard-friendly navigation with visible focus states, and passes WCAG AA contrast targets in both themes.",
  },
];

/** Trusted-by placeholder wordmark labels (not real brands). */
export const trustedBy = [
  "Northwind",
  "Radiant",
  "Acme Dental",
  "Blue-Lite",
  "Vertex Labs",
  "Coastal Co.",
];