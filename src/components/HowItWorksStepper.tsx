'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Network, Database, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';

export default function HowItWorksStepper() {
  const steps = [
    {
      step: '01',
      title: 'Parse & Boundary Mapping',
      subtitle: 'Deterministic AST Topology',
      description:
        'Scans repository AST syntax trees, package manifests, and route entry points. Automatically detects tech stacks and shields private secrets with deterministic regex guardrails.',
      icon: Network,
      tag: 'AST Parser',
      metric: '142 files mapped in < 180ms',
      badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40',
    },
    {
      step: '02',
      title: 'L2 Persistent Disk Cache',
      subtitle: '92% Token Consumption Reduction',
      description:
        'Persists computed module graphs, schemas, and diagrams into an L2 local disk cache. Sub-agents query cached indices instead of repeatedly burning 125,000+ raw tokens per prompt.',
      icon: Database,
      tag: 'L2 Disk Cache',
      metric: '125k -> 10k tokens (Saved 92%)',
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
    },
    {
      step: '03',
      title: 'Multi-IDE Sync & Rules Push',
      subtitle: 'Zero Context Drift Across Team',
      description:
        'Pushes synchronized .cursor/rules/*.mdc (alwaysApply: true), CLAUDE.md, and local stdio MCP servers directly into your active workspace with multi-agent file locks.',
      icon: RefreshCw,
      tag: 'Live IDE Sync',
      metric: 'stdio protocol active (< 12ms latency)',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
    },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20 text-left font-sans select-none">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-amber-400 mb-3.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Three-Step Context Pipeline
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          How It Works.{' '}
          <span className="font-serif italic font-normal text-amber-300">Deterministic AI Sync.</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          From raw GitHub repository to synchronized Cursor and Claude Code configurations in three high-speed stages.
        </p>
      </div>

      {/* 3-Step Interactive Grid with whileInView */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: idx * 0.12 }}
              className="p-6 sm:p-7 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 hover:border-zinc-700/90 flex flex-col justify-between space-y-6 transition-all duration-300 group hover:shadow-[0_0_35px_rgba(255,255,255,0.02)] relative overflow-hidden"
            >
              <div>
                {/* Step Pill & Tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-2xl font-mono font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    {item.step}
                  </span>
                  <span className={'px-2.5 py-0.5 rounded-full text-[11px] font-mono border ' + item.badgeColor}>
                    {item.tag}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-200 mb-4 group-hover:text-amber-400 group-hover:border-amber-400/40 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-white mb-1 tracking-tight font-mono">
                  {item.title}
                </h3>
                <p className="text-xs text-amber-400/90 font-mono mb-2.5">
                  {item.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span className="text-zinc-300 font-medium">{item.metric}</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
