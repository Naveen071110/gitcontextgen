import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, FileCode2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CLAUDE.md Generator | Instant Codebase Context for Claude 5 & Claude Code',
  description: 'Generate formatted CLAUDE.md files from any GitHub repository so Claude Code & Sonnet write perfect code with zero hallucinations.',
  keywords: [
    'CLAUDE.md generator',
    'Claude code rules',
    'Claude codebase context',
    'github to CLAUDE.md',
    'Claude 5 Sonnet prompt context',
    'context engineering for Claude',
    'Claude project memory configuration',
  ],
  openGraph: {
    title: 'CLAUDE.md Generator | Instant Codebase Context for Claude 5 & Claude Code',
    description: 'Generate formatted CLAUDE.md files from any GitHub repository so Claude Code & Sonnet write perfect code with zero hallucinations.',
    url: 'https://gitcontextgen.com/claude-md-generator',
    siteName: 'GitContextGen',
    type: 'website',
    images: [
      {
        url: 'https://gitcontextgen.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CLAUDE.md Generator by GitContextGen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CLAUDE.md Generator | Instant Codebase Context for Claude 5 & Claude Code',
    description: 'Generate formatted CLAUDE.md files from any GitHub repository instantly.',
    images: ['https://gitcontextgen.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://gitcontextgen.com/claude-md-generator',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'CLAUDE.md Context Specification Generator for Claude AI & Claude Code',
  description: 'Automated tool to create repository-level CLAUDE.md context files for Anthropic Claude 5 Sonnet and Claude Code agent.',
  url: 'https://gitcontextgen.com/claude-md-generator',
  inLanguage: 'en-US',
  author: {
    '@type': 'Organization',
    name: 'GitContextGen',
    url: 'https://gitcontextgen.com',
  },
};

export default function ClaudeMdGeneratorPage() {
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
          <ShieldCheck className="w-4 h-4" /> CLAUDE.md Specification Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          CLAUDE.md Generator for <span className="text-cyan-300 font-serif italic">Claude AI & Sonnet.</span>
        </h1>

        <p className="text-white/60 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-sans">
          Give Claude Code and web assistants an exact blueprint of your file tree, build scripts, and coding conventions so it never breaks your project.
        </p>

        <div className="w-full p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-left space-y-6 mb-12 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-2">
              <FileCode2 className="w-4 h-4" /> CLAUDE.md Output Preview
            </span>
            <span className="text-[10px] font-mono uppercase bg-cyan-950/60 text-cyan-300 px-3 py-1 rounded-md">
              Claude Optimized
            </span>
          </div>

          <pre className="p-6 rounded-xl bg-black font-mono text-xs sm:text-sm text-white/80 overflow-x-auto leading-relaxed">
{`# CLAUDE.md - Technical Specification

## Project Overview
Next.js App Router project with TypeScript and Tailwind CSS.

## Essential Commands
- Development: npm run dev
- Build Verification: npm run build
- Typecheck: npx tsc --noEmit

## Code Guidelines
- Use React Server Components by default.
- Place client interactions in /components with 'use client' directive.`}
          </pre>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-2xl"
        >
          Generate CLAUDE.md Now <ArrowRight className="w-4 h-4" />
        </Link>
      </main>

      <Footer />
    </div>
  );
}
