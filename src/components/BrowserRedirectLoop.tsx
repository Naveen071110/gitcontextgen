'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Lock,
  RotateCcw,
  Star,
  GitFork,
  CheckCircle2,
  FileCode2,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Play,
  Pause
} from 'lucide-react';

export default function BrowserRedirectLoop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.3 });

  // Phase:
  // 0: Initial GitHub view (https://github.com/facebook/react)
  // 1: "hub" is selected (blue highlight)
  // 2: "hub" deleted, typing "contextgen" -> https://gitcontextgen.com/facebook/react
  // 3: Enter pressed (subtle pulse ring on address bar)
  // 4: Morphed into GitContextGen Dashboard (AST tree, 92% savings, rules synced)
  const [phase, setPhase] = useState<number>(0);
  const [typedUrl, setTypedUrl] = useState('https://github.com/facebook/react');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isInView || isPaused) return;

    const timer = setInterval(() => {
      setPhase((prev) => (prev + 1) % 5);
    }, 2400);

    return () => clearInterval(timer);
  }, [isInView, isPaused]);

  useEffect(() => {
    if (phase === 0) {
      setTypedUrl('https://github.com/facebook/react');
    } else if (phase === 1) {
      setTypedUrl('https://github.com/facebook/react');
    } else if (phase === 2) {
      setTypedUrl('https://gitcontextgen.com/facebook/react');
    } else if (phase === 3) {
      setTypedUrl('https://gitcontextgen.com/facebook/react');
    } else if (phase === 4) {
      setTypedUrl('https://gitcontextgen.com/facebook/react');
    }
  }, [phase]);

  const isMorphed = phase >= 3;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full max-w-5xl mx-auto rounded-2xl border border-zinc-800/80 bg-[#030303] shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden text-left font-sans select-none relative group"
    >
      {/* Ambient Backlight Glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Browser Chrome Bar */}
      <div className="px-4 py-3 bg-zinc-950/90 border-b border-zinc-850 flex items-center justify-between gap-3 text-xs">
        {/* Window Controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700/60" />
          <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700/60" />
          <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700/60" />
        </div>

        {/* Animated Address Bar */}
        <div
          className={`flex-1 max-w-2xl mx-auto px-4 py-1.5 rounded-full bg-zinc-900/80 border text-xs font-mono flex items-center justify-between gap-2 transition-all duration-300 ${
            phase === 3
              ? 'border-amber-400/80 ring-2 ring-amber-400/20 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
              : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-zinc-500 shrink-0 select-none">https://</span>
            <span className="text-zinc-400 shrink-0">git</span>

            {/* Address Mutation: "hub" vs "contextgen" */}
            {phase <= 1 ? (
              <span
                className={`transition-colors duration-200 ${
                  phase === 1 ? 'bg-blue-500/40 text-blue-200 px-1 rounded' : 'text-zinc-200'
                }`}
              >
                hub
              </span>
            ) : (
              <motion.span
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-amber-400 font-bold bg-amber-400/10 px-1 rounded border border-amber-400/30"
              >
                contextgen
              </motion.span>
            )}

            <span className="text-zinc-500 shrink-0">.com/</span>
            <span className="text-zinc-200 truncate">facebook/react</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {phase === 3 && (
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/30">
                ↵ Enter
              </span>
            )}
            <button
              type="button"
              onClick={() => setPhase(0)}
              className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer p-0.5"
              title="Reset Animation"
              aria-label="Reset Animation"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Play/Pause Tooltip Indicator */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
          <span className="hidden sm:inline">hub ➔ contextgen</span>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition"
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Browser Body with Morphing Content */}
      <div className="relative min-h-[440px] bg-[#080808] p-4 sm:p-6 text-zinc-300 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isMorphed ? (
            /* ========================================================
             * STATE A: Standard GitHub Repository Page (The "Before")
             * ======================================================== */
            <motion.div
              key="github-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              {/* GitHub Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-600" />
                  <span className="text-zinc-400 text-sm font-mono">facebook</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-zinc-100 text-base font-bold font-mono">react</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Public
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" /> 231k
                  </span>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
                    <GitFork className="w-3.5 h-3.5" /> 46.2k
                  </span>
                </div>
              </div>

              {/* GitHub Tabs Bar */}
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 border-b border-zinc-850 pb-2">
                <span className="text-zinc-200 border-b-2 border-amber-500 pb-2 -mb-2 font-medium">Code</span>
                <span>Issues (981)</span>
                <span>Pull requests (214)</span>
                <span>Actions</span>
              </div>

              {/* GitHub File List */}
              <div className="rounded-xl border border-zinc-850 bg-zinc-950/60 overflow-hidden text-xs font-mono">
                <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-850 text-zinc-400 flex items-center justify-between">
                  <span>commit f83c02d • 14 minutes ago</span>
                  <span className="text-zinc-500">1,489 commits</span>
                </div>
                <div className="divide-y divide-zinc-900">
                  {[
                    { name: 'packages/react', type: 'dir', msg: 'Reconciler optimizations' },
                    { name: 'packages/react-dom', type: 'dir', msg: 'Hydration boundary fixes' },
                    { name: 'scripts/release', type: 'dir', msg: 'Sync automated builds' },
                    { name: 'package.json', type: 'file', msg: 'Bump monorepo dependencies' },
                    { name: 'README.md', type: 'file', msg: 'Update documentation pointers' },
                  ].map((f, i) => (
                    <div key={i} className="px-4 py-2 flex items-center justify-between hover:bg-zinc-900/30">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <span>{f.type === 'dir' ? '📁' : '📄'}</span>
                        <span className="hover:underline cursor-pointer">{f.name}</span>
                      </div>
                      <span className="text-zinc-600 truncate max-w-xs">{f.msg}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtle Prompt Callout */}
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400 font-mono flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  Edit URL from <code className="text-zinc-200">github.com</code> to <code className="text-amber-400">gitcontextgen.com</code> to generate AI context...
                </span>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </div>
            </motion.div>
          ) : (
            /* ========================================================
             * STATE B: Sleek GitContextGen Dashboard (The "After")
             * ======================================================== */
            <motion.div
              key="contextgen-dashboard"
              initial={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              {/* ContextGen Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-200 text-sm font-bold font-mono">facebook / react</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Context Ingested
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono">AST Tree Indexed • L2 Cache SHA-256 Match</p>
                  </div>
                </div>

                {/* Animated Token Bill Reduction Metric */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 text-amber-300 font-mono text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Token Bill Reduced by <strong>92%</strong></span>
                </motion.div>
              </div>

              {/* Grid: AST Topology + Rule Harmonization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: AST Topology Decomposition */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-850 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" /> AST Module Topology
                    </span>
                    <span className="text-emerald-400">4 Packages Mapped</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                      <span className="text-zinc-300">react-core</span>
                      <span className="text-zinc-500 text-[11px]">state & hooks API</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                      <span className="text-zinc-300">react-dom</span>
                      <span className="text-zinc-500 text-[11px]">DOM reconciliation</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                      <span className="text-zinc-300">scheduler</span>
                      <span className="text-zinc-500 text-[11px]">concurrent priorities</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Synchronized Rules Output */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-850 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-amber-400" /> Synced AI Rule Engine
                    </span>
                    <span className="text-amber-300 text-[11px]">alwaysApply: true</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                      <span className="text-zinc-300">.cursor/rules/project-rules.mdc</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                      <span className="text-zinc-300">CLAUDE.md</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                      <span className="text-zinc-300">~/.claude.json (MCP stdio bridge)</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Success Banner */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI agents ready to code without burning tokens or hallucinations.</span>
                </div>
                <span className="text-amber-400 font-bold hidden sm:inline">Zero-Hallucination Verified</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Step Tracker Indicator */}
      <div className="px-5 py-2.5 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Interactive Preview • 12s Continuous Simulation Loop</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((stepIdx) => (
            <button
              key={stepIdx}
              type="button"
              onClick={() => setPhase(stepIdx)}
              aria-label={`Jump to step ${stepIdx + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${
                phase === stepIdx ? 'w-5 bg-amber-400' : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
