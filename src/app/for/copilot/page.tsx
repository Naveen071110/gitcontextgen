import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gitcontextgen.com';

export const metadata: Metadata = {
  title: 'GitContextGen for GitHub Copilot | Custom Repository Instructions',
  description: 'Generate official .github/copilot-instructions.md files from any GitHub repository.',
  keywords: [
    'GitContextGen for Copilot',
    'GitHub Copilot custom instructions',
    '.github/copilot-instructions.md generator',
    'Copilot repo setup',
  ],
  openGraph: {
    title: 'GitContextGen for GitHub Copilot | Custom Repository Instructions',
    description: 'Generate official .github/copilot-instructions.md files from any GitHub repository.',
    url: `${baseUrl}/for/copilot`,
    siteName: 'GitContextGen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitContextGen for GitHub Copilot',
    description: 'Generate official .github/copilot-instructions.md files from any GitHub repository.',
  },
  alternates: {
    canonical: '/for/copilot',
  },
};

export default function ForCopilotPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      {/* Structural Top Navbar Offset Spacer */}
      <div className="w-full h-20 sm:h-24 shrink-0 pointer-events-none" />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-20 flex flex-col items-center text-center">
        <div className="w-fit inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-cyan-400 mb-6">
          <ShieldCheck className="w-4 h-4" /> Optimized for GitHub Copilot
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Make Your Repo Ready for <span className="text-cyan-300 font-serif italic">GitHub Copilot.</span>
        </h1>
        <p className="text-white/60 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-sans">
          Generate official <code className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">.github/copilot-instructions.md</code> repository files so Copilot completions follow your team&apos;s standards.
        </p>
        <Link href="/" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:opacity-90 shadow-2xl">
          Analyze Repo for Copilot <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
      <Footer />
    </div>
  );
}
