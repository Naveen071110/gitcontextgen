import { Cpu, CheckCircle2, FileCode2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CompatibilityGridSection() {
  const agents = [
    {
      name: 'Claude 5 (Sonnet, Opus 5 & Fable)',
      format: 'CLAUDE.md',
      description: 'Generates structured specs with overview, commands, and code guidelines.',
      link: '/claude-md-generator',
    },
    {
      name: 'GitHub Copilot',
      format: '.github/copilot-instructions.md',
      description: 'Official custom instructions adapter for repository-wide Copilot completions.',
      link: '/copilot-instructions-generator',
    },
    {
      name: 'Cursor IDE Agent',
      format: '.cursorrules',
      description: 'Strict prompt configuration enforcing project boundaries & framework rules.',
      link: '/cursor-rules-generator',
    },
    {
      name: 'AGENTS.md Open Standard',
      format: 'AGENTS.md',
      description: 'Vendor-neutral open format for cross-agent repository readiness.',
      link: '/agents-md-generator',
    },
    {
      name: 'Replit Agent',
      format: 'replit.md',
      description: 'Configures runtime environment, build targets, and code execution instructions.',
      link: '/for/cursor',
    },
    {
      name: 'Windsurf IDE',
      format: 'windsurf.json',
      description: 'JSON context specification detailing indexing rules and prompt parameters.',
      link: '/for/claude-code',
    },
  ];

  return (
    <section id="compatibility" className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-20">
          <div className="w-full flex justify-center mb-6">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-cyan-400">
              <Cpu className="w-3.5 h-3.5" /> Universal Adapter Engine
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            One Repository Setup.{' '}
            <span className="font-serif italic font-normal text-white/80">Every AI Agent Supported.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            GitContextGen compiles one shared Repository Knowledge Model into native instruction formats for all modern AI tools.
          </p>
        </div>

        {/* Compatibility Cards Grid */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {agents.map((item, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-white/[0.02] space-y-5 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-cyan-400" /> {item.format}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded">
                    Supported
                  </span>
                </div>

                <h3 className="text-base font-bold text-white font-mono">{item.name}</h3>
                <p className="text-xs text-white/60 font-sans leading-relaxed">{item.description}</p>
              </div>

              <Link
                href={item.link}
                className="pt-4 border-t border-white/5 text-xs font-mono text-cyan-300 hover:text-white flex items-center justify-between group-hover:translate-x-0.5 transition-all"
              >
                <span>View {item.format} Specs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
