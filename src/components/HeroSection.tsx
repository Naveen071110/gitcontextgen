'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GithubIcon } from '@/components/icons/Github';
import {
  ClaudeCodeIcon,
  CursorIcon,
  WindsurfIcon,
  WordPressStudioIcon,
  ReplitIcon,
  LovableIcon,
  BoltIcon,
} from '@/components/icons/Integrations';
import { analyzeRepositoryAction, saveProjectAction, switchExportFormatAction } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';
import { RepositoryAnalysisResult } from '@/lib/types';
import Navbar from '@/components/Navbar';
import RepoWorkspaceView from '@/components/RepoWorkspaceView';
import MermaidDiagram from '@/components/MermaidDiagram';
import CodeViewer from '@/components/CodeViewer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import AgentReadinessScore from '@/components/AgentReadinessScore';
import BrowserRedirectLoop from '@/components/BrowserRedirectLoop';
import { calculateReadinessScore, ReadinessScoreResult, ExportFormat } from '@/lib/ai-engine';
import {
  Zap,
  Cpu,
  ArrowRight,
  ShieldAlert,
  FolderGit2,
  FileCode2,
  GitGraph,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Radio,
  ExternalLink,
  RotateCcw,
  Layers,
  Lock
} from 'lucide-react';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const auditResultsRef = useRef<HTMLDivElement>(null);

  // PLG Sandbox state
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
  const [activeAbortController, setActiveAbortController] = useState<AbortController | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RepositoryAnalysisResult | null>(null);
  const [readinessScore, setReadinessScore] = useState<ReadinessScoreResult | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('agents');
  const [formattedContent, setFormattedContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'truth' | 'spec' | 'architecture' | 'security' | 'sync'>('truth');
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fmtParam = params.get('format') as ExportFormat | null;
      if (fmtParam && ['agent_readme', 'agents', 'claude', 'copilot', 'cursor', 'replit', 'windsurf'].includes(fmtParam)) {
        setSelectedFormat(fmtParam);
      }
    }
  }, []);

  const handleCancelAnalysis = () => {
    if (activeAbortController) {
      activeAbortController.abort();
      setActiveAbortController(null);
    }
    setIsLoading(false);
    setStatus('idle');
    setLoadingStep('');
  };

  const handleAnalyze = async (e?: React.FormEvent, targetUrl?: string) => {
    if (e) e.preventDefault();
    const urlToFetch = (targetUrl || repoUrl).trim();

    if (!urlToFetch || urlToFetch.length === 0) {
      setError('Please enter a valid public GitHub repository URL.');
      setStatus('error');
      return;
    }

    if (activeAbortController) {
      activeAbortController.abort();
    }

    const controller = new AbortController();
    setActiveAbortController(controller);
    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 45_000);

    setIsLoading(true);
    setStatus('running');
    setLoadingStep('1/3 Parsing Repository URL...');
    setError(null);
    setResult(null);
    setReadinessScore(null);
    setSaveStatus(null);

    const storageKey = `gitcontextgen_cache_${urlToFetch.toLowerCase()}`;

    // 0. Instant Client-Side Cache Check
    try {
      const cachedJson = localStorage.getItem(storageKey);
      if (cachedJson) {
        const parsedCache = JSON.parse(cachedJson);
        if (parsedCache && parsedCache.data) {
          setLoadingStep('1/3 Loading from Instant Cache...');
          setResult(parsedCache.data);
          const score = calculateReadinessScore(
            parsedCache.data.fileTreeSummary,
            undefined,
            parsedCache.data.readmeContent,
            parsedCache.data.vulnerabilityCount ?? 0,
            parsedCache.data.licenseSpdx
          );
          setReadinessScore(score);
          setFormattedContent(parsedCache.data.contextMarkdown);
          setActiveTab('truth');
          setStatus('complete');
          setIsLoading(false);
          setLoadingStep('');
          window.clearTimeout(timeout);

          setTimeout(() => {
            auditResultsRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          return;
        }
      }
    } catch (cacheErr) {
      console.warn('Cache read notice:', cacheErr);
    }

    try {
      setLoadingStep('2/3 Fetching GitHub Tree & Manifests...');
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const userToken = sessionData?.session?.provider_token || undefined;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch, token: userToken }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errText = `Analysis failed (${res.status})`;
        try {
          const errJson = await res.json();
          if (errJson?.error) errText = errJson.error;
        } catch {}
        throw new Error(errText);
      }

      const payload = await res.json();
      const repoResult = payload.data;

      if (payload.success && repoResult) {
        setLoadingStep('3/3 High-Fidelity AI Synthesizing Truth...');
        setResult(repoResult);
        const score = calculateReadinessScore(
          repoResult.fileTreeSummary,
          undefined,
          repoResult.readmeContent,
          repoResult.vulnerabilityCount ?? 0,
          repoResult.licenseSpdx
        );
        setReadinessScore(score);
        setFormattedContent(repoResult.contextMarkdown);
        setActiveTab('truth');
        setStatus('complete');

        try {
          localStorage.setItem(storageKey, JSON.stringify({ data: repoResult, timestamp: Date.now() }));
        } catch (e) {}

        setTimeout(() => {
          auditResultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      } else {
        throw new Error(payload.error || 'Failed to analyze repository. Please verify URL is public.');
      }
    } catch (cause: any) {
      setStatus('error');
      const isAbort =
        (cause instanceof DOMException && cause.name === 'AbortError') ||
        cause?.name === 'AbortError' ||
        cause?.message?.toLowerCase().includes('aborted') ||
        cause?.message?.toLowerCase().includes('timed out') ||
        cause?.message?.toLowerCase().includes('too long');

      const errMessage = isAbort
        ? 'GitHub took too long to respond. Please try the analysis again.'
        : cause instanceof Error
        ? cause.message
        : 'Analysis failed. Please try again.';

      setError(errMessage);
    } finally {
      window.clearTimeout(timeout);
      setIsLoading(false);
      setActiveAbortController(null);
      setLoadingStep('');
    }
  };

  const handleFormatChange = async (format: ExportFormat) => {
    setSelectedFormat(format);
    if (!result) return;
    setIsLoading(true);
    try {
      const res = await switchExportFormatAction(
        `${result.owner}/${result.repo}`,
        result.fileTreeSummary,
        format,
        result.readmeContent
      );
      if (res.success && res.content) {
        setFormattedContent(res.content);
      }
    } catch (err) {
      console.error('Format switch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formattedContent || result?.contextMarkdown || '')
        .then(() => {
          setCopiedCode(true);
          setTimeout(() => setCopiedCode(false), 2000);
        })
        .catch((err) => console.warn('Clipboard write error:', err));
    }
  };

  const handleSaveToWorkspace = async () => {
    if (!result) return;
    setSaveStatus('Saving workspace...');
    try {
      const saveRes = await saveProjectAction({
        repoUrl: result.repoUrl,
        contextMarkdown: formattedContent || result.contextMarkdown,
        mermaidArchitecture: result.mermaidArchitecture,
      });

      if (saveRes.success) {
        setSaveStatus(`Saved! Project ID: ${saveRes.projectId}`);
      } else {
        setSaveStatus(`Error: ${saveRes.error}`);
      }
    } catch (err: any) {
      setSaveStatus(`Error: ${err?.message}`);
    }
  };

  const handleQuickDemo = (url: string) => {
    setRepoUrl(url);
    handleAnalyze(undefined, url);
  };

  return (
    <section id="hero" ref={sectionRef} className="relative w-full flex flex-col items-center justify-start overflow-hidden bg-black text-white">
      
      {/* Sleek Floating Glassmorphism Navbar */}
      <Navbar />

      {/* Structural Top Navbar Offset Spacer — GUARANTEES full clearance below the fixed navbar */}
      <div className="w-full h-24 sm:h-28 md:h-32 shrink-0 pointer-events-none" />

      {/* FULL-BLEED BACKGROUND VIDEO (Subdued Ambient Atmosphere) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-20 scale-105"
        >
          <source
            src="https://res.cloudinary.com/bcpfhdgi/video/upload/v1785348415/Pure_adrenaline_translated_into_sound_waves_at_128_BPM_1_pv4jom.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/90 to-[#030303]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(24,24,27,0.6),transparent_70%)]" />
      </div>

      {/* Hero Main Typography Group */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center z-10 pt-2 pb-6">
        {/* Liquid Glass Tag Pill */}
        <div className="w-full flex justify-center mb-5">
          <div className="liquid-glass px-4 py-2 rounded-xl inline-flex items-center justify-center gap-2.5 border border-zinc-800 bg-zinc-950/80 shadow-xl text-center w-fit">
            <span className="bg-white text-black rounded-md text-[11px] font-bold px-2.5 py-0.5 font-mono shrink-0">
              AGENCIES, SOLOPRENEURS & NO-CODE BUILDERS
            </span>
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
              Stop Fighting Your AI Co-Pilot
            </span>
          </div>
        </div>

        {/* Prominent Symmetrical H1 Title */}
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15] mb-5 text-center w-full max-w-4xl mx-auto">
          Stop AI models from burning your context.{' '}
          <span className="font-serif italic font-normal text-cyan-300">
            Automatically sync Cursor rules & Claude Code configurations across your entire team.
          </span>
        </h1>

        {/* Subtitle Statement */}
        <p className="text-sm md:text-base text-zinc-400 font-normal max-w-xl mx-auto mt-4 leading-relaxed text-center w-full">
          GitContextGen acts as hallucination insurance—saving agencies up to 92% on token bills by using a persistent L2 caching layer and keeping parallel sub-agents from overwriting files via multi-agent write locks.
        </p>

        {/* PLG Sandbox Input CTA with standardized mt-10 gap */}
        <div className="w-full max-w-2xl mx-auto mt-10 mb-2 flex flex-col items-center justify-center">
          <form onSubmit={handleAnalyze} className="relative w-full max-w-full">
            <div className="bg-zinc-950/90 backdrop-blur-xl rounded-2xl p-2 sm:p-2.5 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xl w-full">
              <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 w-full sm:w-auto flex-1 min-w-0">
                <GithubIcon className="w-5 h-5 text-white/60 shrink-0" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="Paste GitHub repo URL (e.g. vercel/next.js or owner/repo)..."
                  aria-label="Paste GitHub repository URL"
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/40 focus:outline-none font-mono min-w-0 min-h-[44px]"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 min-h-[44px] rounded-xl bg-white text-black font-bold text-xs sm:text-sm transition-all hover:bg-slate-200 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 shadow-lg whitespace-nowrap cursor-pointer touch-manipulation"
                >
                  {isLoading ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin text-black shrink-0" />
                      <span className="animate-pulse">{loadingStep || 'Auditing Repository...'}</span>
                    </>
                  ) : (
                    <>
                      Start Free Audit <ArrowRight className="w-4 h-4 shrink-0" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>

          {/* Quick Demo Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400 font-mono w-full">
            <span className="text-zinc-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Try interactive demo repos:
            </span>
            {[
              { label: '⚡ Try Live Demo: Cosmic-channeling', url: 'https://github.com/Naveen071110/Cosmic-channeling', badge: 'Popular' },
              { label: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
              { label: 'supabase/supabase', url: 'https://github.com/supabase/supabase' },
            ].map((demo) => (
              <button
                key={demo.label}
                type="button"
                onClick={() => handleQuickDemo(demo.url)}
                className="px-3 py-1.5 min-h-[36px] rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 font-medium hover:border-zinc-700 hover:text-white transition-all duration-200 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer touch-manipulation"
              >
                {demo.label}
                {demo.badge && (
                  <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold">
                    {demo.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 max-w-2xl w-full mx-auto p-4 sm:p-5 rounded-2xl bg-red-950/90 border border-red-800/80 text-red-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left backdrop-blur-xl shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="font-semibold text-white">{error}</p>
                <p className="text-[11px] text-red-300/80 mt-0.5 font-mono">
                  Network timeout window reached. Upstream GitHub tree streams can be retried immediately.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => handleAnalyze(undefined, repoUrl)}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Analysis</span>
              </button>
              <button
                type="button"
                onClick={() => { setError(null); setStatus('idle'); }}
                className="px-2.5 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-mono text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Cancel control while loading */}
        {isLoading && (
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={handleCancelAnalysis}
              className="text-xs text-zinc-400 hover:text-white underline font-mono cursor-pointer transition"
            >
              Cancel analysis
            </button>
          </div>
        )}

        {/* Animated "hub ➔ contextgen" Viral Redirection Browser Container - Positioned above-the-fold */}
        {!result && (
          <div className="w-full my-8 z-10 px-2 sm:px-4">
            <BrowserRedirectLoop />
          </div>
        )}

        {/* Professional Monochrome Integration Trust Badges */}
        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col items-center gap-3.5 w-full max-w-4xl">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
            Engineered for Modern Enterprise AI Developer Ecosystems
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-zinc-400">
            <div className="flex items-center gap-2 hover:text-white transition">
              <WordPressStudioIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono">WordPress</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition">
              <ClaudeCodeIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono">Claude Code</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition">
              <CursorIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono">Cursor</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition">
              <WindsurfIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono">Windsurf</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition">
              <ReplitIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono">Replit</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition">
              <LovableIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono">Lovable</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition">
              <BoltIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono">Bolt.new</span>
            </div>
          </div>
        </div>

        {/* $299 Done-For-You (DFY) Integration Service Callout */}
        <div className="mt-6 w-full max-w-2xl px-4 py-3 rounded-xl bg-zinc-950/50 hover:bg-zinc-900/40 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-left transition shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-zinc-300 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-200 font-medium">
                Busy agency team? Skip manual configuration.
              </p>
              <p className="text-[11px] text-zinc-400 font-mono">
                Book our premium <span className="text-zinc-200 font-bold">$299 Done-For-You (DFY) Team Onboarding Pack</span>.
              </p>
            </div>
          </div>
          <Link
            href="/pricing#dfy-setup"
            className="px-3.5 py-1.5 min-h-[36px] flex items-center rounded-lg bg-zinc-100 text-black text-xs font-bold font-mono hover:bg-white transition whitespace-nowrap shrink-0 cursor-pointer touch-manipulation"
          >
            Get DFY Setup →
          </Link>
        </div>
      </div>

      {/* DEDICATED PREMIUM AGENCY AUDIT SUITE WORKSPACE */}
      <div ref={auditResultsRef} className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {isLoading && <LoadingSkeleton />}

        {result && (
          <RepoWorkspaceView
            result={result}
            isGuest={!user}
            isSaved={isSaved}
            onSave={async () => {
              if (!user) {
                window.location.href = `/auth/login?save_owner=${result.owner}&save_repo=${result.repo}&next=/dashboard`;
                return;
              }
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
              } catch (e) {
                console.warn('Save failed:', e);
              }
            }}
            onReSync={() => {
              const storageKey = `gitcontextgen_cache_${result.repoUrl.trim().toLowerCase()}`;
              try {
                localStorage.removeItem(storageKey);
              } catch (e) {}
              handleAnalyze(undefined, result.repoUrl);
            }}
          />
        )}
      </div>

      {/* Workspace Preview Frame - Stable and centered */}
      <div className="w-full flex justify-center z-10 px-4 sm:px-6 my-8">
        <div className="relative max-w-4xl w-full">
          <div className="rounded-2xl overflow-hidden bg-zinc-950/90 border border-zinc-800 shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 mx-auto w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-3 h-3 rounded-full bg-red-500/80 shrink-0"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80 shrink-0"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 shrink-0"></div>
              <span className="text-xs text-zinc-300 ml-2 font-mono truncate">
                GitContextGen — High-Fidelity Context Engine for Multi-Repo Agencies
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
              Billable Efficiency Engine Active
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div
        className="h-24 w-full pointer-events-none z-30 relative"
        style={{
          background: 'linear-gradient(to top, black, transparent)',
        }}
      />
    </section>
  );
}
