import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://repopulse-ai.singhnaveen360.workers.dev"),
  title: "GitContextGen | High-Fidelity AI Context Engine for Cursor, Claude & Replit",
  description:
    "Stop fighting your AI co-pilot. Automatically audit any GitHub repository, detect CVE vulnerabilities via OSV.dev, export Kroki architecture diagrams, and generate zero-hallucination context files directly for Sonnet 5, Cursor, Claude Code, and Replit.",
  keywords: [
    "GitContextGen",
    "AI context engine",
    "AGENTS.md generator",
    "CLAUDE.md generator",
    ".cursorrules generator",
    "copilot instructions generator",
    "OSV.dev vulnerability audit",
    "Kroki architecture diagrams",
    "QuickChart radar scorecard",
    "SPDX license guardrails",
    "replit AI floor plan",
    "no-code developer AI tools",
    "solopreneur AI workflow",
    "agency multi-repo audit",
    "zero-hallucination AI context",
  ],
  authors: [{ name: "GitContextGen Team" }],
  openGraph: {
    title: "GitContextGen | High-Fidelity AI Context Engine for Everyone Who Builds",
    description:
      "Automatically audit any repository, resolve complex logic, and deliver a zero-hallucination 'Floor Plan' directly to Cursor, Claude, or Replit. Built for Agencies, Solopreneurs, and No-Code Builders.",
    url: "https://repopulse-ai.singhnaveen360.workers.dev",
    siteName: "GitContextGen",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://repopulse-ai.singhnaveen360.workers.dev/og-image.png",
        width: 1200,
        height: 630,
        alt: "GitContextGen AI Context Engine & Repository Auditor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitContextGen | High-Fidelity AI Context Engine for Everyone Who Builds",
    description:
      "Automatically audit any repository, resolve complex logic, and deliver a zero-hallucination 'Floor Plan' directly to Cursor, Claude, or Replit. Built for Agencies, Solopreneurs, and No-Code Builders.",
    images: ["https://repopulse-ai.singhnaveen360.workers.dev/og-image.png"],
  },
  alternates: {
    canonical: "https://repopulse-ai.singhnaveen360.workers.dev",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GitContextGen",
  operatingSystem: "Any",
  applicationCategory: "DeveloperApplication",
  url: "https://repopulse-ai.singhnaveen360.workers.dev",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.95",
    reviewCount: "128",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Solo Builder Plan (Monthly)",
      price: "19",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      description: "For solo developers and no-code builders shipping products with Cursor, Claude, or Replit."
    },
    {
      "@type": "Offer",
      name: "Solo Builder Plan (Yearly)",
      price: "16",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      description: "Billed annually at $192/year (Save 15%)."
    },
    {
      "@type": "Offer",
      name: "Agency Pro Plan (Monthly)",
      price: "79",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      description: "For development agencies managing client projects and multi-repo architectures."
    },
    {
      "@type": "Offer",
      name: "Agency Pro Plan (Yearly)",
      price: "67",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      description: "Billed annually at $804/year (Save 15%)."
    },
    {
      "@type": "Offer",
      name: "Founder Lifetime Pass (One-Time)",
      price: "249",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      description: "Permanent lifetime access to all current and future AI context tools with zero recurring subscription fees."
    }
  ],
  description:
    "Automatically audit any repository, resolve complex logic, and deliver a zero-hallucination 'Floor Plan' directly to Cursor, Claude, or Replit. Built for Agencies, Solopreneurs, and No-Code Builders.",
  featureList: [
    "High-Fidelity AI Context Engine for Cursor, Claude & Replit",
    "Automated AGENTS.md, CLAUDE.md, .cursorrules & replit.md Exporters",
    "Mermaid.js System Architecture Mapping & Dependency Graphing",
    "3-Line Direct Truth Summary & Agent Readiness Score Meter",
    "Context Drift Receiver & Automated Pull Request Sync",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} dark h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-black text-white">
        {children}
      </body>
    </html>
  );
}
