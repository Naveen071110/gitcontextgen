import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, ArrowRight, Terminal, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Successful | GitContextGen',
  description: 'Your GitContextGen subscription has been confirmed. Get started with your AI developer workspace context.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black flex flex-col font-sans">
      <Navbar />

      {/* Structural Top Navbar Offset */}
      <div className="w-full h-24 shrink-0 pointer-events-none" />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-2xl mx-auto rounded-3xl bg-neutral-950 border border-white/10 p-8 sm:p-12 shadow-2xl space-y-8 text-center relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Check Badge */}
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <CheckCircle2 className="w-8 h-8 text-cyan-400" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
              Payment Confirmed • Merchant of Record Verified
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome to GitContextGen
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-md mx-auto leading-relaxed">
              Your subscription is active. Your local MCP servers and unified AI rule engines are ready to deploy.
            </p>
          </div>

          {/* Next Steps Card */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-left space-y-4 font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Terminal className="w-4 h-4" /> Next Step: Initialize Your Workspace
            </div>
            <p className="text-white/60 font-sans text-xs">
              Open your terminal inside your project directory and execute the onboarding wizard:
            </p>
            <div className="p-4 rounded-xl bg-black/80 border border-white/10 flex items-center justify-between text-cyan-300 select-all font-mono text-xs sm:text-sm">
              <code>npx @gitcontextgen/core init</code>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-mono text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard/agency"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Agency Portal
            </Link>
          </div>

          {/* Guarantee Badge */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs font-mono text-white/40">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Encrypted transaction processed via Dodo Payments</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
