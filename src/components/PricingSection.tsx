'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const soloPrice = billingCycle === 'yearly' ? 16 : 19;
  const agencyPrice = billingCycle === 'yearly' ? 67 : 79;

  return (
    <section id="pricing" className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-10">
          <div className="w-full flex justify-center mb-6">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-cyan-400">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Transparent Paid Pricing
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Simple, Transparent Plans.{' '}
            <span className="font-serif italic font-normal text-cyan-300">Build Faster.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            Zero fluff. Choose monthly flexibility or save 15% with annual billing.
          </p>
        </div>

        {/* Monthly vs Yearly Interactive Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-14 shadow-xl font-mono text-xs">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2.5 rounded-full font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-cyan-400 text-black shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>Yearly Billing</span>
            <span className="px-2 py-0.5 rounded-full bg-black/80 text-cyan-300 text-[10px] uppercase tracking-wider font-extrabold">
              Save 15%
            </span>
          </button>
        </div>

        {/* 3 Paid Cards Grid */}
        <div className="w-full max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch justify-center w-full text-left">
            
            {/* Tier 1: Solo Builder ($19/mo or $16/mo) */}
            <div className="p-8 sm:p-9 rounded-3xl bg-white/[0.02] flex flex-col justify-between space-y-8 shadow-2xl border border-white/15">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">Solo Builder</h3>
                  <span className="px-3 py-1 rounded-md bg-cyan-950 text-cyan-300 text-xs font-mono font-bold shrink-0 border border-cyan-500/30">
                    Solopreneurs
                  </span>
                </div>
                
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1">
                  ${soloPrice} <span className="text-xs sm:text-sm font-normal text-white/60">/month</span>
                </div>
                <p className="text-xs font-mono text-cyan-300 mb-4">
                  {billingCycle === 'yearly' ? 'Billed annually at $192/year (Saved $36)' : 'Billed monthly'}
                </p>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
                  For solo developers and no-code builders shipping products with Cursor, Claude, or Replit.
                </p>
                
                <div className="h-px bg-white/10 my-6" />
                
                <ul className="space-y-3.5 text-xs sm:text-sm text-white/90 font-mono leading-relaxed">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Unlimited Public Repository Audits
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> All AI Formats (.cursorrules, CLAUDE.md, etc.)
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Instant Architecture & Tech Stack Mapping
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Interactive Mermaid.js System Diagrams
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Non-Coder Step-by-Step Workflow Guide
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Instant 0ms Dual-Layer Fast Re-Sync Cache
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/signup"
                className="w-full py-4 rounded-xl bg-white text-black text-center font-mono text-xs sm:text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                Get Solo Builder (${soloPrice}/mo) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tier 2: Agency Pro ($79/mo or $67/mo) */}
            <div className="p-8 sm:p-9 rounded-3xl bg-white/[0.02] flex flex-col justify-between space-y-8 shadow-2xl border border-white/15">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">Agency Pro</h3>
                  <span className="px-3 py-1 rounded-md bg-white/10 text-white/80 text-xs font-mono shrink-0">
                    Agencies & Teams
                  </span>
                </div>
                
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1">
                  ${agencyPrice} <span className="text-xs sm:text-sm font-normal text-white/60">/month</span>
                </div>
                <p className="text-xs font-mono text-emerald-300 mb-4">
                  {billingCycle === 'yearly' ? 'Billed annually at $804/year (Saved $144)' : 'Billed monthly'}
                </p>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-4">
                  For development agencies managing client projects and multi-repo architectures.
                </p>
                
                <div className="h-px bg-white/10 my-6" />
                
                <ul className="space-y-3.5 text-xs sm:text-sm text-white/80 font-mono leading-relaxed">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Everything in Solo Builder
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Multi-Repo Inter-Dependent Engine
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Shareable Client Audit Reports & Custom Links
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Agency Audit Dashboard & Project History
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> GitHub Webhook Context Drift Listener
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Priority Support & 1-on-1 Setup Assistance
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/signup"
                className="w-full py-4 rounded-xl bg-white/10 border border-white/20 text-center font-mono text-xs sm:text-sm text-white font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Get Agency Pro (${agencyPrice}/mo) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tier 3: Founder Lifetime Access ($249 One-Time) */}
            <div className="p-8 sm:p-9 rounded-3xl bg-gradient-to-b from-emerald-950/40 via-neutral-950 to-black flex flex-col justify-between space-y-8 shadow-[0_0_40px_rgba(16,185,129,0.15)] border-2 border-emerald-500/60 relative">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-mono flex items-center gap-2">
                    Lifetime Pass
                  </h3>
                  <span className="px-3 py-1 rounded-md bg-emerald-950 text-emerald-300 text-xs font-mono font-bold shrink-0 border border-emerald-500/40">
                    Keen Power Users
                  </span>
                </div>
                
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1">
                  $249 <span className="text-xs sm:text-sm font-normal text-white/60">one-time</span>
                </div>
                <p className="text-xs font-mono text-emerald-300 mb-4">
                  Pay once • Permanent access • Zero recurring fees
                </p>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
                  For hardcore power users and founders who want permanent access to all current and future AI context tools.
                </p>
                
                <div className="h-px bg-white/10 my-6" />
                
                <ul className="space-y-3.5 text-xs sm:text-sm text-white/90 font-mono leading-relaxed">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Permanent Lifetime Unlimited Access
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> All Features in Solo Builder & Agency Pro
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Multi-Repo Architecture & Custom Links
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited GitHub Webhook Drift Synchronization
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> All Future AI Specs (.cursorrules, AGENTS.md, etc.)
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Priority 1-on-1 Founder Support & Feature Requests
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/signup"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black text-center font-mono text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Get Lifetime Access ($249) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

        {/* 100% Zero-Risk Guarantee */}
        <div className="w-full max-w-4xl mx-auto rounded-2xl bg-neutral-950 border border-cyan-500/30 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 shrink-0">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                100% Zero-Risk Guarantee
              </h4>
              <p className="text-xs text-white/70 font-mono mt-1 leading-relaxed">
                Try GitContextGen risk-free. If your AI coding assistant (Cursor, Claude, or Replit) doesn&apos;t produce measurably cleaner code on your first project audit, cancel anytime with a single click.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
