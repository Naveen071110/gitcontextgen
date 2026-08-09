'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, FileCode2, Terminal, Layers, ExternalLink, Sparkles } from 'lucide-react';
import { ReadinessScoreResult } from '@/lib/ai-engine';

interface Props {
  score: ReadinessScoreResult;
  repoName: string;
}

export default function AgentReadinessScore({ score, repoName }: Props) {
  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (val >= 75) return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
    return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
  };

  const getBarColor = (val: number) => {
    if (val >= 90) return 'from-emerald-500 to-teal-400 shadow-emerald-500/20';
    if (val >= 75) return 'from-cyan-500 to-blue-400 shadow-cyan-500/20';
    return 'from-amber-500 to-yellow-400 shadow-amber-500/20';
  };

  const getScoreBadge = (val: number) => {
    if (val >= 90) return { label: 'EXCELLENT', color: 'bg-emerald-950 text-emerald-300 border-emerald-500/40' };
    if (val >= 75) return { label: 'READY', color: 'bg-cyan-950 text-cyan-300 border-cyan-500/40' };
    return { label: 'ATTENTION', color: 'bg-amber-950 text-amber-300 border-amber-500/40' };
  };

  const metrics = [
    {
      title: 'Setup & Execution Clarity',
      icon: Terminal,
      iconColor: 'text-cyan-400',
      score: score.setupClarity.score,
      detail: score.setupClarity.detail,
      evidence: score.setupClarity.evidence,
    },
    {
      title: 'Test Command Verification',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      score: score.testClarity.score,
      detail: score.testClarity.detail,
      evidence: score.testClarity.evidence,
    },
    {
      title: 'Architecture Topology',
      icon: Layers,
      iconColor: 'text-indigo-400',
      score: score.architectureClarity.score,
      detail: score.architectureClarity.detail,
      evidence: score.architectureClarity.evidence,
    },
    {
      title: 'Boundary & Secret Safety',
      icon: ShieldCheck,
      iconColor: 'text-amber-400',
      score: score.boundarySafety.score,
      detail: score.boundarySafety.detail,
      evidence: score.boundarySafety.evidence,
    },
    {
      title: 'Multi-Agent Format Coverage',
      icon: FileCode2,
      iconColor: 'text-cyan-300',
      score: score.multiAgentCoverage.score,
      detail: score.multiAgentCoverage.detail,
      evidence: 'AGENTS.md, CLAUDE.md, Copilot, Cursor, Replit, Windsurf',
      spanTwo: true,
    },
  ];

  const overallBadge = getScoreBadge(score.overallScore);

  return (
    <div className="w-full rounded-2xl bg-neutral-950 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-lg">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-xl font-bold text-white font-mono">
                Agent Readiness Score
              </h3>
              <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${overallBadge.color}`}>
                {overallBadge.label}
              </span>
            </div>
            <p className="text-xs text-white/60 font-mono mt-1">
              Evidence-Backed Audit Spec: <span className="text-white font-bold">{repoName}</span>
            </p>
          </div>
        </div>

        {/* Overall Circular Score Ring */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${score.overallScore}, 100` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={score.overallScore >= 90 ? 'text-emerald-400' : score.overallScore >= 75 ? 'text-cyan-400' : 'text-amber-400'}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono font-extrabold text-sm sm:text-base text-white">
              {score.overallScore}%
            </span>
          </div>

          <div className="hidden sm:flex flex-col font-mono text-left">
            <span className="text-xs font-bold text-white">Overall Fitness</span>
            <span className="text-[11px] text-white/50">Verified AI Readiness</span>
          </div>
        </div>
      </div>

      {/* Breakdown Grid with Animated Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className={`p-5 rounded-2xl bg-black/70 border border-white/10 space-y-3 font-mono text-xs shadow-lg transition-all duration-200 hover:border-white/20 ${
                m.spanTwo ? 'col-span-1 md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-bold flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${m.iconColor}`} /> {m.title}
                </span>
                <span className="text-white font-extrabold text-sm">{m.score}%</span>
              </div>

              {/* Progress Bar Meter (Task 2) */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.score}%` }}
                  transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${getBarColor(m.score)}`}
                />
              </div>

              <p className="text-white/60 text-[11px] leading-relaxed font-sans pt-1">
                {m.detail}
              </p>

              <div className="pt-2 border-t border-white/5 text-[10px] text-cyan-300/80 flex items-center gap-1.5 truncate">
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">Evidence: {m.evidence}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
