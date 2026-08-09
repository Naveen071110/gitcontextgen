import { XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ProblemAgitationSection() {
  return (
    <section className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white relative">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="w-full flex justify-center mb-6">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-white/80">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> The AI Context Problem
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            AI only writes good code when it{' '}
            <span className="font-serif italic font-normal text-white/80">understands your codebase.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            When you ask Claude, Cursor, or Replit to build features without a context file, AI gets confused, invents fake files, and breaks your project.
          </p>
        </div>

        {/* 2-Column Comparison - Borderless Sophisticated Floating Cards */}
        <div className="w-full max-w-5xl mx-auto flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch justify-center w-full">
            
            {/* Left Side: Without GitContextGen */}
            <div className="p-8 sm:p-10 rounded-2xl bg-white/[0.02] space-y-8 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2.5 font-bold text-red-400 text-base font-mono">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  Building Without Context
                </div>
                <span className="text-[10px] font-mono uppercase bg-red-950/40 text-red-300 px-3 py-1 rounded-md shrink-0">
                  AI Hallucinations
                </span>
              </div>

              <ul className="space-y-5 text-xs sm:text-sm text-white/70 font-mono leading-relaxed">
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>AI doesn't know your file structure and creates duplicate or broken files.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>AI uses outdated or wrong library versions that fail on build.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>You spend hours debugging error messages instead of shipping features.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>Frustrating for builders with zero or limited coding experience.</span>
                </li>
              </ul>

              <div className="p-5 rounded-xl bg-black/60 font-mono text-xs text-red-300/80 space-y-1.5">
                <p className="text-red-400 font-bold">// AI Prompt Result Without Context:</p>
                <p className="text-white/50">"Error: Cannot find module '@/lib/db' or file conventions."</p>
              </div>
            </div>

            {/* Right Side: With GitContextGen */}
            <div className="p-8 sm:p-10 rounded-2xl bg-white/[0.03] space-y-8 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2.5 font-bold text-emerald-400 text-base font-mono">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  With GitContextGen
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-950/40 text-emerald-300 px-3 py-1 rounded-md shrink-0">
                  100% Working Code
                </span>
              </div>

              <ul className="space-y-5 text-xs sm:text-sm text-white/80 font-mono leading-relaxed">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Generates exact <code className="text-emerald-300">CLAUDE.md</code>, <code className="text-emerald-300">.cursorrules</code>, or <code className="text-emerald-300">replit.md</code> files.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>AI immediately understands your directory layout, routes, and tech stack.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Enforces strict project rules so AI writes clean code on the very first try.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>100% beginner friendly — zero setup, zero technical complexity.</span>
                </li>
              </ul>

              <div className="p-5 rounded-xl bg-black/60 font-mono text-xs text-emerald-300/90 space-y-1.5">
                <p className="text-emerald-400 font-bold">// GitContextGen Generated Context:</p>
                <p className="text-white/70">✓ Full Tree Indexed • Rules Active • 0 Hallucinations</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
