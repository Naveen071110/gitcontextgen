import { Star, Quote, Sparkles } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Alex Rivera',
      role: 'Founding Engineer at ShipFast',
      repo: 'shipfast/core-template',
      quote:
        'GitContextGen solved our Claude hallucinations overnight. Generating an evidence-backed CLAUDE.md and AGENTS.md saved us from fixing broken imports every time we prompted.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Elena Rostova',
      role: 'Indie Builder & SaaS Creator',
      repo: 'rostova/analytics-kit',
      quote:
        'As a solo founder switching between Cursor and Claude Code, having a single repository connection generate .cursorrules and AGENTS.md is a massive superpower.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'David Chen',
      role: 'Staff Engineer at OpenStack',
      repo: 'chen/micro-services-boiler',
      quote:
        'The Agent Readiness Score and file-level evidence links give our team total confidence before committing AI rules to our codebase.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section id="testimonial" className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="w-full flex justify-center mb-6">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-white/80">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Developer Proof
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Loved by Builders Shipping with{' '}
            <span className="font-serif italic font-normal text-white/80">AI Agents.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            See how developers use GitContextGen to keep their repositories agent-ready.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-white/[0.02] space-y-6 flex flex-col justify-between shadow-2xl relative"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-white/80 font-sans leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                />
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">{t.name}</h4>
                  <p className="text-[11px] text-white/50 font-mono">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
