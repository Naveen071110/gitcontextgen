'use client';

import { motion } from 'framer-motion';
import {
  TrendingDown,
  Layers,
  Cpu,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';

export default function FeatureGrid() {
  return (
    <section id="features" className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="w-full flex justify-center mb-5">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Context-Debt Hallucination Insurance
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-white leading-tight text-center">
            Stop AI Models From Burning Your{' '}
            <span className="font-serif italic font-normal text-zinc-300">Context & Capital.</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed text-center max-w-2xl mx-auto">
            Eliminate rule drift, prevent multi-agent write collisions, and save up to 92% on token bills with persistent AST caching and native stdio MCP integration.
          </p>
        </div>

        {/* Symmetrical 3-Column Minimalist Cards Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch justify-center text-left">
          
          {/* Card 1: L2 Token Savings */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-all duration-300 flex flex-col justify-between space-y-8 group"
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                <TrendingDown className="w-6 h-6 text-amber-400" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                  L2 Token Savings
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Persistent local disk caching fingerprints your codebase AST with SHA-256 hashes. Sub-agents query pre-indexed topologies instead of burning 100,000+ raw tokens per prompt.
                </p>
              </div>

              {/* Clean High-Contrast Metric Block */}
              <div className="p-5 rounded-xl bg-black border border-zinc-900 font-mono space-y-3">
                <div className="flex items-baseline justify-between border-b border-zinc-900 pb-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Up to 92%
                  </span>
                  <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
                    Token Reduction
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] text-zinc-400">
                  <p className="flex items-center justify-between">
                    <span>Local AST Cache:</span>
                    <span className="text-zinc-200 font-bold">SHA-256 Verified</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Repeated Repo Scans:</span>
                    <span className="text-emerald-400 font-bold">0 Tokens Burned</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Average Retrieval:</span>
                    <span className="text-zinc-200 font-bold">&lt; 15ms Local Disk</span>
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs font-mono text-zinc-400 border-t border-zinc-900 pt-6">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" /> Zero manual copying or file loss
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" /> Warm-start cache for every agent session
              </li>
            </ul>
          </motion.article>

          {/* Card 2: Technology-Aware Presets */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-all duration-300 flex flex-col justify-between space-y-8 group"
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                <Layers className="w-6 h-6 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                  Technology-Aware Presets
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Automatic stack detection generates tailored rules with security standards and architectural boundaries for your exact framework.
                </p>
              </div>

              {/* Framework Preset Showcase Block */}
              <div className="p-5 rounded-xl bg-black border border-zinc-900 font-mono space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900/80">
                  <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold mb-1">
                    <span>wordpress.mdc</span>
                    <span className="text-zinc-500 font-normal">Auto-Generated</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Enforces <code className="text-zinc-200">$wpdb-&gt;prepare</code>, nonce verification &amp; WPCS standards.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900/80">
                  <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold mb-1">
                    <span>nextjs.mdc</span>
                    <span className="text-zinc-500 font-normal">App Router</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Guards Server Component boundaries and strict TypeScript types.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900/80">
                  <div className="flex items-center justify-between text-[11px] text-red-400 font-bold mb-1">
                    <span>laravel.mdc</span>
                    <span className="text-zinc-500 font-normal">PHP 8.2+</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Enforces Eloquent relations, Form Requests &amp; Policy authorization.
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs font-mono text-zinc-400 border-t border-zinc-900 pt-6">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" /> Zero manual prompt engineering
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" /> Bi-directional sync across CLAUDE.md &amp; .cursorrules
              </li>
            </ul>
          </motion.article>

          {/* Card 3: Local MCP Engine */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-all duration-300 flex flex-col justify-between space-y-8 group"
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                <Cpu className="w-6 h-6 text-emerald-400" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                  Local MCP Engine
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Native stdio Model Context Protocol server connects directly to your editor, providing dynamically queried repository context without polluting active token windows.
                </p>
              </div>

              {/* Protocol Details Block */}
              <div className="p-5 rounded-xl bg-black border border-zinc-900 font-mono space-y-3">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-900">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> stdio Protocol
                  </span>
                  <span className="text-zinc-500">Zero Cloud Deps</span>
                </div>
                <div className="space-y-2 text-[11px] text-zinc-400">
                  <p className="flex items-center justify-between">
                    <span>Supported IDEs:</span>
                    <span className="text-zinc-200 font-bold">Cursor, Claude, Windsurf</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>IPC Latency:</span>
                    <span className="text-emerald-400 font-bold">&lt; 12ms Direct Process</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Multi-Agent Locks:</span>
                    <span className="text-zinc-200 font-bold">Race Condition Guard</span>
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs font-mono text-zinc-400 border-t border-zinc-900 pt-6">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" /> Native Model Context Protocol compliance
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" /> 100% private, on-device execution
              </li>
            </ul>
          </motion.article>

        </div>

      </div>
    </section>
  );
}
