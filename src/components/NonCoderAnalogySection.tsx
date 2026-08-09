'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Compass, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function NonCoderAnalogySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="non-coder-guide" className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 bg-black text-white">
      <div ref={ref} className="w-full flex flex-col items-center justify-center">

        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-cyan-400 mb-6">
            <Compass className="w-3.5 h-3.5" /> Plain-English Concept
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Build Like a Senior Dev,{' '}
            <span className="font-serif italic font-normal text-cyan-300">Even If You Don&apos;t Code.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            You don&apos;t need to write code to build software with AI. GitContextGen gives AI tools like Cursor, Replit, or Claude Code the exact map they need to build new features without breaking your existing app.
          </p>
        </div>

        {/* 2-Card Metaphor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          
          {/* Card 1: Building Without a Floor Plan */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-8 rounded-2xl bg-white/[0.02] border border-red-500/20 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-mono">Building Without a Floor Plan</h3>
                <p className="text-xs text-red-400/80 font-mono">What happens when you ask AI to code directly</p>
              </div>
            </div>

            <p className="text-sm text-white/70 leading-relaxed">
              If you hire a brilliant carpenter but don&apos;t show them where your electrical wires or plumbing live, they will accidentally break walls or drill into pipes.
            </p>

            <div className="space-y-3 font-mono text-xs pt-2">
              <div className="p-3 rounded-xl bg-black/60 border border-red-500/20 text-red-300 flex items-start gap-2">
                <span className="text-red-400 font-bold shrink-0">❌</span>
                <span>Asks technical questions you don&apos;t know how to answer.</span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-red-500/20 text-red-300 flex items-start gap-2">
                <span className="text-red-400 font-bold shrink-0">❌</span>
                <span>Creates duplicate files in wrong folders and breaks existing pages.</span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-red-500/20 text-red-300 flex items-start gap-2">
                <span className="text-red-400 font-bold shrink-0">❌</span>
                <span>Tries to run computer commands that crash your screen.</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Building With GitContextGen Floor Plan */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 rounded-2xl bg-white/[0.04] border border-cyan-500/30 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-mono">With GitContextGen &quot;Floor Plan&quot;</h3>
                <p className="text-xs text-cyan-300/80 font-mono">When your AI receives your app blueprint</p>
              </div>
            </div>

            <p className="text-sm text-white/70 leading-relaxed">
              GitContextGen scans your project link in 10 seconds and creates a clear 1-file blueprint. You drop it into your AI tool, and your AI instantly understands your whole project.
            </p>

            <div className="space-y-3 font-mono text-xs pt-2">
              <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/30 text-emerald-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>AI knows exactly which files to edit without asking you technical jargon.</span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/30 text-emerald-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>AI follows strict &quot;DO NOT TOUCH&quot; safety zones for your database keys.</span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/30 text-emerald-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Builds what you asked for correctly on the first try.</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
