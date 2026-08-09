import { RefreshCw, GitPullRequest, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ContextDriftSection() {
  return (
    <section id="context-drift" className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white relative">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="w-full flex justify-center mb-6">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-amber-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Preventing Context Drift
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Instruction Files Become Stale.{' '}
            <span className="font-serif italic font-normal text-white/80">GitContextGen Keeps Them Current.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            Static CLAUDE.md and .cursorrules files quickly go out of date after refactors, dependency updates, or route additions.
          </p>
        </div>

        {/* Drift Detection Visualization Card */}
        <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white/[0.02] p-8 sm:p-10 text-left space-y-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-950/40 text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-mono">
                  Context Drift Detected in <span className="text-amber-300">src/app/api/route.ts</span>
                </h3>
                <p className="text-xs text-white/60 font-mono">
                  Webhook Event: Push to main branch (Commit #a8f3b2)
                </p>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <GitPullRequest className="w-3.5 h-3.5" /> Proposed PR Ready
            </span>
          </div>

          {/* Diff Box */}
          <div className="p-6 rounded-xl bg-black font-mono text-xs sm:text-sm space-y-3 leading-relaxed">
            <div className="text-white/50 text-[11px] pb-2 border-b border-white/10 flex items-center justify-between">
              <span>Proposed Update: AGENTS.md & .cursorrules</span>
              <span className="text-cyan-400">Evidence: package.json#scripts</span>
            </div>
            
            <p className="text-red-400/80 bg-red-950/30 p-2 rounded">
              - Build Command: npm run build (Deprecated)
            </p>
            <p className="text-emerald-400 bg-emerald-950/30 p-2 rounded font-bold">
              + Build Command: pnpm run build --filter=web (Updated via Push Event)
            </p>
            <p className="text-white/70 pt-2">
              ✓ Added route boundary rule: "Validate JSON body in /src/app/api/webhooks"
            </p>
          </div>

          {/* 3 Step Drift Guarantee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/5 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 1. Webhook Analysis
              </span>
              <p className="text-white/60 text-[11px]">Inspects git diffs automatically on every commit.</p>
            </div>
            <div className="space-y-1">
              <span className="text-indigo-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 2. Drift Verification
              </span>
              <p className="text-white/60 text-[11px]">Identifies outdated build commands or new route paths.</p>
            </div>
            <div className="space-y-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 3. Reviewable PR
              </span>
              <p className="text-white/60 text-[11px]">Opens a clean Pull Request for your team to merge.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
