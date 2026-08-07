import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { TrustedBy } from "@/components/trusted-by";
import { WhyFluentAI } from "@/components/why-fluentai";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { Accents } from "@/components/accents";
import { ConversationPreview } from "@/components/conversation-preview";
import { Analytics } from "@/components/analytics";
import { Testimonials } from "@/components/testimonials";
import { Pricing } from "@/components/pricing";
import { FAQ } from "@/components/faq";
import { FinalCTA } from "@/components/final-cta";
import { Footer } from "@/components/footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FluentAI",
  applicationCategory: "EducationalApplication",
  operatingSystem: "ANY",
  description:
    "AI-powered English communication coaching with multiple English accents, career-focused scenarios, and instant feedback.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "1120",
  },
};

export default function Home() {
  return (
    <ThemeProvider>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Hero />
        <TrustedBy />
        <WhyFluentAI />
        <Features />
        <HowItWorks />
        <Accents />
        <ConversationPreview />
        <Analytics />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </ThemeProvider>
  );
}