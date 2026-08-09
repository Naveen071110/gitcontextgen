import { Cpu, FileCode2, Terminal, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function KnowledgeModelSection() {
  const modelLayers = [
    {
      icon: <Terminal className="w-5 h-5 text-cyan-400 shrink-0" />,
      title: '1. Project Identity & Execution Commands',
      detail: 'Extracts exact package scripts (npm dev, pnpm test, make build) directly from package.json, Makefile, and CI workflows.',
      evidence: 'Evidence: package.json#scripts; .github/workflows/ci.yml',
    },
    {
      icon: <Layers className="w-5 h-5 text-indigo-400 shrink-0" />,
      title: '2. Directory & Component Architecture',
      detail: 'Maps file trees, route handlers, utility functions, and component boundaries across /src, /app, and /lib.',
      evidence: 'Evidence: src/app/api; src/components; src/lib',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />,
      title: '3. Boundary & Safety Rules',
      detail: 'Detects secrets, .env files, generated build artifacts, and protected paths so AI agents never edit prohibited files.',
      evidence: 'Evidence: .gitignore; .env.example',
    },
    {
      icon: <FileCode2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      title: '4. Multi-Agent Instruction Compilation',
      detail: 'Compiles the canonical knowledge model into AGENTS.md, CLAUDE.md, .cursorrules, Copilot instructions, and replit.md.',
      evidence: 'Evidence: GitContextGen Multi-Format Engine',
    },
  ];

  return (
    <section id="knowledge-model" className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-20">
          <div className="w-full flex justify-center mb-6">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-cyan-400">
              <Cpu className="w-3.5 h-3.5" /> Deep Repository Intelligence
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            How GitContextGen Understands{' '}
            <span className="font-serif italic font-normal text-white/80">Your Codebase.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            Instead of dumping raw code into a prompt, GitContextGen builds a structured Repository Knowledge Model backed by real file evidence.
          </p>
        </div>

        {/* Knowledge Layers Breakdown Grid */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {modelLayers.map((layer, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-white/[0.02] space-y-5 shadow-2xl relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  {layer.icon}
                </div>
                <h3 className="text-lg font-bold text-white font-mono">{layer.title}</h3>
              </div>

              <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                {layer.detail}
              </p>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-cyan-400/90">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Verified
                </span>
                <span className="text-white/40">{layer.evidence}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
