import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, FileCode2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '.cursorrules Generator | AI Codebase Rules for Cursor IDE',
  description: 'Generate .cursorrules prompt configuration files instantly from any public or private GitHub repository to customize Cursor AI behavior.',
  keywords: [
    'cursorrules generator',
    '.cursorrules file template',
    'Cursor AI rules configuration',
    'github to cursorrules',
    'Cursor IDE rules setup',
    'context engineering for Cursor',
    'prevent AI coding hallucinations',
  ],
  openGraph: {
    title: '.cursorrules Generator | AI Codebase Rules for Cursor IDE',
    description: 'Generate .cursorrules prompt configuration files instantly from any public or private GitHub repository.',
    url: 'https://gitcontextgen.com/cursor-rules-generator',
    siteName: 'GitContextGen',
    type: 'website',
    images: [
      {
        url: 'https://gitcontextgen.com/og-image.png',
        width: 1200,
        height: 630,
        alt: '.cursorrules Generator by GitContextGen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '.cursorrules Generator | AI Codebase Rules for Cursor IDE',
    description: 'Generate .cursorrules configuration files instantly from any GitHub repository.',
    images: ['https://gitcontextgen.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://gitcontextgen.com/cursor-rules-generator',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: '.cursorrules Specification Generator for Cursor IDE',
  description: 'Automated tool to generate .cursorrules prompt rules from GitHub repository structures for Cursor AI.',
  url: 'https://gitcontextgen.com/cursor-rules-generator',
  inLanguage: 'en-US',
  author: {
    '@type': 'Organization',
    name: 'GitContextGen',
    url: 'https://gitcontextgen.com',
  },
};

export default function CursorRulesGeneratorPage() {
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
          <ShieldCheck className="w-4 h-4" /> .cursorrules Configuration Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          .cursorrules Generator for <span className="text-cyan-300 font-serif italic">Cursor IDE Agent.</span>
        </h1>

        <p className="text-white/60 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-sans">
          Enforce strict project rules, import paths, and framework conventions for Cursor AI so your agent writes pristine code on every prompt.
        </p>

        <div className="w-full p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-left space-y-6 mb-12 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-2">
              <FileCode2 className="w-4 h-4" /> .cursorrules Output Preview
            </span>
            <span className="text-[10px] font-mono uppercase bg-indigo-950/60 text-indigo-300 px-3 py-1 rounded-md">
              Cursor Agent Active
            </span>
          </div>

          <pre className="p-6 rounded-xl bg-black font-mono text-xs sm:text-sm text-white/80 overflow-x-auto leading-relaxed">
{`// .cursorrules - Configuration for Cursor AI

rule: "Always check existing file imports before creating new utility helpers."
rule: "Follow Next.js App Router conventions and preserve server/client boundaries."
rule: "Use Tailwind CSS utility classes with standard design tokens."`}
          </pre>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-2xl"
        >
          Generate .cursorrules in Free Sandbox <ArrowRight className="w-4 h-4" />
        </Link>
      </main>

      <Footer />
    </div>
  );
}
