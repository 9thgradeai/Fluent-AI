<p align="center">
  <img src="./public/window.svg" alt="FluentAI" width="72" height="72" />
</p>

<h1 align="center">FluentAI — Master Real-World English Communication</h1>

<p align="center">
  <b>FluentAI</b> is an AI-powered English communication coaching platform. This repository contains the
  marketing landing page — a single-page, static, high-performance site that tells the FluentAI story, showcases
  its features, and drives conversions.
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

- **[Next.js 15](https://nextjs.org)** — App Router, static export (`output: "export"`)
- **[React 19](https://react.dev)** — UI runtime
- **[TypeScript](https://www.typescriptlang.org)** — strict typing throughout
- **[Tailwind CSS v4](https://tailwindcss.com)** — utility-first styling with `@theme` design tokens
- **[shadcn/ui](https://ui.shadcn.com)** — accessible Radix-based component primitives (`radix-ui`, `radix-lyra` style)
- **[Framer Motion](https://www.framer.com/motion)** — scroll-reveal and stagger animations (reduced-motion aware)
- **[lucide-react](https://lucide.dev)** & **[@phosphor-icons/react](https://phosphoricons.com)** — iconography
- **[next/font/google](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)** — **Sora** (headings) + **Inter** (body)
- **[gh-pages](https://github.com/tschaub/gh-pages)** — deploy to GitHub Pages

---

## 📁 Project Structure

```
.
├── public/                     # Static assets copied verbatim to the export root
│   └── .nojekyll               # Disables Jekyll so GitHub Pages serves _next/ assets
├── src/
│   ├── app/
│   │   ├── globals.css         # Design tokens (light/dark), base styles, keyframes
│   │   ├── layout.tsx          # Root layout: fonts, metadata/SEO, theme pre-paint script
│   │   └── page.tsx            # Home page: composes every section + JSON-LD
│   ├── components/
│   │   ├── <section>/*.tsx     # One file per landing-page section (see table above)
│   │   ├── layout.tsx          # <Container> + <Section> rhythm primitives
│   │   ├── motion.tsx          # <Reveal> / <StaggerGroup> / <StaggerItem> animation wrappers
│   │   ├── ui/*.tsx            # shadcn primitives (button, card, accordion, sheet, …)
│   │   └── providers/          # ThemeProvider (light / dark / system)
│   └── lib/
│       ├── data.ts             # ALL site content + TypeScript types
│       └── utils.ts            # cn() classname helper (clsx + tailwind-merge)
├── next.config.ts              # Static export, basePath, assetPrefix
├── components.json             # shadcn/ui configuration
├── tsconfig.json               # Strict TS, @/* → ./src/* path alias
└── package.json
```

### `@/*` path alias

TypeScript maps `@/*` → `./src/*` (see `tsconfig.json`), so components import as `@/components/hero` rather than
relative paths.

---

## 🚀 Getting Started

Prerequisites: **Node.js 18+** and **npm**.

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page hot-reloads as you edit.

### Available scripts

| Script | Command | What it does |
|---|---|---|
| `dev` | `npm run dev` | Start the development server |
| `build` | `npm run build` | Static-export the site into `out/` |
| `start` | `npm run start` | Serve the production build locally |
| `lint` | `npm run lint` | Run ESLint |
| `deploy` | `npm run deploy` | Publish `out/` to the `gh-pages` branch |

---

## 🌐 Deployment (GitHub Pages)

This site is configured as a **static export** hosted on **GitHub Pages** at:
`https://farhankabir133.github.io/FLUENT-AI/`

### Configuration

`next.config.ts` is the source of truth:

```ts
output: "export",       // static, framework-agnostic HTML/JS/CSS
images: { unoptimized: true },
trailingSlash: true,
basePath: "/FLUENT-AI", // matches the repo name → project site path
assetPrefix: "/FLUENT-AI/",
```

Because GitHub Pages serves this as a **project site** at the `/FLUENT-AI` subpath, `basePath` and `assetPrefix`
prefix every internal asset URL so they resolve correctly on the live site.

### The Jekyll gotcha (important)

GitHub Pages runs **Jekyll** by default, and Jekyll **refuses to serve any path starting with `_`** — so the entire
`_next/` directory (all JS/CSS/fonts) silently 404s, leaving a broken page.

The fix is an empty **`.nojekyll`** file at the export root, which disables Jekyll processing. It is:

1. Kept in `public/` so it ships with every build, **and**
2. Explicitly created on deploy via the `--nojekyll` flag:

```json
"deploy": "gh-pages -d out --nojekyll"
```

> ⚠️ The `--nojekyll` flag is required: `gh-pages` defaults to `dotfiles: false` and would drop a hand-placed
> `.nojekyll` file during copy. The flag creates it directly in the published branch.

### How to publish

After making changes:

```bash
npm run build && npm run deploy
```

This regenerates `out/` and pushes it to the `gh-pages` branch. GitHub Pages (configured in the repo's **Settings →
Pages** to serve from the `gh-pages` branch `/` root) automatically serves the new build. Give it ~1 minute to
propagate.

> **Note:** `out/` is gitignored — it's only ever committed to `gh-pages`, never to `main`. Keep `main` for source.

### Verify a deploy

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://farhankabir133.github.io/FLUENT-AI/
# 200
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
