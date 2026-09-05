'use client';

import { Cpu, Zap, ArrowRight, ShieldAlert, CheckCircle2, TrendingDown, Layers, Terminal, Sparkles } from 'lucide-react';

export default function McpParadigmSection() {
  return (
    <section className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white relative">
      <div className="w-full flex flex-col items-center justify-center">

        {/* Section Pill Badge */}
        <div className="w-full flex justify-center mb-6">
          <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Model Context Protocol (MCP) Integration
          </div>
        </div>

        {/* Section Headline */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Stop Stuffing Context.{' '}
            <span className="font-serif italic font-normal text-cyan-300">Let Your AI Pull on Demand.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            Static prompt injection burns tokens and triggers hallucinations. The GitContextGen MCP Server replaces heavy context dumps with precision, on-demand codebase queries.
          </p>
        </div>

        {/* 2-Column Comparison Grid: Push vs Pull */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16 text-left">

          {/* Card A: The Old Push Method (Context Debt) */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
                The Legacy &quot;Push&quot; Model
              </span>
              <ShieldAlert className="w-5 h-5 text-red-400/60" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-mono mb-2">Massive Static Files in Context</h3>
              <p className="text-xs sm:text-sm text-white/60 font-sans leading-relaxed">
                Stuffing 3,000+ lines of <code className="text-red-300 font-mono">CLAUDE.md</code> or <code className="text-red-300 font-mono">.cursorrules</code> into every turn eats 70% of your LLM context window before you write a single line of prompt.
              </p>
            </div>

            {/* Pain Point Metrics */}
            <div className="space-y-3 pt-4 border-t border-white/5 font-mono text-xs text-white/70">
              <div className="flex items-center gap-2 text-red-300">
                <span className="text-red-400 font-bold">✕</span> Burns 2,500+ tokens on every single chat message
              </div>
              <div className="flex items-center gap-2 text-red-300">
                <span className="text-red-400 font-bold">✕</span> Context drift occurs whenever code changes
              </div>
              <div className="flex items-center gap-2 text-red-300">
                <span className="text-red-400 font-bold">✕</span> Slower model inference latency & higher API costs
              </div>
            </div>

            {/* Visual Token Meter (Heavy) */}
            <div className="p-4 rounded-2xl bg-black/60 border border-red-500/20 font-mono text-xs space-y-2">
              <div className="flex justify-between text-[11px] text-white/60">
                <span>Context Window Utilization:</span>
                <span className="text-red-400 font-bold">78% Burned</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="w-[78%] h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Card B: The Modern GitContextGen MCP Pull Model */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-neutral-950 to-black border-2 border-cyan-500/50 space-y-6 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-extrabold uppercase tracking-wider">
                ⚡ The GitContextGen MCP Model
              </span>
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-mono mb-2">Targeted Dynamic Tool Queries</h3>
              <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                Your AI agent calls <code className="text-cyan-300 font-mono">gitcontextgen_analyze</code> or <code className="text-cyan-300 font-mono">gitcontextgen_get_rules</code> over <code className="text-cyan-300 font-mono">stdio</code> only when it needs specific framework constraints or manifests.
              </p>
            </div>

            {/* Benefit Metrics */}
            <div className="space-y-3 pt-4 border-t border-cyan-500/20 font-mono text-xs text-white/90">
              <div className="flex items-center gap-2 text-cyan-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>90% Token Reduction:</strong> ~120 tokens per focused query</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Zero-Drift Realtime Sync:</strong> Reads live repo manifests</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Sub-Second Local stdio:</strong> Zero round-trip cloud latency</span>
              </div>
            </div>

            {/* Visual Token Meter (Ultra-Light) */}
            <div className="p-4 rounded-2xl bg-black/80 border border-cyan-500/30 font-mono text-xs space-y-2">
              <div className="flex justify-between text-[11px] text-white/60">
                <span>Context Window Utilization:</span>
                <span className="text-emerald-400 font-bold">~8% Used (92% Free for Code)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="w-[8%] h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" />
              </div>
            </div>
          </div>

        </div>

        {/* 3 Value Pillars */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 text-left font-mono text-xs">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <TrendingDown className="w-4 h-4" /> Massive Cost Savings
            </div>
            <p className="text-white/60 font-sans leading-relaxed text-xs">
              Eliminate repetitive system prompt overhead across thousands of daily AI assistant iterations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Layers className="w-4 h-4" /> Live Architecture Maps
            </div>
            <p className="text-white/60 font-sans leading-relaxed text-xs">
              AI agents query Mermaid and Kroki topology diagrams dynamically to understand component boundaries before writing code.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Terminal className="w-4 h-4" /> Zero-Setup CLI
            </div>
            <p className="text-white/60 font-sans leading-relaxed text-xs">
              Launch instantly with <code className="text-emerald-300">npx -y @gitcontextgen/core mcp</code> without downloading binaries or configuring API keys.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
