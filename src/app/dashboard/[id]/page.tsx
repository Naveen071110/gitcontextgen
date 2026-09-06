'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MermaidDiagram from '@/components/MermaidDiagram';
import CodeViewer from '@/components/CodeViewer';
import { Project, DocAsset } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getProjectAction, getDocAssetsAction } from '@/lib/actions';
import {
  FolderGit2,
  FileCode2,
  Layers,
  Key,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  Loader2,
  Unlock,
  Lock,
  GitBranch,
  Server,
} from 'lucide-react';

type TabType = 'context' | 'rules' | 'architecture' | 'webhooks';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [docAssets, setDocAssets] = useState<DocAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('context');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

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
        if (!projRes.success || !projRes.data) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        setProject(projRes.data as Project);
        setIsAuthorized(true);

        const assetsRes = await getDocAssetsAction(projectId);
        if (assetsRes.success && assetsRes.data) {
          setDocAssets(assetsRes.data as DocAsset[]);
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const contextDoc = docAssets.find(a => a.type === 'context')?.content || '';
  const archDoc = docAssets.find(a => a.type === 'architecture')?.content || '';
  const repoName = project ? project.repo_url.replace('https://github.com/', '').replace('.git', '') : '';

  const tabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: 'context', label: 'Code Context', icon: FolderGit2 },
    { id: 'rules', label: 'Synced Rules', icon: FileCode2 },
    { id: 'architecture', label: 'Dependency Graph', icon: Layers },
    { id: 'webhooks', label: 'Webhooks', icon: Server },
  ];

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
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Lock className="w-10 h-10 text-[#f85149] mx-auto" />
            <h2 className="text-lg font-semibold text-[#f0f6fc]">Access Denied</h2>
            <p className="text-sm text-[#8b949e]">This workspace was not found or you do not have permission to view it.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-sm text-[#c9d1d9] transition">
              <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
      {/* GitHub-Style Sticky Header */}
      <header className="w-full bg-[#161b22] border-b border-[#30363d] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/dashboard" className="text-[#8b949e] hover:text-[#58a6ff] transition">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <FolderGit2 className="w-5 h-5 text-[#58a6ff] shrink-0" />
            <div className="flex items-center gap-1.5 text-base font-medium">
              <span className="text-[#58a6ff]">{repoName.split('/')[0]}</span>
              <span className="text-[#8b949e]">/</span>
              <span className="text-[#58a6ff] font-semibold">{repoName.split('/')[1] || project.slug}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono border border-[#30363d] bg-[#21262d] text-[#8b949e] flex items-center gap-1">
              <Unlock className="w-3 h-3 text-[#3fb950]" /> Public
            </span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-md bg-[#21262d] border border-[#30363d] text-[#c9d1d9] font-mono flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#8b949e]" />
              main
            </div>
            <a
              href={project.repo_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#8b949e]" /> View on GitHub
            </a>
          </div>
        </div>

        {/* Tab Navigation — GitHub underline tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto no-scrollbar">
          <nav role="tablist" className="flex items-center gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#f78166] text-[#f0f6fc] font-semibold'
                    : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#f0f6fc]' : 'text-[#8b949e]'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab: Code Context */}
        {activeTab === 'context' && (
          <div className="space-y-6">
            {contextDoc ? (
              <CodeViewer content={contextDoc} filename="AGENTS.md" />
            ) : (
              <div className="px-6 py-12 rounded-lg bg-[#161b22] border border-[#30363d] text-center">
                <p className="text-sm text-[#8b949e]">No context document generated yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Synced Rules */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-[#161b22] border border-[#30363d] overflow-hidden">
              <div className="px-4 py-3 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#f0f6fc] flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-[#8b949e]" />
                  .cursor/rules/project-rules.mdc
                </span>
                <button
                  onClick={() => handleCopy(contextDoc, 'rules')}
                  className="px-3 py-1 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-[#c9d1d9] flex items-center gap-1.5 cursor-pointer transition"
                >
                  {copiedSection === 'rules' ? <Check className="w-3 h-3 text-[#3fb950]" /> : <Copy className="w-3 h-3" />}
                  {copiedSection === 'rules' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 bg-[#0d1117]">
                <pre className="text-xs font-mono text-[#c9d1d9] whitespace-pre-wrap leading-relaxed">
                  {contextDoc ? `---\nalwaysApply: true\n---\n\n${contextDoc.slice(0, 2000)}` : 'No rules generated.'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Architecture / Dependency Graph */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            {archDoc ? (
              <MermaidDiagram chart={archDoc} />
            ) : (
              <div className="px-6 py-12 rounded-lg bg-[#161b22] border border-[#30363d] text-center">
                <p className="text-sm text-[#8b949e]">No architecture diagram generated yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Webhooks */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-[#161b22] border border-[#30363d] overflow-hidden">
              <div className="px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
                <h3 className="text-sm font-semibold text-[#f0f6fc] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#8b949e]" />
                  Webhook Configuration
                </h3>
                <p className="text-xs text-[#8b949e] mt-1">
                  Configure GitHub webhooks to trigger automatic context drift synchronization on push events.
                </p>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#c9d1d9] mb-1.5 block">Payload URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : 'https://gitcontextgen.com'}/api/webhook/github`}
                      className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md text-xs font-mono text-[#c9d1d9] px-3 py-2 focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopy(`${typeof window !== 'undefined' ? window.location.origin : 'https://gitcontextgen.com'}/api/webhook/github`, 'webhook-url')}
                      className="px-3 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] cursor-pointer transition"
                    >
                      {copiedSection === 'webhook-url' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#c9d1d9] mb-1.5 block">Webhook Secret</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={project.webhook_secret || 'Not configured'}
                      className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md text-xs font-mono text-[#c9d1d9] px-3 py-2 focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopy(project.webhook_secret || '', 'webhook-secret')}
                      className="px-3 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] cursor-pointer transition"
                    >
                      {copiedSection === 'webhook-secret' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
