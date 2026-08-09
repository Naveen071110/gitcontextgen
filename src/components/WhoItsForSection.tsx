'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Building2,
  User,
  Code2,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Sparkles,
} from 'lucide-react';

const personas = [
  {
    icon: Building2,
    title: 'Agency Teams',
    subtitle: 'Managing 5+ client repositories',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/30',
    borderHover: 'hover:border-cyan-500/20',
    painPoints: [
      'Onboarding new devs onto unfamiliar client repos takes days',
      'AI agents hallucinate because they lack codebase context',
      'Maintaining separate instruction files per client is unsustainable',
    ],
    solution:
      'Generate verified context files for every client repo in seconds. New team members and AI agents instantly understand architecture, commands, and boundaries — cutting onboarding from days to minutes.',
    metric: '80% less non-billable context time',
  },
  {
    icon: User,
    title: 'Solo Developers',
    subtitle: '"Vibe coders" & indie hackers',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-950/30',
    borderHover: 'hover:border-indigo-500/20',
    painPoints: [
      'Prompting AI to build features results in broken, wrong-library code',
      'Manually writing CLAUDE.md or .cursorrules is tedious and error-prone',
      'Context files go stale every time you refactor or add dependencies',
    ],
    solution:
      'Paste your repo URL, get a production-grade specification instantly. Your AI assistant writes correct code on the first try — no more debugging hallucinated imports or deprecated APIs.',
    metric: 'First-try correct code generation',
  },
  {
    icon: Code2,
    title: 'Non-Coders & Founders',
    subtitle: 'Building with AI — no coding background',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/30',
    borderHover: 'hover:border-emerald-500/20',
    painPoints: [
      'Don\'t know what a CLAUDE.md or .cursorrules file even is',
      'AI tools break the app because there\'s no project context',
      'Can\'t debug why the AI keeps generating wrong code',
    ],
    solution:
      'You don\'t need to understand the technical details. Paste your GitHub link, select your AI tool, and download the context file. Drop it in your project — your AI immediately "gets" your codebase.',
    metric: 'Zero technical knowledge required',
  },
];

export default function WhoItsForSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white">
      <div ref={ref} className="w-full flex flex-col items-center justify-center">

        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-20">
          <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-white/80 mb-6">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" /> Built For You
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Whether You&apos;re an Agency, Solo Dev, or{' '}
            <span className="font-serif italic font-normal text-white/80">Complete Beginner.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/50 max-w-xl mx-auto">
            GitContextGen adapts to your workflow — no matter your technical background or team size.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {personas.map((persona, idx) => {
            const Icon = persona.icon;
            return (
              <motion.div
                key={persona.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.15, ease: 'easeOut' }}
                className={`group flex flex-col p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] ${persona.borderHover} hover:bg-white/[0.04] transition-all duration-300 shadow-2xl`}
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl ${persona.bgColor} border border-white/10 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${persona.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{persona.title}</h3>
                    <p className="text-xs font-mono text-white/40">{persona.subtitle}</p>
                  </div>
                </div>

                {/* Pain Points */}
                <div className="mb-6">
                  <p className="text-xs font-mono text-red-400/70 uppercase tracking-wider mb-3">Common Problems</p>
                  <ul className="space-y-2.5">
                    {persona.painPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-white/50 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400/50 mt-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-white/[0.06] mb-6" />

                {/* Solution */}
                <div className="mb-6 flex-1">
                  <p className="text-xs font-mono text-emerald-400/70 uppercase tracking-wider mb-3">How GitContextGen Helps</p>
                  <p className="text-sm text-white/60 leading-relaxed">{persona.solution}</p>
                </div>

                {/* Bottom Metric */}
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${persona.bgColor} border border-white/[0.06]`}>
                  <CheckCircle2 className={`w-4 h-4 ${persona.color} flex-shrink-0`} />
                  <span className={`text-sm font-semibold ${persona.color}`}>{persona.metric}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-14 flex flex-col items-center gap-3"
        >
          <a
            href="#hero"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all duration-200 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Try It Free — Paste Your Repo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <p className="text-xs text-white/30 font-mono">No signup required. Results in under 30 seconds.</p>
        </motion.div>
      </div>
    </section>
  );
}
