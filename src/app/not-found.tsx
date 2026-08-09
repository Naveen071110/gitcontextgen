import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, ArrowRight, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />

      {/* Structural Top Offset */}
      <div className="w-full h-24 sm:h-28 shrink-0 pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shadow-2xl">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
            404 Page Not Found
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white pt-2 font-mono">
            Lost in Code Context?
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-mono leading-relaxed pt-2">
            The route or context specification page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 w-full justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-black font-mono font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Zap className="w-4 h-4 text-black fill-black" /> Return to Free Sandbox
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 text-white font-mono font-bold text-xs border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            My Workspace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
