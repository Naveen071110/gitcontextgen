import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2 } from 'lucide-react';

export default function SecurityTrustSection() {
  const securityPillars = [
    {
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      title: 'In-Memory Edge Processing',
      description: 'Repository file trees and manifests are parsed strictly in-memory during edge execution. Code is never written to disk.',
    },
    {
      icon: <EyeOff className="w-5 h-5 text-cyan-400" />,
      title: 'Zero Permanent Storage',
      description: 'Your source code is never saved to a database or used to train public AI models. Only approved markdown outputs remain in your repo.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />,
      title: 'Secret & .env Filtering',
      description: 'Automatic scanning strips API keys, credentials, .env files, and protected paths before generating context instructions.',
    },
    {
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      title: 'Git-Native Review & Control',
      description: 'GitContextGen is read-only by default. Proposed context updates are submitted via Pull Requests for your team to review.',
    },
  ];

  return (
    <section id="security" className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-20">
          <div className="w-full flex justify-center mb-6">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Security & Governance
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Your Codebase Remains{' '}
            <span className="font-serif italic font-normal text-white/80">Private & Secure.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            Built from the ground up for strict privacy, read-only repository analysis, and zero lock-in.
          </p>
        </div>

        {/* Security Cards Grid */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {securityPillars.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-white/[0.02] space-y-4 shadow-2xl relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white font-mono">{item.title}</h3>
              </div>

              <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                {item.description}
              </p>

              <div className="pt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Security Protocol
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
