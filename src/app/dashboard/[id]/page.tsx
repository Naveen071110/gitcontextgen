'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MermaidDiagram from '@/components/MermaidDiagram';
import CodeViewer from '@/components/CodeViewer';
import { MockStore } from '@/lib/mockStore';
import { Project, DocAsset, Release } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  FileText,
  GitGraph,
  Zap,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  Key,
  Radio,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Columns
} from 'lucide-react';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [docAssets, setDocAssets] = useState<DocAsset[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const [activeTab, setActiveTab] = useState<'truth' | 'context' | 'architecture' | 'automation'>('truth');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isDualPane, setIsDualPane] = useState(false);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login?error=Please+sign+in+to+view+this+workspace');
          return;
        }

        const proj = MockStore.getProjectById(projectId);
        if (!proj) {
          setProject(null);
          setIsAuthorized(false);
          return;
        }

        // Strict Tenant Isolation: verify ownership
        if (proj.user_id !== user.id) {
          setIsAuthorized(false);
          return;
        }

        setIsAuthorized(true);
        setProject(proj);
        setDocAssets(MockStore.getDocAssets(proj.id));
        setReleases(MockStore.getReleases(proj.id));
      } catch (err) {
        console.error('Auth verification error:', err);
        router.push('/auth/login');
      }
    };

    checkAuthAndLoad();
  }, [projectId, router]);

  if (isAuthorized === false || !project) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied or Not Found</h2>
            <p className="text-sm text-white/60 mb-4 max-w-sm">
              The requested repository workspace does not exist or you do not have permission to view it.
            </p>
            <Link href="/dashboard" className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold">
              Return to Agency Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const contextDoc = docAssets.find(a => a.type === 'context')?.content || `# AGENTS.md - ${project.slug}\n\n# Project Instructions for AI Coding Agents\n\n## Verified Execution Commands\n- Build: pnpm run build\n- Test: pnpm test`;
  const archDoc = docAssets.find(a => a.type === 'architecture')?.content || `graph TD\n    A[Client UI] --> B[API Handler]\n    B --> C[Knowledge Model Engine]`;

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhook/github?project_id=${project.id}`
    : `/api/webhook/github?project_id=${project.id}`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const tabs = [
    { key: 'truth' as const, label: '3-Line Truth Stream', icon: Zap },
    { key: 'context' as const, label: 'AGENTS.md / Specs', icon: FileText },
    { key: 'architecture' as const, label: 'Architecture Map', icon: GitGraph },
    { key: 'automation' as const, label: 'Context Sync Webhook', icon: Radio },
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-sans antialiased">
      <Navbar />

      {/* Structural Top Navbar Offset Spacer */}
      <div className="w-full h-20 sm:h-24 shrink-0 pointer-events-none" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 sm:pt-6 pb-16 space-y-8">
        {/* Workspace Top Header */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition mb-4 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 shrink-0" /> Back to Repository Workspace Directory
          </Link>

          <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-2xl bg-[#121620] border border-white/[0.08] shadow-2xl">
            {/* Project Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0"></span>
                  <h1 className="text-2xl font-bold text-white truncate">{project.slug}</h1>
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white text-xs font-mono inline-flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1.5 truncate">
                  {project.repo_url} • Webhook Secret: <span className="text-slate-300 font-mono">{project.webhook_secret}</span>
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center overflow-x-auto no-scrollbar bg-[#0B0E14] p-1.5 rounded-xl border border-white/[0.08] gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`inline-flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-lg text-xs font-semibold font-mono transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-white text-black shadow-lg'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {tab.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => setIsDualPane(!isDualPane)}
                  aria-pressed={isDualPane}
                  className={`inline-flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-lg text-xs font-semibold font-mono transition-all whitespace-nowrap cursor-pointer border ${
                    isDualPane
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5 shrink-0" />
                  Dual-Pane View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dual-Pane Code & Architecture Workspace */}
        {isDualPane ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-bold text-white font-mono inline-flex items-center gap-2">
                  <Columns className="w-4 h-4 text-cyan-400 shrink-0" /> Dual-Pane Code & Architecture Workspace
                </h3>
                <p className="text-xs text-slate-400 font-mono">Synchronized view of codebase rules and system topology</p>
              </div>
              <button
                onClick={() => setIsDualPane(false)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                Close Split View
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" /> Context Specifications (AGENTS.md)
                  </span>
                </div>
                <CodeViewer content={contextDoc} filename="AGENTS.md" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-mono text-indigo-300 font-bold flex items-center gap-1.5">
                    <GitGraph className="w-3.5 h-3.5 text-indigo-400" /> System Architecture Topology
                  </span>
                </div>
                <MermaidDiagram chart={archDoc} />
              </div>
            </div>
          </div>
        ) : (
          <>
        {/* Tab 1: 3-Line High-Fidelity Architectural Truth */}
        {activeTab === 'truth' && (
          <div className="space-y-6">
            <div className="p-7 sm:p-8 rounded-2xl bg-[#121620] border border-cyan-500/30 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">
                      3-Line Architectural Truth Summary
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">Zero Configuration • Direct Context Fragment</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-md bg-emerald-950/60 text-emerald-300 text-xs font-mono flex items-center gap-1 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Truth Fragment
                </span>
              </div>

              <div className="p-6 rounded-xl bg-[#0B0E14] font-mono text-xs sm:text-sm text-slate-200 space-y-3 leading-relaxed border border-white/[0.06]">
                <p className="text-cyan-400 font-bold">// 3-Line Direct Output Stream for {project.slug}:</p>
                <p className="text-slate-200">
                  <span className="text-cyan-300 font-bold">Line 1 (Tech Stack):</span> Next.js App Router • TypeScript • Tailwind CSS • Supabase Client
                </p>
                <p className="text-slate-200">
                  <span className="text-indigo-300 font-bold">Line 2 (Verified Commands):</span> Build: <code className="text-emerald-300">pnpm run build</code> • Dev: <code className="text-emerald-300">pnpm dev</code> • Test: <code className="text-emerald-300">pnpm test</code>
                </p>
                <p className="text-slate-200">
                  <span className="text-emerald-300 font-bold">Line 3 (Boundary Safety):</span> Protected /src/lib/secrets; Strict API JSON validation enforced.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center justify-between gap-4">
                <span>Directly injectable into Cursor, Claude Desktop, and Replit prompts for zero-hallucination execution.</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121620] border border-white/[0.08] space-y-3">
              <h4 className="text-sm font-bold text-white font-mono">Automated Context Guarantee</h4>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Delivered automatically via context injection. No filters, no manual weight tuning, no configuration slop.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: AI Context Specifications */}
        {activeTab === 'context' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white font-mono inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" /> Multi-Agent AGENTS.md & Specification
              </h3>
              <span className="text-xs text-slate-400 font-mono whitespace-nowrap">Evidence Verified</span>
            </div>
            <CodeViewer content={contextDoc} filename="AGENTS.md" />
          </div>
        )}

        {/* Tab 3: Architecture Diagram */}
        {activeTab === 'architecture' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white font-mono inline-flex items-center gap-2">
                <GitGraph className="w-4 h-4 text-indigo-400 shrink-0" /> Repository Architecture Map
              </h3>
              <span className="text-xs text-slate-400 font-mono whitespace-nowrap">Rendered via Mermaid.js</span>
            </div>
            <MermaidDiagram chart={archDoc} />
          </div>
        )}

        {/* Tab 4: Webhook & Synchronization */}
        {activeTab === 'automation' && (
          <div className="space-y-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#121620] border border-white/[0.08] space-y-5 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-white inline-flex items-center gap-2 min-w-0">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                  <span className="whitespace-nowrap">Context Drift Webhook Sync Receiver</span>
                </h3>
                <span className="inline-flex items-center shrink-0 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono whitespace-nowrap">
                  Live Receiver
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Add this endpoint to your client GitHub Repository Settings → Webhooks under <code className="text-cyan-300 font-mono">push</code> events to automatically trigger context drift detection and Pull Request updates.
              </p>

              {/* Webhook URL Copy Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 min-w-0 bg-[#0B0E14] text-xs font-mono text-cyan-300 p-3.5 rounded-xl border border-white/[0.08] focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="px-4 py-3.5 bg-white text-black font-bold text-xs rounded-xl shadow transition shrink-0 hover:bg-slate-200 flex items-center gap-1.5 font-mono cursor-pointer"
                >
                  {copiedWebhook ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedWebhook ? 'Copied!' : 'Copy Endpoint'}
                </button>
              </div>
            </div>

            {/* Context Updates Log */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#121620] border border-white/[0.08] space-y-5 shadow-xl">
              <h3 className="text-base font-bold text-white font-mono">Context Synchronization History ({releases.length})</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {releases.map((rel) => (
                  <div key={rel.id} className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.06] space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-xs gap-3">
                      <span className="font-bold text-cyan-300 font-mono whitespace-nowrap">{rel.version_tag}</span>
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap shrink-0">
                        {new Date(rel.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{rel.commit_summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </main>

      <Footer />
    </div>
  );
}
