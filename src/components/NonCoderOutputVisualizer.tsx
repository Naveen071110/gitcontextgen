'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FileCode2, CheckCircle2, Shield, PlayCircle, FolderTree, Sparkles } from 'lucide-react';

const calloutItems = [
  {
    id: 'run',
    badge: '🚀 Start Commands',
    title: 'Tells AI How to Run Your App',
    icon: PlayCircle,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/40',
    border: 'border-cyan-500/30',
    codeSnippet: `## Run & Operate\n- npm run dev — starts your local server on port 3000\n- npm run build — checks for errors before saving`,
    plainExplanation: 'Without this, AI tools guess how to start your app and run broken commands that freeze your computer screen. This section forces the AI to use the exact right command.',
  },
  {
    id: 'map',
    badge: '📁 Folder Map',
    title: 'Tells AI Where Files Live',
    icon: FolderTree,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-950/40',
    border: 'border-indigo-500/30',
    codeSnippet: `## Where things live\n- /client/src/pages: Page views & screens\n- /client/src/components: Buttons & forms`,
    plainExplanation: 'When you ask for a new button or layout change, this map tells the AI exactly which file to edit so it never creates random duplicate files across your project.',
  },
  {
    id: 'safety',
    badge: '🛡️ Safe Zones',
    title: 'Warns AI What NOT to Touch',
    icon: Shield,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/40',
    border: 'border-emerald-500/30',
    codeSnippet: `## Gotchas & Safety Rules\n- NEVER edit .env database keys or passwords\n- NEVER touch generated build files`,
    plainExplanation: 'Your database passwords and payment credentials live here. This rule sets a strict boundary so the AI never accidentally erases or breaks your app secrets.',
  },
];

export default function NonCoderOutputVisualizer() {
  const [activeItem, setActiveItem] = useState('run');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const current = calloutItems.find((i) => i.id === activeItem) || calloutItems[0];

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 bg-black text-white">
      <div ref={ref} className="w-full flex flex-col items-center justify-center">

        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-emerald-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> What the Output Means
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Inside the AI File:{' '}
            <span className="font-serif italic font-normal text-white/80">Explained in Plain English.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto">
            You don&apos;t need to read or edit the file yourself. Click each section below to see what it tells your AI tool.
          </p>
        </div>

        {/* Interactive Visual Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl items-stretch">
          
          {/* Left Column: Selector Buttons */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {calloutItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={`p-5 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? `${item.bgColor} ${item.border} shadow-2xl`
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-black/60 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{item.badge}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-white/50 line-clamp-2">{item.plainExplanation}</p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Code Snippet + Plain English Callout Card */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 shadow-2xl space-y-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-2">
                  <FileCode2 className="w-4 h-4" /> Generated Output Segment
                </span>
                <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-md ${current.bgColor} ${current.color} font-bold`}>
                  {current.badge}
                </span>
              </div>

              {/* Code Snippet */}
              <pre className="p-4 rounded-xl bg-black font-mono text-xs text-white/80 overflow-x-auto leading-relaxed border border-white/10 mb-6">
                {current.codeSnippet}
              </pre>

              {/* Plain English Translation Card */}
              <div className={`p-5 rounded-xl ${current.bgColor} border ${current.border} space-y-2`}>
                <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${current.color}`} /> Plain-English Takeaway:
                </span>
                <p className="text-xs text-white/80 leading-relaxed font-sans">
                  {current.plainExplanation}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
