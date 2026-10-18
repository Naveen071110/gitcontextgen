'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { analyzeRepositoryAction } from '@/lib/actions';
import { RepositoryAnalysisResult } from '@/lib/types';
import TerminalLoader from '@/components/TerminalLoader';
import RepoWorkspaceView from '@/components/RepoWorkspaceView';
import { GitHubBrandIcon } from '@/components/icons/Integrations';
import { createClient } from '@/lib/supabase/client';
import { ShieldAlert, Lock, ArrowRight, RotateCcw, Clock, AlertTriangle, Globe } from 'lucide-react';

interface RepoViewClientProps {
  owner: string;
  repo: string;
}

export default function RepoViewClient({ owner, repo }: RepoViewClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<RepositoryAnalysisResult | null>(null);
  const [previousResult, setPreviousResult] = useState<RepositoryAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
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

    try {
      const repoUrl = `https://github.com/${owner}/${repo}`;
      const res = await analyzeRepositoryAction(repoUrl);

      if (res.success && res.data) {
        const freshData: RepositoryAnalysisResult = res.data;
        setResult((current) => {
          if (current) {
            setPreviousResult(current);
          }
          return freshData;
        });
      } else {
        const errMsg = res.error || 'Failed to analyze repository.';
        setError(errMsg);
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

  // 1. Loading state with truthful TerminalLoader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center p-4">
        <TerminalLoader
          owner={owner}
          repo={repo}
          onCancel={() => {
            window.location.href = '/';
          }}
        />
      </div>
    );
  }

  // 2. Categorized Error States
  if (error || !result) {
    const errLower = (error || '').toLowerCase();
    const isPrivateOrNotFound =
      errLower.includes('private') ||
      errLower.includes('not found') ||
      errLower.includes('404') ||
      errLower.includes('401') ||
      errLower.includes('unauthorized');
    const isRateLimited =
      errLower.includes('rate limit') ||
      errLower.includes('403') ||
      errLower.includes('429');
    const isTimeout =
      errLower.includes('timeout') ||
      errLower.includes('timed out') ||
      errLower.includes('too long') ||
      errLower.includes('abort');
    const isInvalidUrl =
      errLower.includes('invalid') ||
      errLower.includes('format') ||
      errLower.includes('typo');

    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-2xl text-center space-y-6">
          {/* Error Category Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#21262d] border border-[#30363d] flex items-center justify-center mx-auto text-[#f85149]">
            {isPrivateOrNotFound ? (
              <Lock className="w-7 h-7 text-[#f85149]" />
            ) : isRateLimited ? (
              <AlertTriangle className="w-7 h-7 text-[#d29922]" />
            ) : isTimeout ? (
              <Clock className="w-7 h-7 text-[#58a6ff]" />
            ) : isInvalidUrl ? (
              <Globe className="w-7 h-7 text-[#f85149]" />
            ) : (
              <ShieldAlert className="w-7 h-7 text-[#f85149]" />
            )}
          </div>

          {/* Categorized Copy */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#f0f6fc]">
              {isPrivateOrNotFound
                ? 'Private Repository or Not Found'
                : isRateLimited
                ? 'GitHub API Rate Limit Reached'
                : isTimeout
                ? 'Analysis Timed Out (45s)'
                : isInvalidUrl
                ? 'Invalid Repository URL'
                : 'Unable to Analyze Repository'}
            </h2>
            <p className="text-xs font-mono text-[#58a6ff]">
              {owner}/{repo}
            </p>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              {isPrivateOrNotFound
                ? 'This repository may be private, require OAuth permissions, or not exist on GitHub. Sign in with GitHub to access your private repositories.'
                : isRateLimited
                ? 'Unauthenticated GitHub API rate limits reached (60 req/hr). Sign in with GitHub to increase limits to 5,000 req/hr, or wait a few minutes.'
                : isTimeout
                ? 'The repository took longer than 45 seconds to scan. This can happen with extremely large repositories or upstream GitHub latency. Please try again.'
                : isInvalidUrl
                ? 'Please check the repository name for typos. The expected format is github.com/owner/repository.'
                : error || 'An unexpected network error occurred while querying GitHub.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {isPrivateOrNotFound ? (
              <Link
                href={`/auth/login?save_owner=${owner}&save_repo=${repo}&next=/${owner}/${repo}`}
                className="w-full py-3 px-4 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
              >
                <GitHubBrandIcon className="w-4 h-4" />
                <span>Sign in with GitHub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={() => fetchRepoAnalysis(true)}
                className="w-full py-3 px-4 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Analysis</span>
              </button>
            )}

            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-[#c9d1d9] flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
            >
              Back to Public Sandbox
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render the Unified 6-Tab GitHub-Familiar Workspace
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans flex flex-col">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <RepoWorkspaceView
          result={result}
          previousResult={previousResult}
          isGuest={!user}
          isSaved={isSaved}
          onSave={handleSave}
          onReSync={() => fetchRepoAnalysis(true)}
          isReAnalyzing={isLoading}
          showBackToDashboard={!!user}
        />
      </div>
    </div>
  );
}
