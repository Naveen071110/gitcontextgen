'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Minus,
  ArrowRight,
  Sparkles,
  GitCompareArrows,
} from 'lucide-react';

type Support = 'full' | 'partial' | 'none';

interface ComparisonRow {
  feature: string;
  tooltip?: string;
  gitcontextgen: Support;
  manual: Support;
  chatgpt: Support;
  generic: Support;
}

const rows: ComparisonRow[] = [
  {
    feature: 'Reads your actual codebase structure',
    gitcontextgen: 'full',
    manual: 'partial',
    chatgpt: 'none',
    generic: 'partial',
  },
  {
    feature: 'Verifies commands from package.json',
    gitcontextgen: 'full',
    manual: 'partial',
    chatgpt: 'none',
    generic: 'none',
  },
  {
    feature: 'Multi-format export (CLAUDE.md, .cursorrules, replit.md, etc.)',
    gitcontextgen: 'full',
    manual: 'none',
    chatgpt: 'none',
    generic: 'partial',
  },
  {
    feature: 'Auto-detects tech stack & dependencies',
    gitcontextgen: 'full',
    manual: 'none',
    chatgpt: 'none',
    generic: 'partial',
  },
  {
    feature: 'Safety boundaries (protected files, secrets)',
    gitcontextgen: 'full',
    manual: 'partial',
    chatgpt: 'none',
    generic: 'none',
  },
  {
    feature: 'Architecture diagrams (Mermaid)',
    gitcontextgen: 'full',
    manual: 'none',
    chatgpt: 'none',
    generic: 'none',
  },
  {
    feature: 'Stays up-to-date when code changes',
    gitcontextgen: 'full',
    manual: 'none',
    chatgpt: 'none',
    generic: 'partial',
  },
  {
    feature: 'Ease of Use for Non-Coders',
    gitcontextgen: 'full',
    manual: 'none',
    chatgpt: 'partial',
    generic: 'partial',
  },
  {
    feature: 'No token/context window wasted',
    gitcontextgen: 'full',
    manual: 'partial',
    chatgpt: 'none',
    generic: 'partial',
  },
];

function CellIcon({ status }: { status: Support }) {
  if (status === 'full') {
    return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  }
  if (status === 'partial') {
    return <Minus className="w-5 h-5 text-amber-400/70" />;
  }
  return <XCircle className="w-5 h-5 text-white/15" />;
}

export default function ComparisonTableSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 bg-black text-white">
      <div ref={ref} className="w-full flex flex-col items-center justify-center">

        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-white/80 mb-6">
            <GitCompareArrows className="w-3.5 h-3.5 text-cyan-400" /> How It Compares
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Stop Writing Context Files{' '}
            <span className="font-serif italic font-normal text-white/80">By Hand.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto">
            See how GitContextGen compares to the alternatives developers are using today —
            and why most of them leave your AI agent flying blind.
          </p>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-5xl overflow-x-auto"
        >
          <div className="min-w-[680px] rounded-2xl bg-white/[0.02] border border-white/[0.06] shadow-2xl overflow-hidden">

            {/* Table Header */}
            <div className="grid grid-cols-[1fr_120px_120px_120px_120px] border-b border-white/[0.06] bg-white/[0.02]">
              <div className="px-6 py-5 text-sm font-semibold text-white/60">Capability</div>
              <div className="px-4 py-5 text-center">
                <div className="text-sm font-bold text-cyan-400">GitContextGen</div>
                <div className="text-[10px] font-mono text-white/30 mt-0.5">Automated</div>
              </div>
              <div className="px-4 py-5 text-center">
                <div className="text-sm font-semibold text-white/50">Write Manually</div>
                <div className="text-[10px] font-mono text-white/20 mt-0.5">DIY</div>
              </div>
              <div className="px-4 py-5 text-center">
                <div className="text-sm font-semibold text-white/50">ChatGPT Prompt</div>
                <div className="text-[10px] font-mono text-white/20 mt-0.5">Copy-Paste</div>
              </div>
              <div className="px-4 py-5 text-center">
                <div className="text-sm font-semibold text-white/50">Generic Tools</div>
                <div className="text-[10px] font-mono text-white/20 mt-0.5">Other</div>
              </div>
            </div>

            {/* Table Rows */}
            {rows.map((row, idx) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
                className={`grid grid-cols-[1fr_120px_120px_120px_120px] items-center ${
                  idx < rows.length - 1 ? 'border-b border-white/[0.04]' : ''
                } hover:bg-white/[0.02] transition-colors duration-150`}
              >
                <div className="px-6 py-4 text-sm text-white/70">{row.feature}</div>
                <div className="px-4 py-4 flex justify-center">
                  <CellIcon status={row.gitcontextgen} />
                </div>
                <div className="px-4 py-4 flex justify-center">
                  <CellIcon status={row.manual} />
                </div>
                <div className="px-4 py-4 flex justify-center">
                  <CellIcon status={row.chatgpt} />
                </div>
                <div className="px-4 py-4 flex justify-center">
                  <CellIcon status={row.generic} />
                </div>
              </motion.div>
            ))}

            {/* Best For Row */}
            <div className="grid grid-cols-[1fr_120px_120px_120px_120px] items-center border-t border-white/[0.08] bg-white/[0.01]">
              <div className="px-6 py-5 text-xs font-mono text-white/40 uppercase tracking-wider">Best For</div>
              <div className="px-3 py-5 text-center text-xs font-semibold text-cyan-400 leading-snug">
                Teams & solo devs who want it done right
              </div>
              <div className="px-3 py-5 text-center text-xs text-white/30 leading-snug">
                Experts who have time to spare
              </div>
              <div className="px-3 py-5 text-center text-xs text-white/30 leading-snug">
                Quick experiments, not production
              </div>
              <div className="px-3 py-5 text-center text-xs text-white/30 leading-snug">
                Basic repos with simple stacks
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <a
            href="#hero"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all duration-200 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Try GitContextGen Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <p className="text-xs text-white/30 font-mono">No signup required. Paste a repo URL and see the difference.</p>
        </motion.div>
      </div>
    </section>
  );
}
