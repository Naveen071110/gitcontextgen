import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, FileCode2, ArrowRight } from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://repopulse-ai.singhnaveen360.workers.dev';

export const metadata: Metadata = {
  title: 'GitHub Copilot Instructions Generator | Repository Custom Instructions',
  description: 'Generate official .github/copilot-instructions.md files from any GitHub repository to customize Copilot code completions.',
  keywords: [
    'copilot instructions generator',
    '.github/copilot-instructions.md',
    'GitHub Copilot repository rules',
    'customize GitHub Copilot completions',
    'Copilot custom instructions template',
  ],
  openGraph: {
    title: 'GitHub Copilot Instructions Generator | Repository Custom Instructions',
    description: 'Generate official .github/copilot-instructions.md files from any GitHub repository.',
    url: `${baseUrl}/copilot-instructions-generator`,
    siteName: 'GitContextGen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub Copilot Instructions Generator | Repository Custom Instructions',
    description: 'Generate official .github/copilot-instructions.md files from any GitHub repository.',
  },
  alternates: {
    canonical: '/copilot-instructions-generator',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'GitHub Copilot Custom Instructions Generator',
  description: 'Automated tool to generate .github/copilot-instructions.md files for GitHub Copilot repository customization.',
  url: `${baseUrl}/copilot-instructions-generator`,
  inLanguage: 'en-US',
  author: {
    '@type': 'Organization',
    name: 'GitContextGen',
    url: baseUrl,
  },
};

export default function CopilotInstructionsGeneratorPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Structural Top Navbar Offset Spacer */}
      <div className="w-full h-20 sm:h-24 shrink-0 pointer-events-none" />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-20 flex flex-col items-center text-center">
        <div className="w-fit inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-cyan-400 mb-6">
          <ShieldCheck className="w-4 h-4" /> Official Copilot Instructions Adapter
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Copilot Instructions Generator for <span className="text-cyan-300 font-serif italic">GitHub Copilot.</span>
        </h1>

        <p className="text-white/60 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-sans">
          Generate official <code className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">.github/copilot-instructions.md</code> repository files so Copilot completions match your exact stack rules.
        </p>

        <div className="w-full p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-left space-y-6 mb-12 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-2">
              <FileCode2 className="w-4 h-4" /> .github/copilot-instructions.md Preview
            </span>
            <span className="text-[10px] font-mono uppercase bg-emerald-950/60 text-emerald-300 px-3 py-1 rounded-md">
              Copilot Ready
            </span>
          </div>

          <pre className="p-6 rounded-xl bg-black font-mono text-xs sm:text-sm text-white/80 overflow-x-auto leading-relaxed">
{`# GitHub Copilot Repository Custom Instructions

## Project Context
Framework: Next.js App Router & Tailwind CSS.

## Code Style
- Use TypeScript functional components with explicit return types.
- Ensure all API routes validate incoming JSON payloads.`}
          </pre>
        </div>

        <Link
          href="/?format=copilot"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-2xl"
        >
          Generate Copilot Instructions in Free Sandbox <ArrowRight className="w-4 h-4" />
        </Link>
      </main>

      <Footer />
    </div>
  );
}
