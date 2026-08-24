<p align="center">
  <img src="./public/window.svg" alt="FluentAI" width="72" height="72" />
</p>

<h1 align="center">FluentAI — Master Real-World English Communication</h1>

<p align="center">
  <b>FluentAI</b> is an AI-powered English communication coaching platform. This repository contains the
  full product: the marketing landing page, the authenticated learner app (dashboard, conversations, vocabulary),
  and the production backend (Next.js API routes, Prisma + Postgres, session auth, and the AI coaching engine).
</p>

<p align="center">
  <a href="https://farhankabir133.github.io/FLUENT-AI/">🔗 Live Site</a>
  ·
  <a href="#-features">Features</a>
  ·
  <a href="#-tech-stack">Tech Stack</a>
  ·
  <a href="#-getting-started">Getting Started</a>
  ·
  <a href="#-deployment">Deployment</a>
  ·
  <a href="#-project-structure">Structure</a>
  ·
  <a href="#-design-system">Design System</a>
</p>

---

## 📖 What is FluentAI?

FluentAI helps learners **improve their English communication through AI-powered conversations with multiple
English accents**. Users practice speaking, listening, pronunciation, and fluency with an adaptive, career-focused
AI coach that:

- Holds **natural, unscripted conversations** (not scripted chatbots)
- Switches between **6 accents** — American, British, Australian, Canadian, Irish, and Indian
- Delivers **instant feedback** on pronunciation, grammar, vocabulary, and fluency
- Runs **professional roleplay scenarios** (interviews, meetings, sales calls)
- Tracks **progress, streaks, and learning analytics**

The product's headline promise is summarized in `src/lib/data.ts`:

> *"Master Real-World English Communication with AI."*

---

## ✨ Features

The landing page is a single scrolling page composed of these sections (in order):

| Section | Component | Purpose |
|---|---|---|
| Hero | `hero.tsx` | Bold headline, tagline, primary call-to-action |
| Trusted by | `trusted-by.tsx` | Placeholder brand wordmarks for social proof |
| Why FluentAI | `why-fluentai.tsx` | Value proposition and differentiators |
| Features | `features.tsx` | 10 capability cards (AI conversations, voice, accents, etc.) |
| How It Works | `how-it-works.tsx` | 4-step onboarding flow |
| Accents | `accents.tsx` | The 6 supported English accents |
| Conversation Preview | `conversation-preview.tsx` | Live UI mock of a coaching chat |
| Analytics | `analytics.tsx` | Dashboard mock with confidence chart & weekly bars |
| Testimonials | `testimonials.tsx` | 6 customer stories |
| Pricing | `pricing.tsx` | Free / Pro / Teams / Enterprise plans |
| FAQ | `faq.tsx` | Accordion of common questions |
| Final CTA | `final-cta.tsx` | Conversion push + newsletter signup |
| Footer | `footer.tsx` | Site links and meta |

All copy content (features, accents, testimonials, pricing, FAQs, nav) lives as typed data in
[`src/lib/data.ts`](src/lib/data.ts), so editing content rarely requires touching components.

---

## 🧱 Tech Stack

- **[Next.js 15](https://nextjs.org)** — App Router, server rendering + API route handlers
- **[React 19](https://react.dev)** — UI runtime
- **[TypeScript](https://www.typescriptlang.org)** — strict typing throughout
- **[Tailwind CSS v4](https://tailwindcss.com)** — utility-first styling with `@theme` design tokens
- **[shadcn/ui](https://ui.shadcn.com)** — accessible Radix-based component primitives
- **[Prisma](https://www.prisma.io)** + **PostgreSQL** — data layer, driver adapter (`@prisma/adapter-pg`), versioned migrations
- **[Vercel AI SDK](https://ai-sdk.dev)** — streaming chat + structured output (OpenAI / Anthropic / local mock)
- **[@node-rs/argon2](https://github.com/napi-rs/argon2)** — Argon2id password hashing; custom session auth with rotation
- **[zod](https://zod.dev)** — request validation at every API boundary
- **[Vitest](https://vitest.dev)** — unit tests
- **[Framer Motion](https://www.framer.com/motion)** — scroll-reveal and stagger animations (reduced-motion aware)
- **[lucide-react](https://lucide.dev)** & **[@phosphor-icons/react](https://phosphoricons.com)** — iconography
- **[next/font/google](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)** — **Sora** (headings) + **Inter** (body)

---

## 📁 Project Structure

```
.
├── prisma/                     # Data layer
│   ├── schema.prisma           # Models: users, sessions, conversations, messages, vocabulary, progress, XP, streaks, audit
│   ├── migrations/             # Versioned SQL migrations
│   └── seed.ts                 # Demo user + achievement catalog
├── src/
│   ├── app/
│   │   ├── globals.css         # Design tokens (light/dark), base styles, keyframes
│   │   ├── layout.tsx          # Root layout: fonts, metadata/SEO, theme pre-paint script
│   │   ├── page.tsx            # Landing: composes every section + JSON-LD
│   │   ├── login/ register/ dashboard/ conversations/   # Authenticated app UI
│   │   └── api/                # Backend route handlers
│   │       ├── auth/*          # register, login, logout, me
│   │       ├── conversations/* # list, create, single, streaming messages
│   │       ├── vocabulary/*    # CRUD
│   │       ├── flashcards/*    # spaced-repetition review
│   │       ├── progress/*      # dashboard aggregates
│   │       └── health          # liveness + DB check
│   ├── components/
│   │   ├── <section>/*.tsx     # Landing-page sections
│   │   ├── app/*.tsx           # App UI (chat, etc.)
│   │   ├── ui/*.tsx            # shadcn primitives
│   │   └── providers/          # ThemeProvider (light / dark / system)
│   └── lib/
│       ├── data.ts             # Landing site content + types
│       ├── utils.ts            # cn() classname helper
│       ├── types.ts            # Shared API response types
│       ├── client.ts           # fetch wrapper + useAuth
│       ├── http.ts             # RFC 7807 errors, rate limiting, api() wrapper
│       ├── errors.ts           # problem+json error model
│       ├── validation/         # zod request schemas
│       ├── domain/learning.ts  # Pure XP / streak / SM-2 rules (unit-tested)
│       ├── db/                 # Prisma client + repository layer
│       ├── auth/               # Argon2id, session tokens, guard, cookies
│       └── ai/                 # model gateway, streaming, grading, mock coach
├── middleware.ts               # Protects /dashboard and /conversations
├── next.config.ts              # Server build (no static export)
├── prisma.config.ts            # Prisma CLI config (env, migrations, seed)
├── docker-compose.yml          # Local Postgres
├── .env.example                # Env template
├── vitest.config.ts            # Unit test config
├── components.json             # shadcn/ui configuration
├── tsconfig.json               # Strict TS, @/* → ./src/* path alias
└── package.json
```

### `@/*` path alias

TypeScript maps `@/*` → `./src/*` (see `tsconfig.json`), so components import as `@/components/hero` rather than
relative paths.

---

## 🚀 Getting Started

Prerequisites: **Node.js 18+**, **npm**, and **PostgreSQL** (see below).

### 1. Start the database

```bash
# Option A — Docker (one command)
docker compose up -d          # Postgres 16 on localhost:5432 (fluentai/fluentai)

# Option B — Homebrew
brew install postgresql@16
/opt/homebrew/opt/postgresql@16/bin/pg_ctl -D /opt/homebrew/var/postgresql@16 start
psql -d postgres -c "CREATE ROLE fluentai LOGIN PASSWORD 'fluentai' CREATEDB;"
psql -d postgres -c "CREATE DATABASE fluentai OWNER fluentai;"
```

### 2. Configure environment

```bash
cp .env.example .env          # then set SESSION_SECRET (see the file)
```

### 3. Install, migrate, seed, run

```bash
npm install
npm run db:migrate            # apply Prisma migrations
npm run db:seed               # creates demo@fluentai.app / password123
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register (or sign in as the demo user) and start a
conversation. Without an AI API key the app uses a local demo coach; set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
in `.env` to get the full AI coach.

### Available scripts

| Script | Command | What it does |
|---|---|---|
| `dev` | `npm run dev` | Start the development server |
| `build` | `npm run build` | Generate the Prisma client, then build |
| `start` | `npm run start` | Serve the production build locally |
| `lint` | `npm run lint` | Run ESLint |
| `typecheck` | `npm run typecheck` | Type-check with `tsc --noEmit` |
| `test` | `npm run test` | Run the Vitest unit suite |
| `db:migrate` | `npm run db:migrate` | Apply Prisma migrations locally |
| `db:deploy` | `npm run db:deploy` | Apply migrations in CI/production |
| `db:seed` | `npm run db:seed` | Seed the database |
| `db:studio` | `npm run db:studio` | Open Prisma Studio |

---

## 🌐 Deployment (Vercel)

The app — landing page, authenticated dashboard, and API — is a single Next.js app deployed to **Vercel** (Fluid
Compute) with a managed **Neon Postgres**. It is **not** a static export; it requires a server runtime and a
database.

### 1. Create the project

Push this repo to GitHub and import it in Vercel. Set the framework to **Next.js** (auto-detected).

### 2. Provision a database

Add **Neon Postgres** from the Vercel Marketplace (or any Postgres provider) and copy its connection string.

### 3. Set environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon pooled connection string |
| `SESSION_SECRET` | ✅ | Long random string (≥32 chars). `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `APP_URL` | ✅ | Production URL, e.g. `https://<your-app>.vercel.app` |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | optional | Omit to run on the local demo coach |
| `AI_PROVIDER` | optional | `openai` or `anthropic` |

### 4. Deploy

`npm run build` runs `prisma generate` automatically. Run `npm run db:deploy` once against production (or a
`predev`/`postinstall` hook) to apply migrations, then `npm run db:seed` if you want the demo user.

> **Note:** Vercel provides the production `DATABASE_URL`; `next.config.ts` no longer contains the GitHub Pages
> static-export settings (`output: "export"`, `basePath`, `assetPrefix`).

### Verify a deploy

```bash
curl -s https://<your-app>.vercel.app/api/health
# {"status":"ok","db":"up",...}
```

---

## 🎨 Design System

The visual language is defined in `src/app/globals.css` using Tailwind v4 `@theme` tokens.

- **Palette:** calm, ink-based neutrals plus a single teal-green **"signal"** accent used for all call-to-action,
  progress, and emphasis states. Full semantic token set (`background`, `foreground`, `card`, `muted`, `primary`,
  `signal`, `border`, `destructive`, `chart-1…5`).
- **Theming:** full **light** and **dark** modes via a `.dark` class, driven by the ThemeProvider and a
  pre-paint inline script in `layout.tsx` that applies the saved/system theme before React hydrates — **no flash of
  unstyled theme**.
- **Typography:** **Sora** for headings (`--font-heading`, tight tracking), **Inter** for body (`--font-sans`).
- **Radius:** a single `--radius` token (`0.875rem`) scales to `sm`–`3xl` variants.
- **Motion:** Framer Motion scroll-reveals via the reusable `Reveal` / `StaggerGroup` / `StaggerItem` wrappers in
  `motion.tsx`, plus pure-CSS keyframes (`drift`, `eq`, `pulse-soft`, `score-ring`, `bg-grid`).
- **Colors:** defined in the **OKLCH** color space for perceptual consistency across themes.

### Accessibility

- Honors `prefers-reduced-motion` — animations collapse to fades/no travel.
- Keyboard-friendly navigation with visible `:focus-visible` states.
- Skip-to-content link.
- Semantic landmarks (`<main>`, `<section>`, `<nav>`) and `aria-label`s on non-text visuals.
- WCAG AA contrast targets in both light and dark themes (see the FAQ copy).

---

## ⚙️ Configuration & SEO

- **Metadata & OpenGraph** are centralized in `src/app/layout.tsx` (title template, description, keywords, OG/Twitter
  cards, `metadataBase`).
- **Structured data**: `page.tsx` injects a `SoftwareApplication` JSON-LD block (name, category, aggregate rating)
  for search-engine rich results.

---

## 🛠️ Customizing Content

Almost everything visitors read is data, not JSX. Edit `src/lib/data.ts` to change:

- Nav links (`nav`)
- Feature cards (`features`)
- How-it-works steps (`howItWorks`)
- Accents (`accents`)
- Testimonials (`testimonials`)
- Pricing plans (`pricing`)
- FAQ entries (`faqs`)
- Trusted-by wordmarks (`trustedBy`)

Each dataset has an exported TypeScript type (e.g. `Feature`, `Plan`, `Testimonial`) so adding items is
type-checked.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-change`.
3. Make your changes and run `npm run lint` and `npm run build` to validate.
4. Commit and open a pull request.

---

## 📄 License

This project is closed-source / proprietary. All rights reserved. The "trusted-by" brand names are placeholders and
not affiliated with their owners.

---

<p align="center">Made with ❤️ by <a href="https://github.com/farhankabir133">farhankabir133</a></p>
