import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, FileCode2, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AGENTS.md Generator | Free Vendor-Neutral AI Agent Context Spec',
  description: 'Instantly generate an evidence-backed AGENTS.md file for any GitHub repository. Works seamlessly across Claude Code, GitHub Copilot, Cursor IDE, Replit Agent, and Windsurf.',
  keywords: [
    'AGENTS.md generator',
    'AGENTS.md open standard',
    'AI coding agent instructions',
    'github repo to AGENTS.md',
    'vendor neutral AI context',
    'context engineering for LLMs',
    'AI agent prompt specification',
  ],
  openGraph: {
    title: 'AGENTS.md Generator | Free Vendor-Neutral AI Agent Context Spec',
    description: 'Instantly generate an evidence-backed AGENTS.md file for any GitHub repository. Works across Claude, Copilot, Cursor, Replit, and Windsurf.',
    url: 'https://gitcontextgen.com/agents-md-generator',
    siteName: 'GitContextGen',
    type: 'website',
    images: [
      {
        url: 'https://gitcontextgen.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AGENTS.md Generator by GitContextGen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AGENTS.md Generator | Free Vendor-Neutral AI Agent Context Spec',
    description: 'Instantly generate an evidence-backed AGENTS.md file for any GitHub repository.',
    images: ['https://gitcontextgen.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://gitcontextgen.com/agents-md-generator',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'AGENTS.md Specification Generator for AI Coding Agents',
  description: 'Automated tool to create vendor-neutral AGENTS.md context specifications from GitHub repositories.',
  url: 'https://gitcontextgen.com/agents-md-generator',
  inLanguage: 'en-US',
  author: {
    '@type': 'Organization',
    name: 'GitContextGen',
    url: 'https://gitcontextgen.com',
  },
};

export default function AgentsMdGeneratorPage() {
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
          <ShieldCheck className="w-4 h-4" /> Open Standard AGENTS.md Exporter
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          AGENTS.md Generator for <span className="text-cyan-300 font-serif italic">AI Coding Agents.</span>
        </h1>

        <p className="text-white/60 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-sans">
          <code className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">AGENTS.md</code> is the vendor-neutral, open standard for guiding AI coding assistants across any repository. Generate verified instructions in seconds.
        </p>

        <div className="w-full p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-left space-y-6 mb-12 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-2">
              <FileCode2 className="w-4 h-4" /> Sample AGENTS.md Output
            </span>
            <span className="text-[10px] font-mono uppercase bg-emerald-950/60 text-emerald-300 px-3 py-1 rounded-md">
              Evidence Verified
            </span>
          </div>

          <pre className="p-6 rounded-xl bg-black font-mono text-xs sm:text-sm text-white/80 overflow-x-auto leading-relaxed">
{`# AGENTS.md - Repository Agent-Readiness Specification

## Project Overview
This repository provides evidence-backed instructions for AI coding agents.

## Verified Execution Commands
- Build Script: pnpm run build (Evidence: package.json#scripts.build)
- Test Script: pnpm test (Evidence: package.json#scripts.test; .github/workflows/ci.yml)

## Development Rules
1. Enforce strict TypeScript types across /src/lib.
2. Validate request parameters in Next.js API route handlers.
3. Protect secrets in .env and prevent edits to generated files.`}
          </pre>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mb-16">
          <div className="p-6 rounded-xl bg-white/[0.02] space-y-2 font-mono text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Vendor Neutral</h3>
            <p className="text-white/60">Works seamlessly across Claude, Copilot, Cursor, Replit & Windsurf.</p>
          </div>
          <div className="p-6 rounded-xl bg-white/[0.02] space-y-2 font-mono text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Evidence Backed</h3>
            <p className="text-white/60">Every command and rule is linked to actual repo manifests.</p>
          </div>
          <div className="p-6 rounded-xl bg-white/[0.02] space-y-2 font-mono text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Zero Lock-in</h3>
            <p className="text-white/60">Plain Markdown file committed directly to your Git repository.</p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-2xl"
        >
          Generate AGENTS.md in Live Sandbox <ArrowRight className="w-4 h-4" />
        </Link>
      </main>

      <Footer />
    </div>
  );
}
