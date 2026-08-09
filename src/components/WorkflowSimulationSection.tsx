'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, FileCode2, Sparkles, Check, Download, Zap } from 'lucide-react';

export default function WorkflowSimulationSection() {
  const [selectedFormat, setSelectedFormat] = useState<'claude' | 'cursor' | 'replit'>('claude');

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white relative">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Section Title */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="w-full flex justify-center mb-6">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-white/80">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> How It Works
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            3 Simple Steps to Perfect{' '}
            <span className="font-serif italic font-normal text-white/80">AI Code Context.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            No coding experience needed. Generate instant context files for your AI tool in seconds.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="w-full flex justify-center mb-12">
          <div className="w-fit bg-white/[0.03] p-2 rounded-xl flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSelectedFormat('claude')}
              className={`px-6 py-3 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2.5 ${
                selectedFormat === 'claude' ? 'bg-white text-black shadow-xl' : 'text-white/60 hover:text-white'
              }`}
            >
              <FileCode2 className="w-4 h-4 text-cyan-400" /> Preset 1: CLAUDE.md
            </button>
            <button
              onClick={() => setSelectedFormat('cursor')}
              className={`px-6 py-3 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2.5 ${
                selectedFormat === 'cursor' ? 'bg-white text-black shadow-xl' : 'text-white/60 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-indigo-400" /> Preset 2: .cursorrules
            </button>
            <button
              onClick={() => setSelectedFormat('replit')}
              className={`px-6 py-3 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2.5 ${
                selectedFormat === 'replit' ? 'bg-white text-black shadow-xl' : 'text-white/60 hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-400" /> Preset 3: replit.md
            </button>
          </div>
        </div>

        {/* Live Simulation Card - Borderless Sophisticated Floating Surface */}
        <div className="w-full max-w-4xl mx-auto flex justify-center">
          <motion.div
            key={selectedFormat}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full rounded-2xl bg-white/[0.03] overflow-hidden shadow-2xl"
          >
            {/* Window Header */}
            <div className="px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-xs font-mono text-white/50 ml-2">
                  {selectedFormat === 'claude' && 'CLAUDE.md Spec Generator'}
                  {selectedFormat === 'cursor' && '.cursorrules Config Generator'}
                  {selectedFormat === 'replit' && 'replit.md Context Generator'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-md shrink-0">
                1-Click Export
              </span>
            </div>

            {/* Content Preview */}
            <div className="p-6 sm:p-8 font-mono text-xs sm:text-sm space-y-5 leading-relaxed">
              <p className="text-white/90">
                <span className="text-cyan-400 font-bold">Step 1:</span> Paste GitHub Repository URL
              </p>
              <p className="text-white/40">› Analyzing file tree, routes, and dependencies...</p>

              <p className="text-white/90">
                <span className="text-emerald-400 font-bold">Step 2:</span> AI Synthesizes Project Rules & Conventions
              </p>

              <div className="p-5 rounded-xl bg-black/60 space-y-3">
                <div className="flex items-center justify-between text-xs text-white/60 pb-2.5">
                  <span className="flex items-center gap-2 font-bold text-white">
                    {selectedFormat === 'claude' && '# CLAUDE.md Configuration'}
                    {selectedFormat === 'cursor' && '// .cursorrules Specification'}
                    {selectedFormat === 'replit' && '# replit.md Project Context'}
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Ready to Copy</span>
                </div>
                {selectedFormat === 'claude' && (
                  <>
                    <p className="text-cyan-300 font-bold"># Project Instructions for Claude</p>
                    <p className="text-white/70">- Enforce Next.js App Router conventions</p>
                    <p className="text-white/70">- Preserve clean TypeScript types across /lib</p>
                  </>
                )}
                {selectedFormat === 'cursor' && (
                  <>
                    <p className="text-indigo-300 font-bold">// Rules for Cursor AI Agent</p>
                    <p className="text-white/70">rule: "Always check existing file imports before creating new ones"</p>
                    <p className="text-white/70">rule: "Follow strict Tailwind styling guidelines"</p>
                  </>
                )}
                {selectedFormat === 'replit' && (
                  <>
                    <p className="text-emerald-300 font-bold"># Instructions for Replit AI</p>
                    <p className="text-white/70">- Use Node 20 runtime specifications</p>
                    <p className="text-white/70">- Execute build checks before committing changes</p>
                  </>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-xs rounded-lg shadow-md">
                  <Download className="w-3.5 h-3.5" /> Download Context File
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
