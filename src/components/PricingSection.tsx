'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Zap, ShieldCheck, Sparkles, Loader2, Users } from 'lucide-react';
import { DodoPayments } from 'dodopayments-checkout';
import { DODO_PRODUCTS } from '@/lib/products';

export default function PricingSection() {
  // Default toggle state is Annual (true) on load to maximize cash flow
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [bundleDfy, setBundleDfy] = useState<boolean>(false);

  useEffect(() => {
    try {
      const mode =
        process.env.NEXT_PUBLIC_DODO_MODE === 'live' ||
        process.env.NEXT_PUBLIC_DODO_MODE === 'live_mode'
          ? 'live'
          : 'test';
      DodoPayments.Initialize({ mode });
    } catch {
      // Non-fatal if modal initialization is already initialized or SSR
    }
  }, []);

  // Pricing values matching specification
  const starterMonthly = 9;
  const starterAnnualMonthly = 6;
  const starterAnnualBilled = 72;

  const proMonthly = 24;
  const proAnnualMonthly = 19;
  const proAnnualBilled = 228;

  const agencyMonthly = 79;
  const agencyAnnualMonthly = 59;
  const agencyAnnualBilled = 708;

  const handleCheckout = async (productId: string, includeDfy: boolean = false) => {
    try {
      setLoadingProductId(productId);

      let payload: any = { productId };
      if (includeDfy && productId !== DODO_PRODUCTS.DFY_SETUP.oneTime) {
        payload = {
          productCart: [
            { product_id: productId, quantity: 1 },
            { product_id: DODO_PRODUCTS.DFY_SETUP.oneTime, quantity: 1 },
          ],
        };
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });


      const data = await res.json();

      if (data.url) {
        if (typeof window !== 'undefined') {
          try {
            // Attempt standard DodoPayments overlay checkout modal
            DodoPayments.Checkout.open({ checkoutUrl: data.url });
          } catch {
            // Fallback: direct window location redirect to hosted checkout
            window.location.href = data.url;
          }
        }
      } else if (data.error) {
        alert(`Checkout error: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Dodo checkout initiation failed:', err);
      alert('Unable to connect to Dodo Payments checkout session. Please try again.');
    } finally {
      setLoadingProductId(null);
    }
  };

  return (
    <section id="pricing" className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 bg-[#030303] text-zinc-100 selection:bg-amber-400 selection:text-black">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-10">
          <div className="w-full flex justify-center mb-4">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 text-xs font-mono text-amber-400 border border-zinc-800 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Dodo Payments (Merchant of Record)
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight text-center">
            Simple, Transparent Plans.{' '}
            <span className="font-serif italic font-normal text-amber-300">Build Faster.</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed text-center max-w-xl mx-auto">
            Zero token waste. Eliminate context debt with instant local MCP servers and unified AI rule orchestration.
          </p>
        </div>

        {/* Step 3: Pricing Switch Toggle Box with solid grid isolation */}
        <div className="relative flex justify-center items-center mb-12 z-20 w-full">
          <div className="relative inline-flex items-center h-11 p-1 rounded-full bg-zinc-900 border border-zinc-800 shadow-xl font-mono text-xs select-none touch-manipulation">
            {/* Monthly Button */}
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`relative z-10 h-9 w-36 rounded-full font-bold transition-colors duration-200 cursor-pointer touch-manipulation flex items-center justify-center min-h-[36px] ${
                !isAnnual ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {!isAnnual && (
                <motion.div
                  layoutId="pricing-active-pill"
                  className="absolute inset-0 rounded-full bg-zinc-100 shadow-md"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">Billed Monthly</span>
            </button>

            {/* Billed Annually Button */}
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`relative z-10 h-9 w-40 rounded-full font-bold transition-colors duration-200 cursor-pointer touch-manipulation flex items-center justify-center gap-1.5 min-h-[36px] ${
                isAnnual ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isAnnual && (
                <motion.div
                  layoutId="pricing-active-pill"
                  className="absolute inset-0 rounded-full bg-zinc-100 shadow-md"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">Billed Annually</span>
              <span className={`relative z-10 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase transition-colors ${
                isAnnual ? 'bg-amber-400 text-zinc-950' : 'bg-amber-400/20 text-amber-300'
              }`}>
                -33%
              </span>
            </button>
          </div>
        </div>

        {/* Step 4: Three High-Converting B2B Pricing Cards */}
        <div className="w-full max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch justify-center w-full text-left">
            
            {/* Card 1: Starter Pass (For Solo Hobbyists) */}
            <div className="p-8 sm:p-9 rounded-3xl bg-zinc-900/30 flex flex-col justify-between space-y-8 border border-zinc-800/80 hover:border-zinc-700 hover:shadow-[0_0_50px_rgba(255,255,255,0.02)] transition-all duration-300">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">Starter Pass</h3>
                  <span className="px-3 py-1 rounded-md bg-zinc-800/60 text-zinc-300 text-xs font-mono font-medium shrink-0 border border-zinc-700/60">
                    Solo Hobbyists
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">
                    ${isAnnual ? starterAnnualMonthly : starterMonthly}
                  </span>
                  <span className="text-xs sm:text-sm font-normal text-zinc-400">/month</span>
                </div>
                
                <p className="text-xs font-mono text-amber-400/90 mb-4 min-h-[1.25rem]">
                  {isAnnual ? `Billed $${starterAnnualBilled} annually (Save $36)` : 'Billed monthly, cancel anytime'}
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  For solo developers and side-project builders wanting clean, structured context files on demand.
                </p>
                
                <div className="h-px bg-zinc-800/80 my-6" />
                
                <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-300 font-mono leading-relaxed">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> 50 Repository Scans / month
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Unified CLAUDE.md & .cursorrules
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Automatic AST Tech Stack Detection
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Basic Mermaid.js Architecture Diagrams
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Non-Coder Step-by-Step Workflow Guide
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleCheckout(isAnnual ? DODO_PRODUCTS.STARTER.annual : DODO_PRODUCTS.STARTER.monthly)}
                disabled={loadingProductId !== null}
                className="w-full min-h-[44px] py-3.5 rounded-xl bg-zinc-100 hover:bg-white active:scale-[0.99] text-zinc-950 text-center font-mono text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingProductId === (isAnnual ? DODO_PRODUCTS.STARTER.annual : DODO_PRODUCTS.STARTER.monthly) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Preparing Checkout...
                  </>
                ) : (
                  <>
                    Start Context Building <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Card 2: Pro Builder (For Elite Freelancers & Power Users) — Refined Razor-Thin Highlight */}
            <div className="p-8 sm:p-9 rounded-3xl bg-gradient-to-b from-amber-500/[0.04] via-zinc-900/40 to-black flex flex-col justify-between space-y-8 border border-amber-500/30 hover:border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.06)] relative transition-all duration-300">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">Pro Builder</h3>
                  <span className="px-3 py-1 rounded-md bg-amber-400/10 text-amber-300 text-xs font-mono font-bold shrink-0 border border-amber-400/30">
                    Elite Freelancers
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">
                    ${isAnnual ? proAnnualMonthly : proMonthly}
                  </span>
                  <span className="text-xs sm:text-sm font-normal text-zinc-400">/month</span>
                </div>
                
                <p className="text-xs font-mono text-amber-400/90 mb-4 min-h-[1.25rem]">
                  {isAnnual ? `Billed $${proAnnualBilled} annually (Save $60)` : 'Billed monthly, cancel anytime'}
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  For professional developers using Cursor Composer, Claude Code CLI, and Windsurf on production apps.
                </p>
                
                <div className="h-px bg-zinc-800/80 my-6" />
                
                <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-200 font-mono leading-relaxed">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Everything in Starter Pass
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Standalone Zero-Dependency Binaries
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Bidirectional CLAUDE.md & .mdc Sync
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Local stdio Model Context Protocol (MCP)
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> L2 Persistent Disk Cache (Saves 92% Tokens)
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Automated OSV.dev Vulnerability Audits
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Kroki Vector SVG Architecture Exports
                  </li>
                </ul>

                {/* DFY Bundle Add-On Checkbox */}
                <label className="flex items-center gap-2.5 mt-5 pt-3.5 border-t border-zinc-800/80 cursor-pointer text-xs font-mono select-none">
                  <input
                    type="checkbox"
                    checked={bundleDfy}
                    onChange={(e) => setBundleDfy(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-400 focus:ring-amber-400 cursor-pointer"
                  />
                  <span className="text-zinc-300">
                    Include DFY Team Setup <span className="text-amber-400 font-bold">(+$299)</span>
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => handleCheckout(isAnnual ? DODO_PRODUCTS.PRO.annual : DODO_PRODUCTS.PRO.monthly, bundleDfy)}
                disabled={loadingProductId !== null}
                className="w-full min-h-[44px] py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 active:scale-[0.99] text-zinc-950 text-center font-mono text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingProductId === (isAnnual ? DODO_PRODUCTS.PRO.annual : DODO_PRODUCTS.PRO.monthly) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Preparing Checkout...
                  </>
                ) : (
                  <>
                    {bundleDfy ? 'Go Pro + DFY Onboarding' : 'Go Pro Builder'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Card 3: Agency Team (For Dev Agencies & WordPress Shops) */}
            <div className="p-8 sm:p-9 rounded-3xl bg-zinc-900/30 flex flex-col justify-between space-y-8 border border-zinc-800/80 hover:border-zinc-700 hover:shadow-[0_0_50px_rgba(255,255,255,0.02)] transition-all duration-300">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">Agency Team</h3>
                  <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-300 text-xs font-mono font-bold shrink-0 border border-emerald-500/30">
                    WordPress & Agencies
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">
                    ${isAnnual ? agencyAnnualMonthly : agencyMonthly}
                  </span>
                  <span className="text-xs sm:text-sm font-normal text-zinc-400">/month</span>
                </div>
                
                <p className="text-xs font-mono text-emerald-400/90 mb-4 min-h-[1.25rem]">
                  {isAnnual ? `Billed $${agencyAnnualBilled} annually (Save $240)` : 'Billed monthly, cancel anytime'}
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  For software agencies managing dozens of client projects, microservices, and WordPress architectures.
                </p>
                
                <div className="h-px bg-zinc-800/80 my-6" />
                
                <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-300 font-mono leading-relaxed">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Everything in Pro Builder
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited Public & Private Repositories
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Auto Tech Detection (WordPress, Laravel, React)
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Pre-Configured WordPress AI Presets (WPCS & DB)
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Automattic Telex & Gutenberg Block Support
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Multi-Agent Context Splitting (Subagents)
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> GitHub Webhook Context Drift Synchronization
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Shareable Branded Client Audit Reports
                  </li>
                </ul>

                {/* DFY Bundle Add-On Checkbox for Agency */}
                <label className="flex items-center gap-2.5 mt-5 pt-3.5 border-t border-zinc-800/80 cursor-pointer text-xs font-mono select-none">
                  <input
                    type="checkbox"
                    checked={bundleDfy}
                    onChange={(e) => setBundleDfy(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-400 focus:ring-emerald-400 cursor-pointer"
                  />
                  <span className="text-zinc-300">
                    Include DFY Team Setup <span className="text-emerald-400 font-bold">(+$299)</span>
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => handleCheckout(isAnnual ? DODO_PRODUCTS.AGENCY.annual : DODO_PRODUCTS.AGENCY.monthly, bundleDfy)}
                disabled={loadingProductId !== null}
                className="w-full min-h-[44px] py-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 active:scale-[0.99] border border-zinc-700 text-center font-mono text-xs sm:text-sm text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingProductId === (isAnnual ? DODO_PRODUCTS.AGENCY.annual : DODO_PRODUCTS.AGENCY.monthly) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Preparing Checkout...
                  </>
                ) : (
                  <>
                    {bundleDfy ? 'Deploy Agency + DFY Onboarding' : 'Deploy Agency Workspace'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>


          </div>
        </div>

        {/* Step 5: Done-For-You (DFY) Setup Add-On (High-Margin Upsell) */}
        <div className="w-full max-w-4xl mx-auto rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-left shadow-2xl mb-14 relative overflow-hidden transition-all duration-300">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-[11px] font-mono font-bold border border-amber-400/30">
              <Users className="w-3.5 h-3.5 text-amber-400" /> Done-For-You Team Integration Pack
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              Need Us to Configure Everything For You?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
              Our core engineering team will hop on a 1-on-1 implementation call with your developers to audit your major repositories, optimize your custom context rules, and configure your local MCP servers for maximum token efficiency.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto">
            <div className="text-center md:text-right">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                $299
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">One-Time Implementation Add-On</span>
            </div>
            
            <button
              type="button"
              onClick={() => handleCheckout(DODO_PRODUCTS.DFY_SETUP.oneTime)}
              disabled={loadingProductId !== null}
              className="w-full md:w-auto min-h-[44px] px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-zinc-950 text-xs sm:text-sm font-bold font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProductId === DODO_PRODUCTS.DFY_SETUP.oneTime ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
                </>
              ) : (
                <>
                  Add DFY Setup ($299) <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 100% Zero-Risk Guarantee */}
        <div className="w-full max-w-4xl mx-auto rounded-2xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                100% Zero-Risk Merchant of Record Guarantee
              </h4>
              <p className="text-xs text-zinc-400 font-mono mt-1 leading-relaxed">
                Processed securely via Dodo Payments. If your AI coding assistant (Cursor, Claude, or Copilot) doesn't produce measurably cleaner code on your first project audit, cancel anytime with a single click.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
