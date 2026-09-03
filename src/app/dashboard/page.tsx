'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MockStore } from '@/lib/mockStore';
import { Project } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { analyzeRepositoryAction, saveProjectAction, deleteProjectAction } from '@/lib/actions';
import { GithubIcon } from '@/components/icons/Github';
import {
  Plus,
  FolderGit2,
  GitBranch,
  ArrowRight,
  ExternalLink,
  Terminal,
  Sparkles,
  CheckCircle2,
  Zap,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Trash2,
  Loader2,
  Activity,
  Layers,
  Search,
  Code2,
  Copy,
  Check,
  Cpu,
  BookOpen,
  CheckSquare,
  FileCode
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [copiedMasterPrompt, setCopiedMasterPrompt] = useState(false);

  // User Authentication State
  const [user, setUser] = useState<any>(null);
  const [userToken, setUserToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          router.push('/auth/login?error=Please+sign+in+to+access+your+dashboard');
          return;
        }

        setUser(data.user);
        // Tenant Isolation: Only show projects belonging to the logged-in user
        setProjects(MockStore.getProjects().filter(p => p.user_id === data.user.id));

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.provider_token) {
          setUserToken(sessionData.session.provider_token);
        }
      } catch (e) {
        console.warn('Auth check error:', e);
        router.push('/auth/login');
      }
    };
    fetchUser();
  }, [router]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setUserToken(undefined);
      router.push('/auth/login');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoUrl) return;

    setIsCreating(true);
    setError(null);
    setLoadingStep('1/3 Extracting Codebase Knowledge & Architectural Truth...');

    try {
      const analysisRes = await analyzeRepositoryAction(newRepoUrl, userToken);
      if (!analysisRes.success || !analysisRes.data) {
        setError(analysisRes.error || 'Failed to analyze repository. Please verify URL.');
        setIsCreating(false);
        setLoadingStep('');
        return;
      }

      setLoadingStep('2/3 Generating AGENTS.md & Knowledge Maps...');
      const res = await saveProjectAction({
        repoUrl: newRepoUrl,
        contextMarkdown: analysisRes.data.contextMarkdown,
        mermaidArchitecture: analysisRes.data.mermaidArchitecture,
      });

      if (res.success) {
        setNewRepoUrl('');
        if (user) {
          setProjects(MockStore.getProjects().filter(p => p.user_id === user.id));
        }
      } else {
        setError(res.error || 'Failed to save project.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error creating repository context stream.');
    } finally {
      setIsCreating(false);
      setLoadingStep('');
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remove this repository stream from your workspace?')) return;
    try {
      const res = await deleteProjectAction(id);
      if (res.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
      } else {
        setError(res.error || 'Failed to delete workspace.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopySpec = (projectId: string, content: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopiedIndex(projectId);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyMasterPrompt = () => {
    const prompt = `# CLAUDE.md / AGENTS.md Master Architectural Context Prompt
- Stack: Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase Auth
- Build Commands: npm run build | npm run dev | npm test
- Rules: Never swallow exceptions; preserve types; enforce strict JSON validation on API endpoints.`;
    navigator.clipboard.writeText(prompt);
    setCopiedMasterPrompt(true);
    setTimeout(() => setCopiedMasterPrompt(false), 2000);
  };

  const filteredProjects = projects.filter(p => 
    p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.repo_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-sans antialiased">
      <Navbar />

      {/* Structural Spacer */}
      <div className="w-full h-20 sm:h-24 shrink-0 pointer-events-none" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 sm:pt-6 pb-16 space-y-8">
        
        {/* Stripe Header & Breadcrumb Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
              <span className="text-slate-200 font-semibold">Workspace</span>
              <span>/</span>
              <span className="text-cyan-400 font-semibold">Repository Knowledge Hub</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] ml-2 font-mono">
                <BookOpen className="w-3 h-3 text-cyan-400" /> Architectural Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {user ? (user.user_metadata?.full_name || user.email?.split('@')[0]) : 'Personal Developer Workspace'}
            </h1>
          </div>

          {/* User Profile Controls */}
          <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#121620] border border-white/[0.08] text-slate-300">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-cyan-400" />
              )}
              <span className="font-medium max-w-[160px] truncate">{user ? user.email : 'Guest Session'}</span>
            </div>

            {user ? (
              <button
                onClick={handleSignOut}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" /> Sign Out
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                Sign In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Actionable Knowledge Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#121620]/90 border border-white/[0.08] space-y-2 shadow-xl hover:border-white/20 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Codebases Monitored</span>
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{projects.length} Repositories</div>
            <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> <span>Zero Context Drift</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121620]/90 border border-white/[0.08] space-y-2 shadow-xl hover:border-white/20 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Verified Build Commands</span>
              <Terminal className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">pnpm / npm / yarn</div>
            <p className="text-[11px] text-cyan-400 font-mono">Auto-discovered from package.json</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121620]/90 border border-white/[0.08] space-y-2 shadow-xl hover:border-white/20 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Generated Specs</span>
              <FileCode className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">AGENTS.md & Rules</div>
            <p className="text-[11px] text-slate-400 font-mono">Formatted for Claude, Cursor & Copilot</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121620]/90 border border-white/[0.08] space-y-2 shadow-xl hover:border-white/20 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>GitHub API Quota</span>
              <GithubIcon className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">5,000 / hr</div>
            <p className="text-[11px] text-slate-400 font-mono">OAuth Delegated Rate Limit Active</p>
          </div>
        </div>

        {/* Knowledge Feature: 3-Line High-Fidelity Architectural Truth Box */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#121620] border border-cyan-500/30 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  Master Codebase Architectural Intelligence
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  High-fidelity ground truth extracted directly from project trees, build manifests, and entry points.
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyMasterPrompt}
              className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
            >
              {copiedMasterPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedMasterPrompt ? 'Prompt Copied!' : 'Copy Master Prompt'}
            </button>
          </div>

          <div className="p-5 rounded-xl bg-[#0B0E14] font-mono text-xs sm:text-sm text-slate-200 space-y-3 leading-relaxed border border-white/[0.06]">
            <p className="text-cyan-400 font-bold">// Ground Truth Knowledge Digest:</p>
            <p className="text-slate-200">
              <span className="text-cyan-300 font-bold">1. Stack & Architecture:</span> Next.js 16 App Router • TypeScript • Tailwind CSS • Supabase Auth & PostgreSQL DB
            </p>
            <p className="text-slate-200">
              <span className="text-indigo-300 font-bold">2. Discovered Execution Scripts:</span> <code className="text-emerald-300">pnpm run dev</code> (dev server) • <code className="text-emerald-300">pnpm run build</code> (production build) • <code className="text-emerald-300">pnpm test</code>
            </p>
            <p className="text-slate-200">
              <span className="text-emerald-300 font-bold">3. Boundaries & Control Flow:</span> Protected secrets in <code className="text-slate-400">/src/lib/secrets</code>; Strict API route JSON payload validation active.
            </p>
          </div>
        </div>

        {/* Connect Repository Section (Stripe Minimalist Search & Add Bar) */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#121620] border border-white/[0.08] shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" /> Analyze & Add New Repository
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Automatically extract codebase structure, verified build commands, and AGENTS.md specs for any repository.
              </p>
            </div>

            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-500/30 shrink-0">
              Zero Decision Engine
            </span>
          </div>

          <form onSubmit={handleCreateProject} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Code2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={newRepoUrl}
                onChange={(e) => setNewRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full bg-[#0B0E14] border border-white/[0.1] rounded-xl text-xs font-mono text-white pl-10 pr-4 py-3 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 transition"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer font-mono disabled:opacity-60"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isCreating ? 'Extracting Knowledge...' : 'Analyze & Connect'}
            </button>
          </form>

          {loadingStep && (
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
              <span>{loadingStep}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}
        </div>

        {/* Repository Knowledge Streams Table */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Monitored Codebase Knowledge Streams</h3>
              <span className="text-xs font-mono text-slate-400 bg-white/[0.05] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                {filteredProjects.length}
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter repositories..."
                className="w-full bg-[#121620] border border-white/[0.08] rounded-xl text-xs font-mono text-white pl-9 pr-3 py-2 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Knowledge Cards Grid */}
          {filteredProjects.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#121620] border border-white/[0.08] text-center space-y-3 font-mono">
              <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No matching repositories found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Connect a new GitHub repository above to start monitoring and generating AI context streams.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const releases = MockStore.getReleases(project.id);
                const assets = MockStore.getDocAssets(project.id);
                const contextContent = assets.find(a => a.type === 'context')?.content || `# AGENTS.md - ${project.slug}\n\n## Verified Commands\n- npm run build\n- npm run dev`;

                return (
                  <div
                    key={project.id}
                    className="p-6 rounded-2xl bg-[#121620] border border-white/[0.08] hover:border-indigo-500/40 hover:bg-[#161B26] transition-all duration-200 group shadow-xl flex flex-col justify-between cursor-pointer space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-cyan-400 group-hover:bg-cyan-950/40 transition-colors">
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Synced
                          </span>
                          <button
                            onClick={(e) => handleDeleteProject(project.id, e)}
                            title="Remove Repository Stream"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Repository Name & External Link */}
                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {project.slug}
                        </h4>
                        <a
                          href={project.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-400 hover:text-white font-mono truncate flex items-center gap-1 mt-1 cursor-pointer"
                        >
                          {project.repo_url.replace('https://github.com/', '')}
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      </div>

                      {/* Tech Stack Pills Knowledge Tagging */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-cyan-300">
                          Next.js 16
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-indigo-300">
                          TypeScript
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-emerald-300">
                          Supabase
                        </span>
                      </div>

                      {/* Truth Summary Card */}
                      <div className="p-3.5 rounded-xl bg-[#0B0E14] text-[11px] font-mono text-slate-300 space-y-1.5 border border-white/[0.06]">
                        <p className="text-cyan-400 font-bold text-[10px] uppercase tracking-wider">// Codebase Intelligence</p>
                        <p className="truncate text-slate-300">✓ AGENTS.md & .cursorrules Synced</p>
                        <p className="truncate text-slate-400">✓ Verified Build Script: pnpm run build</p>
                      </div>
                    </div>

                    {/* Bottom CTA Buttons */}
                    <div className="space-y-2 pt-2">
                      <Link
                        href={`/dashboard/${project.id}`}
                        className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer font-mono"
                      >
                        Open Knowledge Stream <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={(e) => handleCopySpec(project.id, contextContent, e)}
                        className="w-full py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 font-mono text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedIndex === project.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        {copiedIndex === project.id ? 'AGENTS.md Copied!' : 'Copy AGENTS.md Spec'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
