'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, FileCode2, Layers, ShieldCheck, Timer, GitBranch } from 'lucide-react';

const metrics = [
  {
    value: '150+',
    label: 'Lines of Verified Specs',
    sublabel: 'Per analysis output',
    icon: FileCode2,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/30',
  },
  {
    value: '6',
    label: 'AI Formats Supported',
    sublabel: 'Claude, Cursor, Copilot, Replit, Windsurf, AGENTS.md',
    icon: Layers,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-950/30',
  },
  {
    value: '<30s',
    label: 'Average Analysis Time',
    sublabel: 'Full repo scan to output',
    icon: Timer,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/30',
  },
  {
    value: '100%',
    label: 'Evidence-Backed',
    sublabel: 'Every rule traced to source files',
    icon: ShieldCheck,
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/30',
  },
];

export default function MetricsBarSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 bg-black text-white">
      <div ref={ref} className="w-full">

        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-white/80 mb-6">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> By The Numbers
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Enterprise-Grade Context,{' '}
            <span className="font-serif italic font-normal text-white/80">Measured & Verified.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/50 max-w-xl mx-auto">
            Every output is backed by physical repository evidence — not AI guesswork. Here&apos;s what our engine delivers.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.12, ease: 'easeOut' }}
                className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 shadow-2xl"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${metric.bgColor} border border-white/10 flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>

                {/* Big Number */}
                <div className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 ${metric.color}`}>
                  {metric.value}
                </div>

                {/* Label */}
                <div className="text-sm font-semibold text-white/90 mb-1">
                  {metric.label}
                </div>
                <div className="text-xs text-white/40 font-mono">
                  {metric.sublabel}
                </div>

                {/* Subtle glow on hover */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  style={{
                    background: `radial-gradient(ellipse at center, ${
                      metric.color.includes('cyan') ? 'rgba(34, 211, 238, 0.04)' :
                      metric.color.includes('indigo') ? 'rgba(129, 140, 248, 0.04)' :
                      metric.color.includes('emerald') ? 'rgba(52, 211, 153, 0.04)' :
                      'rgba(251, 191, 36, 0.04)'
                    } 0%, transparent 70%)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Evidence Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center gap-2 mt-10 text-xs font-mono text-white/30"
        >
          <GitBranch className="w-3.5 h-3.5" />
          All metrics derived from live repository analysis of real GitHub codebases.
        </motion.div>
      </div>
    </section>
  );
}
