'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Layers,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

export default function FeatureGrid() {
  const [selectedFormat, setSelectedFormat] = useState<'claude' | 'cursor' | 'replit' | 'windsurf'>('claude');

  return (
    <section id="features" className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-20">
          <div className="w-full flex justify-center mb-6">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-white/80">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Built for Modern AI Tools
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Everything You Need to Make{' '}
            <span className="font-serif italic font-normal text-white/80">AI Write Perfect Code.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            Paste any GitHub link. Get formatted context files for Claude, Cursor, Replit, Windsurf, or Bolt in seconds.
          </p>
        </div>

        {/* 3 Core Cards Grid - Borderless Sophisticated Cards */}
        <div className="w-full max-w-7xl mx-auto flex justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch justify-center w-full">
            
            {/* Card 1: Universal Context Export */}
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="p-8 sm:p-10 rounded-2xl bg-white/[0.02] flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  1. Universal Context Presets
                </h3>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Export tailored AI instruction files for your favorite tool. Switch format presets with one click.
                </p>

                {/* Dropdown UI Preview */}
                <div className="p-5 rounded-xl bg-black/60 font-mono text-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-[11px]">Format Preset:</span>
                    <div className="relative">
                      <select
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value as any)}
                        aria-label="Format Preset"
                        className="bg-neutral-900 text-white text-xs font-mono px-3 py-1.5 rounded-lg border-0 focus:outline-none appearance-none pr-7 cursor-pointer"
                      >
                        <option value="claude">CLAUDE.md</option>
                        <option value="cursor">.cursorrules</option>
                        <option value="replit">replit.md</option>
                        <option value="windsurf">windsurf.json</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-white/60 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-neutral-950/80 text-[11px] text-white/80 space-y-1.5">
                    {selectedFormat === 'claude' && (
                      <>
                        <p className="text-cyan-400 font-bold"># CLAUDE.md Specification</p>
                        <p className="text-white/60">- Project: App Router & TypeScript</p>
                        <p className="text-white/60">- Directory Tree: Indexed 48 files</p>
                      </>
                    )}
                    {selectedFormat === 'cursor' && (
                      <>
                        <p className="text-indigo-400 font-bold">// .cursorrules Configuration</p>
                        <p className="text-white/60">rule: "Enforce strict TypeScript & RSC"</p>
                      </>
                    )}
                    {selectedFormat === 'replit' && (
                      <>
                        <p className="text-emerald-400 font-bold"># replit.md Rules</p>
                        <p className="text-white/60">"runtime": "Node 20 / Tailwind"</p>
                      </>
                    )}
                    {selectedFormat === 'windsurf' && (
                      <>
                        <p className="text-amber-400 font-bold">&#123; "windsurf": "v1.0" &#125;</p>
                        <p className="text-white/60">"context": "Indexed Codebase"</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm font-mono text-white/70 pt-6">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Works with Claude, Cursor, Replit & Bolt
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> One-click copy or download
                </li>
              </ul>
            </motion.article>

            {/* Card 2: Automatic Codebase Understanding */}
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 sm:p-10 rounded-2xl bg-white/[0.02] flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  2. Automatic Codebase Analysis
                </h3>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  GitContextGen scans directory layouts, package dependencies, and file structures automatically.
                </p>

                <div className="p-5 rounded-xl bg-black/60 font-mono text-xs space-y-4">
                  <div className="flex items-center justify-between text-white/50 text-[11px] pb-2">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-bold">Codebase Indexer</span>
                    <span className="text-emerald-400">100% Complete</span>
                  </div>

                  <div className="p-4 rounded-lg bg-neutral-950/80 text-[11px] space-y-2 text-white/80">
                    <p className="text-white/60">✓ Scanned 120 source files</p>
                    <p className="text-white/60">✓ Mapped route handlers & utilities</p>
                    <p className="text-white/60">✓ Extracted component conventions</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm font-mono text-white/70 pt-6">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Zero manual copying or file loss
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Instant repository directory mapping
                </li>
              </ul>
            </motion.article>

            {/* Card 3: Zero AI Hallucinations */}
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 sm:p-10 rounded-2xl bg-white/[0.02] flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  3. Zero AI Hallucinations
                </h3>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Give AI tools strict project boundaries so they write clean, working code on the first attempt.
                </p>

                <div className="p-5 rounded-xl bg-black/60 font-mono text-xs space-y-4">
                  <div className="flex items-center justify-between text-white/50 text-[11px] pb-2">
                    <span className="text-emerald-400 font-bold">Accuracy Guard</span>
                    <span className="text-white/40">Active</span>
                  </div>

                  <div className="p-4 rounded-lg bg-neutral-950/80 text-[11px] text-white/80 space-y-1.5">
                    <p className="text-emerald-400 font-bold">[Verified Project Rules]</p>
                    <p className="text-white/70">"AI MUST use existing components from /src/components and preserve TypeScript contracts."</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm font-mono text-white/70 pt-6">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Perfect for non-coders & solo builders
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Stops AI from breaking your app
                </li>
              </ul>
            </motion.article>

          </div>
        </div>

      </div>
    </section>
  );
}
