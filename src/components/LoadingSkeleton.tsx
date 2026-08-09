'use client';

import { Cpu, Layers, Sparkles, Terminal } from 'lucide-react';

export default function LoadingSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-black p-8 backdrop-blur-md shadow-2xl relative overflow-hidden my-8">
      {/* Laser Beam Glow Sweep */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>

      {/* Vertical Scanning Shimmer */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-white/5 to-transparent animate-laser-scan opacity-60"></div>

      <div className="flex flex-col items-center justify-center text-center space-y-4 py-8 relative z-10">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-lg">
            <Cpu className="w-8 h-8 text-white animate-pulse" />
          </div>
          <Sparkles className="w-5 h-5 text-cyan-400 absolute -top-2 -right-2 animate-ping" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white font-mono tracking-tight flex items-center justify-center gap-2">
            AI Engine Scanning Repository...
          </h3>
          <p className="text-xs text-white/60 font-mono">
            Parsing file hierarchy, extracting architecture boundaries, and generating CLAUDE.md context.
          </p>
        </div>

        {/* Status Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <span className="px-3 py-1 rounded-full bg-black border border-white/10 text-[11px] text-white/80 font-mono flex items-center gap-1.5 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            GitHub Tree Parsed
          </span>
          <span className="px-3 py-1 rounded-full bg-black border border-white/10 text-[11px] text-white/80 font-mono flex items-center gap-1.5 shadow-inner">
            <Layers className="w-3.5 h-3.5 text-white/60 animate-spin" />
            Synthesizing Architecture Topology
          </span>
          <span className="px-3 py-1 rounded-full bg-black border border-white/10 text-[11px] text-white/80 font-mono flex items-center gap-1.5 shadow-inner">
            <Terminal className="w-3.5 h-3.5 text-white/60" />
            Formatting Code Conventions
          </span>
        </div>
      </div>

      {/* Grid Pulse Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/10 relative z-10">
        <div className="space-y-3 p-5 rounded-xl bg-black border border-white/10">
          <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse"></div>
          <div className="h-3 bg-white/10 rounded w-5/6 animate-pulse"></div>
          <div className="h-3 bg-white/10 rounded w-4/6 animate-pulse"></div>
          <div className="h-24 bg-white/5 rounded w-full animate-pulse"></div>
        </div>

        <div className="space-y-3 p-5 rounded-xl bg-black border border-white/10">
          <div className="h-4 bg-white/10 rounded w-2/5 animate-pulse"></div>
          <div className="h-3 bg-white/10 rounded w-full animate-pulse"></div>
          <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse"></div>
          <div className="h-24 bg-white/5 rounded w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
