import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Bot, FileCode2, ArrowRight, CheckCircle2, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AGENT_README.md Generator | Comprehensive AI Agent Intelligence Dossier',
  description: 'Generate evidence-backed AGENT_README.md context dossiers and multi-agent delegation blueprints for autonomous AI coding agents. Compatible with Sonnet 5, Opus 5, Claude Code, Cursor, and Windsurf.',
  keywords: [
    'AGENT_README.md generator',
    'AI agent readme',
    'multi agent coding blueprint',
    'codebase context dossier for AI',
    'subagent delegation architecture',
    'AI coding agent instructions',
    'anti hallucination context generator',
    'github repo to AGENT_README',
  ],
  openGraph: {
    title: 'AGENT_README.md Generator | Comprehensive AI Agent Intelligence Dossier',
    description: 'Generate evidence-backed AGENT_README.md context dossiers and multi-agent delegation blueprints for any repository.',
    url: 'https://gitcontextgen.com/agent-readme-generator',
    siteName: 'GitContextGen',
    type: 'website',
    images: [
      {
        url: 'https://gitcontextgen.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AGENT_README.md Generator by GitContextGen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AGENT_README.md Generator | Comprehensive AI Agent Intelligence Dossier',
    description: 'Generate evidence-backed AGENT_README.md context dossiers and multi-agent delegation blueprints.',
    images: ['https://gitcontextgen.com/og-image.png'],
  },
  alternates: {
    canonical: '/agent-readme-generator',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'AGENT_README.md Specification Generator for Autonomous AI Coding Agents',
  description: 'Automated tool to create comprehensive AGENT_README.md context dossiers and multi-agent delegation blueprints from GitHub repositories.',
  url: 'https://gitcontextgen.com/agent-readme-generator',
  inLanguage: 'en-US',
  author: {
    '@type': 'Organization',
    name: 'GitContextGen',
    url: 'https://gitcontextgen.com',
  },
};

export default function AgentReadmeGeneratorPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Structural Top Navbar Offset Spacer */}
      <div className="w-full h-20 sm:h-24 shrink-0 pointer-events-none" />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-20 flex flex-col items-center text-center">
        <div className="w-fit inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-cyan-400 mb-6">
          <Bot className="w-4 h-4 text-cyan-400" /> Multi-Agent Intelligence Blueprint
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          AGENT_README.md Generator for <span className="text-cyan-300 font-serif italic">Autonomous AI Agents.</span>
        </h1>

        <p className="text-white/60 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-sans">
          Standard READMEs are built for humans, not AI. <code className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">AGENT_README.md</code> provides deep architectural invariants, non-negotiable guardrails, and subagent delegation boundaries so AI agents never hallucinate or break your codebase.
        </p>

        <div className="w-full p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-left space-y-6 mb-12 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-2">
              <FileCode2 className="w-4 h-4" /> Sample AGENT_README.md Blueprint
            </span>
            <span className="text-[10px] font-mono uppercase bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 px-3 py-1 rounded-md">
              Multi-Agent Ready
            </span>
          </div>

          <pre className="p-6 rounded-xl bg-black font-mono text-xs sm:text-sm text-white/80 overflow-x-auto leading-relaxed border border-white/5">
{`# 🤖 AGENT_README.md — Codebase AI Intelligence Dossier

## 🎯 1. Executive Mission & System Invariants
- Purpose: High-performance production microSaaS application.
- Paradigm: Modular Next.js 16 (App Router) + TypeScript + Edge API runtimes.
- Truth Policy: Verified commands in this dossier override generic LLM assumptions.

## 🛡️ 2. Non-Negotiable Guardrails ("The Red Lines")
- ❌ NEVER expose private API keys (ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE).
- ❌ NEVER edit generated build directories (.next/, dist/, out/).
- ❌ NEVER use implicit 'any' types in TypeScript.
- ✅ ALWAYS run 'npm run build' and 'npm test' to verify changes before completion.

## 👥 3. Multi-Agent Delegation Blueprint
- 🎨 Frontend Specialist: Owns /src/components and /src/app. Handles UI/UX and styling.
- ⚙️ Backend Specialist: Owns /src/app/api and /src/lib/actions.ts. Handles data validation.
- 🛡️ QA & Security Specialist: Owns test suites and executes typecheck validation.`}
          </pre>
        </div>

        {/* Feature Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mb-16">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 font-mono text-xs">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Adaptive Sizing</h3>
            <p className="text-white/60">Generates a unified master dossier for small repos, or a modular subagent folder structure for large multi-package repos.</p>
          </div>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 font-mono text-xs">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-white text-sm">Anti-Hallucination Guardrails</h3>
            <p className="text-white/60">Explicit "NEVER do X" and "ALWAYS do Y" rules prevent agents from rewriting working architectural patterns.</p>
          </div>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 font-mono text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Multi-Agent Swarm Ready</h3>
            <p className="text-white/60">Partitions folder ownership and task roles across Frontend, Backend, and QA subagents seamlessly.</p>
          </div>
        </div>

        <Link
          href="/?format=agent_readme"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-2xl font-mono group"
        >
          Generate AGENT_README.md in Live Sandbox <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </main>

      <Footer />
    </div>
  );
}
