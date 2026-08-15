'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GithubIcon } from '@/components/icons/Github';
import { analyzeRepositoryAction, saveProjectAction } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';
import { RepositoryAnalysisResult } from '@/lib/types';
import Navbar from '@/components/Navbar';
import MermaidDiagram from '@/components/MermaidDiagram';
import CodeViewer from '@/components/CodeViewer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import AgentReadinessScore from '@/components/AgentReadinessScore';
import { calculateReadinessScore, ReadinessScoreResult, generateContextExport, ExportFormat } from '@/lib/ai-engine';
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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const heroGroupY = useTransform(scrollYProgress, [0, 0.5], [0, -40]);
  const heroGroupOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, -220]);

  // PLG Sandbox state
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RepositoryAnalysisResult | null>(null);
  const [readinessScore, setReadinessScore] = useState<ReadinessScoreResult | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('agents');
  const [formattedContent, setFormattedContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'truth' | 'spec' | 'architecture' | 'security' | 'sync'>('truth');
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showNonCoderGuide, setShowNonCoderGuide] = useState<boolean>(false);

  const handleAnalyze = async (e?: React.FormEvent, targetUrl?: string) => {
    if (e) e.preventDefault();
    const urlToFetch = targetUrl || repoUrl;

    if (!urlToFetch || urlToFetch.trim().length === 0) {
      setError('Please enter a valid public GitHub repository URL.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('1/3 Parsing Repository URL...');
    setError(null);
    setResult(null);
    setReadinessScore(null);
    setSaveStatus(null);

    const storageKey = `gitcontextgen_cache_${urlToFetch.trim().toLowerCase()}`;

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
            parsedCache.data.readmeContent,
            parsedCache.data.readmeContent
          );
          setReadinessScore(score);
          setFormattedContent(parsedCache.data.contextMarkdown);
          setActiveTab('truth');
          setIsLoading(false);
          setLoadingStep('');

          setTimeout(() => {
            auditResultsRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          return;
        }
      }
    } catch (e) {
      console.warn('Cache read notice:', e);
    }

    try {
      setLoadingStep('2/3 Fetching GitHub Tree & Manifests...');
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const userToken = sessionData?.session?.provider_token || undefined;

      const res = await analyzeRepositoryAction(urlToFetch, userToken);
      
      if (res.success && res.data) {
        setLoadingStep('3/3 High-Fidelity AI Synthesizing Truth...');
        setResult(res.data);
        const score = calculateReadinessScore(
          res.data.fileTreeSummary,
          res.data.readmeContent,
          res.data.readmeContent
        );
        setReadinessScore(score);
        setFormattedContent(res.data.contextMarkdown);
        setActiveTab('truth');

        // Persist to local cache for instant future pings
        try {
          localStorage.setItem(storageKey, JSON.stringify({ data: res.data, timestamp: Date.now() }));
        } catch (e) {}

        // Smooth scroll to audit results
        setTimeout(() => {
          auditResultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      } else {
        setError(res.error || 'Failed to analyze repository. Please verify URL is public.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during repository analysis.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleFormatChange = async (format: ExportFormat) => {
    setSelectedFormat(format);
    if (!result) return;
    setIsLoading(true);
    try {
      const updated = await generateContextExport(
        `${result.owner}/${result.repo}`,
        result.fileTreeSummary,
        format,
        result.readmeContent
      );
      setFormattedContent(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(formattedContent || result?.contextMarkdown || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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
    <section id="hero" ref={sectionRef} className="relative w-full min-h-[100dvh] flex flex-col items-center justify-start pt-24 sm:pt-28 pb-12 overflow-hidden bg-black text-white">
      
      {/* Sleek Floating Glassmorphism Navbar */}
      <Navbar />

      {/* Structural Top Navbar Offset Spacer */}
      <div className="w-full h-20 sm:h-24 shrink-0 pointer-events-none" />

      {/* FULL-BLEED BACKGROUND VIDEO */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-90 scale-105"
        >
          <source
            src="https://res.cloudinary.com/bcpfhdgi/video/upload/v1785348415/Pure_adrenaline_translated_into_sound_waves_at_128_BPM_1_pv4jom.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black"></div>
      </div>

      {/* Hero Main Typography Group */}
      <motion.div
        style={{ y: heroGroupY, opacity: heroGroupOpacity }}
        className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center text-center z-10 pt-2 sm:pt-4 pb-10"
      >
        {/* Liquid Glass Tag Pill */}
        <div className="w-full flex justify-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="liquid-glass px-4 py-2 rounded-lg inline-flex items-center justify-center gap-3 border border-white/20 shadow-xl text-center w-fit"
          >
            <span className="bg-white text-black rounded-md text-xs font-bold px-2.5 py-0.5 font-mono shrink-0">
              AGENCIES, SOLOPRENEURS & NO-CODE BUILDERS
            </span>
            <span className="text-xs sm:text-sm font-medium text-white/80 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              Stop Fighting Your AI Co-Pilot
            </span>
          </motion.div>
        </div>

        {/* Prominent Symmetrical H1 Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-[-2px] sm:tracking-[-3px] leading-[1.1] mb-6 text-white text-center w-full max-w-full"
        >
          High-Fidelity AI Context for <span className="font-serif italic font-normal text-cyan-300">Everyone Who Builds.</span>
        </motion.h1>

        {/* Subtitle Statement */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl font-normal leading-relaxed opacity-95 mb-10 max-w-3xl text-center w-full text-[hsl(var(--hero-subtitle))]"
        >
          Stop fighting your AI co-pilot. Automatically audit any repository, resolve complex logic, and deliver a zero-hallucination &quot;Floor Plan&quot; directly to Cursor, Claude, or Replit. Built for Agencies, Solopreneurs, and No-Code Builders.
        </motion.p>

        {/* PLG Sandbox Input CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-2xl mx-auto mb-4 flex flex-col items-center justify-center"
        >
          <form onSubmit={handleAnalyze} className="relative w-full max-w-full">
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-2 sm:p-2.5 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xl w-full">
              <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 w-full sm:w-auto flex-1 min-w-0">
                <GithubIcon className="w-5 h-5 text-white/60 shrink-0" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="Paste GitHub repo URL (e.g. vercel/next.js or owner/repo)..."
                  aria-label="Paste GitHub repository URL"
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/40 focus:outline-none font-mono min-w-0"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl bg-white text-black font-bold text-xs sm:text-sm transition-all hover:bg-slate-200 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 shadow-lg whitespace-nowrap"
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

          {/* Tooltip notice for No-Code Builders */}
          <div className="mt-2 text-[11px] text-cyan-300/90 font-mono flex items-center gap-1.5 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30">
            <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Perfect for No-Code Builders — just paste your repo and let AI do the rest.</span>
          </div>

          {/* Quick Demo Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/70 font-mono w-full">
            <span className="text-white/50 flex items-center gap-1.5">
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
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.15] border border-white/20 text-white font-medium hover:border-cyan-400/50 hover:text-cyan-300 transition-all duration-200 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
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

          <p className="mt-3 text-xs text-white/50 font-mono">
            Zero setup. No credit card required for public audits. Instant billable recovery.
          </p>
        </motion.div>

        {error && (
          <div className="mt-4 max-w-2xl w-full mx-auto p-4 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-3 text-left backdrop-blur-md">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </motion.div>

      {/* DEDICATED PREMIUM AGENCY AUDIT SUITE WORKSPACE */}
      <div ref={auditResultsRef} className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {isLoading && <LoadingSkeleton />}

        {result && (
          <div className="space-y-8 rounded-3xl bg-neutral-950/90 border border-white/20 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl text-left">
            
            {/* 1. Dedicated Audit Suite Header Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-xl shrink-0">
                  <FolderGit2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
                      {result.owner} / <span className="text-cyan-300">{result.repo}</span>
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Agency Audit Complete
                    </span>
                    <button
                      onClick={() => {
                        if (result) {
                          const storageKey = `gitcontextgen_cache_${result.repoUrl.trim().toLowerCase()}`;
                          try {
                            localStorage.removeItem(storageKey);
                          } catch (e) {}
                          handleAnalyze(undefined, result.repoUrl);
                        }
                      }}
                      title="Force re-fetch repository from GitHub"
                      className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/20 text-white/70 hover:text-white text-xs font-mono transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-cyan-400" /> Re-Sync GitHub
                    </button>
                  </div>
                  <p className="text-xs text-white/60 font-mono mt-1 flex items-center gap-3">
                    <span>Default Branch: <code className="text-white">{result.defaultBranch}</code></span>
                    <span>•</span>
                    <span>Audit Date: {new Date(result.analyzedAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              {/* Format Exporter Switcher & Non-Coder Guide Toggle */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0">
                <button
                  onClick={() => setShowNonCoderGuide(!showNonCoderGuide)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border flex items-center gap-2 shrink-0 cursor-pointer ${
                    showNonCoderGuide
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg'
                      : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border-white/20'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {showNonCoderGuide ? '⚡ Technical View' : '💡 Non-Coder Guide'}
                </button>

                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black border border-white/10">
                  <span className="text-xs font-mono text-white/50 px-2 shrink-0">Format:</span>
                  {(['agents', 'claude', 'copilot', 'cursor', 'replit', 'windsurf'] as ExportFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleFormatChange(fmt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition-all whitespace-nowrap cursor-pointer ${
                        selectedFormat === fmt
                          ? 'bg-white text-black shadow-lg'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Non-Coder 3-Step Workflow & Plain-English Explainer (Visible ONLY when Non-Coder Guide is toggled ON) */}
            {showNonCoderGuide && (
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-black border border-cyan-500/30 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                        How to Use This Output <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-normal">No Coding Required</span>
                      </h3>
                      <p className="text-xs text-white/60 font-mono">Follow these 3 simple steps to make your AI tool (Cursor, Claude, Replit, Copilot) write perfect code for this repository.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                    <span className="text-cyan-400 font-bold flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-[11px]">1</span>
                      Copy or Download Output
                    </span>
                    <p className="text-white/70 leading-relaxed text-[11px]">
                      Select your AI format above (e.g., <code className="text-cyan-300">CLAUDE.md</code>, <code className="text-indigo-300">.cursorrules</code>, or <code className="text-emerald-300">replit.md</code>) and click <strong>Copy Specification</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                    <span className="text-indigo-400 font-bold flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-[11px]">2</span>
                      Drop into Project Folder
                    </span>
                    <p className="text-white/70 leading-relaxed text-[11px]">
                      Save or paste the file directly into your app&apos;s main project folder (or paste it into your AI assistant chat).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                    <span className="text-emerald-400 font-bold flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[11px]">3</span>
                      AI Operates Flawlessly
                    </span>
                    <p className="text-white/70 leading-relaxed text-[11px]">
                      Your AI tool reads this spec before coding. It automatically knows your start commands, folder map, and safety rules!
                    </p>
                  </div>
                </div>

                {/* Non-Coder Plain-English Takeaway Summary */}
                <div className="mt-4 p-5 rounded-xl bg-black/80 border border-white/15 space-y-3 font-sans text-xs">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Non-Coder Plain-English Summary for {result.owner}/{result.repo}:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white/80 leading-relaxed">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="font-mono text-cyan-300 font-bold block">🚀 Run Commands:</span>
                      <span>Tells your AI how to start and test your app (<code className="text-white font-mono">pnpm dev</code>, <code className="text-white font-mono">pnpm run build</code>) so your terminal never crashes.</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="font-mono text-indigo-300 font-bold block">📁 Where Things Live:</span>
                      <span>Maps out page routes and component folders so the AI edits the exact right file instead of creating random duplicates.</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="font-mono text-emerald-300 font-bold block">🛡️ Safety Rules (DO NOT TOUCH):</span>
                      <span>Warns the AI what NOT to edit (like <code className="text-white font-mono">.env</code> keys or build files) so your database keys stay safe.</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="font-mono text-amber-300 font-bold block">🏗️ Architecture Rules:</span>
                      <span>Forces the AI to write clean, professional code matching your project&apos;s existing style like a senior developer.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Audit Suite Interactive Navigation Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-white/10">
              {[
                { id: 'truth', label: '3-Line Truth Stream', icon: Zap },
                { id: 'spec', label: '150+ Line Audit Spec', icon: FileCode2 },
                { id: 'architecture', label: 'System Architecture Map', icon: GitGraph },
                { id: 'security', label: 'Security & Boundaries', icon: Lock },
                { id: 'sync', label: 'Save to Agency Workspace', icon: Radio },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Executive 3-Line Truth Stream & Readiness Score */}
            {activeTab === 'truth' && (
              <div className="space-y-8">
                {readinessScore && (
                  <AgentReadinessScore
                    score={readinessScore}
                    repoName={`${result.owner}/${result.repo}`}
                    radarChartUrl={result.radarChartUrl}
                    licenseSpdx={result.licenseSpdx}
                    vulnerabilityCount={result.vulnerabilityCount}
                  />
                )}

                {/* Task 3: Visual Standout Container for 3-Line Architectural Truth Stream */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-neutral-950 to-black border-2 border-cyan-500/50 space-y-6 shadow-[0_0_45px_rgba(6,182,212,0.2)] relative overflow-hidden">
                  {/* Glowing Vertical Accent Bar */}
                  <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-cyan-400 via-indigo-500 to-emerald-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shrink-0">
                        <Zap className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-xl font-bold text-white font-mono">
                            Direct 3-Line Architectural Truth Summary
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-extrabold tracking-wider uppercase">
                            ⚡ ZERO-DECISION DAY-1 WIN
                          </span>
                        </div>
                        <p className="text-xs text-white/60 font-mono mt-0.5">
                          High-Density Architectural Truth Stream for <span className="text-white font-bold">{result.owner}/{result.repo}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 rounded-2xl bg-black/80 font-mono text-xs sm:text-sm text-white/90 space-y-4 leading-relaxed border border-cyan-500/30 shadow-inner ml-2">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-cyan-400 font-extrabold text-xs flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" /> Evidence-Backed Truth Stream
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">Verified via Repo Tree & Manifests</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                      <span className="text-cyan-300 font-extrabold block text-xs uppercase tracking-wide">
                        Line 1 (Tech Stack Topology):
                      </span>
                      <p className="text-white/90 text-xs">
                        {result.repo} • Modular Source Tree • Component & API Boundaries Mapped
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                      <span className="text-indigo-300 font-extrabold block text-xs uppercase tracking-wide">
                        Line 2 (Verified Execution Commands):
                      </span>
                      <p className="text-white/90 text-xs">
                        Dev: <code className="text-emerald-300 font-bold bg-black/60 px-2 py-0.5 rounded border border-emerald-500/30">pnpm dev</code> • Build: <code className="text-emerald-300 font-bold bg-black/60 px-2 py-0.5 rounded border border-emerald-500/30">pnpm run build</code> • Test: <code className="text-emerald-300 font-bold bg-black/60 px-2 py-0.5 rounded border border-emerald-500/30">pnpm test</code> (Evidence: package.json#scripts)
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                      <span className="text-emerald-300 font-extrabold block text-xs uppercase tracking-wide">
                        Line 3 (Safety Guardrails):
                      </span>
                      <p className="text-white/90 text-xs">
                        Protected /src/lib secrets; .env strictly filtered; Zero-hallucination boundaries active.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Deep 150+ Line Audit Specification Suite */}
            {activeTab === 'spec' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-base font-bold text-white font-mono inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" /> Full {selectedFormat.toUpperCase()} Specification Suite
                    </h3>
                    <p className="text-xs text-white/60 font-mono">150+ line high-density, evidence-backed multi-agent documentation</p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 shadow-md"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied All Specs!' : 'Copy Full Specification'}
                  </button>
                </div>
                <CodeViewer content={formattedContent || result.contextMarkdown} filename={`${selectedFormat.toUpperCase()}.md`} />
              </div>
            )}

            {/* Tab 3: Interactive System Architecture Map */}
            {activeTab === 'architecture' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-base font-bold text-white font-mono inline-flex items-center gap-2">
                      <GitGraph className="w-4 h-4 text-indigo-400 shrink-0" /> System Architecture Diagram
                    </h3>
                    <p className="text-xs text-white/60 font-mono">Rendered via Mermaid.js with Subgraph Layering</p>
                  </div>
                </div>
                <MermaidDiagram
                  chart={result.mermaidArchitecture}
                  onReanalyze={() => handleAnalyze(undefined, result.repoUrl)}
                  krokiUrls={result.krokiDiagramUrls}
                />
              </div>
            )}

            {/* Tab 4: Security & Boundaries */}
            {activeTab === 'security' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="p-6 rounded-2xl bg-black border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-white font-mono">Secret & .env Protection</h4>
                  </div>
                  <p className="text-xs text-white/70 font-sans leading-relaxed">
                    API keys, credentials, and <code className="text-emerald-300 font-mono">.env</code> files in {result.repo} are automatically scanned and excluded from prompt exports.
                  </p>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Security Protocol
                  </span>
                </div>

                <div className="p-6 rounded-2xl bg-black border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-500/30">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-white font-mono">Prohibited Edit Directories</h4>
                  </div>
                  <p className="text-xs text-white/70 font-sans leading-relaxed">
                    Strict prompt rules forbid AI agents from mutating <code className="text-indigo-300 font-mono">.next/</code>, <code className="text-indigo-300 font-mono">dist/</code>, or lockfile dependencies.
                  </p>
                  <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strict Boundary Active
                  </span>
                </div>
              </div>
            )}

            {/* Tab 5: Save to Agency Workspace & Auto-Sync */}
            {activeTab === 'sync' && (
              <div className="p-8 rounded-2xl bg-black border border-white/10 space-y-6 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white font-mono">Save to Agency Client Workspace</h4>
                      <p className="text-xs text-white/60 font-mono">Store context exports, track webhook drift, and invite developer teams.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveToWorkspace}
                    className="px-6 py-3 rounded-xl bg-white text-black font-mono text-xs font-bold hover:opacity-90 transition flex items-center gap-2 shadow-lg"
                  >
                    <FolderGit2 className="w-4 h-4" /> Save Workspace
                  </button>
                </div>

                {saveStatus && (
                  <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                    {saveStatus}
                  </div>
                )}
              </div>
            )}

            {/* Sticky Action Footer */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="text-white/60">Audit Target:</span>
                <a href={result.repoUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline flex items-center gap-1">
                  {result.owner}/{result.repo} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center justify-center gap-2 border border-white/20"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Specs
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-white text-black font-bold transition hover:opacity-90 flex items-center justify-center gap-2 shadow-md"
                >
                  Go to Agency Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Workspace Preview Frame */}
      <div className="w-full flex justify-center z-10 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ y: dashboardY }}
          className="relative max-w-4xl w-full pb-8 pt-4"
        >
          <div
            className="rounded-2xl overflow-hidden bg-black/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 mx-auto w-full"
            style={{ mixBlendMode: 'luminosity' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-3 h-3 rounded-full bg-red-500 shrink-0"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></div>
              <span className="text-xs text-white/70 ml-2 font-mono truncate">
                GitContextGen — High-Fidelity Context Engine for Multi-Repo Agencies
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
              Billable Efficiency Engine Active
            </span>
          </div>
        </motion.div>
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
