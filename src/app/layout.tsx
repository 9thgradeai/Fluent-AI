import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FluentAI — Master Real-World English Communication",
    template: "%s · FluentAI",
  },
  description:
    "FluentAI helps you improve your English communication through AI-powered conversations with multiple English accents. Practice speaking, listening, pronunciation, and fluency with instant, career-focused feedback.",
  keywords: [
    "AI English speaking practice",
    "English conversation practice",
    "pronunciation coach",
    "accent training",
    "IELTS speaking practice",
    "fluency coach",
  ],
  openGraph: {
    title: "FluentAI — Master Real-World English Communication",
    description:
      "Practice real-world English with an AI coach that adapts to your profession, level, and accent.",
    type: "website",
    locale: "en_US",
    url: "https://fluentai.app",
    siteName: "FluentAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "FluentAI — Master Real-World English Communication",
    description:
      "Practice real-world English with an AI coach that adapts to your profession, level, and accent.",
  },
  metadataBase: new URL("https://fluentai.app"),
};

// Pre-paint inline script: apply the saved/system theme to <html> before React
// hydrates, so dark mode never flashes. Mirrors the logic in ThemeProvider.
const themeScript = `(function(){try{var s=localStorage.getItem('fluentai-theme');var dark=s? s==='dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;if(dark)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        {children}
      </body>
    </html>
  );
}