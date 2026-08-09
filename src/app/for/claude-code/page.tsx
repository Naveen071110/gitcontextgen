import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GitContextGen for Claude Code | Repository Context Engine',
  description: 'Instantly make any GitHub repository ready for Claude Code & Claude 3.5 Sonnet.',
  keywords: [
    'GitContextGen for Claude Code',
    'Claude Code repository context',
    'CLAUDE.md setup for Claude Code',
    'Claude 3.5 Sonnet prompt engineering',
  ],
  openGraph: {
    title: 'GitContextGen for Claude Code | Repository Context Engine',
    description: 'Instantly make any GitHub repository ready for Claude Code & Claude 3.5 Sonnet.',
    url: 'https://gitcontextgen.com/for/claude-code',
    siteName: 'GitContextGen',
    type: 'website',
    images: [{ url: 'https://gitcontextgen.com/og-image.png', width: 1200, height: 630, alt: 'GitContextGen for Claude Code' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitContextGen for Claude Code',
    description: 'Instantly make any GitHub repository ready for Claude Code.',
    images: ['https://gitcontextgen.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://gitcontextgen.com/for/claude-code',
  },
};

export default function ForClaudeCodePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      {/* Structural Top Navbar Offset Spacer */}
      <div className="w-full h-20 sm:h-24 shrink-0 pointer-events-none" />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-20 flex flex-col items-center text-center">
        <div className="w-fit inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-cyan-400 mb-6">
          <ShieldCheck className="w-4 h-4" /> Optimized for Claude Code
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Make Your Repo Ready for <span className="text-cyan-300 font-serif italic">Claude Code.</span>
        </h1>
        <p className="text-white/60 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-sans">
          Generate evidence-backed <code className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">CLAUDE.md</code> and <code className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">AGENTS.md</code> files so Claude Code builds features without hallucinations.
        </p>
        <Link href="/" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:opacity-90 shadow-2xl">
          Analyze Repo for Claude Code <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
      <Footer />
    </div>
  );
}
