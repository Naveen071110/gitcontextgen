'use client';


import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RepoWorkspaceView from '@/components/RepoWorkspaceView';
import { Project, DocAsset, RepositoryAnalysisResult } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getProjectAction, getDocAssetsAction } from '@/lib/actions';
import { generateKrokiDiagramUrls } from '@/lib/integrations/kroki';
import { Loader2, Lock, ChevronLeft } from 'lucide-react';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [docAssets, setDocAssets] = useState<DocAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login?error=Please+sign+in+to+view+this+workspace');
          return;
        }

        const projRes = await getProjectAction(projectId);
        let currentProject: Project | null = null;

        if (projRes.success && projRes.data) {
          currentProject = projRes.data as Project;
          setProject(currentProject);
          setIsAuthorized(true);
        } else {
          // Client-side resilient fallback to user-scoped localStorage
          if (user?.id) {
            try {
              const raw = localStorage.getItem(`gitcontextgen_projects_${user.id}`);
              if (raw) {
                const list: Project[] = JSON.parse(raw);
                const found = list.find(p => p.id === projectId || p.slug === projectId);
                if (found) {
                  currentProject = found;
                  setProject(found);
                  setIsAuthorized(true);
                }
              }
            } catch (e) {
              console.warn('LocalStorage fallback error:', e);
            }
          }

          if (!currentProject) {
            setIsAuthorized(false);
            setIsLoading(false);
            return;
          }
        }

        const assetsRes = await getDocAssetsAction(projectId);
        if (assetsRes.success && assetsRes.data && assetsRes.data.length > 0) {
          setDocAssets(assetsRes.data as DocAsset[]);
        } else if (currentProject?.analysis_results) {
          const synthesized: DocAsset[] = [
            {
              id: `doc_ctx_${currentProject.id}`,
              project_id: currentProject.id,
              type: 'context',
              content: currentProject.analysis_results.onboarding?.claudeMd || '',
              updated_at: new Date().toISOString(),
            },
            {
              id: `doc_arch_${currentProject.id}`,
              project_id: currentProject.id,
              type: 'architecture',
              content: currentProject.analysis_results.architecture?.mermaidGraph || '',
              updated_at: new Date().toISOString(),
            },
          ];
          setDocAssets(synthesized);
        }
      } catch (err) {
        console.error('Load error:', err);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [projectId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#58a6ff] mb-4" />
        <p className="text-sm text-[#8b949e]">Loading workspace...</p>
      </div>
    );
  }

  if (isAuthorized === false || !project) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
        <Navbar />
        <div className="w-full h-20 sm:h-24 shrink-0" />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md p-8 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-2xl">
            <Lock className="w-10 h-10 text-[#f85149] mx-auto" />
            <h2 className="text-lg font-semibold text-[#f0f6fc]">Access Denied</h2>
            <p className="text-xs text-[#8b949e]">This workspace was not found or you do not have permission to view it.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-[#c9d1d9] transition">
              <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const contextDoc = docAssets.find(a => a.type === 'context')?.content || '';
  const archDoc = docAssets.find(a => a.type === 'architecture')?.content || '';
  const rawRepo = (project.repo_name || project.repo_url.replace('https://github.com/', '').replace('.git', ''));
  const repoNameParts = rawRepo.split('/');
  const owner = repoNameParts.length > 1 ? repoNameParts[0] : 'workspace';
  const repo = repoNameParts.length > 1 ? repoNameParts[1] : repoNameParts[0];

  const archChart = project.analysis_results?.architecture?.mermaidGraph || archDoc || 'graph TD\n  Client[Client Application] --> API[API Server]';
  const krokiUrls = generateKrokiDiagramUrls(archChart, repo);

  const analysisResult: RepositoryAnalysisResult = {
    repoUrl: project.repo_url,
    owner,
    repo,
    defaultBranch: 'main',
    fileTreeSummary: '',
    contextMarkdown: project.analysis_results?.onboarding?.claudeMd || contextDoc || `# ${repo}\n\nNo context generated yet.`,
    mermaidArchitecture: archChart,
    analyzedAt: project.created_at || new Date().toISOString(),
    krokiDiagramUrls: krokiUrls,
    monetizableOutputs: project.analysis_results || {
      framework: 'Next.js',
      onboarding: {
        claudeMd: contextDoc || `# ${repo}\n`,
        agentsMd: `# Agent Guidelines — ${repo}\n`,
        devCommands: ['npm run dev', 'npm run build', 'npm test'],
        stylingStandards: 'Tailwind CSS utility-first guidelines',
        componentRules: 'Strict React 19 functional components with TypeScript',
      },
      cursorRules: [
        {
          filename: '.cursor/rules/project-rules.mdc',
          content: '---\nalwaysApply: true\n---\n# Project Rules\n',
          framework: 'General',
        },
      ],
      architecture: {
        mermaidGraph: archDoc || 'graph TD\n  Client --> API',
        flowchartNodes: [
          { id: 'Client', label: 'Client Application', type: 'frontend' },
          { id: 'API', label: 'API Server', type: 'backend' },
        ],
      },
      clientHandoffReport: {
        title: `Client Progress Report — ${repo}`,
        summary: 'Executive delivery update.',
        categories: {
          newFeatures: ['Production workspace initialization complete'],
          securityMaintenance: ['Environment credentials shielded'],
          userExperience: ['Unified responsive workspace dashboard configured'],
        },
        markdown: `# Delivery Summary\n- Ready for production`,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans flex flex-col">
      <Navbar />
      <div className="w-full h-16 sm:h-20 shrink-0" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <RepoWorkspaceView
          result={analysisResult}
          isGuest={false}
          isSaved={true}
          showBackToDashboard={true}
        />
      </main>
    </div>
  );
}
