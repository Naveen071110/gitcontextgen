'use client';

import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, Cpu } from 'lucide-react';

export interface RepositoryAnalyzerProps {
  initialRepoUrl?: string;
  onSuccess?: (result: any) => void;
}

export default function RepositoryAnalyzer({
  initialRepoUrl = '',
  onSuccess,
}: RepositoryAnalyzerProps) {
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl);
  const [status, setStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30_000);
    setStatus('running');
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Analysis failed (${res.status})`);
      const data = await res.json();
      setResult(data.data || data);
      setStatus('complete');
      if (onSuccess) onSuccess(data.data || data);
    } catch (cause: any) {
      setStatus('error');
      setError(
        cause instanceof DOMException && cause.name === 'AbortError'
          ? 'GitHub took too long to respond. Please try the analysis again.'
          : cause instanceof Error
          ? cause.message
          : 'Analysis failed. Retry.'
      );
    } finally {
      window.clearTimeout(timeout);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-white font-mono text-xs">
      <div className="flex gap-2">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="owner/repo"
          disabled={status === 'running'}
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none"
        />
        <button
          onClick={handleAnalyze}
          disabled={status === 'running'}
          className="px-4 py-2 rounded-lg bg-white text-black font-bold flex items-center gap-1.5 hover:bg-zinc-200 transition disabled:opacity-50"
        >
          {status === 'running' ? (
            <>
              <Cpu className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Analyze</span>
          )}
        </button>
      </div>

      {status === 'error' && error && (
        <div className="mt-3 p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleAnalyze}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry Analysis</span>
          </button>
        </div>
      )}

      {status === 'complete' && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Analysis complete for {result?.repo || repoUrl}</span>
        </div>
      )}
    </div>
  );
}
