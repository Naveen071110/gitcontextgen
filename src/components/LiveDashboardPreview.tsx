'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  FileCode2,
  Server,
  TrendingDown,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Download,
  Sparkles,
  ExternalLink
} from 'lucide-react';

type TabId = 'explore' | 'sync' | 'mcp' | 'cache' | 'handoff';

export default function LiveDashboardPreview() {
  const [activeTab, setActiveTab] = useState<TabId>('explore');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const tabs: Array<{ id: TabId; label: string; icon: any }> = [
    { id: 'explore', label: 'Explore Code', icon: FolderGit2 },
    { id: 'sync', label: 'Sync Engine', icon: FileCode2 },
    { id: 'mcp', label: 'MCP Tools', icon: Server },
    { id: 'cache', label: 'Token Caching', icon: TrendingDown },
    { id: 'handoff', label: 'Client Handoff', icon: FileText },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-24 text-left font-sans select-none">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-amber-400 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Interactive Product Walkthrough
        </div>
        <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 mb-4">
          The B2B AI Workspace{' '}
          <span className="font-serif italic font-normal text-amber-300">Engineers Actually Love.</span>
        </h3>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Explore our GitHub-familiar interface. Inspect file trees, test live rule synchronization, observe local MCP latency, and track 92% token bill savings.
        </p>
      </div>

      {/* Dashboard Preview Shell */}
      <div className="w-full rounded-2xl border border-zinc-800 bg-[#09090b] shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="px-4 bg-zinc-950 border-b border-zinc-800 overflow-x-auto no-scrollbar">
          <nav role="tablist" className="flex items-center gap-1 sm:gap-2 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3.5 text-xs sm:text-sm font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-amber-400 text-zinc-100 font-semibold bg-zinc-900/30'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Body */}
        <div className="p-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* TAB 1: Explore Code */}
            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 font-mono text-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-zinc-400">
                  <span>Repository File Tree & AST Module Topology</span>
                  <span className="text-emerald-400">0 Secrets Leaked (Regex Shield)</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2 max-h-[280px] overflow-y-auto">
                  {[
                    { path: 'src/app/page.tsx', tag: 'Next.js App Router Page' },
                    { path: 'src/components/HeroSection.tsx', tag: 'Interactive Client Component' },
                    { path: 'src/lib/contextEngine.ts', tag: 'Deterministic AST Parser' },
                    { path: 'src/lib/fileLock.ts', tag: 'Multi-Agent Write Lockfile' },
                    { path: 'package.json', tag: 'Ecosystem Dependencies (npm)' },
                    { path: '.cursor/rules/project-rules.mdc', tag: 'Enforced with alwaysApply: true' },
                    { path: 'CLAUDE.md', tag: 'Synchronized Command Guidelines' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center justify-between py-1 px-2 rounded hover:bg-zinc-900/50">
                      <span className="text-zinc-300 flex items-center gap-2">
                        <span className="text-amber-400">📄</span> {f.path}
                      </span>
                      <span className="text-zinc-500 text-[11px]">{f.tag}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 2: Sync Engine */}
            {activeTab === 'sync' && (
              <motion.div
                key="sync"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono"
              >
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                  <div className="flex items-center justify-between text-zinc-300 pb-2 border-b border-zinc-850">
                    <span className="text-amber-400">.cursor/rules/project-rules.mdc</span>
                    <span className="text-emerald-400 text-[10px]">alwaysApply: true</span>
                  </div>
                  <pre className="text-zinc-400 text-[11px] leading-relaxed overflow-x-auto">
{`---
description: Agency Architectural Guardrails
globs: *
alwaysApply: true
---
# Cursor Composer Agent Rules
- Enforce strict TypeScript types
- Never edit build artifacts (.next/)
- Preserve verified npm run test commands`}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                  <div className="flex items-center justify-between text-zinc-300 pb-2 border-b border-zinc-850">
                    <span className="text-cyan-400">CLAUDE.md</span>
                    <span className="text-zinc-500 text-[10px]">Cross-Synchronized</span>
                  </div>
                  <pre className="text-zinc-400 text-[11px] leading-relaxed overflow-x-auto">
{`# CLAUDE.md — Multi-Agent Guidelines
> Paired with .cursor/rules/*.mdc
## Verified Execution
- Dev: npm run dev
- Build: npm run build
- Typecheck: npx tsc --noEmit
## Safety
- All API promises wrapped in try/catch`}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* TAB 3: MCP Tools */}
            {activeTab === 'mcp' && (
              <motion.div
                key="mcp"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-xs font-mono"
              >
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <p className="text-zinc-200 font-bold">Local stdio Model Context Protocol Server</p>
                      <p className="text-zinc-500 text-[11px]">Registered in ~/.claude.json & .cursor/mcp.json</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs">
                    &lt; 12ms latency
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850">
                    <strong className="text-zinc-200">gitcontextgen_get_rules</strong>
                    <p className="text-zinc-500 text-[11px] mt-1">Fetches synchronized rules without full file tree re-reads.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850">
                    <strong className="text-zinc-200">gitcontextgen_lint</strong>
                    <p className="text-zinc-500 text-[11px] mt-1">Verifies frontmatter compliance & secret protections.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: Token Caching (Interactive SVG Area Chart) */}
            {activeTab === 'cache' && (
              <motion.div
                key="cache"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-zinc-300">Cumulative Token Consumption (10 Agent Queries)</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-red-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" /> Without Cache (125k tokens)
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> With L2 Cache (10k tokens - 92% Saved)
                    </span>
                  </div>
                </div>

                {/* SVG Area Chart */}
                <div className="w-full h-48 rounded-xl bg-zinc-950 border border-zinc-850 p-3 flex items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Red Area (Without cache) */}
                    <path
                      d="M 0 140 L 50 120 L 100 95 L 150 80 L 200 65 L 250 50 L 300 40 L 350 30 L 400 20 L 450 15 L 500 10 L 500 150 L 0 150 Z"
                      fill="url(#redGrad)"
                    />
                    <path
                      d="M 0 140 L 50 120 L 100 95 L 150 80 L 200 65 L 250 50 L 300 40 L 350 30 L 400 20 L 450 15 L 500 10"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />

                    {/* Green Area (With L2 cache) */}
                    <path
                      d="M 0 145 L 50 140 L 100 138 L 150 137 L 200 136 L 250 135 L 300 134 L 350 134 L 400 133 L 450 133 L 500 132 L 500 150 L 0 150 Z"
                      fill="url(#greenGrad)"
                    />
                    <path
                      d="M 0 145 L 50 140 L 100 138 L 150 137 L 200 136 L 250 135 L 300 134 L 350 134 L 400 133 L 450 133 L 500 132"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </motion.div>
            )}

            {/* TAB 5: Client Handoff */}
            {activeTab === 'handoff' && (
              <motion.div
                key="handoff"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-4 text-xs font-mono"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                  <div>
                    <h4 className="text-zinc-100 font-bold text-sm">Automated Agency Client Handoff Report</h4>
                    <p className="text-zinc-500 text-[11px]">Jargon-free delivery certification for non-technical clients</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('Delivered & Verified via GitContextGen', 'handoff')}
                    className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 transition"
                  >
                    {copiedSection === 'handoff' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'handoff' ? 'Copied' : 'Export PDF / Markdown'}</span>
                  </button>
                </div>

                <div className="space-y-2 text-zinc-400 leading-relaxed text-[11px]">
                  <p>✓ All modules delivered and verified under clean TypeScript boundaries.</p>
                  <p>✓ 0 open CVE vulnerabilities flagged via OSV.dev package index.</p>
                  <p>✓ Open-source license compatibility certified (MIT / SPDX compliant).</p>
                  <p>✓ AI rules initialized to protect future agency maintenance sprints.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
