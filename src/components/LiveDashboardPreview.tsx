'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  TrendingDown,
  FileText,
  Copy,
  Check,
  Sparkles,
  GitBranch,
  Unlock,
  CheckCircle2,
  Database,
  ShieldCheck,
  Layers,
} from 'lucide-react';

type TabId = 'codemap' | 'cache' | 'handoff';

export default function LiveDashboardPreview() {
  const [activeTab, setActiveTab] = useState<TabId>('codemap');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSection(id);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  const tabs: Array<{ id: TabId; label: string; icon: any }> = [
    { id: 'codemap', label: 'Code Map Preview', icon: FolderGit2 },
    { id: 'cache', label: 'L2 Caching Chart', icon: TrendingDown },
    { id: 'handoff', label: 'Client Handoff Report', icon: FileText },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-16 md:py-20 text-left font-sans select-none">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-amber-400 mb-3.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Interactive Feature Dashboard
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          GitHub-Familiar.{' '}
          <span className="font-serif italic font-normal text-amber-300">Engineered for Teams.</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Inspect your indexed codebase map, monitor token billing savings via local L2 cache, and preview automated client delivery summaries.
        </p>
      </div>

      {/* GitHub-Inspired Workspace Card Shell */}
      <div className="w-full rounded-2xl border border-zinc-800 bg-[#0d1117] shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* GitHub Repository Header Strip */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#161b22] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <FolderGit2 className="w-4 h-4 text-[#58a6ff]" />
            <span className="text-[#58a6ff] font-semibold">acme-agency</span>
            <span className="text-[#8b949e]">/</span>
            <span className="text-[#f0f6fc] font-bold">production-saas-core</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] border border-[#30363d] bg-[#21262d] text-[#8b949e] flex items-center gap-1 ml-1">
              <Unlock className="w-2.5 h-2.5 text-[#3fb950]" /> Public
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center gap-1.5 text-[11px]">
              <GitBranch className="w-3 h-3 text-[#8b949e]" /> main
            </span>
            <span className="px-2 py-1 rounded-md bg-[#238636]/15 border border-[#238636]/40 text-[#3fb950] text-[11px] font-bold">
              Synced
            </span>
          </div>
        </div>

        {/* GitHub Navigation Tabs with Framer Motion layoutId underline */}
        <div className="px-4 sm:px-6 bg-[#0d1117] border-b border-[#30363d] overflow-x-auto no-scrollbar">
          <nav role="tablist" className="flex items-center gap-1 sm:gap-3 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={'relative px-3.5 py-3 text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer touch-manipulation min-h-[44px] ' + (
                    isActive
                      ? 'text-[#f0f6fc] font-semibold'
                      : 'text-[#8b949e] hover:text-[#c9d1d9]'
                  )}
                >
                  <Icon className={'w-4 h-4 ' + (isActive ? 'text-[#f0f6fc]' : 'text-[#8b949e]')} />
                  <span>{tab.label}</span>

                  {/* Fluid Framer Motion Tab Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="github-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f78166]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Canvas with Explicit Height to Prevent CLS */}
        <div className="p-5 sm:p-7 min-h-[380px] bg-[#0d1117]">
          <AnimatePresence mode="wait">
            {/* TAB 1: Code Map Preview (Animated Dark-Themed SVG Tree Diagram) */}
            {activeTab === 'codemap' && (
              <motion.div
                key="codemap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#30363d] text-xs font-mono">
                  <span className="text-[#8b949e] flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#58a6ff]" />
                    Indexed AST Topology Diagram
                  </span>
                  <span className="text-[#3fb950] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 0 Secrets Leaked (Regex Shield Active)
                  </span>
                </div>

                {/* SVG Code Map Tree Diagram */}
                <div className="w-full h-64 rounded-xl bg-[#161b22] border border-[#30363d] p-4 relative overflow-hidden flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 600 220" fill="none">
                    {/* Connecting Branch Lines */}
                    <path d="M 60 110 H 130" stroke="#30363d" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M 130 110 V 45 H 200" stroke="#30363d" strokeWidth="2" />
                    <path d="M 130 110 H 200" stroke="#30363d" strokeWidth="2" />
                    <path d="M 130 110 V 175 H 200" stroke="#30363d" strokeWidth="2" />

                    <path d="M 330 45 H 390" stroke="#58a6ff" strokeWidth="1.5" strokeOpacity="0.6" />
                    <path d="M 330 110 H 390" stroke="#f78166" strokeWidth="1.5" strokeOpacity="0.6" />
                    <path d="M 330 175 H 390" stroke="#3fb950" strokeWidth="1.5" strokeOpacity="0.6" />

                    {/* Root Node: Repository */}
                    <g transform="translate(10, 88)">
                      <rect width="95" height="44" rx="8" fill="#21262d" stroke="#58a6ff" strokeWidth="1.5" />
                      <text x="47" y="22" textAnchor="middle" fill="#f0f6fc" fontSize="11" fontFamily="monospace" fontWeight="bold">root /</text>
                      <text x="47" y="34" textAnchor="middle" fill="#8b949e" fontSize="9" fontFamily="monospace">142 files</text>
                    </g>

                    {/* Branch Node 1: src/app */}
                    <g transform="translate(200, 23)">
                      <rect width="130" height="44" rx="8" fill="#21262d" stroke="#30363d" strokeWidth="1" />
                      <text x="65" y="21" textAnchor="middle" fill="#58a6ff" fontSize="11" fontFamily="monospace" fontWeight="bold">📁 src/app/</text>
                      <text x="65" y="33" textAnchor="middle" fill="#8b949e" fontSize="9" fontFamily="monospace">23 routes</text>
                    </g>

                    {/* Branch Node 2: .cursor/rules */}
                    <g transform="translate(200, 88)">
                      <rect width="130" height="44" rx="8" fill="#21262d" stroke="#f78166" strokeWidth="1.5" />
                      <text x="65" y="21" textAnchor="middle" fill="#f78166" fontSize="11" fontFamily="monospace" fontWeight="bold">📄 .cursor/rules</text>
                      <text x="65" y="33" textAnchor="middle" fill="#8b949e" fontSize="9" fontFamily="monospace">alwaysApply: true</text>
                    </g>

                    {/* Branch Node 3: CLAUDE.md */}
                    <g transform="translate(200, 153)">
                      <rect width="130" height="44" rx="8" fill="#21262d" stroke="#30363d" strokeWidth="1" />
                      <text x="65" y="21" textAnchor="middle" fill="#3fb950" fontSize="11" fontFamily="monospace" fontWeight="bold">📄 CLAUDE.md</text>
                      <text x="65" y="33" textAnchor="middle" fill="#8b949e" fontSize="9" fontFamily="monospace">Synced commands</text>
                    </g>

                    {/* Target End Leaf: Claude Code MCP */}
                    <g transform="translate(390, 23)">
                      <rect width="180" height="44" rx="8" fill="#1f242c" stroke="#58a6ff" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="90" y="21" textAnchor="middle" fill="#f0f6fc" fontSize="10" fontFamily="monospace">Claude Code CLI</text>
                      <text x="90" y="33" textAnchor="middle" fill="#58a6ff" fontSize="9" fontFamily="monospace">&lt; 12ms stdio hook</text>
                    </g>

                    {/* Target End Leaf: Cursor Composer */}
                    <g transform="translate(390, 88)">
                      <rect width="180" height="44" rx="8" fill="#1f242c" stroke="#f78166" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="90" y="21" textAnchor="middle" fill="#f0f6fc" fontSize="10" fontFamily="monospace">Cursor Composer</text>
                      <text x="90" y="33" textAnchor="middle" fill="#f78166" fontSize="9" fontFamily="monospace">Strict Type Guardrails</text>
                    </g>

                    {/* Target End Leaf: Multi-Agent Lock */}
                    <g transform="translate(390, 153)">
                      <rect width="180" height="44" rx="8" fill="#1f242c" stroke="#3fb950" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="90" y="21" textAnchor="middle" fill="#f0f6fc" fontSize="10" fontFamily="monospace">Write-Lock Engine</text>
                      <text x="90" y="33" textAnchor="middle" fill="#3fb950" fontSize="9" fontFamily="monospace">Zero Race Conditions</text>
                    </g>
                  </svg>
                </div>
              </motion.div>
            )}

            {/* TAB 2: L2 Caching Chart (Visual Bar Chart Illustrating 92% Drop in Token Waste) */}
            {activeTab === 'cache' && (
              <motion.div
                key="cache"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#30363d] text-xs font-mono">
                  <span className="text-[#8b949e] flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    Token Consumption Benchmark (10 Continuous Agent Tasks)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-bold">
                    92% Drop in Token Costs
                  </span>
                </div>

                {/* Animated Comparison Bar Chart */}
                <div className="space-y-5 font-mono text-xs">
                  {/* Row 1: Uncached Raw Dump */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
                        Without GitContextGen (Raw Full-Tree Re-Reads)
                      </span>
                      <span className="text-[#f85149] font-bold">125,000 tokens ($0.375 / query)</span>
                    </div>
                    <div className="w-full h-8 rounded-lg bg-[#161b22] border border-[#30363d] p-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-md bg-gradient-to-r from-red-600 to-rose-500 flex items-center justify-end pr-3 text-[11px] font-bold text-white shadow-sm"
                      >
                        100% Volume
                      </motion.div>
                    </div>
                  </div>

                  {/* Row 2: With GitContextGen L2 Cache */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" />
                        With GitContextGen L2 Cache (AST Boundary Pulls)
                      </span>
                      <span className="text-[#3fb950] font-bold">10,000 tokens ($0.030 / query)</span>
                    </div>
                    <div className="w-full h-8 rounded-lg bg-[#161b22] border border-[#30363d] p-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '8%' }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className="h-full min-w-[50px] rounded-md bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center text-[10px] font-bold text-zinc-950 shadow-sm"
                      >
                        8% (-92%)
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d]">
                    <span className="text-[#8b949e] text-[11px] block">Agency Monthly Savings</span>
                    <strong className="text-xl font-bold text-[#f0f6fc]">$345.00+ / mo</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d]">
                    <span className="text-[#8b949e] text-[11px] block">Average Cache Hit Latency</span>
                    <strong className="text-xl font-bold text-[#3fb950]">&lt; 12ms</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d]">
                    <span className="text-[#8b949e] text-[11px] block">Context Window Headroom</span>
                    <strong className="text-xl font-bold text-[#58a6ff]">190k+ Free Tokens</strong>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: Client Handoff Report (Jargon-Free Delivery Summary) */}
            {activeTab === 'handoff' && (
              <motion.div
                key="handoff"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-4 font-mono text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#30363d]">
                  <div>
                    <h4 className="text-[#f0f6fc] font-bold text-sm">Sprint Delivery Certification</h4>
                    <p className="text-[#8b949e] text-[11px]">Jargon-free client progress verification & AI handoff</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy('GitContextGen Agency Client Verification: All sprint deliverables audited with 0 CVE vulnerabilities and synchronized AI rules.', 'handoff-report')}
                    className="px-3.5 py-1.5 min-h-[36px] rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] flex items-center gap-1.5 transition cursor-pointer touch-manipulation"
                  >
                    {copiedSection === 'handoff-report' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'handoff-report' ? 'Copied' : 'Export Report'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3 font-sans">
                  <div className="flex items-center gap-2 text-[#3fb950] font-mono text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Ready for Production Client Delivery
                  </div>

                  <div className="space-y-2 text-xs text-[#c9d1d9] leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="text-[#3fb950] font-bold">✓</span>
                      <span><strong>TypeScript Architecture:</strong> 100% strict type compliance across 23 dynamic routes with zero runtime exceptions.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#3fb950] font-bold">✓</span>
                      <span><strong>Security & Vulnerabilities:</strong> 0 open CVE alerts detected via automated OSV.dev dependency audit.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#3fb950] font-bold">✓</span>
                      <span><strong>Open-Source Licensing:</strong> Verified MIT/SPDX guardrails prevent IP contamination for commercial use.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#3fb950] font-bold">✓</span>
                      <span><strong>Future Maintenance AI Rules:</strong> Synchronized .cursor/rules/*.mdc & CLAUDE.md prevent context rot during future agency retainers.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
