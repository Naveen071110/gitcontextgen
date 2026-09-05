import Link from 'next/link';
import { Terminal, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function QuickSetupSection() {
  return (
    <section className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white relative">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="w-full flex justify-center mb-6">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-white/80">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Fast & Simple
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Start Generating AI Context in{' '}
            <span className="font-serif italic font-normal text-white/80">Seconds.</span>
          </h2>
          
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            No mandatory installation. No complex configuration. Pure plain-text context files ready for Claude, Cursor, Replit, or Windsurf.
          </p>
        </div>

        {/* Terminal Quick Box - Borderless Sophisticated Floating Terminal */}
        <div className="w-full max-w-2xl mx-auto mb-14 flex justify-center">
          <div className="w-full rounded-2xl bg-white/[0.03] overflow-hidden shadow-2xl text-left">
            <div className="px-6 sm:px-8 py-4 sm:py-5 flex items-center gap-2 bg-black/60">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span className="text-xs font-mono text-white/50 ml-2 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" /> quick-start — zero setup
              </span>
            </div>

            <div className="p-6 sm:p-8 font-mono text-xs sm:text-sm space-y-4 leading-relaxed">
              <p className="text-white/40">// Option A: Connect directly via MCP Server (Claude Code, Cursor, Windsurf)</p>
              <p className="text-white">
                <span className="text-cyan-400 font-bold">$</span> npx -y @gitcontextgen/core mcp
              </p>

              <p className="text-white/40 pt-2">// Option B: Web UI & Instant Markdown Exporter</p>
              <p className="text-emerald-400 font-bold">
                ✓ 1-Click AGENTS.md, CLAUDE.md, .cursorrules & Kroki Architecture Maps
              </p>
            </div>
          </div>
        </div>

        {/* Feature Checkmarks */}
        <div className="w-full flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm font-mono text-white/80 mb-12 text-center">
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Native MCP Server Protocol (`stdio`)
          </span>
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Zero Lock-in (Plain Markdown Files)
          </span>
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Works with Claude Code, Cursor & Windsurf
          </span>
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 100% In-Memory Code Security
          </span>
        </div>

        <div className="w-full flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-white text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-2xl"
          >
            Try the Free AI Context Generator <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
