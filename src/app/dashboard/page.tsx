'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { analyzeRepositoryAction, saveProjectAction, getUserProjectsAction, deleteProjectAction } from '@/lib/actions';
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
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
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

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.provider_token) {
          setUserToken(sessionData.session.provider_token);
        }

        // Load projects from Supabase
        const res = await getUserProjectsAction();
        if (res.success && res.data) {
          setProjects(res.data as Project[]);
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
    if (!newRepoUrl) return;

    setIsCreating(true);
    setError(null);
    setLoadingStep('Analyzing repository structure...');

    try {
      const analysisRes = await analyzeRepositoryAction(newRepoUrl, userToken);
      if (!analysisRes.success || !analysisRes.data) {
        setError(analysisRes.error || 'Failed to analyze repository.');
        return;
      }

      setLoadingStep('Saving workspace to database...');
      const res = await saveProjectAction({
        repoUrl: newRepoUrl,
        contextMarkdown: analysisRes.data.contextMarkdown,
        mermaidArchitecture: analysisRes.data.mermaidArchitecture,
      });

      if (res.success && res.projectId) {
        // Navigate directly to the new project
        router.push(`/dashboard/${res.projectId}`);
      } else {
        setError(res.error || 'Failed to save project.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error creating repository workspace.');
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
        setProjects(prev => prev.filter(p => p.id !== id));
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

        {/* Loading / Error Banners */}
        {loadingStep && (
          <div className="mb-4 px-4 py-3 rounded-md bg-[#161b22] border border-[#30363d] text-sm text-[#58a6ff] font-mono flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#58a6ff] shrink-0" />
            {loadingStep}
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-md bg-[#1c1214] border border-[#f8514930] text-sm text-[#f85149]">
            {error}
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
                            {extractRepoName(project.repo_url) || project.slug}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono border border-[#30363d] bg-[#21262d] text-[#8b949e] flex items-center gap-0.5 shrink-0">
                            <Unlock className="w-2.5 h-2.5" /> Public
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
