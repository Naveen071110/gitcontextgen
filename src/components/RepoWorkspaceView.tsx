'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { RepositoryAnalysisResult } from '@/lib/types';
import MermaidDiagram from '@/components/MermaidDiagram';
import ErrorBoundary from '@/components/ErrorBoundary';
import CodeViewer from '@/components/CodeViewer';
import McpExplorerSandbox, { McpUpgradePlaceholder } from '@/components/McpExplorerSandbox';
import { GithubIcon } from '@/components/icons/Github';
import { downloadExcelWorkbook } from '@/lib/export/excelExporter';
import { downloadFileInventoryCsv, downloadClientHandoffCsv } from '@/lib/export/csvExporter';
import {
  FolderGit2,
  GitBranch,
  ExternalLink,
  RotateCcw,
  Copy,
  Check,
  Code2,
  FileCode2,
  Server,
  Layers,
  Briefcase,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Terminal,
  Box,
  Search,
  Lock,
  Unlock,
  Radio,
  FileText,
  Download,
  Package,
  Share2,
  TerminalSquare,
  FileSpreadsheet,
  ChevronDown,
  X
} from 'lucide-react';

export interface RepoWorkspaceViewProps {
  result: RepositoryAnalysisResult;
  isGuest?: boolean;
  onSave?: () => Promise<void> | void;
  isSaved?: boolean;
  onReSync?: () => void;
  showBackToDashboard?: boolean;
  className?: string;
}

export type WorkspaceTabType = 'context' | 'rules' | 'mcp' | 'graph' | 'handoff';

export default function RepoWorkspaceView({
  result,
  isGuest = false,
  onSave,
  isSaved = false,
  onReSync,
  showBackToDashboard = false,
  className = '',
}: RepoWorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTabType>('context');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [onboardingType, setOnboardingType] = useState<'claude' | 'agents'>('claude');
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number>(0);
  const [fileSearch, setFileSearch] = useState<string>('');
  const [activeAiTool, setActiveAiTool] = useState<'claude' | 'cursor' | 'copilot' | 'windsurf'>('claude');
  const [copiedFolder, setCopiedFolder] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };

    if (isExportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportOpen]);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setExportToast({ message, type });
    setTimeout(() => {
      setExportToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const handleExportExcel = () => {
    try {
      const filename = downloadExcelWorkbook(result);
      setIsExportOpen(false);
      triggerToast(`✅ Exported ${filename} successfully!`);
    } catch (err) {
      console.error('Failed to export Excel workbook:', err);
      triggerToast(`Failed to export Excel workbook: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const handleExportFileInventory = () => {
    try {
      const filename = downloadFileInventoryCsv(result);
      setIsExportOpen(false);
      triggerToast(`✅ Exported ${filename} successfully!`);
    } catch (err) {
      console.error('Failed to export file inventory CSV:', err);
      triggerToast(`Failed to export file inventory: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const handleExportClientHandoff = () => {
    try {
      const filename = downloadClientHandoffCsv(result);
      setIsExportOpen(false);
      triggerToast(`✅ Exported ${filename} successfully!`);
    } catch (err) {
      console.error('Failed to export client handoff CSV:', err);
      triggerToast(`Failed to export client handoff: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const handleCopyRawJson = () => {
    try {
      const jsonStr = JSON.stringify(result, null, 2);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(jsonStr).then(() => {
          setIsExportOpen(false);
          triggerToast('📋 Copied raw analysis JSON payload to clipboard!');
        }).catch(err => {
          console.error('Clipboard copy error:', err);
          triggerToast('Failed to copy JSON to clipboard', 'error');
        });
      } else {
        setIsExportOpen(false);
        triggerToast('Clipboard API not available in this browser', 'error');
      }
    } catch (err) {
      console.error('Failed to serialize analysis JSON:', err);
      triggerToast('Failed to serialize analysis JSON', 'error');
    }
  };

  // Local Authorization Hook:
  // For development, this is hardcoded to true so everything is visible.
  // Later, this will map to: user?.plan === 'pro' || user?.plan === 'agency'
  const hasMcpAccess = true;

  const handleCopy = (text: string, sectionId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedSection(sectionId);
        setTimeout(() => setCopiedSection(null), 2000);
      }).catch(err => console.warn('Copy error:', err));
    }
  };

  const handleDownloadCursorRule = (filename: string, ruleContent: string) => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([ruleContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.split('/').pop() || 'project-rules.mdc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCopiedSection('cursor-download');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const outputs = result.monetizableOutputs;

  const handleCopyFolderContext = (folderPath: string, filesList: string[]) => {
    const cleanFolder = folderPath.replace(/^\[(DIR|FILE)\]\s*/, '').trim();
    const folderFiles = filesList.filter(f => f.includes(cleanFolder));
    
    const contextPackage = `### 📂 Subdirectory Context Package: \`${cleanFolder}\`
- **Repository**: ${result.owner}/${result.repo}
- **Framework**: ${outputs?.framework || 'Standard'}
- **Subsystem Path**: \`${cleanFolder}\`
- **Indexed Subsystem Files (${folderFiles.length})**:
${folderFiles.slice(0, 25).map(f => `- ${f.replace(/^\[(DIR|FILE)\]\s*/, '')}`).join('\n')}

#### Integration Invariants
1. Adhere to root repository architecture standards defined in [CLAUDE.md](CLAUDE.md).
2. When creating new components or routes in this folder, maintain strict TypeScript types.
3. Validate parameters and sanitize user inputs before invoking parent services.
`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(contextPackage).then(() => {
        setCopiedFolder(cleanFolder);
        setTimeout(() => setCopiedFolder(null), 2000);
      }).catch(err => console.warn('Folder copy error:', err));
    }
  };

  // Onboarding Files
  const claudeMd = outputs?.onboarding?.claudeMd || result.contextMarkdown || `# CLAUDE.md — ${result.repo}\n\nNo context generated.`;
  const agentsMd = outputs?.onboarding?.agentsMd || `# AGENTS.md — ${result.repo}\n\nMulti-Agent Orchestration Specification\n\n- Repository: ${result.owner}/${result.repo}\n- Branch: ${result.defaultBranch}\n`;
  const devCommands = outputs?.onboarding?.devCommands || ['npm run dev', 'npm run build', 'npm test', 'npx tsc --noEmit'];

  // Cursor Rules (.mdc)
  const cursorRules = outputs?.cursorRules && outputs.cursorRules.length > 0
    ? outputs.cursorRules
    : [
        {
          filename: '.cursor/rules/project-rules.mdc',
          content: `---\ndescription: ${result.repo} Architecture & Rule Invariants\nglobs: *\nalwaysApply: true\n---\n\n# Project Rules\nEnforce clean TypeScript types and verify route parameters.\n`,
          framework: outputs?.framework || 'General',
        },
      ];
  const activeCursorRule = cursorRules[selectedRuleIndex] || cursorRules[0];

  // Architecture AST
  const mermaidGraph = outputs?.architecture?.mermaidGraph || result.mermaidArchitecture;
  const flowchartNodes = outputs?.architecture?.flowchartNodes || [];

  // Client Progress Report
  const rawCategories = (outputs?.clientHandoffReport?.categories as any) || {};
  const clientReport = {
    summary: outputs?.clientHandoffReport?.summary || `Technical updates, code structure optimizations, and API integrations for ${result.repo}.`,
    categories: {
      newFeatures: (rawCategories.newFeatures || ['Initialized verified codebase map and AST intelligence engine.', 'Configured multi-agent prompt isolation for parallel development.']) as string[],
      securityMaintenance: (rawCategories.securityMaintenance || ['Audited dependency vulnerabilities and confirmed package boundaries.', 'Redacted API secrets and locked down environment configurations.']) as string[],
      uxImprovements: (rawCategories.userExperience || rawCategories.uxImprovements || ['Streamlined client-side component architectures for optimal bundle delivery.']) as string[],
    },
  };

  // MCP JSON Presets
  const mcpClaudeJson = JSON.stringify(
    {
      mcpServers: {
        gitcontextgen: {
          command: 'npx',
          args: ['-y', '@gitcontextgen/core', 'mcp'],
        },
      },
    },
    null,
    2
  );

  const mcpDesktopJson = JSON.stringify(
    {
      mcpServers: {
        'gitcontextgen-local': {
          command: 'npx',
          args: ['-y', '@gitcontextgen/core', 'mcp'],
          env: {
            REPO_NAME: result.repo,
          },
        },
      },
    },
    null,
    2
  );

  // Filtered File Tree
  const fileTreeLines = (result.fileTreeSummary || '').split('\n').filter(Boolean);
  const filteredFiles = fileSearch.trim()
    ? fileTreeLines.filter(f => f.toLowerCase().includes(fileSearch.toLowerCase()))
    : fileTreeLines.slice(0, 40);

  const tabs: Array<{ id: WorkspaceTabType; label: string; icon: any; count?: number | string }> = [
    { id: 'context', label: 'Code Context', icon: FolderGit2 },
    { id: 'rules', label: 'Synced Rules', icon: FileCode2, count: cursorRules.length },
    { id: 'mcp', label: 'MCP Config', icon: Server },
    { id: 'graph', label: 'Dependency Graph', icon: Layers },
    { id: 'handoff', label: 'Client Handoff', icon: Briefcase },
  ];

  return (
    <div className={`w-full bg-[#0d1117] text-[#c9d1d9] font-sans rounded-2xl border border-[#30363d] overflow-hidden shadow-2xl ${className}`}>
      
      {/* 1. Guest Minimalist Top-Banner / Growth Loop */}
      {isGuest && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-cyan-950/70 via-indigo-950/50 to-[#0d1117] border-b border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                💡 Save this Workspace &amp; Sync Live
              </h4>
              <p className="text-xs text-[#8b949e] mt-0.5 max-w-xl leading-relaxed">
                Analyze and sync your repositories on the fly. Save this codebase to your dashboard and connect our local stdio MCP server in 1-click by creating a free account.
              </p>
            </div>
          </div>
          <Link
            href={`/auth/login?save_owner=${encodeURIComponent(result.owner)}&save_repo=${encodeURIComponent(result.repo)}&next=/dashboard`}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs font-mono transition-all duration-150 flex items-center justify-center gap-2 shrink-0 shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <GithubIcon className="w-4 h-4 text-black" />
            <span>Save Repository &amp; Sign Up Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 2. Workspace Sticky Header Bar */}
      <header className="w-full bg-[#161b22] border-b border-[#30363d] px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Breadcrumbs & Title */}
          <div className="flex items-center gap-3 flex-wrap">
            {showBackToDashboard && (
              <Link href="/dashboard" className="text-[#8b949e] hover:text-[#58a6ff] transition" title="Back to Dashboard">
                <ChevronLeft className="w-4 h-4" />
              </Link>
            )}
            <FolderGit2 className="w-5 h-5 text-[#58a6ff] shrink-0" />
            <div className="flex items-center gap-1.5 text-base font-semibold">
              <span className="text-[#58a6ff]">{result.owner}</span>
              <span className="text-[#8b949e]">/</span>
              <span className="text-[#58a6ff] font-bold">{result.repo}</span>
            </div>

            {outputs?.framework && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-[#388bfd40] bg-[#388bfd15] text-[#58a6ff] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#58a6ff]" /> {outputs.framework}
              </span>
            )}

            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono border border-[#30363d] bg-[#21262d] text-[#8b949e] flex items-center gap-1">
              <Unlock className="w-3 h-3 text-[#3fb950]" /> Public
            </span>

            {/* Saved Indicator for Authenticated Users */}
            {!isGuest && isSaved && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono bg-[#238636]/20 border border-[#238636]/40 text-[#3fb950]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3fb950]" />
                Synced &amp; Saved to Dashboard
              </span>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="px-3 py-1.5 rounded-md bg-[#21262d] border border-[#30363d] text-[#c9d1d9] font-mono flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#8b949e]" />
              {result.defaultBranch || 'main'}
            </div>

            {/* Direct-to-AI Quick Copy Button */}
            <button
              onClick={() => handleCopy(claudeMd, 'header-claude-copy')}
              className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Copy CLAUDE.md context specification directly for AI coding agents"
            >
              {copiedSection === 'header-claude-copy' ? (
                <Check className="w-3.5 h-3.5 text-[#3fb950]" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#f78166]" />
              )}
              <span>{copiedSection === 'header-claude-copy' ? 'Copied CLAUDE.md!' : 'Copy for Claude'}</span>
            </button>

            {/* 📥 Export Data Dropdown Menu */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                aria-haspopup="true"
                aria-expanded={isExportOpen}
                title="Export analysis data (.xlsx, .csv, .json)"
              >
                <Download className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span className="font-medium">Export Data</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8b949e] transition-transform duration-150 ${isExportOpen ? 'rotate-180 text-[#58a6ff]' : ''}`} />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-80 rounded-xl bg-[#161b22] border border-[#30363d] shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 border-b border-[#30363d]/60 mb-1">
                    <p className="text-[10px] font-mono font-semibold text-[#8b949e] uppercase tracking-wider">
                      Export Codebase Analysis
                    </p>
                  </div>

                  {/* Option 1: Full Excel Workbook */}
                  <button
                    onClick={handleExportExcel}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#21262d] flex items-start gap-2.5 transition group cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#3fb950] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff] transition">
                        📊 Export Full Excel Workbook (.xlsx)
                      </div>
                      <div className="text-[11px] text-[#8b949e] mt-0.5 leading-tight">
                        Downloads multi-sheet workbook (Overview, AST, Rules, Handoff)
                      </div>
                    </div>
                  </button>

                  {/* Option 2: File Inventory CSV */}
                  <button
                    onClick={handleExportFileInventory}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#21262d] flex items-start gap-2.5 transition group cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#58a6ff] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff] transition">
                        📄 Export File Inventory (.csv)
                      </div>
                      <div className="text-[11px] text-[#8b949e] mt-0.5 leading-tight">
                        Downloads flat CSV mapping all parsed files, sizes, and AST
                      </div>
                    </div>
                  </button>

                  {/* Option 3: Client Handoff Summary CSV */}
                  <button
                    onClick={handleExportClientHandoff}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#21262d] flex items-start gap-2.5 transition group cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-[#bc8cff] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff] transition">
                        🤝 Export Client Handoff Summary (.csv)
                      </div>
                      <div className="text-[11px] text-[#8b949e] mt-0.5 leading-tight">
                        Downloads business-ready CSV of translated commits &amp; notes
                      </div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-[#30363d]/60" />

                  {/* Option 4: Copy Raw JSON Payload */}
                  <button
                    onClick={handleCopyRawJson}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#21262d] flex items-start gap-2.5 transition group cursor-pointer"
                  >
                    <Code2 className="w-4 h-4 text-[#f0883e] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff] transition">
                        📋 Copy Raw JSON Payload
                      </div>
                      <div className="text-[11px] text-[#8b949e] mt-0.5 leading-tight">
                        Copies full analysis JSON object directly to clipboard
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {onReSync && (
              <button
                onClick={onReSync}
                className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] transition flex items-center gap-1.5 cursor-pointer"
                title="Re-analyze repository"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>Re-sync</span>
              </button>
            )}

            {onSave && !isSaved && !isGuest && (
              <button
                onClick={onSave}
                className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to Dashboard</span>
              </button>
            )}

            <a
              href={result.repoUrl || `https://github.com/${result.owner}/${result.repo}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#8b949e]" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>

        {/* 3. Horizontal 5-Tab Navigation Bar */}
        <div className="overflow-x-auto no-scrollbar pt-3 -mb-4">
          <nav role="tablist" className="flex items-center gap-1 border-b border-[#30363d]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-[#f78166] text-[#f0f6fc] font-semibold bg-[#21262d]/40'
                      : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#f78166]' : 'text-[#8b949e]'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#30363d] text-[#c9d1d9]">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 4. Tab Panels */}
      <main className="p-4 sm:p-6 space-y-6">

        {/* ===================================================================== */}
        {/* TAB 1: 📂 Code Context                                                */}
        {/* ===================================================================== */}
        {activeTab === 'context' && (
          <div className="space-y-6">
            {/* Context Selector Header & AI Tool Switcher */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-[#f0f6fc] flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-[#58a6ff]" />
                    Asset 1: Direct-to-AI Context &amp; Onboarding Specs
                  </h3>
                  <p className="text-xs text-[#8b949e] mt-0.5">
                    Tailor execution instructions and clipboard payloads directly for your active coding agent.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* File Type Selector */}
                  <div className="flex items-center p-1 rounded-lg bg-[#0d1117] border border-[#30363d]">
                    <button
                      onClick={() => setOnboardingType('claude')}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition cursor-pointer ${
                        onboardingType === 'claude'
                          ? 'bg-[#1f6feb] text-white shadow-sm'
                          : 'text-[#8b949e] hover:text-[#c9d1d9]'
                      }`}
                    >
                      CLAUDE.md
                    </button>
                    <button
                      onClick={() => setOnboardingType('agents')}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition cursor-pointer ${
                        onboardingType === 'agents'
                          ? 'bg-[#1f6feb] text-white shadow-sm'
                          : 'text-[#8b949e] hover:text-[#c9d1d9]'
                      }`}
                    >
                      AGENTS.md
                    </button>
                  </div>

                  {/* Standard Copy File */}
                  <button
                    onClick={() => handleCopy(onboardingType === 'claude' ? claudeMd : agentsMd, 'onboarding-copy')}
                    className="px-3.5 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#f0f6fc] flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    {copiedSection === 'onboarding-copy' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5 text-[#8b949e]" />}
                    <span>{copiedSection === 'onboarding-copy' ? 'Copied File!' : 'Copy Raw File'}</span>
                  </button>
                </div>
              </div>

              {/* Direct-to-AI Agent Tool Switcher Bar */}
              <div className="pt-3 border-t border-[#30363d]/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#8b949e] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" /> Active Coding Agent:
                  </span>
                  <div className="flex items-center p-0.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
                    <button
                      onClick={() => setActiveAiTool('claude')}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
                        activeAiTool === 'claude' ? 'bg-[#238636] text-white font-bold' : 'text-[#8b949e] hover:text-[#c9d1d9]'
                      }`}
                    >
                      Claude Code
                    </button>
                    <button
                      onClick={() => setActiveAiTool('cursor')}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
                        activeAiTool === 'cursor' ? 'bg-[#1f6feb] text-white font-bold' : 'text-[#8b949e] hover:text-[#c9d1d9]'
                      }`}
                    >
                      Cursor
                    </button>
                    <button
                      onClick={() => setActiveAiTool('copilot')}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
                        activeAiTool === 'copilot' ? 'bg-[#8957e5] text-white font-bold' : 'text-[#8b949e] hover:text-[#c9d1d9]'
                      }`}
                    >
                      GitHub Copilot
                    </button>
                  </div>
                </div>

                {/* Dynamic AI Tool Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {activeAiTool === 'claude' && (
                    <button
                      onClick={() => {
                        const heredoc = `cat << 'EOF' > CLAUDE.md\n${claudeMd}\nEOF`;
                        handleCopy(heredoc, 'claude-heredoc');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#238636]/20 hover:bg-[#238636]/30 border border-[#2ea043]/40 text-[#3fb950] text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Generate and copy terminal command to write CLAUDE.md in one step"
                    >
                      {copiedSection === 'claude-heredoc' ? <Check className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'claude-heredoc' ? 'Copied Shell Script!' : 'Copy Shell Script (cat << EOF)'}</span>
                    </button>
                  )}

                  {activeAiTool === 'cursor' && (
                    <button
                      onClick={() => handleDownloadCursorRule(activeCursorRule.filename, activeCursorRule.content)}
                      className="px-3 py-1.5 rounded-lg bg-[#1f6feb]/20 hover:bg-[#1f6feb]/30 border border-[#388bfd]/40 text-[#58a6ff] text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Download rule file directly into your workspace"
                    >
                      {copiedSection === 'cursor-download' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Download className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'cursor-download' ? 'Downloaded Rule!' : 'Download .cursor/rules/*.mdc'}</span>
                    </button>
                  )}

                  {activeAiTool === 'copilot' && (
                    <button
                      onClick={() => {
                        const copilotInstructions = `# GitHub Copilot Custom Instructions — ${result.repo}\n<!-- Place in .github/copilot-instructions.md -->\n\n## Architecture Overview & Boundaries\n${claudeMd}\n\n## Strict Code Safety & Invariants\n${activeCursorRule.content}`;
                        handleCopy(copilotInstructions, 'copilot-instructions');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#8957e5]/20 hover:bg-[#8957e5]/30 border border-[#a371f7]/40 text-[#d2a8ff] text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Copy formatted custom instructions for GitHub Copilot Agent Mode"
                    >
                      {copiedSection === 'copilot-instructions' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <FileText className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'copilot-instructions' ? 'Copied Instructions!' : 'Copy .github/copilot-instructions.md'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cursor Visual Placement Walkthrough */}
              {activeAiTool === 'cursor' && (
                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-[#8b949e]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#58a6ff] font-bold">Target Path:</span>
                    <code className="text-[#c9d1d9] bg-[#161b22] px-2 py-0.5 rounded border border-[#30363d]">
                      {result.repo}/.cursor/rules/{activeCursorRule.filename.split('/').pop()}
                    </code>
                  </div>
                  <span className="text-[#3fb950] text-[11px]">Enforced via alwaysApply: true</span>
                </div>
              )}
            </div>

            {/* Framework Dev Commands Grid */}
            {devCommands.length > 0 && (
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
                <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#58a6ff]" /> Framework Execution Commands
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                  {devCommands.map((cmd, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-between gap-2">
                      <code className="text-xs font-mono text-[#79c0ff] truncate">{cmd}</code>
                      <button
                        onClick={() => handleCopy(cmd.split(' (')[0], `cmd-${idx}`)}
                        className="text-[#8b949e] hover:text-[#c9d1d9] p-1 transition cursor-pointer shrink-0"
                        title="Copy command"
                      >
                        {copiedSection === `cmd-${idx}` ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dual Grid: File Tree + Code Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Parsed Directory Structure */}
              <div className="lg:col-span-4 rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden flex flex-col max-h-[600px]">
                <div className="p-3 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-[#f0f6fc] flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-[#58a6ff]" /> Codebase AST Tree
                  </span>
                  <span className="text-[10px] font-mono text-[#8b949e]">
                    {fileTreeLines.length} nodes indexed
                  </span>
                </div>
                <div className="p-2 border-b border-[#30363d] bg-[#161b22]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter files..."
                      value={fileSearch}
                      onChange={(e) => setFileSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                </div>
                <div className="p-3 bg-[#0d1117] overflow-y-auto flex-1 font-mono text-xs text-[#8b949e] space-y-1 select-text">
                  {filteredFiles.map((file, i) => {
                    const isDirectory = file.startsWith('[DIR]') || !file.includes('.');
                    const cleanPath = file.replace(/^\[(DIR|FILE)\]\s*/, '').trim();

                    return (
                      <div
                        key={i}
                        className="group flex items-center justify-between gap-2 py-1 px-1.5 rounded hover:bg-[#161b22] transition"
                      >
                        <span className="truncate hover:text-[#58a6ff] transition">
                          {file}
                        </span>

                        {isDirectory && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyFolderContext(cleanPath, fileTreeLines);
                            }}
                            title={`Copy focused context prompt for ${cleanPath}`}
                            aria-label={`Copy context block for ${cleanPath}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 px-2 py-0.5 text-[10px] font-mono rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#58a6ff] hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            {copiedFolder === cleanPath ? (
                              <>
                                <Check className="w-3 h-3 text-[#3fb950]" />
                                <span className="text-[#3fb950]">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Context Block</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {filteredFiles.length === 0 && (
                    <p className="text-xs text-center py-6 text-[#8b949e]">No matching files found.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Active Onboarding Document Preview */}
              <div className="lg:col-span-8">
                <CodeViewer
                  content={onboardingType === 'claude' ? claudeMd : agentsMd}
                  filename={onboardingType === 'claude' ? 'CLAUDE.md' : 'AGENTS.md'}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: 📜 Synced Rules                                                */}
        {/* ===================================================================== */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            {/* Rules Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
              <div>
                <h3 className="text-base font-semibold text-[#f0f6fc] flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-[#79c0ff]" />
                  Asset 2: Fully Scaffolded Cursor Rules (.cursor/rules/*.mdc)
                </h3>
                <p className="text-xs text-[#8b949e] mt-0.5">
                  Strict YAML frontmatter (<code className="text-[#3fb950] font-mono">alwaysApply: true</code>) and framework-tailored security standards.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {cursorRules.length > 1 && (
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0d1117] border border-[#30363d]">
                    {cursorRules.map((rule, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedRuleIndex(idx)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono transition cursor-pointer ${
                          selectedRuleIndex === idx
                            ? 'bg-[#1f6feb] text-white'
                            : 'text-[#8b949e] hover:text-[#c9d1d9]'
                        }`}
                      >
                        {rule.filename.split('/').pop()}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleCopy(activeCursorRule.content, 'cursor-rule-copy')}
                  className="px-3.5 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#f0f6fc] flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedSection === 'cursor-rule-copy' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5 text-[#8b949e]" />}
                  <span>{copiedSection === 'cursor-rule-copy' ? 'Copied Rule!' : 'Copy Rule'}</span>
                </button>
              </div>
            </div>

            {/* Side-by-Side View: Active Rule vs Harmonized CLAUDE.md */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <CodeViewer
                  content={activeCursorRule.content}
                  filename={activeCursorRule.filename}
                />
              </div>
              <div>
                <CodeViewer
                  content={claudeMd}
                  filename="CLAUDE.md (Harmonized Invariant)"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: 🔌 MCP Config                                                  */}
        {/* ===================================================================== */}
        {activeTab === 'mcp' && (
          <div className="space-y-6">
            {/* Feature Header */}
            <div>
              <h3 className="text-lg font-semibold text-[#f0f6fc]">Model Context Protocol (MCP) Server</h3>
              <p className="text-sm text-[#8b949e]">Connect Claude Code, Cursor, or Desktop Agents directly to your repository context.</p>
            </div>

            {hasMcpAccess ? (
              <McpExplorerSandbox repo={result} />
            ) : (
              <McpUpgradePlaceholder />
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 4: 📊 Dependency Graph (Architecture AST)                         */}
        {/* ===================================================================== */}
        {activeTab === 'graph' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
              <h3 className="text-base font-semibold text-[#f0f6fc] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#d2a8ff]" />
                Asset 3: Visual AST Flowchart &amp; Architecture Map
              </h3>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Deterministic Mermaid.js diagram generated from codebase module boundaries, API endpoints, and route controllers.
              </p>
            </div>

            {mermaidGraph ? (
              <ErrorBoundary title="Architecture AST Diagram">
                <MermaidDiagram chart={mermaidGraph} krokiUrls={result.krokiDiagramUrls} />
              </ErrorBoundary>
            ) : (
              <div className="px-6 py-12 rounded-xl bg-[#161b22] border border-[#30363d] text-center">
                <p className="text-sm text-[#8b949e]">No architecture diagram generated yet.</p>
              </div>
            )}

            {/* Flowchart Node Hierarchy Breakdown */}
            {flowchartNodes.length > 0 && (
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
                <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-[#58a6ff]" /> Architectural Node Hierarchy
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {flowchartNodes.map((node) => (
                    <div key={node.id} className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-mono text-[#58a6ff] uppercase">{node.type}</span>
                        <span className="text-[10px] font-mono text-[#8b949e]">ID: {node.id}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#f0f6fc] mt-1 truncate">{node.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 5: 🤝 Client Handoff                                              */}
        {/* ===================================================================== */}
        {activeTab === 'handoff' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#f0f6fc] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#3fb950]" />
                  Asset 4: Automated Client Progress Report
                </h3>
                <p className="text-xs text-[#8b949e] mt-0.5">
                  Translates technical commits into high-impact commercial outcomes for non-technical clients (<code className="text-[#3fb950] font-mono">gitcontextgen handoff --client</code>).
                </p>
              </div>

              <button
                onClick={() => {
                  const reportText = `# Client Progress Report — ${result.repo}\n\n${clientReport.summary}\n\n## New Features\n${clientReport.categories.newFeatures.map(f => `- ${f}`).join('\n')}\n\n## Security & Maintenance\n${clientReport.categories.securityMaintenance.map(s => `- ${s}`).join('\n')}\n\n## UX Improvements\n${clientReport.categories.uxImprovements.map(u => `- ${u}`).join('\n')}`;
                  handleCopy(reportText, 'report-copy');
                }}
                className="px-3.5 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#f0f6fc] flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {copiedSection === 'report-copy' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5 text-[#8b949e]" />}
                <span>{copiedSection === 'report-copy' ? 'Copied Report!' : 'Copy Executive Report'}</span>
              </button>
            </div>

            {/* Executive Overview Box */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-1.5">
              <span className="text-xs font-mono text-[#58a6ff] uppercase tracking-wider font-semibold">Executive Overview</span>
              <p className="text-sm text-[#c9d1d9] leading-relaxed">{clientReport.summary}</p>
            </div>

            {/* 3 Impact Categorization Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* New Features */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#23863640] space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#3fb950]">
                  <CheckCircle2 className="w-4 h-4" /> New Features ({clientReport.categories.newFeatures.length})
                </div>
                <ul className="space-y-2 text-xs text-[#c9d1d9]">
                  {clientReport.categories.newFeatures.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#3fb950] mt-0.5">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security & Maintenance */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#1f6feb40] space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#58a6ff]">
                  <Lock className="w-4 h-4" /> Security &amp; Infrastructure ({clientReport.categories.securityMaintenance.length})
                </div>
                <ul className="space-y-2 text-xs text-[#c9d1d9]">
                  {clientReport.categories.securityMaintenance.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#58a6ff] mt-0.5">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* UX Improvements */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#8957e540] space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#d2a8ff]">
                  <Sparkles className="w-4 h-4" /> UX &amp; Polish ({clientReport.categories.uxImprovements.length})
                </div>
                <ul className="space-y-2 text-xs text-[#c9d1d9]">
                  {clientReport.categories.uxImprovements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#d2a8ff] mt-0.5">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Export & Action Toast Notification */}
      {exportToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md p-3.5 sm:p-4 rounded-xl bg-[#161b22] border border-[#238636]/60 text-sm shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2.5">
            {exportToast.type === 'error' ? (
              <span className="text-red-400 text-base shrink-0">⚠️</span>
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#3fb950] shrink-0" />
            )}
            <span className="font-medium text-[#f0f6fc] text-xs sm:text-sm leading-snug">{exportToast.message}</span>
          </div>
          <button
            onClick={() => setExportToast(null)}
            className="text-[#8b949e] hover:text-[#c9d1d9] p-1 rounded transition cursor-pointer shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}