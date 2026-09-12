'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { analyzeRepositoryAction } from '@/lib/actions';
import { RepositoryAnalysisResult } from '@/lib/types';
import TerminalLoader from '@/components/TerminalLoader';
import RepoWorkspaceView from '@/components/RepoWorkspaceView';
import { GitHubBrandIcon } from '@/components/icons/Integrations';
import { createClient } from '@/lib/supabase/client';
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
  const [user, setUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user);
        try {
          const res = await fetch('/api/projects');
          if (res.ok) {
            const json = await res.json();
            const exists = (json.projects || []).some(
              (p: any) => p.repo_url?.toLowerCase().includes(`${owner}/${repo}`.toLowerCase())
            );
            if (exists) setIsSaved(true);
          }
        } catch (e) {
          console.warn('Could not check saved status:', e);
        }
      }
    });
  }, [owner, repo]);

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

  const handleSave = async () => {
    if (!user) {
      window.location.href = `/auth/login?save_owner=${owner}&save_repo=${repo}&next=/${owner}/${repo}`;
      return;
    }
    if (!result) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: result.repoUrl,
          repo_name: `${result.owner}/${result.repo}`,
          status: 'completed',
          analysis_results: result.monetizableOutputs,
        }),
      });
      if (res.ok) {
        setIsSaved(true);
      }
    } catch (err) {
      console.warn('Failed to save project:', err);
    }
  };

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
              href={`/auth/login?save_owner=${owner}&save_repo=${repo}&next=/${owner}/${repo}`}
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

  // 4. Render the Unified 5-Tab GitHub-Familiar Workspace
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans flex flex-col">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <RepoWorkspaceView
          result={result}
          isGuest={!user}
          isSaved={isSaved}
          onSave={handleSave}
          onReSync={() => fetchRepoAnalysis(true)}
          showBackToDashboard={!!user}
        />
      </div>
    </div>
  );
}
