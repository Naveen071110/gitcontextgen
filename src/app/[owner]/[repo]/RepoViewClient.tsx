'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { analyzeRepositoryAction } from '@/lib/actions';
import { RepositoryAnalysisResult } from '@/lib/types';
import TerminalLoader from '@/components/TerminalLoader';
import RepoDashboard from '@/components/RepoDashboard';
import { GitHubBrandIcon } from '@/components/icons/Integrations';
import { ShieldAlert, Lock, ArrowRight, RotateCcw } from 'lucide-react';

interface RepoViewClientProps {
  owner: string;
  repo: string;
}

export default function RepoViewClient({ owner, repo }: RepoViewClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<RepositoryAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPrivateOrUnauthorized, setIsPrivateOrUnauthorized] = useState(false);

  const fetchRepoAnalysis = useCallback(async (bypassCache = false) => {
    setIsLoading(true);
    setError(null);
    setIsPrivateOrUnauthorized(false);

    try {
      const repoUrl = `https://github.com/${owner}/${repo}`;
      const res = await analyzeRepositoryAction(repoUrl);

      if (res.success && res.data) {
        setResult(res.data);
      } else {
        const errMsg = res.error || 'Failed to analyze repository.';
        setError(errMsg);
        if (
          errMsg.toLowerCase().includes('private') ||
          errMsg.toLowerCase().includes('not found') ||
          errMsg.toLowerCase().includes('404') ||
          errMsg.toLowerCase().includes('401')
        ) {
          setIsPrivateOrUnauthorized(true);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during repository analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchRepoAnalysis();
  }, [fetchRepoAnalysis]);

  // 1. Loading state with TerminalLoader animation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center">
        <TerminalLoader owner={owner} repo={repo} />
      </div>
    );
  }

  // 2. Private or unauthorized repository OAuth sign-in fallback card
  if (isPrivateOrUnauthorized) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#21262d] border border-[#30363d] flex items-center justify-center mx-auto text-[#f85149]">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#f0f6fc]">
              Private Repository Detected
            </h2>
            <p className="text-xs font-mono text-[#58a6ff]">
              {owner}/{repo}
            </p>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              This repository requires read-access. Sign in with GitHub to generate context and synchronize your AI agent rules.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={`/auth/login?next=/${owner}/${repo}`}
              className="w-full py-3 px-4 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
            >
              <GitHubBrandIcon className="w-4 h-4" />
              <span>Sign in with GitHub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-[#c9d1d9] flex items-center justify-center transition"
            >
              Back to Public Sandbox
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Generic Error State
  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-[#f85149]/10 border border-[#f85149]/30 flex items-center justify-center mx-auto text-[#f85149]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#f0f6fc]">Analysis Failed</h2>
            <p className="text-xs text-[#8b949e]">{error || 'Could not fetch repository.'}</p>
          </div>
          <button
            onClick={() => fetchRepoAnalysis(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-[#f0f6fc] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Render the GitHub-Familiar Dashboard
  return <RepoDashboard result={result} onReSync={() => fetchRepoAnalysis(true)} />;
}
