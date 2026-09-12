'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured application error boundary exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#f85149]/10 border border-[#f85149]/30 flex items-center justify-center mx-auto text-[#f85149]">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#f0f6fc]">
            Workspace Display Notice
          </h2>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            {error?.message || 'An unexpected error occurred while loading this view. You can reload or return to your dashboard.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload View</span>
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-[#c9d1d9] hover:text-white flex items-center justify-center gap-2 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
