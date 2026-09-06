'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Pause, RotateCcw, Check, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useInView } from 'framer-motion';

interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
}

export default function InteractiveCliTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.3 });

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [step, setStep] = useState(0);

  const checklist: ChecklistItem[] = [
    { id: '1', label: 'Local Codebase Detected', detail: 'Next.js + Tailwind React' },
    { id: '2', label: 'WordPress Environment Found', detail: 'Loading Secure WPCS Presets...' },
    { id: '3', label: 'Target IDE Configured', detail: 'Bootstrapping .cursor/rules/ (alwaysApply: true)' },
    { id: '4', label: 'Concurrency Protection', detail: 'Multi-Agent file locks enabled' },
    { id: '5', label: 'Local MCP Server', detail: 'Registered successfully in ~/.claude.json' },
  ];

  useEffect(() => {
    if (!isInView || !isPlaying) return;

    const timer = setInterval(() => {
      setStep((prev) => (prev >= 8 ? 0 : prev + 1));
    }, 1400);

    return () => clearInterval(timer);
  }, [isInView, isPlaying]);

  const handleReplay = () => {
    setStep(0);
    setIsPlaying(true);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-20 text-left font-mono select-none">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-amber-400 mb-4">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Instant Local Onboarding
        </div>
        <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-3">
          One Command.{' '}
          <span className="font-serif italic font-normal text-amber-300">Every AI Agent Configured.</span>
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
          No manual JSON editing. Automatically detect your project structure, lock down rule formats, and register stdio MCP servers in seconds.
        </p>
      </div>

      {/* Terminal Mock Window */}
      <div
        ref={containerRef}
        className="w-full rounded-2xl border border-zinc-800 bg-[#070707] shadow-2xl overflow-hidden"
      >
        {/* Chrome Title Bar */}
        <div className="px-4 py-3 bg-zinc-950/90 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs text-zinc-500 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> gitcontextgen-cli — setup & initialization
            </span>
          </div>

          {/* Interactive Controls */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 flex items-center gap-1 transition"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="text-[11px]">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              title="Replay sequence"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 text-xs sm:text-sm text-zinc-300 space-y-4 min-h-[340px]">
          {/* Step 1: Install CLI */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-100">
              <span className="text-amber-400 select-none">$</span>
              <span>npm install -g @gitcontextgen/core</span>
              {step === 0 && <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse" />}
            </div>
            {step >= 1 && (
              <p className="text-zinc-500 text-xs pl-4">
                + @gitcontextgen/core@1.0.1 (added 1 package in 340ms)
              </p>
            )}
          </div>

          {/* Step 2: Run Init */}
          {step >= 2 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-zinc-100">
                <span className="text-amber-400 select-none">$</span>
                <span>gitcontextgen init</span>
                {step === 2 && <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse" />}
              </div>

              {/* Checklist Items Progressively Appearing */}
              <div className="space-y-2 pl-4 text-xs font-mono">
                {checklist.map((item, index) => {
                  const isItemVisible = step >= index + 3;
                  if (!isItemVisible) return null;

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-2.5 text-zinc-300 animate-fadeIn"
                    >
                      <span className="text-emerald-400 font-bold shrink-0">[✔]</span>
                      <div>
                        <strong className="text-zinc-100">{item.label}:</strong>{' '}
                        <span className="text-zinc-400">{item.detail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 8: Completion Summary */}
          {step >= 8 && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Workspace configured. Zero hallucinations guaranteed.</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Loop resets in 3s...</span>
            </div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="px-5 py-2.5 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Compatible with Claude Code, Cursor, Windsurf, Replit</span>
          <span className="text-emerald-400">● CLI Gateway Online</span>
        </div>
      </div>
    </section>
  );
}
