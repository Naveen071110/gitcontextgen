'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Zap, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { GithubIcon } from '@/components/icons/Github';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGithubSignup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'read:user repo',
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err?.message || 'GitHub signup failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Structural Top Navbar Offset Spacer */}
      <div className="w-full h-20 sm:h-24 shrink-0 pointer-events-none" />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Zap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your Account</h1>
            <p className="text-xs text-slate-400">Join Solopreneurs, No-Code Builders & Agencies using GitContextGen</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono leading-relaxed">
              {error}
            </div>
          )}

          {/* Primary 1-Click GitHub OAuth Button */}
          <button
            type="button"
            onClick={handleGithubSignup}
            disabled={isLoading}
            className="w-full py-4 bg-white hover:bg-slate-200 text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-white/10 hover:scale-[1.01] active:scale-[0.99] font-mono group"
          >
            <GithubIcon className="w-5 h-5 text-black shrink-0 group-hover:scale-110 transition-transform" />
            {isLoading ? 'Connecting GitHub Account...' : 'Sign Up with GitHub (1-Click)'}
            <ArrowRight className="w-4 h-4 text-slate-700 shrink-0" />
          </button>

          {/* Security & Trust Features */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero-Config 1-Click Account Creation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Personal 5,000 requests/hr GitHub quota unlocked</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Isolated, scoped workspace & data privacy</span>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 font-mono">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
