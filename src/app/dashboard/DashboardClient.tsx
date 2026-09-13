'use client';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import {
  createAndAnalyzeProjectAction,
  analyzeRepositoryAction,
  saveProjectAction,
  getUserProjectsAction,
  deleteProjectAction,
} from '@/lib/actions';
import { GithubIcon } from '@/components/icons/Github';
import { Project } from '@/lib/types';
import {
  Plus,
  FolderGit2,
  ArrowRight,
  ExternalLink,
  LogOut,
  Trash2,
  Loader2,
  Search,
  User as UserIcon,
  BookOpen,
  Unlock,
  Lock,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

function getStoredProjects(userId: string): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`gitcontextgen_projects_${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredProjects(userId: string, projects: Project[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`gitcontextgen_projects_${userId}`, JSON.stringify(projects));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userToken, setUserToken] = useState<string | undefined>(undefined);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          router.push('/auth/login?error=Please+sign+in+to+access+your+dashboard');
          return;
        }
        setUser(data.user);

        // Instantly load user's cached projects so they never disappear
        const localCached = getStoredProjects(data.user.id);
        if (localCached.length > 0) {
          setProjects(localCached);
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.provider_token) {
          setUserToken(sessionData.session.provider_token);
        }

        // Load projects from server and merge with local storage
        const res = await getUserProjectsAction();
        const serverProjects = (res.success && res.data ? res.data : []) as Project[];

        const map = new Map<string, Project>();
        serverProjects.forEach(p => map.set(p.id, p));
        localCached.forEach(p => {
          if (!map.has(p.id)) map.set(p.id, p);
        });

        const merged = Array.from(map.values());
        setProjects(merged);
        saveStoredProjects(data.user.id, merged);

        // Check for checkout success return
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (params.get('checkout') === 'success' || params.get('dodo_session')) {
            setSuccessToast('Pro Builder unlocked! Sandbox simulation mode active (live domain & payment gateway pending).');
            try {
              window.history.replaceState({}, '', '/dashboard');
            } catch {}
          }
        }
      } catch (e) {
        console.warn('Auth check error:', e);
        router.push('/auth/login');
      } finally {
        setIsLoadingProjects(false);
      }
    };
    init();
  }, [router]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      router.push('/auth/login');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoUrl.trim()) return;

    setIsCreating(true);
    setError(null);
    setDiagnostic(null);
    setSuccessToast(null);
    setLoadingStep('Cloning AST & parsing codebase architecture...');

    try {
      const res = await createAndAnalyzeProjectAction({
        repoUrl: newRepoUrl.trim(),
        userToken,
      });

      if (res.success && res.project) {
        const savedProject = res.project;

        // Immediate local & persistent state update so the repo is permanently saved!
        setProjects(prev => {
          const updated = [savedProject, ...prev.filter(p => p.id !== savedProject.id)];
          if (user?.id) {
            saveStoredProjects(user.id, updated);
          }
          return updated;
        });

        setSuccessToast(`Successfully analyzed and added ${savedProject.repo_name || 'repository'}!`);
        setNewRepoUrl('');

        // Smoothly transition to project detail page
        setTimeout(() => {
          router.push(`/dashboard/${savedProject.id}`);
        }, 500);
      } else {
        setError(res.error || 'Failed to analyze repository.');
        setDiagnostic(res.diagnostic || 'Please verify that the repository URL is correct and publicly accessible.');
      }
    } catch (err: any) {
      console.error('Error creating repository workspace:', err);
      setError(err?.message || 'Error creating repository workspace.');
      setDiagnostic('An unexpected network error occurred while connecting to GitHub. Please try again.');
    } finally {
      setIsCreating(false);
      setLoadingStep('');
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Remove this repository from your workspace?')) return;
    try {
      const res = await deleteProjectAction(id);
      if (res.success) {
        setProjects(prev => {
          const updated = prev.filter(p => p.id !== id);
          if (user?.id) {
            saveStoredProjects(user.id, updated);
          }
          return updated;
        });
      } else {
        setError(res.error || 'Failed to delete workspace.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.repo_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const extractRepoName = (url: string) => {
    return url.replace('https://github.com/', '').replace('.git', '');
  };

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
      <Navbar />
      <div className="w-full h-20 sm:h-24 shrink-0 pointer-events-none" />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 w-full pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#30363d]">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#8b949e]" />
            <h1 className="text-xl font-semibold text-[#f0f6fc]">
              Your Repositories
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#21262d] border border-[#30363d] text-[#8b949e]">
              {projects.length}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {user && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#21262d] border border-[#30363d] text-[#c9d1d9]">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-[#8b949e]" />
                  )}
                  <span className="font-medium max-w-[140px] truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#f85149]" /> Sign Out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search + New Repo */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 py-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a repository..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] pl-9 pr-3 py-2 placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition"
            />
          </div>

          <form onSubmit={handleCreateProject} className="flex items-center gap-2">
            <input
              type="text"
              value={newRepoUrl}
              onChange={(e) => setNewRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              disabled={isCreating}
              className="w-full sm:w-72 bg-[#0d1117] border border-[#30363d] rounded-md text-sm font-mono text-[#c9d1d9] px-3 py-2 placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isCreating || !newRepoUrl}
              className="px-4 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium flex items-center gap-1.5 shrink-0 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              New
            </button>
          </form>
        </div>

        {/* Loading / Diagnostic Error / Success Banners */}
        {loadingStep && (
          <div className="mb-5 px-4 py-3 rounded-md bg-[#161b22] border border-[#58a6ff40] text-sm text-[#58a6ff] font-mono flex items-center gap-3 shadow-md animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#58a6ff] shrink-0" />
            <span>{loadingStep}</span>
          </div>
        )}

        {successToast && (
          <div className="mb-5 p-4 rounded-md bg-[#161b22] border border-[#23863660] text-sm text-[#3fb950] flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#3fb950] shrink-0" />
              <span className="font-medium text-[#f0f6fc]">{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-[#8b949e] hover:text-[#c9d1d9] p-1 rounded transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 rounded-md bg-[#161b22] border border-[#f8514960] shadow-lg flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#f85149] mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#da363325] text-[#f85149] border border-[#da363350]">
                    Repository Error
                  </span>
                  <h4 className="text-sm font-semibold text-[#f0f6fc]">{error}</h4>
                </div>
                {diagnostic && (
                  <p className="text-xs text-[#8b949e] mt-2 leading-relaxed max-w-2xl">
                    {diagnostic}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => { setError(null); setDiagnostic(null); }}
              className="text-[#8b949e] hover:text-[#c9d1d9] p-1 rounded transition cursor-pointer shrink-0"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Repository List */}
        <div className="border border-[#30363d] rounded-lg overflow-hidden bg-[#0d1117]">
          {/* List Header */}
          <div className="px-4 py-3 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#f0f6fc]">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'repository' : 'repositories'}
            </span>
          </div>

          {/* List Body */}
          {isLoadingProjects ? (
            <div className="px-4 py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#8b949e] mx-auto mb-3" />
              <p className="text-sm text-[#8b949e]">Loading repositories...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <FolderGit2 className="w-10 h-10 text-[#30363d] mx-auto mb-3" />
              <h4 className="text-base font-semibold text-[#c9d1d9] mb-1">No repositories yet</h4>
              <p className="text-sm text-[#8b949e] max-w-md mx-auto">
                Paste a GitHub repository URL above and click <strong>New</strong> to analyze and add your first repo.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#21262d]">
              {filteredProjects.map((project) => (
                <li key={project.id} className="group">
                  <Link
                    href={`/dashboard/${project.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-[#161b22] transition"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <FolderGit2 className="w-4 h-4 text-[#8b949e] mt-1 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#58a6ff] hover:underline truncate">
                            {project.repo_name || extractRepoName(project.repo_url) || project.slug}
                          </span>
                          {project.status === 'analyzing' ? (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono border border-[#1f6feb] bg-[#388bfd1a] text-[#58a6ff] flex items-center gap-1 shrink-0">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" /> Analyzing
                            </span>
                          ) : project.status === 'failed' ? (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono border border-[#f8514940] bg-[#da36331a] text-[#f85149] flex items-center gap-1 shrink-0">
                              <AlertCircle className="w-2.5 h-2.5" /> Failed
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono border border-[#238636] bg-[#2386361a] text-[#3fb950] flex items-center gap-1 shrink-0">
                              <Check className="w-2.5 h-2.5" /> Ready
                            </span>
                          )}
                          {project.analysis_results?.framework && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono border border-[#30363d] bg-[#21262d] text-[#8b949e] shrink-0">
                              {project.analysis_results.framework}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono border border-[#30363d] bg-[#21262d] text-[#8b949e] flex items-center gap-0.5 shrink-0">
                            <Unlock className="w-2.5 h-2.5 text-[#3fb950]" /> Public
                          </span>
                        </div>
                        <p className="text-xs text-[#8b949e] mt-0.5 truncate">
                          {project.repo_url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-[#8b949e] font-mono hidden sm:block">
                        {timeAgo(project.created_at)}
                      </span>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        title="Remove repository"
                        className="p-1.5 rounded-md text-[#8b949e] hover:text-[#f85149] hover:bg-[#1c1214] transition cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-[#30363d] group-hover:text-[#8b949e] transition" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
