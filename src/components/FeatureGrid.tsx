'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  Database,
  Zap,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  Sparkles,
  Lock,
  ShieldCheck,
  TrendingDown,
  Cpu,
  Table
} from 'lucide-react';

export default function FeatureGrid() {
  return (
    <section id="features" className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-[#030303] text-white">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="w-full flex justify-center mb-5">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Core Architectural Pillars</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-white leading-tight text-center">
            Engineered For Speed, Precision, and{' '}
            <span className="font-serif italic font-normal text-cyan-300">Zero AI Amnesia.</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed text-center max-w-2xl mx-auto">
            From local SQLite MCP memory to publication-grade Excel handoffs and AI-powered intelligence with cost guardrails—GitContextGen gives your team total AI context control.
          </p>
        </div>

        {/* 4 Pillars Grid (Symmetrical 2x2 on Desktop, 1 Col on Mobile) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch justify-center text-left">
          
          {/* Pillar 1: Persistent Local Agent Memory (MCP) */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-3xl bg-zinc-950/70 border border-zinc-900 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between space-y-8 group relative overflow-hidden"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <Database className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="px-3 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                  Sub-ms SQLite
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 font-mono">
                  Persistent Local Agent Memory
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                  Stops AI Agent Amnesia with an on-device SQLite database (<code className="text-cyan-300 font-mono">.gitcontextgen/memory.db</code>). AI coding agents query past architectural decisions and schemas in under 1 millisecond.
                </p>
              </div>

              {/* High-Contrast Technical Metric Block */}
              <div className="p-5 rounded-2xl bg-black border border-zinc-900 font-mono space-y-3">
                <div className="flex items-baseline justify-between border-b border-zinc-900 pb-3">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    &lt; 1ms
                  </span>
                  <span className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">
                    Query Latency
                  </span>
                </div>
                <div className="space-y-2 text-[11px] text-zinc-400">
                  <p className="flex items-center justify-between">
                    <span>Protocol Transport:</span>
                    <span className="text-zinc-200 font-bold">Native stdio (Offline)</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Cloud Egress Fee:</span>
                    <span className="text-emerald-400 font-bold">$0 Infrastructure</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Multi-Agent Locking:</span>
                    <span className="text-cyan-300 font-bold">Atomic PID Mutex</span>
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs font-mono text-zinc-400 border-t border-zinc-900 pt-6">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Real-time <code className="text-zinc-300">gitcontextgen_recall</code> tool calls
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Atomic PID locks prevent Cursor &amp; Claude write collisions
              </li>
            </ul>
          </motion.article>

          {/* Pillar 2: Advanced AI Intelligence & Cost Guardrails */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-8 rounded-3xl bg-zinc-950/70 border border-zinc-900 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between space-y-8 group relative overflow-hidden"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <span className="px-3 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                  5-Tier Defense
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 font-mono">
                  Advanced AI Intelligence Engine
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                  Deep repository understanding powered by a hybrid AI reasoning engine. A 5-tier defense matrix protects your budget with deterministic AST token pruning, 8k ceilings, and clear engine indicators.
                </p>
              </div>

              {/* High-Contrast Technical Metric Block */}
              <div className="p-5 rounded-2xl bg-black border border-zinc-900 font-mono space-y-3">
                <div className="flex items-baseline justify-between border-b border-zinc-900 pb-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
                    ⚡ Enhanced
                  </span>
                  <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
                    Cost Guardrails
                  </span>
                </div>
                <div className="space-y-2 text-[11px] text-zinc-400">
                  <p className="flex items-center justify-between">
                    <span>Engine Status Pill:</span>
                    <span className="text-zinc-200 font-bold">[⚡ AI Enhanced] vs [🛠️ Local]</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Input Pre-Filtering:</span>
                    <span className="text-emerald-400 font-bold">0 Raw Code Sent (AST Only)</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Max Output Token Cap:</span>
                    <span className="text-zinc-200 font-bold">8,000 Hard Limit</span>
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs font-mono text-zinc-400 border-t border-zinc-900 pt-6">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Zero surprise API bills via strict multi-tier rate controls
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Graceful instant offline fallback to local heuristic engine
              </li>
            </ul>
          </motion.article>

          {/* Pillar 3: Publication-Grade Executive Multi-Tab Excel Exports */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-8 rounded-3xl bg-zinc-950/70 border border-zinc-900 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-8 group relative overflow-hidden"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                  5 Worksheets
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 font-mono">
                  Executive Multi-Tab Excel Exports
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                  Deliver publication-grade <code className="text-emerald-300 font-mono">.xlsx</code> workbooks to clients and executives. Generated with <code className="text-zinc-200">exceljs</code> with KPI stat cards, auto-filtering, and security audits.
                </p>
              </div>

              {/* High-Contrast Technical Metric Block */}
              <div className="p-5 rounded-2xl bg-black border border-zinc-900 font-mono space-y-3">
                <div className="flex items-baseline justify-between border-b border-zinc-900 pb-3">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    5-Sheet
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Workbook Structure
                  </span>
                </div>
                <div className="space-y-2 text-[11px] text-zinc-400">
                  <p className="flex items-center justify-between">
                    <span>Sheet 1: Executive Summary</span>
                    <span className="text-zinc-200 font-bold">Health &amp; Readiness KPIs</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Sheet 2: File Inventory</span>
                    <span className="text-zinc-200 font-bold">AST Manifest &amp; Line Counts</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Sheet 3: Security &amp; Licences</span>
                    <span className="text-emerald-400 font-bold">OSV Matrix + SPDX</span>
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs font-mono text-zinc-400 border-t border-zinc-900 pt-6">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Auto-filter headers, zebra stripes &amp; executive KPI cards
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Ready-to-send deliverables for client sign-off and agency retainers
              </li>
            </ul>
          </motion.article>

          {/* Pillar 4: Universal Multi-Tool Rule Synchronization */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="p-8 rounded-3xl bg-zinc-950/70 border border-zinc-900 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between space-y-8 group relative overflow-hidden"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <Layers className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                  4 AI Formats
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 font-mono">
                  Universal Multi-Tool Rule Sync
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                  Unified cross-tool compatibility ensures every developer machine and AI co-pilot adheres to the exact same source of truth. Synchronizes rules across Claude Code, Cursor, and Copilot.
                </p>
              </div>

              {/* High-Contrast Technical Metric Block */}
              <div className="p-5 rounded-2xl bg-black border border-zinc-900 font-mono space-y-3">
                <div className="flex items-baseline justify-between border-b border-zinc-900 pb-3">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    100%
                  </span>
                  <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">
                    Format Parity
                  </span>
                </div>
                <div className="space-y-2 text-[11px] text-zinc-400">
                  <p className="flex items-center justify-between">
                    <span>Anthropic Claude Code:</span>
                    <span className="text-zinc-200 font-bold">CLAUDE.md Specification</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Cursor Composer &amp; IDE:</span>
                    <span className="text-zinc-200 font-bold">.cursor/rules/*.mdc</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>GitHub Copilot:</span>
                    <span className="text-zinc-200 font-bold">AGENTS.md / Instructions</span>
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs font-mono text-zinc-400 border-t border-zinc-900 pt-6">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Zero rule drift across team machines and CI/CD pipelines
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Automatic framework stack detection (Next.js, WP, Laravel, Go)
              </li>
            </ul>
          </motion.article>

        </div>

      </div>
    </section>
  );
}
