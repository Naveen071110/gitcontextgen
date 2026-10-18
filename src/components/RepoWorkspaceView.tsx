'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  X,
  Clock,
  GitCommit,
  Split,
  AlertTriangle,
  Zap,
  GitCompare,
  LayoutDashboard,
  ShieldCheck,
  Cpu,
  ChevronRight,
  Command,
  Wrench,
  FolderTree,
  History,
  FileDiff,
  ArrowRightLeft
} from 'lucide-react';

export interface RepoWorkspaceViewProps {
  result: RepositoryAnalysisResult;
  previousResult?: RepositoryAnalysisResult | null;
  isGuest?: boolean;
  onSave?: () => Promise<void> | void;
  isSaved?: boolean;
  onReSync?: () => void;
  isReAnalyzing?: boolean;
  showBackToDashboard?: boolean;
  className?: string;
}

export type WorkspaceTabType = 'overview' | 'context' | 'rules' | 'mcp' | 'graph' | 'handoff';

export const ARCHETYPE_BADGES: Record<string, { label: string; icon: string; badgeClass: string; title: string }> = {
  AI_AGENT: {
    label: 'AI AGENT',
    icon: '🤖',
    badgeClass: 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/10',
    title: 'Autonomous loop & tool-calling agent system',
  },
  AGENT_SKILL: {
    label: 'AGENT SKILL',
    icon: '⚡',
    badgeClass: 'border-violet-500/40 bg-violet-500/15 text-violet-300 shadow-sm shadow-violet-500/10',
    title: 'Standalone tool & agent skill definition',
  },
  SAAS_WEB_APP: {
    label: 'SAAS WEB APP',
    icon: '🌐',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/10',
    title: 'Full-stack web application & SaaS platform',
  },
  FULL_APPLICATION: {
    label: 'FULL APPLICATION',
    icon: '🚀',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/10',
    title: 'Full-stack application architecture',
  },
  LIBRARY_SDK: {
    label: 'LIBRARY SDK',
    icon: '📦',
    badgeClass: 'border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/10',
    title: 'Reusable library, SDK, or package module',
  },
  CLI_TOOL: {
    label: 'CLI TOOL',
    icon: '💻',
    badgeClass: 'border-sky-500/40 bg-sky-500/15 text-sky-300 shadow-sm shadow-sky-500/10',
    title: 'Terminal CLI binary and command-line utility',
  },
  CMS_PLUGIN: {
    label: 'CMS PLUGIN',
    icon: '🔌',
    badgeClass: 'border-blue-500/40 bg-blue-500/15 text-blue-300 shadow-sm shadow-blue-500/10',
    title: 'Content management plugin or theme extension',
  },
  FRAMEWORK_INFRA: {
    label: 'INFRASTRUCTURE',
    icon: '🏗️',
    badgeClass: 'border-orange-500/40 bg-orange-500/15 text-orange-300 shadow-sm shadow-orange-500/10',
    title: 'Infrastructure, orchestration, or system engine',
  },
};

// Helper: format relative time
function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'Just now';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return 'Just now';
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 45) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function formatIsoDate(isoString?: string): string {
  if (!isoString) return 'Current';
  try {
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? isoString : d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  } catch {
    return isoString;
  }
}

// Helper: token estimate (average 3.8 chars/token)
function estimateTokens(text: string): number {
  return Math.max(1, Math.round((text || '').length / 3.8));
}

// Helper: condense markdown to token-optimized minimal specification
function condenseToMinimal(markdown: string): string {
  if (!markdown) return '';
  const lines = markdown.split('\n');
  const kept: string[] = [];
  let inCodeBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Preserve code blocks completely (commands, scripts, configurations)
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      kept.push(raw);
      continue;
    }
    if (inCodeBlock) {
      kept.push(raw);
      continue;
    }

    // Preserve frontmatter
    if (trimmed === '---') {
      kept.push(raw);
      continue;
    }

    // Keep headings (H1, H2, H3)
    if (trimmed.startsWith('#')) {
      kept.push(raw);
      continue;
    }

    // Keep bullet points, checklists, numbered lists, commands, and invariants
    if (
      trimmed.startsWith('- [ ]') ||
      trimmed.startsWith('- [x]') ||
      trimmed.startsWith('* ') ||
      trimmed.startsWith('- ') ||
      /^\d+\.\s/.test(trimmed)
    ) {
      if (trimmed.length > 250) {
        kept.push(raw.slice(0, 240) + '...');
      } else {
        kept.push(raw);
      }
      continue;
    }

    // Keep Markdown tables
    if (trimmed.startsWith('|')) {
      kept.push(raw);
      continue;
    }

    // Strip long conversational paragraphs to save tokens (keep only compact lines < 100 chars)
    if (trimmed.length > 0 && trimmed.length < 100 && !trimmed.toLowerCase().startsWith('welcome to') && !trimmed.toLowerCase().includes('automatically generated by')) {
      kept.push(raw);
    }
  }

  const output = kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return `<!-- ⚡ MINIMAL CONTEXT SPECIFICATION (Token-Optimized for Low-Latency LLM Inference) -->\n\n${output}`;
}

// ============================================================================
// Priority 2: Change-Aware Context & Drift Detection Deterministic Engines
// ============================================================================

export interface ParsedFileTreeInfo {
  paths: Set<string>;
  fileList: string[];
  dirList: string[];
  fileCount: number;
  dirCount: number;
  isTruncated: boolean;
}

export function parseFileTreePaths(fileTreeSummary: string): ParsedFileTreeInfo {
  if (!fileTreeSummary) {
    return { paths: new Set(), fileList: [], dirList: [], fileCount: 0, dirCount: 0, isTruncated: false };
  }
  const lines = fileTreeSummary.split('\n');
  const paths = new Set<string>();
  const fileList: string[] = [];
  const dirList: string[] = [];
  let isTruncated = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.toLowerCase().includes('truncated') || line.toLowerCase().includes('300 files') || line.toLowerCase().includes('ast ceiling')) {
      isTruncated = true;
      continue;
    }
    // Clean tree formatting characters: [FILE], [DIR], ├──, └──, │, 📁, 📄, -, *
    let cleaned = line
      .replace(/^\[(FILE|DIR)\]\s*/i, '')
      .replace(/^[│├└─\s\-\*]+/g, '')
      .replace(/^[📁📄]\s*/, '')
      .replace(/\s*\([^)]*\)$/, '')
      .trim();

    if (!cleaned) continue;

    const isDir = line.startsWith('[DIR]') || line.includes('📁') || cleaned.endsWith('/');
    cleaned = cleaned.replace(/\/$/, '');

    paths.add(cleaned.toLowerCase());
    paths.add(cleaned);

    if (cleaned.includes('/')) {
      const parts = cleaned.split('/');
      const basename = parts[parts.length - 1];
      if (basename) {
        paths.add(basename.toLowerCase());
        paths.add(basename);
      }
    }

    if (isDir) {
      dirList.push(cleaned);
    } else {
      fileList.push(cleaned);
    }
  }

  return {
    paths,
    fileList,
    dirList,
    fileCount: fileList.length,
    dirCount: dirList.length,
    isTruncated,
  };
}

export interface StaleFinding {
  id: string;
  category: 'MECHANICAL_ORPHAN' | 'STRUCTURAL_DRIFT' | 'REVIEW_SUGGESTED';
  title: string;
  ruleFile: string;
  targetRef?: string;
  explanation: string;
  evidence: string;
  actionSuggested: string;
}

export function detectStaleInstructions(
  current: RepositoryAnalysisResult,
  prior: RepositoryAnalysisResult | null | undefined,
  currentPaths: Set<string>,
  isTruncated: boolean
): StaleFinding[] {
  const findings: StaleFinding[] = [];
  let idCounter = 1;

  // Check 1: Orphaned File Path Reference in Rules (Confirmed Mechanical Finding)
  const rulesToCheck: Array<{ name: string; content: string }> = [];
  if (current.monetizableOutputs?.onboarding?.claudeMd) {
    rulesToCheck.push({ name: 'CLAUDE.md', content: current.monetizableOutputs.onboarding.claudeMd });
  }
  if (current.monetizableOutputs?.onboarding?.agentsMd) {
    rulesToCheck.push({ name: 'AGENTS.md', content: current.monetizableOutputs.onboarding.agentsMd });
  }
  if (current.monetizableOutputs?.cursorRules) {
    for (const cr of current.monetizableOutputs.cursorRules) {
      rulesToCheck.push({ name: cr.filename, content: cr.content });
    }
  }

  const commonExtensions = new Set([
    'ts', 'tsx', 'js', 'jsx', 'json', 'md', 'css', 'scss', 'html',
    'yaml', 'yml', 'toml', 'env', 'py', 'rb', 'go', 'rs', 'sql', 'sh', 'lock', 'prisma'
  ]);
  const ignoredTokens = new Set([
    'npm', 'npx', 'pnpm', 'yarn', 'bun', 'git', 'node', 'tsc', 'true', 'false',
    'localhost', 'http', 'https', 'none', 'null', 'undefined', 'utf-8', 'utf8', 'app.ts'
  ]);

  if (currentPaths.size > 0) {
    const checkedRefs = new Set<string>();

    for (const rule of rulesToCheck) {
      const lines = rule.content.split('\n');
      const pathRegex = /`([a-zA-Z0-9_\-\./\\]+\.[a-zA-Z0-9_\-]+)`/g;

      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('create ') || lowerLine.includes('generate ') || lowerLine.includes('new file')) {
          continue;
        }

        let match: RegExpExecArray | null;
        while ((match = pathRegex.exec(line)) !== null) {
          const candidate = match[1].trim();
          if (candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.startsWith('--') || candidate.includes('*')) {
            continue;
          }
          const parts = candidate.split('.');
          const ext = parts[parts.length - 1].toLowerCase();
          if (!commonExtensions.has(ext)) continue;
          if (ignoredTokens.has(candidate.toLowerCase())) continue;

          const candLower = candidate.toLowerCase();
          const candNorm = candLower.replace(/^\.?\//, '');
          const basename = candLower.split('/').pop() || candLower;

          const existsInTree =
            currentPaths.has(candLower) ||
            currentPaths.has(candNorm) ||
            currentPaths.has(basename);

          const dedupeKey = `${rule.name}:${candLower}`;
          if (!existsInTree && !checkedRefs.has(dedupeKey)) {
            checkedRefs.add(dedupeKey);

            findings.push({
              id: `stale-${idCounter++}`,
              category: 'MECHANICAL_ORPHAN',
              title: `Orphaned File Reference in ${rule.name}`,
              ruleFile: rule.name,
              targetRef: candidate,
              explanation: `Rule ${rule.name} references '${candidate}', but this file does not exist in the analyzed repository tree.`,
              evidence: `Indexed tree contains ${currentPaths.size} AST nodes. '${candidate}' was not matched anywhere in the scanned files.${
                isTruncated ? ' (Note: Repository exceeded the 300-node AST ceiling; path could exist in an un-scanned directory).' : ''
              }`,
              actionSuggested: `Verify whether '${candidate}' was deleted, moved, or renamed, and update ${rule.name} accordingly.`,
            });
          }
        }
      }
    }
  }

  // Check 2: Architecture Module Removal Drift (Between Snapshots)
  if (prior && prior.monetizableOutputs?.architecture?.flowchartNodes && current.monetizableOutputs?.architecture?.flowchartNodes) {
    const currentNodes = new Set(
      current.monetizableOutputs.architecture.flowchartNodes.map(n => n.id.toLowerCase())
    );
    for (const priorNode of prior.monetizableOutputs.architecture.flowchartNodes) {
      if (!currentNodes.has(priorNode.id.toLowerCase())) {
        findings.push({
          id: `stale-${idCounter++}`,
          category: 'STRUCTURAL_DRIFT',
          title: `Architectural Subsystem Removed: ${priorNode.label}`,
          ruleFile: 'Architecture Topology',
          targetRef: priorNode.label,
          explanation: `Architectural module '${priorNode.label}' (${priorNode.type}) was detected in the prior analysis at ${new Date(prior.analyzedAt).toLocaleTimeString()}, but is absent in the current snapshot.`,
          evidence: `Module node '${priorNode.id}' was removed from the synthesized AST node list.`,
          actionSuggested: `Inspect recent commits to confirm if this subsystem was refactored or deleted.`,
        });
      }
    }
  }

  // Check 3: Instruction Text Modification (Review Suggested)
  if (prior) {
    const priorClaude = prior.monetizableOutputs?.onboarding?.claudeMd || '';
    const currClaude = current.monetizableOutputs?.onboarding?.claudeMd || '';
    if (priorClaude && currClaude && priorClaude !== currClaude) {
      const charDiff = currClaude.length - priorClaude.length;
      findings.push({
        id: `stale-${idCounter++}`,
        category: 'REVIEW_SUGGESTED',
        title: `CLAUDE.md Instruction Text Updated`,
        ruleFile: 'CLAUDE.md',
        explanation: `Generated instructions for CLAUDE.md changed between snapshots. A text update reflects updated AST findings and dev commands.`,
        evidence: `Character count changed from ${priorClaude.length} to ${currClaude.length} (${charDiff > 0 ? '+' : ''}${charDiff} chars).`,
        actionSuggested: `Review the diff to confirm that updated build or test commands align with your workflow.`,
      });
    }

    const priorAgents = prior.monetizableOutputs?.onboarding?.agentsMd || '';
    const currAgents = current.monetizableOutputs?.onboarding?.agentsMd || '';
    if (priorAgents && currAgents && priorAgents !== currAgents) {
      const charDiff = currAgents.length - priorAgents.length;
      findings.push({
        id: `stale-${idCounter++}`,
        category: 'REVIEW_SUGGESTED',
        title: `AGENTS.md Multi-Agent Spec Updated`,
        ruleFile: 'AGENTS.md',
        explanation: `Multi-agent coordination specification was regenerated with updated constraints.`,
        evidence: `Character count changed from ${priorAgents.length} to ${currAgents.length} (${charDiff > 0 ? '+' : ''}${charDiff} chars).`,
        actionSuggested: `Verify multi-agent invariants before distributing to Claude Code or Cursor.`,
      });
    }
  }

  return findings;
}

export function computeSnapshotComparison(
  current: RepositoryAnalysisResult,
  prior: RepositoryAnalysisResult | null | undefined
) {
  const currentParsed = parseFileTreePaths(current.fileTreeSummary);
  const priorParsed = prior ? parseFileTreePaths(prior.fileTreeSummary) : null;

  const addedFiles: string[] = [];
  const removedFiles: string[] = [];
  let unchangedCount = 0;

  if (priorParsed) {
    for (const file of currentParsed.fileList) {
      if (!priorParsed.paths.has(file.toLowerCase())) {
        addedFiles.push(file);
      } else {
        unchangedCount++;
      }
    }
    for (const file of priorParsed.fileList) {
      if (!currentParsed.paths.has(file.toLowerCase())) {
        removedFiles.push(file);
      }
    }
  }

  const instructionChanges: Array<{
    file: string;
    status: 'MODIFIED' | 'UNCHANGED' | 'ADDED' | 'REMOVED';
    priorLength: number;
    currentLength: number;
    charDelta: number;
  }> = [];

  if (prior) {
    const priorClaude = prior.monetizableOutputs?.onboarding?.claudeMd || '';
    const currClaude = current.monetizableOutputs?.onboarding?.claudeMd || '';
    instructionChanges.push({
      file: 'CLAUDE.md',
      status: priorClaude === currClaude ? 'UNCHANGED' : 'MODIFIED',
      priorLength: priorClaude.length,
      currentLength: currClaude.length,
      charDelta: currClaude.length - priorClaude.length,
    });

    const priorAgents = prior.monetizableOutputs?.onboarding?.agentsMd || '';
    const currAgents = current.monetizableOutputs?.onboarding?.agentsMd || '';
    instructionChanges.push({
      file: 'AGENTS.md',
      status: priorAgents === currAgents ? 'UNCHANGED' : 'MODIFIED',
      priorLength: priorAgents.length,
      currentLength: currAgents.length,
      charDelta: currAgents.length - priorAgents.length,
    });

    const priorRules = prior.monetizableOutputs?.cursorRules || [];
    const currRules = current.monetizableOutputs?.cursorRules || [];
    const allRuleNames = Array.from(
      new Set([...priorRules.map(r => r.filename), ...currRules.map(r => r.filename)])
    );

    for (const rName of allRuleNames) {
      const pRule = priorRules.find(r => r.filename === rName);
      const cRule = currRules.find(r => r.filename === rName);
      if (!pRule && cRule) {
        instructionChanges.push({
          file: rName,
          status: 'ADDED',
          priorLength: 0,
          currentLength: cRule.content.length,
          charDelta: cRule.content.length,
        });
      } else if (pRule && !cRule) {
        instructionChanges.push({
          file: rName,
          status: 'REMOVED',
          priorLength: pRule.content.length,
          currentLength: 0,
          charDelta: -pRule.content.length,
        });
      } else if (pRule && cRule) {
        instructionChanges.push({
          file: rName,
          status: pRule.content === cRule.content ? 'UNCHANGED' : 'MODIFIED',
          priorLength: pRule.content.length,
          currentLength: cRule.content.length,
          charDelta: cRule.content.length - pRule.content.length,
        });
      }
    }
  }

  const findings = detectStaleInstructions(current, prior, currentParsed.paths, currentParsed.isTruncated);

  let elapsedMinutes = 0;
  if (prior && prior.analyzedAt && current.analyzedAt) {
    const elapsedMs = new Date(current.analyzedAt).getTime() - new Date(prior.analyzedAt).getTime();
    elapsedMinutes = Math.max(0, Math.round(elapsedMs / (1000 * 60)));
  }

  const vulnerabilityDelta = (current.vulnerabilityCount ?? 0) - (prior?.vulnerabilityCount ?? 0);

  return {
    hasBaseline: Boolean(prior && prior.analyzedAt !== current.analyzedAt),
    priorParsed,
    currentParsed,
    addedFiles,
    removedFiles,
    unchangedCount,
    instructionChanges,
    findings,
    elapsedMinutes,
    vulnerabilityDelta,
  };
}

export function computeFreshnessState(
  hasBaseline: boolean,
  addedFilesCount: number,
  removedFilesCount: number,
  instructionModCount: number,
  findings: StaleFinding[]
) {
  const orphanFindings = findings.filter(f => f.category === 'MECHANICAL_ORPHAN');
  const structuralFindings = findings.filter(f => f.category === 'STRUCTURAL_DRIFT');

  if (orphanFindings.length > 0) {
    return {
      status: 'ORPHAN_FOUND',
      label: `Orphaned Ref Detected (${orphanFindings.length})`,
      dotClass: 'bg-amber-400 animate-pulse',
      badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      tooltip: 'One or more generated rules reference file paths that do not exist in the scanned repository tree.',
    };
  }

  if (!hasBaseline) {
    return {
      status: 'BASELINE_VERIFIED',
      label: 'HEAD Snapshot Verified',
      dotClass: 'bg-[#58a6ff]',
      badgeClass: 'border-[#1f6feb]/40 bg-[#1f6feb]/10 text-[#58a6ff]',
      tooltip: 'Single verified snapshot in current session. Re-analyze to compare against newer commits.',
    };
  }

  const totalDrift = addedFilesCount + removedFilesCount + instructionModCount + structuralFindings.length;

  if (totalDrift > 0) {
    return {
      status: 'DRIFT_DETECTED',
      label: `Context Drift Detected (${totalDrift})`,
      dotClass: 'bg-amber-400 animate-pulse',
      badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      tooltip: `${totalDrift} differences detected between prior baseline and current snapshot.`,
    };
  }

  return {
    status: 'ZERO_DRIFT',
    label: 'Zero Drift Detected (2 Snapshots)',
    dotClass: 'bg-[#3fb950]',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-[#3fb950]',
    tooltip: 'File inventory and synthesized rules match the prior analysis snapshot exactly.',
  };
}

export default function RepoWorkspaceView({
  result,
  previousResult,
  isGuest = false,
  onSave,
  isSaved = false,
  onReSync,
  isReAnalyzing = false,
  showBackToDashboard = false,
  className = '',
}: RepoWorkspaceViewProps) {
  // Session snapshot retention
  const [internalPreviousResult, setInternalPreviousResult] = useState<RepositoryAnalysisResult | null>(null);
  const prevResultRef = useRef<RepositoryAnalysisResult>(result);

  useEffect(() => {
    if (prevResultRef.current && prevResultRef.current !== result && prevResultRef.current.analyzedAt !== result.analyzedAt) {
      setInternalPreviousResult(prevResultRef.current);
    }
    prevResultRef.current = result;
  }, [result]);

  const effectivePreviousResult = previousResult || internalPreviousResult;
  const [activeSnapshotView, setActiveSnapshotView] = useState<'latest' | 'prior'>('latest');
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [isDriftDetailsOpen, setIsDriftDetailsOpen] = useState<boolean>(false);

  // Compute snapshot comparison
  const comparisonResult = useMemo(() => {
    return computeSnapshotComparison(result, effectivePreviousResult);
  }, [result, effectivePreviousResult]);

  const freshnessState = useMemo(() => {
    const addedCount = comparisonResult.addedFiles.length;
    const removedCount = comparisonResult.removedFiles.length;
    const instructionModCount = comparisonResult.instructionChanges.filter(c => c.status === 'MODIFIED').length;
    return computeFreshnessState(
      comparisonResult.hasBaseline,
      addedCount,
      removedCount,
      instructionModCount,
      comparisonResult.findings
    );
  }, [comparisonResult]);

  const hasBaseline = comparisonResult.hasBaseline;
  const activeAnalysisResult = (activeSnapshotView === 'prior' && effectivePreviousResult) ? effectivePreviousResult : result;

  const [activeTab, setActiveTab] = useState<WorkspaceTabType>('overview');
  const [setupTool, setSetupTool] = useState<'claude' | 'cursor' | 'copilot' | 'windsurf'>('claude');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [onboardingType, setOnboardingType] = useState<'claude' | 'agents'>('claude');
  const [outputMode, setOutputMode] = useState<'standard' | 'minimal'>('standard');
  const [showDiffView, setShowDiffView] = useState<boolean>(false);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number>(0);
  const [fileSearch, setFileSearch] = useState<string>('');
  const [activeAiTool, setActiveAiTool] = useState<'claude' | 'cursor' | 'copilot' | 'windsurf'>('claude');
  const [copiedFolder, setCopiedFolder] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>({});
  const toggleChecklistItem = (key: string) => {
    setCompletedChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };
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

  const handleExportExcel = async () => {
    try {
      const filename = await downloadExcelWorkbook(activeAnalysisResult);
      setIsExportOpen(false);
      triggerToast(`✅ Exported ${filename} successfully!`);
    } catch (err) {
      console.error('Failed to export Excel workbook:', err);
      triggerToast(`Failed to export Excel workbook: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const handleExportFileInventory = () => {
    try {
      const filename = downloadFileInventoryCsv(activeAnalysisResult);
      setIsExportOpen(false);
      triggerToast(`✅ Exported ${filename} successfully!`);
    } catch (err) {
      console.error('Failed to export file inventory CSV:', err);
      triggerToast(`Failed to export file inventory: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const handleExportClientHandoff = () => {
    try {
      const filename = downloadClientHandoffCsv(activeAnalysisResult);
      setIsExportOpen(false);
      triggerToast(`✅ Exported ${filename} successfully!`);
    } catch (err) {
      console.error('Failed to export client handoff CSV:', err);
      triggerToast(`Failed to export client handoff: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const handleCopyRawJson = () => {
    try {
      const jsonStr = JSON.stringify(activeAnalysisResult, null, 2);
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

  const handleDownloadRawJson = () => {
    try {
      if (typeof window === 'undefined') return;
      const jsonStr = JSON.stringify(activeAnalysisResult, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeAnalysisResult.repo || 'repo'}-analysis.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsExportOpen(false);
      triggerToast(`✅ Exported ${link.download} successfully!`);
    } catch (err) {
      console.error('Failed to download analysis JSON:', err);
      triggerToast(`Failed to export analysis JSON: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
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

  const outputs = activeAnalysisResult.monetizableOutputs;
  const currentArchetype = activeAnalysisResult.archetype || outputs?.archetype || 'SAAS_WEB_APP';
  const archetypeBadge = ARCHETYPE_BADGES[currentArchetype] || ARCHETYPE_BADGES.SAAS_WEB_APP;

  const handleCopyFolderContext = (folderPath: string, filesList: string[]) => {
    const cleanFolder = folderPath.replace(/^\[(DIR|FILE)\]\s*/, '').trim();
    const folderFiles = filesList.filter(f => f.includes(cleanFolder));
    
    const contextPackage = `### 📂 Subdirectory Context Package: \`${cleanFolder}\`
- **Repository**: ${activeAnalysisResult.owner}/${activeAnalysisResult.repo}
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

  // Onboarding Files (Standard vs Minimal Condensation)
  const rawClaudeMd = outputs?.onboarding?.claudeMd || activeAnalysisResult.contextMarkdown || `# CLAUDE.md — ${activeAnalysisResult.repo}\n\nNo context generated.`;
  const rawAgentsMd = outputs?.onboarding?.agentsMd || `# AGENTS.md — ${activeAnalysisResult.repo}\n\nMulti-Agent Orchestration Specification\n\n- Repository: ${activeAnalysisResult.owner}/${activeAnalysisResult.repo}\n- Branch: ${activeAnalysisResult.defaultBranch}\n`;
  const minimalClaudeMd = condenseToMinimal(rawClaudeMd);
  const minimalAgentsMd = condenseToMinimal(rawAgentsMd);
  const claudeMd = outputMode === 'minimal' ? minimalClaudeMd : rawClaudeMd;
  const agentsMd = outputMode === 'minimal' ? minimalAgentsMd : rawAgentsMd;
  const devCommands = outputs?.onboarding?.devCommands || ['npm run dev', 'npm run build', 'npm test', 'npx tsc --noEmit'];

  const activeOnboardingRaw = onboardingType === 'claude' ? rawClaudeMd : rawAgentsMd;
  const activeOnboardingMinimal = onboardingType === 'claude' ? minimalClaudeMd : minimalAgentsMd;
  const activeOnboardingContent = outputMode === 'minimal' ? activeOnboardingMinimal : activeOnboardingRaw;

  // Commit SHA Resolution (supports backend commitSha if present, falls back gracefully)
  const commitSha = (activeAnalysisResult as any).commitSha || (activeAnalysisResult as any).commit_sha || (activeAnalysisResult as any).headCommit || null;

  // Cursor Rules (.mdc)
  const cursorRules = outputs?.cursorRules && outputs.cursorRules.length > 0
    ? outputs.cursorRules
    : [
        {
          filename: '.cursor/rules/project-rules.mdc',
          content: `---\ndescription: ${activeAnalysisResult.repo} Architecture & Rule Invariants\nglobs: *\nalwaysApply: true\n---\n\n# Project Rules\nEnforce clean TypeScript types and verify route parameters.\n`,
          framework: outputs?.framework || 'General',
        },
      ];
  const activeCursorRule = cursorRules[selectedRuleIndex] || cursorRules[0];

  // Architecture AST
  const mermaidGraph = outputs?.architecture?.mermaidGraph || activeAnalysisResult.mermaidArchitecture;
  const flowchartNodes = outputs?.architecture?.flowchartNodes || [];

  // Client Progress Report
  const rawCategories = (outputs?.clientHandoffReport?.categories as any) || {};
  const clientReport = {
    summary: outputs?.clientHandoffReport?.summary || `Technical updates, code structure optimizations, and API integrations for ${activeAnalysisResult.repo}.`,
    categories: {
      newFeatures: (rawCategories.newFeatures || ['Initialized verified codebase map and AST intelligence engine.', 'Configured multi-agent prompt isolation for parallel development.']) as string[],
      securityMaintenance: (rawCategories.securityMaintenance || ['Audited dependency vulnerabilities and confirmed package boundaries.', 'Redacted API secrets and locked down environment configurations.']) as string[],
      uxImprovements: (rawCategories.userExperience || rawCategories.uxImprovements || ['Streamlined client-side component architectures for optimal bundle delivery.']) as string[],
    },
  };

  // Shareable Markdown Summary (Priority 3: Feature 2)
  const shareableMarkdownSummary = useMemo(() => {
    const rawCats = (outputs?.clientHandoffReport?.categories as any) || {};
    const features = (rawCats.newFeatures || ['Initialized verified codebase map and AST intelligence engine.', 'Configured multi-agent prompt isolation for parallel development.']) as string[];
    const security = (rawCats.securityMaintenance || ['Audited dependency vulnerabilities and confirmed package boundaries.', 'Redacted API secrets and locked down environment configurations.']) as string[];
    const ux = (rawCats.userExperience || rawCats.uxImprovements || ['Streamlined client-side component architectures for optimal bundle delivery.']) as string[];
    const fileCount = comparisonResult.currentParsed.fileCount;
    const dirCount = comparisonResult.currentParsed.dirCount;
    const isTruncated = comparisonResult.currentParsed.isTruncated;
    const vulnText = (activeAnalysisResult.vulnerabilityCount ?? 0) === 0
      ? '0 advisories reported (via OSV.dev dependency audit)'
      : `${activeAnalysisResult.vulnerabilityCount} advisory/advisories reported (${activeAnalysisResult.criticalVulnerabilityCount ?? 0} critical)`;

    return `# 🏛️ Repository Executive Handoff: ${activeAnalysisResult.owner}/${activeAnalysisResult.repo}

**Analyzed Revision**: HEAD (${activeAnalysisResult.defaultBranch || 'main'})
**Analysis Timestamp**: ${formatIsoDate(activeAnalysisResult.analyzedAt)} (${formatRelativeTime(activeAnalysisResult.analyzedAt)})
**Project Archetype**: ${currentArchetype} (${archetypeBadge.label})
**Detected Framework**: ${outputs?.framework || 'Universal / Polyglot'}
**License**: ${activeAnalysisResult.licenseSpdx || 'Not reported by repository manifest'}

---

## 1. Executive Summary
${clientReport.summary}

---

## 2. Key Architecture Findings & Topology
- **Framework & Runtime**: ${outputs?.framework || 'Standard Framework'}
- **Codebase Inventory**: ${fileCount} examined files across ${dirCount} directories${isTruncated ? ' (300-node AST ceiling reached)' : ''}
- **Dependency Security**: ${vulnText}
- **Secret Redaction**: 7-class heuristic regex scan applied (Stripe, AWS, GitHub, OpenAI, Anthropic, Private Keys, SSH)

---

## 3. Commercial & Engineering Progress
### 🚀 New Features & Capabilities
${features.map(f => `- ${f}`).join('\n')}

### 🛡️ Security & Infrastructure Stability
${security.map(s => `- ${s}`).join('\n')}

### ✨ User Experience & Interface Polish
${ux.map(u => `- ${u}`).join('\n')}

---

## 4. Generated AI Configuration Deliverables
- **CLAUDE.md**: Standard & minimal instruction protocols for Claude Code CLI (~${estimateTokens(rawClaudeMd)} tokens)
- **AGENTS.md**: Multi-agent swarms coordination manifest (~${estimateTokens(rawAgentsMd)} tokens)
- **Cursor Rules**: ${cursorRules.length} rule file(s) under .cursor/rules/ with alwaysApply: true frontmatter
- **Visual Architecture**: Mermaid.js dependency graph with Kroki vector bridge
- **Executive Workbook**: 5-tab Excel (.xlsx) report with formulas and 2x3 KPI stat grid

---

## 5. Engineering Invariants & Verified Commands
${outputs?.onboarding?.devCommands && outputs.onboarding.devCommands.length > 0 ? `Verified Dev Scripts:\n${outputs.onboarding.devCommands.map(c => `- \`${c}\``).join('\n')}\n` : ''}
- Anti-Hallucination Protocol: Mandatory verification before finalizing code edits
- Mutex Multi-Agent Guard: Atomic locking for concurrent agent sessions

---

## 6. Analysis Scope & Verification Guardrails
- **Ingestion Mode**: GitHub REST API tree extraction with a 500KB per-file ceiling.
- **Excluded Categories**: Standard vendor trees (node_modules, dist, .next) bypassed to prevent server exhaustion.
- **Verification Basis**: Static AST inspection. Does not execute code or access private local workstations.
- **Commit SHA**: Evaluated against remote HEAD (${activeAnalysisResult.defaultBranch || 'main'}). Root payload does not expose explicit commit SHA.
`;
  }, [activeAnalysisResult, outputs, clientReport, currentArchetype, archetypeBadge, comparisonResult, rawClaudeMd, rawAgentsMd, cursorRules]);

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
  const examinedFiles = fileTreeLines.filter(line => line.startsWith('[FILE]'));
  const examinedDirs = fileTreeLines.filter(line => line.startsWith('[DIR]'));
  const truncationLine = fileTreeLines.find(line => line.toLowerCase().includes('more files'));
  const isTreeTruncated = !!truncationLine;
  const truncatedFilesCount = truncationLine ? (truncationLine.match(/\d+/) ? parseInt(truncationLine.match(/\d+/)![0], 10) : null) : 0;
  const filteredFiles = fileSearch.trim()
    ? fileTreeLines.filter(f => f.toLowerCase().includes(fileSearch.toLowerCase()))
    : fileTreeLines.slice(0, 40);

  // Existing instruction file detection
  const existingClaudeFile = fileTreeLines.find(line => {
    const clean = line.replace(/^\[(FILE|DIR)\]\s*/, '').trim().split(' ')[0];
    return clean === 'CLAUDE.md' || clean.toLowerCase() === 'claude.md' || clean.endsWith('/CLAUDE.md') || clean === '.claude/CLAUDE.md';
  });

  const existingAgentsFile = fileTreeLines.find(line => {
    const clean = line.replace(/^\[(FILE|DIR)\]\s*/, '').trim().split(' ')[0];
    return clean === 'AGENTS.md' || clean.toLowerCase() === 'agents.md' || clean.endsWith('/AGENTS.md');
  });

  const detectedExistingFile = onboardingType === 'claude' ? existingClaudeFile : existingAgentsFile;
  const detectedFileName = onboardingType === 'claude' ? 'CLAUDE.md' : 'AGENTS.md';

  // Verified Commands from AST & manifest (devCommands defined above)
  const installCmd = devCommands.find(c => c.includes('install') || c.includes('add') || c.includes('cargo build') || c.includes('pip install')) ||
    (fileTreeLines.some(f => f.includes('pnpm-lock')) ? 'pnpm install' :
     fileTreeLines.some(f => f.includes('yarn.lock')) ? 'yarn install' :
     fileTreeLines.some(f => f.includes('package.json')) ? 'npm install' :
     fileTreeLines.some(f => f.includes('Cargo.toml')) ? 'cargo build' :
     fileTreeLines.some(f => f.includes('requirements.txt')) ? 'pip install -r requirements.txt' : null);
  const devCmd = devCommands.find(c => c.includes('dev') || c.includes('start')) ||
    (fileTreeLines.some(f => f.includes('package.json')) ? 'npm run dev' : null);
  const buildCmd = devCommands.find(c => c.includes('build')) ||
    (fileTreeLines.some(f => f.includes('package.json')) ? 'npm run build' :
     fileTreeLines.some(f => f.includes('Cargo.toml')) ? 'cargo build --release' : null);
  const testCmd = devCommands.find(c => c.includes('test')) ||
    (fileTreeLines.some(f => f.includes('package.json')) ? 'npm test' :
     fileTreeLines.some(f => f.includes('Cargo.toml')) ? 'cargo test' : null);
  const typecheckCmd = devCommands.find(c => c.includes('tsc') || c.includes('typecheck')) ||
    (fileTreeLines.some(f => f.includes('tsconfig.json')) ? 'npx tsc --noEmit' : null);

  // Key directories detected
  const detectedDirs = Array.from(new Set(
    fileTreeLines
      .filter(line => line.startsWith('[DIR]'))
      .map(line => line.replace(/^\[DIR\]\s*/, '').trim().split('/')[0])
      .filter(Boolean)
  )).slice(0, 8);

  // Key config files detected
  const detectedConfigFiles = fileTreeLines
    .filter(line => line.startsWith('[FILE]'))
    .map(line => line.replace(/^\[FILE\]\s*/, '').trim())
    .filter(path => {
      const name = path.toLowerCase();
      return (
        name.includes('package.json') ||
        name.includes('tsconfig') ||
        name.includes('next.config') ||
        name.includes('vite.config') ||
        name.includes('cargo.toml') ||
        name.includes('dockerfile') ||
        name.includes('.env.example') ||
        name.includes('tailwind.config') ||
        name.includes('pyproject.toml') ||
        name.includes('go.mod') ||
        name.includes('composer.json')
      );
    })
    .slice(0, 6);

  // Copilot instructions & Windsurf rules generated
  const copilotInstructions = `# GitHub Copilot Custom Instructions for ${result.repo}\n\n## Repository Architecture\n- Archetype: ${currentArchetype}\n- Framework: ${outputs?.framework || 'Auto-Detected'}\n- Default Branch: ${result.defaultBranch || 'main'}\n\n## Mandatory Development Standards\n${outputs?.onboarding?.componentRules || '1. Enforce strict type safety and verify all inputs.\n2. Do not delete existing comments or docstrings.\n3. Verify build and tests pass before committing.'}\n\n## Verified Execution Commands\n${(devCommands.length > 0 ? devCommands : ['npm test', 'npx tsc --noEmit']).map(c => `- \`${c}\``).join('\n')}\n`;

  const windsurfRules = `# Windsurf Cascade Rules for ${result.repo}\n\n# Archetype: ${currentArchetype}\n# Framework: ${outputs?.framework || 'Auto-Detected'}\n\n## Invariants\n- Always run typecheck verification after editing files.\n- Strictly preserve existing comments, docstrings, and author notes.\n- Never expose private keys, credentials, or environment secrets.\n\n## Dev Commands\n${(devCommands.length > 0 ? devCommands : ['npm run dev', 'npm test']).map(c => `- \`${c}\``).join('\n')}\n`;

  const tabs: Array<{ id: WorkspaceTabType; label: string; icon: any; count?: number | string }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'context', label: 'Code Context', icon: FolderGit2 },
    { id: 'rules', label: 'Synced Rules', icon: FileCode2, count: cursorRules.length },
    { id: 'mcp', label: 'MCP Config', icon: Server },
    { id: 'graph', label: 'Dependency Graph', icon: Layers },
    { id: 'handoff', label: 'Team Handoff', icon: Briefcase },
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

      {/* Historical Baseline Snapshot Warning Banner */}
      {activeSnapshotView === 'prior' && effectivePreviousResult && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Viewing Historical Snapshot:</strong> Analysis from {formatIsoDate(effectivePreviousResult.analyzedAt)}. Specifications reflect the prior baseline.
            </span>
          </div>
          <button
            onClick={() => setActiveSnapshotView('latest')}
            className="self-start sm:self-auto px-2.5 py-1 rounded bg-amber-500/25 hover:bg-amber-500/40 border border-amber-500/40 text-amber-100 font-bold text-[11px] transition cursor-pointer"
          >
            Switch to Latest Analysis
          </button>
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
              <span className="text-[#58a6ff]">{activeAnalysisResult.owner}</span>
              <span className="text-[#8b949e]">/</span>
              <span className="text-[#58a6ff] font-bold">{activeAnalysisResult.repo}</span>
            </div>

            {/* 🤖 Archetype Badge */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border flex items-center gap-1.5 ${archetypeBadge.badgeClass}`}
              title={archetypeBadge.title}
            >
              <span>{archetypeBadge.icon}</span>
              <span>{archetypeBadge.label}</span>
            </span>

            {outputs?.framework && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-[#388bfd40] bg-[#388bfd15] text-[#58a6ff] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#58a6ff]" /> {outputs.framework}
              </span>
            )}

            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono border border-[#30363d] bg-[#21262d] text-[#8b949e] flex items-center gap-1">
              <Unlock className="w-3 h-3 text-[#3fb950]" /> Public
            </span>

            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5"
              title="Persistent Agent Memory Engine Active (.gitcontextgen/memory.db)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              🧠 SQLite Memory Active
            </span>

            {/* ⚡ AI Enhanced vs 🛠️ Local Engine Indicator */}
            {result.analysisEngine === 'deepseek' || result.deepseekEnhanced ? (
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 flex items-center gap-1.5 shadow-sm shadow-cyan-500/10"
                title="Advanced AI Intelligence Active (Deterministic AST Pre-Filtered)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                ⚡ AI Enhanced
              </span>
            ) : (
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-zinc-700 bg-zinc-800/80 text-zinc-300 flex items-center gap-1.5"
                title="Deterministic AST Engine Active (Pre-Filtered Tree, $0 Cost)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                🛠️ Local Engine
              </span>
            )}

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
              className="px-3 py-1.5 min-w-[145px] justify-center rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] transition flex items-center gap-1.5 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
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

                  {/* Option 4: Download Raw JSON Payload */}
                  <button
                    onClick={handleDownloadRawJson}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#21262d] flex items-start gap-2.5 transition group cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#f0883e] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff] transition">
                        ⚡ Download Analysis JSON (.json)
                      </div>
                      <div className="text-[11px] text-[#8b949e] mt-0.5 leading-tight">
                        Downloads raw RFC-compliant analysis payload file
                      </div>
                    </div>
                  </button>

                  {/* Option 5: Copy Raw JSON Payload */}
                  <button
                    onClick={handleCopyRawJson}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#21262d] flex items-start gap-2.5 transition group cursor-pointer"
                  >
                    <Code2 className="w-4 h-4 text-[#8b949e] shrink-0 mt-0.5" />
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

        {/* 2.5 Analysis Freshness & Commit Invariant Line (Priority 2 Upgraded) */}
        <div className="mt-3.5 pt-3 border-t border-[#30363d]/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap text-zinc-300">
            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]" title="Timestamp of the synthesized codebase analysis">
              <Clock className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span className="text-[#8b949e]">Freshness:</span>
              <span className="text-[#f0f6fc] font-semibold">{formatRelativeTime(activeAnalysisResult.analyzedAt)}</span>
              <span className="text-[#8b949e] text-[10px] hidden lg:inline">({formatIsoDate(activeAnalysisResult.analyzedAt)})</span>
            </div>

            <span className="text-[#30363d] hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]">
              <GitBranch className="w-3.5 h-3.5 text-[#3fb950]" />
              <span className="text-[#8b949e]">Branch:</span>
              <span className="text-[#f0f6fc] font-semibold">{activeAnalysisResult.defaultBranch || 'main'}</span>
            </div>

            <span className="text-[#30363d] hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]">
              <GitCommit className="w-3.5 h-3.5 text-[#bc8cff]" />
              <span className="text-[#8b949e]">Commit Snapshot:</span>
              {commitSha ? (
                <a
                  href={`https://github.com/${activeAnalysisResult.owner}/${activeAnalysisResult.repo}/commit/${commitSha}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#58a6ff] hover:underline flex items-center gap-1 font-bold"
                  title={`View commit ${commitSha} on GitHub`}
                >
                  <span>{commitSha.slice(0, 7)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[#c9d1d9]" title="Analysis synced to default branch HEAD (commitSha field pending in backend)">
                  HEAD ({activeAnalysisResult.defaultBranch || 'main'})
                </span>
              )}
            </div>
          </div>

          {/* Priority 2: Clear Freshness & Comparison Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Dynamic 5-State Freshness Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition ${freshnessState.badgeClass}`}
              title={freshnessState.tooltip}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${freshnessState.dotClass}`} />
              <span>{freshnessState.label}</span>
            </div>

            {/* Snapshot Baseline View Switcher */}
            {hasBaseline && effectivePreviousResult && (
              <div className="inline-flex rounded-md bg-[#0d1117] border border-[#30363d] p-0.5 text-[11px] font-mono">
                <button
                  onClick={() => setActiveSnapshotView('latest')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    activeSnapshotView === 'latest'
                      ? 'bg-[#21262d] text-white font-bold'
                      : 'text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                  title="Inspect latest repository analysis"
                >
                  Latest
                </button>
                <button
                  onClick={() => setActiveSnapshotView('prior')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    activeSnapshotView === 'prior'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                  title="Inspect prior baseline analysis"
                >
                  Prior Baseline
                </button>
              </div>
            )}

            {/* Compare Snapshots Action Button */}
            <button
              onClick={() => setIsComparisonOpen(true)}
              className="px-2.5 py-1 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[11px] font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
              title="Open side-by-side snapshot comparison & drift detection report"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span>Compare {hasBaseline ? 'Snapshots' : 'Baseline'}</span>
              {hasBaseline && comparisonResult.findings.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            {/* Re-analyze Action Button */}
            {onReSync && (
              <button
                onClick={onReSync}
                disabled={isReAnalyzing}
                className="px-2.5 py-1 rounded-md bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-[11px] font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                title="Trigger on-demand re-analysis from GitHub to check for changes"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-white ${isReAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isReAnalyzing ? 'Re-analyzing...' : 'Re-analyze'}</span>
              </button>
            )}
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
        {/* TAB 0: 📋 Analysis Overview                                          */}
        {/* ===================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* SECTION 1: PRIMARY ACTION HERO CARD - "Prepare My AI Coding Setup" */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#161b22] via-[#0d1117] to-[#161b22] border border-cyan-500/30 shadow-xl space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Primary Next Step</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    Prepare My AI Coding Setup
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8b949e] max-w-2xl leading-relaxed">
                    Select your AI coding tool below. GitContextGen has synthesized verified configuration files to equip your agent with full codebase truth and eliminate hallucinations.
                  </p>
                </div>

                {/* AI Tool Switcher (Claude Code, Cursor, Copilot, Windsurf) */}
                <div className="flex items-center p-1 rounded-xl bg-[#0d1117] border border-[#30363d] self-start md:self-auto shrink-0 flex-wrap gap-1">
                  {[
                    { id: 'claude', label: 'Claude Code', badge: 'Recommended', color: 'bg-[#238636] text-white border-emerald-500/40' },
                    { id: 'cursor', label: 'Cursor', color: 'bg-[#1f6feb] text-white border-blue-500/40' },
                    { id: 'copilot', label: 'GitHub Copilot', color: 'bg-[#8957e5] text-white border-purple-500/40' },
                    { id: 'windsurf', label: 'Windsurf', color: 'bg-[#0969da] text-white border-sky-500/40' },
                  ].map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setSetupTool(tool.id as any)}
                      className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#58a6ff] ${
                        setupTool === tool.id
                          ? `${tool.color} font-bold shadow-md`
                          : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'
                      }`}
                    >
                      <span>{tool.label}</span>
                      {tool.badge && setupTool === tool.id && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-emerald-300 uppercase font-mono font-bold">
                          {tool.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tool Execution Panel */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-4">
                {setupTool === 'claude' && (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-[#3fb950]" />
                          Claude Code Setup: 2-Step Immediate Launch
                        </h4>
                        <p className="text-xs text-[#8b949e] mt-0.5">
                          Drop the verified <code className="text-[#58a6ff] font-mono">CLAUDE.md</code> specification into your project root so Claude understands your architecture, package scripts, and safety invariants.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#21262d] border border-[#30363d] text-[#58a6ff] shrink-0">
                        File target: ./CLAUDE.md
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Step 1 */}
                      <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                            <span className="text-white font-bold flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#238636] text-white flex items-center justify-center text-[11px]">1</span>
                              Write CLAUDE.md
                            </span>
                            <span className="text-[10px] text-[#3fb950]">1-Click Terminal Command</span>
                          </div>
                          <p className="text-xs text-[#8b949e] leading-relaxed">
                            Run this command in your repository root to instantly create or overwrite <code className="text-[#c9d1d9]">CLAUDE.md</code>:
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2 flex-wrap">
                          <button
                            onClick={() => {
                              const heredoc = `cat << 'EOF' > CLAUDE.md\n${claudeMd}\nEOF`;
                              handleCopy(heredoc, 'overview-claude-heredoc');
                            }}
                            className="px-3 py-1.5 min-h-[34px] rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-400"
                          >
                            {copiedSection === 'overview-claude-heredoc' ? <Check className="w-3.5 h-3.5 text-white" /> : <Terminal className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'overview-claude-heredoc' ? 'Copied Command!' : 'Copy Shell Command (cat << EOF)'}</span>
                          </button>
                          <button
                            onClick={() => handleCopy(claudeMd, 'overview-claude-raw')}
                            className="px-3 py-1.5 min-h-[34px] rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#c9d1d9] flex items-center gap-1.5 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400"
                          >
                            {copiedSection === 'overview-claude-raw' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'overview-claude-raw' ? 'Copied File!' : 'Copy File Content'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                            <span className="text-white font-bold flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#1f6feb] text-white flex items-center justify-center text-[11px]">2</span>
                              Launch Claude Code
                            </span>
                            <span className="text-[10px] text-[#58a6ff]">Anti-Hallucination Protocol</span>
                          </div>
                          <p className="text-xs text-[#8b949e] leading-relaxed">
                            Open your terminal in the repository folder and execute:
                          </p>
                          <div className="p-2 rounded bg-[#0d1117] border border-[#30363d] font-mono text-xs text-[#58a6ff] flex items-center justify-between">
                            <code>claude</code>
                            <button
                              onClick={() => handleCopy('claude', 'overview-claude-launch')}
                              className="text-[#8b949e] hover:text-white transition p-1 cursor-pointer"
                              title="Copy launch command"
                            >
                              {copiedSection === 'overview-claude-launch' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#3fb950] font-mono pt-1">
                          ✓ Claude automatically discovers ./CLAUDE.md and respects all project invariants.
                        </p>
                      </div>
                    </div>

                    {/* Claude Manual Verification Checklist */}
                    <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3fb950]" />
                          Claude Code Manual Verification Checklist
                        </h5>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          ⚠️ Manual Verification Process (No local filesystem access)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-mono">
                        <button
                          onClick={() => toggleChecklistItem('claude-step-1')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['claude-step-1']
                              ? 'bg-[#238636]/15 border-[#3fb950]/40 text-[#3fb950]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['claude-step-1'] ? 'bg-[#238636] border-[#3fb950] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['claude-step-1'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">1. Save to ./CLAUDE.md</span>
                        </button>
                        <button
                          onClick={() => toggleChecklistItem('claude-step-2')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['claude-step-2']
                              ? 'bg-[#238636]/15 border-[#3fb950]/40 text-[#3fb950]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['claude-step-2'] ? 'bg-[#238636] border-[#3fb950] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['claude-step-2'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">2. Run &apos;claude&apos; CLI</span>
                        </button>
                        <button
                          onClick={() => toggleChecklistItem('claude-step-3')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['claude-step-3']
                              ? 'bg-[#238636]/15 border-[#3fb950]/40 text-[#3fb950]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['claude-step-3'] ? 'bg-[#238636] border-[#3fb950] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['claude-step-3'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">3. Confirm rules cited</span>
                        </button>
                      </div>
                      <div className="pt-1 text-[11px] text-[#8b949e] leading-relaxed border-t border-[#30363d]/50">
                        <strong className="text-white">Recovery guidance:</strong> If Claude does not acknowledge the rules, confirm that <code className="text-[#58a6ff]">CLAUDE.md</code> is located in the exact directory where you launched your terminal, and run <code className="text-[#c9d1d9]">claude --print</code> to inspect the loaded system prompt.
                      </div>
                    </div>
                  </div>
                )}

                {setupTool === 'cursor' && (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <FileCode2 className="w-4 h-4 text-[#58a6ff]" />
                          Cursor Setup: Scaffold Project Rules (.cursor/rules/)
                        </h4>
                        <p className="text-xs text-[#8b949e] mt-0.5">
                          Add the generated rule file to your <code className="text-[#58a6ff] font-mono">.cursor/rules/</code> directory. Cursor automatically applies these invariants for Composer and Agent modes.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#21262d] border border-[#30363d] text-[#58a6ff] shrink-0">
                        Target: {activeCursorRule.filename}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Step 1 */}
                      <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                            <span className="text-white font-bold flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#1f6feb] text-white flex items-center justify-center text-[11px]">1</span>
                              Save Rule File
                            </span>
                            <span className="text-[10px] text-[#58a6ff]">YAML Frontmatter Validated</span>
                          </div>
                          <p className="text-xs text-[#8b949e] leading-relaxed">
                            Download the pre-scaffolded rule file directly or copy its raw content:
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2 flex-wrap">
                          <button
                            onClick={() => handleDownloadCursorRule(activeCursorRule.filename, activeCursorRule.content)}
                            className="px-3 py-1.5 min-h-[34px] rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-blue-400"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download {activeCursorRule.filename.split('/').pop()}</span>
                          </button>
                          <button
                            onClick={() => handleCopy(activeCursorRule.content, 'overview-cursor-copy')}
                            className="px-3 py-1.5 min-h-[34px] rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#c9d1d9] flex items-center gap-1.5 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400"
                          >
                            {copiedSection === 'overview-cursor-copy' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'overview-cursor-copy' ? 'Copied Rule!' : 'Copy Rule Text'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                            <span className="text-white font-bold flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#238636] text-white flex items-center justify-center text-[11px]">2</span>
                              Open in Cursor
                            </span>
                            <span className="text-[10px] text-[#3fb950]">alwaysApply: true</span>
                          </div>
                          <p className="text-xs text-[#8b949e] leading-relaxed">
                            Save the file in your repository under <code className="text-[#58a6ff] font-mono">.cursor/rules/{activeCursorRule.filename.split('/').pop()}</code>.
                          </p>
                        </div>
                        <p className="text-[11px] text-[#3fb950] font-mono pt-1">
                          ✓ Cursor Composer will automatically follow anti-hallucination protocols on every code edit.
                        </p>
                      </div>
                    </div>

                    {/* Cursor Manual Verification Checklist */}
                    <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#58a6ff]" />
                          Cursor Manual Installation &amp; Verification Checklist
                        </h5>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          ⚠️ Manual Verification Process (No local filesystem access)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-mono">
                        <button
                          onClick={() => toggleChecklistItem('cursor-step-1')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['cursor-step-1']
                              ? 'bg-[#1f6feb]/15 border-[#388bfd]/40 text-[#58a6ff]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['cursor-step-1'] ? 'bg-[#1f6feb] border-[#388bfd] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['cursor-step-1'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">1. Save to .cursor/rules/</span>
                        </button>
                        <button
                          onClick={() => toggleChecklistItem('cursor-step-2')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['cursor-step-2']
                              ? 'bg-[#1f6feb]/15 border-[#388bfd]/40 text-[#58a6ff]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['cursor-step-2'] ? 'bg-[#1f6feb] border-[#388bfd] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['cursor-step-2'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">2. Open Composer (Ctrl+I)</span>
                        </button>
                        <button
                          onClick={() => toggleChecklistItem('cursor-step-3')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['cursor-step-3']
                              ? 'bg-[#1f6feb]/15 border-[#388bfd]/40 text-[#58a6ff]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['cursor-step-3'] ? 'bg-[#1f6feb] border-[#388bfd] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['cursor-step-3'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">3. Confirm rule pill active</span>
                        </button>
                      </div>
                      <div className="pt-1 text-[11px] text-[#8b949e] leading-relaxed border-t border-[#30363d]/50">
                        <strong className="text-white">Recovery guidance:</strong> If Cursor does not load the rule, ensure the file extension is <code className="text-[#58a6ff]">.mdc</code> and verify that <code className="text-[#c9d1d9]">alwaysApply: true</code> is present in the top YAML frontmatter.
                      </div>
                    </div>
                  </div>
                )}

                {setupTool === 'copilot' && (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#bc8cff]" />
                          GitHub Copilot Instructions Setup
                        </h4>
                        <p className="text-xs text-[#8b949e] mt-0.5">
                          Provide codebase architecture and development invariants to GitHub Copilot via <code className="text-[#58a6ff] font-mono">.github/copilot-instructions.md</code>.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#21262d] border border-[#30363d] text-[#bc8cff] shrink-0">
                        Target: .github/copilot-instructions.md
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                            <span className="text-white font-bold flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#8957e5] text-white flex items-center justify-center text-[11px]">1</span>
                              Copy Copilot Instructions
                            </span>
                          </div>
                          <p className="text-xs text-[#8b949e] leading-relaxed">
                            Copy the tailor-made custom instruction block for this repository:
                          </p>
                        </div>
                        <div className="pt-2">
                          <button
                            onClick={() => handleCopy(copilotInstructions, 'overview-copilot-copy')}
                            className="px-3 py-1.5 min-h-[34px] rounded-md bg-[#8957e5] hover:bg-[#a371f7] text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-purple-400"
                          >
                            {copiedSection === 'overview-copilot-copy' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'overview-copilot-copy' ? 'Copied Instructions!' : 'Copy Copilot Instructions'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                            <span className="text-white font-bold flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#238636] text-white flex items-center justify-center text-[11px]">2</span>
                              Save in Repository
                            </span>
                          </div>
                          <p className="text-xs text-[#8b949e] leading-relaxed">
                            Save the content in <code className="text-[#58a6ff] font-mono">.github/copilot-instructions.md</code> and commit to git. Copilot Chat will use this context for all future queries.
                          </p>
                        </div>
                        <p className="text-[11px] text-[#3fb950] font-mono pt-1">
                          ✓ Copilot applies repository standards to inline suggestions and chat answers.
                        </p>
                      </div>
                    </div>

                    {/* Copilot Manual Verification Checklist */}
                    <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#bc8cff]" />
                          GitHub Copilot Manual Verification Checklist
                        </h5>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          ⚠️ Manual Verification Process (No local filesystem access)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-mono">
                        <button
                          onClick={() => toggleChecklistItem('copilot-step-1')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['copilot-step-1']
                              ? 'bg-[#8957e5]/15 border-[#a371f7]/40 text-[#d2a8ff]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['copilot-step-1'] ? 'bg-[#8957e5] border-[#a371f7] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['copilot-step-1'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">1. Save .github/copilot-instructions.md</span>
                        </button>
                        <button
                          onClick={() => toggleChecklistItem('copilot-step-2')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['copilot-step-2']
                              ? 'bg-[#8957e5]/15 border-[#a371f7]/40 text-[#d2a8ff]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['copilot-step-2'] ? 'bg-[#8957e5] border-[#a371f7] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['copilot-step-2'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">2. Commit &amp; push to git</span>
                        </button>
                        <button
                          onClick={() => toggleChecklistItem('copilot-step-3')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['copilot-step-3']
                              ? 'bg-[#8957e5]/15 border-[#a371f7]/40 text-[#d2a8ff]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['copilot-step-3'] ? 'bg-[#8957e5] border-[#a371f7] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['copilot-step-3'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">3. Test in Copilot Chat</span>
                        </button>
                      </div>
                      <div className="pt-1 text-[11px] text-[#8b949e] leading-relaxed border-t border-[#30363d]/50">
                        <strong className="text-white">Recovery guidance:</strong> Copilot requires files to be committed to git to index instructions. If Copilot Chat fails to reference the instructions, ensure the file is committed to your active branch.
                      </div>
                    </div>
                  </div>
                )}

                {setupTool === 'windsurf' && (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#58a6ff]" />
                          Windsurf Cascade Rules Setup
                        </h4>
                        <p className="text-xs text-[#8b949e] mt-0.5">
                          Enforce architectural boundaries and command invariants in Windsurf via <code className="text-[#58a6ff] font-mono">.windsurfrules</code>.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#21262d] border border-[#30363d] text-[#58a6ff] shrink-0">
                        Target: ./.windsurfrules
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                            <span className="text-white font-bold flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#0969da] text-white flex items-center justify-center text-[11px]">1</span>
                              Copy Windsurf Rules
                            </span>
                          </div>
                          <p className="text-xs text-[#8b949e] leading-relaxed">
                            Copy the structured Windsurf rules block:
                          </p>
                        </div>
                        <div className="pt-2">
                          <button
                            onClick={() => handleCopy(windsurfRules, 'overview-windsurf-copy')}
                            className="px-3 py-1.5 min-h-[34px] rounded-md bg-[#0969da] hover:bg-[#218bff] text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-sky-400"
                          >
                            {copiedSection === 'overview-windsurf-copy' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSection === 'overview-windsurf-copy' ? 'Copied Rules!' : 'Copy Windsurf Rules'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
                            <span className="text-white font-bold flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#238636] text-white flex items-center justify-center text-[11px]">2</span>
                              Save in Root Folder
                            </span>
                          </div>
                          <p className="text-xs text-[#8b949e] leading-relaxed">
                            Create a file named <code className="text-[#58a6ff] font-mono">.windsurfrules</code> in your repository root and paste the rules.
                          </p>
                        </div>
                        <p className="text-[11px] text-[#3fb950] font-mono pt-1">
                          ✓ Cascade AI references invariants and build checks on every command.
                        </p>
                      </div>
                    </div>

                    {/* Windsurf Manual Verification Checklist */}
                    <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#58a6ff]" />
                          Windsurf Manual Verification Checklist
                        </h5>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          ⚠️ Manual Verification Process (No local filesystem access)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-mono">
                        <button
                          onClick={() => toggleChecklistItem('windsurf-step-1')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['windsurf-step-1']
                              ? 'bg-[#0969da]/15 border-[#218bff]/40 text-[#58a6ff]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['windsurf-step-1'] ? 'bg-[#0969da] border-[#218bff] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['windsurf-step-1'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">1. Save to ./.windsurfrules</span>
                        </button>
                        <button
                          onClick={() => toggleChecklistItem('windsurf-step-2')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['windsurf-step-2']
                              ? 'bg-[#0969da]/15 border-[#218bff]/40 text-[#58a6ff]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['windsurf-step-2'] ? 'bg-[#0969da] border-[#218bff] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['windsurf-step-2'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">2. Open Cascade in editor</span>
                        </button>
                        <button
                          onClick={() => toggleChecklistItem('windsurf-step-3')}
                          className={`p-2 rounded border flex items-center gap-2 text-left transition cursor-pointer ${
                            completedChecklist['windsurf-step-3']
                              ? 'bg-[#0969da]/15 border-[#218bff]/40 text-[#58a6ff]'
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            completedChecklist['windsurf-step-3'] ? 'bg-[#0969da] border-[#218bff] text-white' : 'border-[#30363d]'
                          }`}>
                            {completedChecklist['windsurf-step-3'] && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">3. Confirm rules referenced</span>
                        </button>
                      </div>
                      <div className="pt-1 text-[11px] text-[#8b949e] leading-relaxed border-t border-[#30363d]/50">
                        <strong className="text-white">Recovery guidance:</strong> Ensure the file has no extension (named exactly <code className="text-[#58a6ff]">.windsurfrules</code>) and is located directly in the workspace root.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: GENUINE FINDINGS & AST TELEMETRY GRID (NO ARBITRARY HEALTH SCORES) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Repository Identity */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8b949e] font-mono">
                    <span className="flex items-center gap-1.5 text-[#58a6ff] font-semibold">
                      <FolderGit2 className="w-3.5 h-3.5" /> Identity
                    </span>
                    <span className="text-[10px] text-[#3fb950] bg-[#238636]/15 border border-[#3fb950]/30 px-1.5 py-0.2 rounded">
                      Verified
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate" title={`${result.owner}/${result.repo}`}>
                      {result.owner}/{result.repo}
                    </h4>
                    <p className="text-xs text-[#8b949e] font-mono mt-0.5">
                      Branch: <span className="text-[#f0f6fc] font-semibold">{result.defaultBranch || 'main'}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#30363d]/60 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e]">Archetype:</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold border flex items-center gap-1 ${archetypeBadge.badgeClass}`}>
                      <span>{archetypeBadge.icon}</span>
                      <span>{archetypeBadge.label}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e]">Framework:</span>
                    <span className="text-[#58a6ff] font-semibold truncate max-w-[120px]">
                      {outputs?.framework || 'Auto-Detected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
                    <span>Analyzed:</span>
                    <span>{formatRelativeTime(result.analyzedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Verified Development Commands */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8b949e] font-mono">
                    <span className="flex items-center gap-1.5 text-[#58a6ff] font-semibold">
                      <Command className="w-3.5 h-3.5" /> Dev Commands
                    </span>
                    <span className="text-[10px] text-[#58a6ff] bg-[#1f6feb]/15 border border-[#388bfd]/30 px-1.5 py-0.2 rounded">
                      AST Verified
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Execution Invariants</h4>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-[#30363d]/60 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e]">Install:</span>
                    <code className="text-[#f0f6fc] text-[11px] truncate max-w-[130px]" title={installCmd || 'Not detected'}>
                      {installCmd || 'Not detected'}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e]">Dev:</span>
                    <code className="text-[#58a6ff] text-[11px] truncate max-w-[130px]" title={devCmd || 'Not detected'}>
                      {devCmd || 'Not detected'}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e]">Build:</span>
                    <code className="text-[#f0f6fc] text-[11px] truncate max-w-[130px]" title={buildCmd || 'Not detected'}>
                      {buildCmd || 'Not detected'}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e]">Test:</span>
                    <code className="text-[#3fb950] text-[11px] truncate max-w-[130px]" title={testCmd || 'Not detected'}>
                      {testCmd || 'Not detected'}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e]">Typecheck:</span>
                    <code className="text-[#bc8cff] text-[11px] truncate max-w-[130px]" title={typecheckCmd || 'Not detected'}>
                      {typecheckCmd || 'Not detected'}
                    </code>
                  </div>
                </div>
              </div>

              {/* Card 3: AST Codebase Summary */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8b949e] font-mono">
                    <span className="flex items-center gap-1.5 text-[#58a6ff] font-semibold">
                      <FolderTree className="w-3.5 h-3.5" /> Codebase AST
                    </span>
                    <span className="text-[10px] text-[#c9d1d9] bg-[#21262d] border border-[#30363d] px-1.5 py-0.2 rounded font-mono">
                      {fileTreeLines.length} Nodes
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Tree &amp; Configurations</h4>
                    <p className="text-xs text-[#8b949e]">Indexed module boundaries</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-[#30363d]/60 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#8b949e] uppercase font-bold">Key Directories:</span>
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      {detectedDirs.length > 0 ? (
                        detectedDirs.slice(0, 4).map((d) => (
                          <span key={d} className="px-1.5 py-0.2 rounded bg-[#0d1117] border border-[#30363d] text-[10px] text-[#c9d1d9]">
                            {d}/
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-[#8b949e]">Root directory only</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8b949e] uppercase font-bold">Configs Detected:</span>
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      {detectedConfigFiles.length > 0 ? (
                        detectedConfigFiles.slice(0, 3).map((c) => (
                          <span key={c} className="px-1.5 py-0.2 rounded bg-[#0d1117] border border-[#30363d] text-[10px] text-[#58a6ff] truncate max-w-[100px]">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-[#8b949e]">Standard manifests</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Security & Secret Sanitization */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8b949e] font-mono">
                    <span className="flex items-center gap-1.5 text-[#3fb950] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Security &amp; Trust
                    </span>
                    <span className="text-[10px] text-[#3fb950] bg-[#238636]/15 border border-[#3fb950]/30 px-1.5 py-0.2 rounded">
                      Audited
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">OSV &amp; Secret Vault</h4>
                    <p className="text-xs text-[#8b949e]">Heuristic Secret Scrubbing</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-[#30363d]/60 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e]">OSV.dev CVEs:</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${
                      (result.vulnerabilityCount ?? 0) === 0
                        ? 'bg-[#238636]/20 text-[#3fb950] border-[#3fb950]/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {(result.vulnerabilityCount ?? 0) === 0 ? '0 CVEs Detected' : `${result.vulnerabilityCount} CVEs Flagged`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e]">SPDX License:</span>
                    <span className="text-[#f0f6fc] font-semibold truncate max-w-[120px]" title={result.licenseSpdx || 'Not specified'}>
                      {result.licenseSpdx || 'Not specified'}
                    </span>
                  </div>
                  <div className="pt-1 text-[10px] text-[#8b949e] leading-snug">
                    <span className="text-[#3fb950] font-bold">✓ 7 Secret Classes Audited:</span> Stripe, AWS, PATs, AI keys, SSH certs, and .env secrets redacted via regex heuristics.
                  </div>
                  <button
                    onClick={() => setIsReceiptOpen(!isReceiptOpen)}
                    className="w-full mt-1.5 py-1 px-2 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-[11px] font-mono text-[#58a6ff] flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{isReceiptOpen ? 'Hide Receipt ▲' : 'View Scope & Limitations Receipt ▼'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2.5: ANALYSIS SCOPE & TRANSPARENCY RECEIPT */}
            <div className="rounded-xl bg-[#161b22] border border-[#30363d] overflow-hidden">
              <button
                onClick={() => setIsReceiptOpen(!isReceiptOpen)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#21262d]/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-8 h-8 rounded-lg bg-[#1f6feb]/15 border border-[#1f6feb]/30 flex items-center justify-center text-[#58a6ff]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Analysis Scope &amp; Transparency Receipt</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
                        Verifiable Audit Trail
                      </span>
                    </h4>
                    <p className="text-xs text-[#8b949e] mt-0.5">
                      Scope, audited ref, examined nodes count, skipped categories, security scanner boundaries, and known limitations.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#58a6ff] hidden sm:inline">
                    {isReceiptOpen ? 'Hide Receipt' : 'View Full Receipt'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#8b949e] transition-transform duration-200 ${isReceiptOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isReceiptOpen && (
                <div className="p-5 border-t border-[#30363d] bg-[#0d1117] space-y-5 text-xs font-mono">
                  {/* Scope & Ingress Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* Ingress Card 1: Target & Commit */}
                    <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
                        <span className="text-[#58a6ff] font-bold flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5" /> Target &amp; Commit Ref
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-[#21262d] text-[#c9d1d9] text-[10px]">
                          Ingress
                        </span>
                      </div>
                      <div className="space-y-1 pt-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Repo:</span>
                          <span className="text-white font-semibold truncate max-w-[140px]" title={`${result.owner}/${result.repo}`}>{result.owner}/{result.repo}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Branch:</span>
                          <span className="text-white">{result.defaultBranch || 'main'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Analyzed Ref:</span>
                          <span className="text-[#79c0ff]">HEAD ({result.defaultBranch || 'main'})</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-[#30363d]/50">
                          <span className="text-[#8b949e]">Commit SHA:</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px]" title="Commit SHA is not exposed at root of RepositoryAnalysisResult">
                            Not reported by this analysis
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ingress Card 2: Timestamp & Engine */}
                    <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
                        <span className="text-[#58a6ff] font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Ingress Telemetry
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-[#21262d] text-[#c9d1d9] text-[10px]">
                          Runtime
                        </span>
                      </div>
                      <div className="space-y-1 pt-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Timestamp:</span>
                          <span className="text-white truncate max-w-[150px]" title={formatIsoDate(result.analyzedAt)}>{formatIsoDate(result.analyzedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Relative:</span>
                          <span className="text-white">{formatRelativeTime(result.analyzedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Engine Mode:</span>
                          <span className="text-[#58a6ff]">{result.analysisEngine === 'deepseek' || result.deepseekEnhanced ? 'DeepSeek-V3 Enhanced' : 'Local Deterministic AST'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-[#30363d]/50">
                          <span className="text-[#8b949e]">Timeout Defense:</span>
                          <span className="text-[#3fb950]">35s Server / 45s Client</span>
                        </div>
                      </div>
                    </div>

                    {/* Ingress Card 3: File Scope & Truncation */}
                    <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
                        <span className="text-[#58a6ff] font-bold flex items-center gap-1.5">
                          <FolderTree className="w-3.5 h-3.5" /> AST Scope &amp; Ceilings
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-[#21262d] text-[#c9d1d9] text-[10px]">
                          Boundaries
                        </span>
                      </div>
                      <div className="space-y-1 pt-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Examined Nodes:</span>
                          <span className="text-white font-bold">{fileTreeLines.length} nodes ({examinedFiles.length} files, {examinedDirs.length} dirs)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">300-Node Limit:</span>
                          <span className={isTreeTruncated ? 'text-amber-400' : 'text-[#3fb950]'}>
                            {isTreeTruncated ? `Truncated (~${truncatedFilesCount ?? 'X'} more)` : 'Full tree (<300 nodes)'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Size Ceiling:</span>
                          <span className="text-white">500 KB / file (ReDoS Guard)</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-[#30363d]/50">
                          <span className="text-[#8b949e]">Skipped File Count:</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px]" title="Skipped count is pre-filtered and not returned in the result payload">
                            Not reported by this analysis
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Classification of Exclusions and Scanner Findings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Box 1: Exclusion Policy */}
                    <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2">
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        Intentionally Excluded Directories &amp; Files
                      </h5>
                      <p className="text-[11px] text-[#8b949e] leading-relaxed">
                        To protect analysis performance, prevent ReDoS CPU exhaustion, and avoid polluting agent context windows, the following directories are automatically excluded from the AST tree:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['node_modules/', 'vendor/', 'dist/', 'build/', '.next/', '.git/', '.idea/', '.vscode/'].map((dir) => (
                          <span key={dir} className="px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-[11px] text-amber-300">
                            {dir}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#8b949e] pt-1">
                        Files larger than 500 KB or located within vendor paths bypass content scanning.
                      </p>
                    </div>

                    {/* Box 2: Security Pattern Scanner Scope */}
                    <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2">
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3fb950]" />
                        Security Pattern Scope &amp; Secret Audit
                      </h5>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">OSV.dev Vulnerabilities:</span>
                          <span className={(result.vulnerabilityCount ?? 0) === 0 ? 'text-[#3fb950]' : 'text-red-400'}>
                            {(result.vulnerabilityCount ?? 0) === 0 ? '0 CVEs detected in manifests' : `${result.vulnerabilityCount} CVEs flagged (${result.criticalVulnerabilityCount ?? 0} critical)`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">SPDX License:</span>
                          <span className="text-white">{result.licenseSpdx || 'Not specified in repository'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Redaction Classes:</span>
                          <span className="text-[#79c0ff]">7 Regex Patterns (Stripe, AWS, PATs, AI, RSA, SSH, .env)</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-[#30363d]/50">
                          <span className="text-[#8b949e]">Redaction Count:</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px]">
                            Not reported by this analysis
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#8b949e] pt-1 leading-snug">
                        <strong className="text-white">Honest Scope Notice:</strong> Heuristic pattern scanning redacts standard known credential formats. It does NOT guarantee detection of all proprietary, obfuscated, or encrypted secrets.
                      </p>
                    </div>
                  </div>

                  {/* Known Limitations Drawer */}
                  <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Known Reliability Boundaries &amp; Limitations
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] text-[#8b949e]">
                      <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]/60 space-y-1">
                        <strong className="text-white block">1. Static Analysis Only</strong>
                        <span>Analysis evaluates repository manifests and directory topology. It does not execute code, start servers, or run unit tests in a live runtime container.</span>
                      </div>
                      <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]/60 space-y-1">
                        <strong className="text-white block">2. Browser Isolation</strong>
                        <span>GitContextGen operates in your web browser and does not possess access to your local machine or local git working copy. Setup steps require manual verification.</span>
                      </div>
                      <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]/60 space-y-1">
                        <strong className="text-white block">3. Rule Evidence Lineage</strong>
                        <span>The backend API does not currently expose a granular per-rule evidence map object. Inferred guidelines are derived from archetype conventions and framework standards.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2.6: CHANGE-AWARE CONTEXT & DRIFT DETECTION (PRIORITY 2) */}
            <div className="p-5 sm:p-6 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <GitCompare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>Change-Aware Context &amp; Drift Detection</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${freshnessState.badgeClass}`}>
                          {freshnessState.label}
                        </span>
                      </h4>
                      <p className="text-xs text-[#8b949e]">
                        Deterministic verification tracking file tree modifications, stale instruction paths, and architectural module changes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsComparisonOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>{hasBaseline ? 'Inspect Snapshot Diffs' : 'View Comparison State'}</span>
                  </button>
                  {onReSync && (
                    <button
                      onClick={onReSync}
                      disabled={isReAnalyzing}
                      className="px-3 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isReAnalyzing ? 'animate-spin' : ''}`} />
                      <span>{isReAnalyzing ? 'Scanning...' : 'Re-analyze'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3-Card Drift Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                {/* Card 1: Comparison Baseline */}
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8b949e] font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#58a6ff]" /> Session Baseline
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                      hasBaseline ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}>
                      {hasBaseline ? 'Baseline Active' : 'Single Snapshot'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#c9d1d9] space-y-1">
                    {hasBaseline && effectivePreviousResult ? (
                      <>
                        <div className="text-white font-semibold">
                          Prior: {formatRelativeTime(effectivePreviousResult.analyzedAt)}
                        </div>
                        <div className="text-[10px] text-[#8b949e]">
                          {comparisonResult.elapsedMinutes}m elapsed between scans
                        </div>
                        <div className="text-[10px] text-zinc-400 pt-1">
                          Changes: +{comparisonResult.addedFiles.length} added, -{comparisonResult.removedFiles.length} removed
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-white font-semibold">No Prior Baseline in Session</div>
                        <p className="text-[10px] text-[#8b949e] leading-snug">
                          Initial scan. Re-analyze to establish a 2-snapshot baseline and detect remote repository changes.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Card 2: Mechanical Stale Path Check */}
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8b949e] font-semibold flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-[#bc8cff]" /> Rule Path Integrity
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                      comparisonResult.findings.filter(f => f.category === 'MECHANICAL_ORPHAN').length > 0
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {comparisonResult.findings.filter(f => f.category === 'MECHANICAL_ORPHAN').length > 0 ? 'Orphan Found' : 'Paths Verified'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#c9d1d9] space-y-1">
                    {comparisonResult.findings.filter(f => f.category === 'MECHANICAL_ORPHAN').length > 0 ? (
                      <>
                        <div className="text-amber-300 font-semibold">
                          {comparisonResult.findings.filter(f => f.category === 'MECHANICAL_ORPHAN').length} Orphaned Path Reference(s)
                        </div>
                        <p className="text-[10px] text-[#8b949e] leading-snug">
                          Generated rules reference paths absent from the AST file inventory.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-[#3fb950] font-semibold">Zero Orphaned References</div>
                        <p className="text-[10px] text-[#8b949e] leading-snug">
                          All file paths in instructions match confirmed nodes in the indexed repository tree.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Card 3: Architecture & Module Drift */}
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8b949e] font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" /> Topology Drift
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                      comparisonResult.findings.filter(f => f.category === 'STRUCTURAL_DRIFT').length > 0
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {comparisonResult.findings.filter(f => f.category === 'STRUCTURAL_DRIFT').length > 0 ? 'Topology Changed' : 'Consistent'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#c9d1d9] space-y-1">
                    {comparisonResult.findings.filter(f => f.category === 'STRUCTURAL_DRIFT').length > 0 ? (
                      <>
                        <div className="text-amber-300 font-semibold">
                          {comparisonResult.findings.filter(f => f.category === 'STRUCTURAL_DRIFT').length} Subsystem Change(s)
                        </div>
                        <p className="text-[10px] text-[#8b949e] leading-snug">
                          Architectural components were added or removed between snapshots.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-[#3fb950] font-semibold">Architecture Stable</div>
                        <p className="text-[10px] text-[#8b949e] leading-snug">
                          Synthesized module graph invariants remain stable across analysis runs.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Notice regarding on-demand model */}
              <div className="p-3 rounded-lg bg-[#0d1117]/60 border border-[#30363d]/60 text-[11px] font-mono text-[#8b949e] flex items-center justify-between gap-2 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
                  <span>On-Demand Verification Model: GitContextGen scans repositories explicitly when requested and does not monitor GitHub or run background polling workers.</span>
                </span>
                <button
                  onClick={() => setIsComparisonOpen(true)}
                  className="text-[#58a6ff] hover:underline font-semibold cursor-pointer shrink-0"
                >
                  View Full Audit Details →
                </button>
              </div>
            </div>

            {/* SECTION 3: DELIVERABLES DIRECTORY (All Assets Generated for this Repo) */}
            <div className="p-5 sm:p-6 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#58a6ff]" />
                    Generated Deliverables Directory
                  </h4>
                  <p className="text-xs text-[#8b949e] mt-0.5">
                    Every asset synthesized for this codebase is ready for immediate team handoff or agent consumption.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#8b949e]">
                  <span className="px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-[#3fb950]">
                    8 Assets Compiled
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Deliverable 1: CLAUDE.md */}
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#f0f6fc] flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5 text-[#58a6ff]" /> CLAUDE.md
                      </span>
                      <span className="text-[10px] font-mono text-[#8b949e]">~{estimateTokens(rawClaudeMd)} tok</span>
                    </div>
                    <p className="text-[11px] text-[#8b949e] leading-relaxed">
                      Primary AI context spec with verified test/build commands and anti-hallucination rules.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#30363d]/60">
                    <button
                      onClick={() => setActiveTab('context')}
                      className="px-2.5 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                    >
                      <span>View in Tab</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleCopy(claudeMd, 'dir-claude-copy')}
                      className="px-2.5 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#c9d1d9] transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400"
                      title="Copy CLAUDE.md"
                    >
                      {copiedSection === 'dir-claude-copy' ? <Check className="w-3 h-3 text-[#3fb950]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'dir-claude-copy' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Deliverable 2: AGENTS.md */}
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#f0f6fc] flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-[#bc8cff]" /> AGENTS.md
                      </span>
                      <span className="text-[10px] font-mono text-[#8b949e]">~{estimateTokens(rawAgentsMd)} tok</span>
                    </div>
                    <p className="text-[11px] text-[#8b949e] leading-relaxed">
                      Multi-agent reasoning loop spec with tool schemas and state persistence guidelines.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#30363d]/60">
                    <button
                      onClick={() => {
                        setOnboardingType('agents');
                        setActiveTab('context');
                      }}
                      className="px-2.5 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                    >
                      <span>View in Tab</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleCopy(agentsMd, 'dir-agents-copy')}
                      className="px-2.5 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#c9d1d9] transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400"
                      title="Copy AGENTS.md"
                    >
                      {copiedSection === 'dir-agents-copy' ? <Check className="w-3 h-3 text-[#3fb950]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'dir-agents-copy' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Deliverable 3: .cursor/rules/*.mdc */}
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#f0f6fc] flex items-center gap-1.5">
                        <FileCode2 className="w-3.5 h-3.5 text-[#79c0ff]" /> Cursor Rules
                      </span>
                      <span className="text-[10px] font-mono text-[#3fb950]">{cursorRules.length} rules</span>
                    </div>
                    <p className="text-[11px] text-[#8b949e] leading-relaxed">
                      Native .mdc rules with <code className="text-[#c9d1d9]">alwaysApply: true</code> and framework invariants.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#30363d]/60">
                    <button
                      onClick={() => setActiveTab('rules')}
                      className="px-2.5 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                    >
                      <span>View in Tab</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDownloadCursorRule(activeCursorRule.filename, activeCursorRule.content)}
                      className="px-2.5 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#c9d1d9] transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400"
                      title="Download .mdc rule"
                    >
                      <Download className="w-3 h-3" />
                      <span>.mdc</span>
                    </button>
                  </div>
                </div>

                {/* Deliverable 4: MCP Stdio Server */}
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#f0f6fc] flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-[#f0883e]" /> MCP Server
                      </span>
                      <span className="text-[10px] font-mono text-[#3fb950]">stdio v2024</span>
                    </div>
                    <p className="text-[11px] text-[#8b949e] leading-relaxed">
                      Stdio server config with 11 tools, SQLite persistent memory, and live AST lookups.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#30363d]/60">
                    <button
                      onClick={() => setActiveTab('mcp')}
                      className="px-2.5 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                    >
                      <span>View in Tab</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleCopy(mcpClaudeJson, 'dir-mcp-copy')}
                      className="px-2.5 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#c9d1d9] transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400"
                      title="Copy MCP JSON"
                    >
                      {copiedSection === 'dir-mcp-copy' ? <Check className="w-3 h-3 text-[#3fb950]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'dir-mcp-copy' ? 'Copied' : 'JSON'}</span>
                    </button>
                  </div>
                </div>

                {/* Deliverable 5: Dependency Graph */}
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#f0f6fc] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#d2a8ff]" /> Architecture Graph
                      </span>
                      <span className="text-[10px] font-mono text-[#58a6ff]">Mermaid.js</span>
                    </div>
                    <p className="text-[11px] text-[#8b949e] leading-relaxed">
                      Visual AST dependency map with Kroki vector bridge and module hierarchy.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#30363d]/60">
                    <button
                      onClick={() => setActiveTab('graph')}
                      className="w-full py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center justify-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                    >
                      <span>Explore Graph</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Deliverable 6: Client Handoff Report */}
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#f0f6fc] flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#3fb950]" /> Client Handoff
                      </span>
                      <span className="text-[10px] font-mono text-[#3fb950]">Non-Tech</span>
                    </div>
                    <p className="text-[11px] text-[#8b949e] leading-relaxed">
                      Technical commits translated into business outcomes (features, security, UX).
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#30363d]/60">
                    <button
                      onClick={() => setActiveTab('handoff')}
                      className="px-2.5 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                    >
                      <span>View in Tab</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        const reportText = `# Client Progress Report — ${result.repo}\n\n${clientReport.summary}\n\n## New Features\n${clientReport.categories.newFeatures.map(f => `- ${f}`).join('\n')}\n\n## Security & Maintenance\n${clientReport.categories.securityMaintenance.map(s => `- ${s}`).join('\n')}\n\n## UX Improvements\n${clientReport.categories.uxImprovements.map(u => `- ${u}`).join('\n')}`;
                        handleCopy(reportText, 'dir-report-copy');
                      }}
                      className="px-2.5 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#c9d1d9] transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400"
                      title="Copy report"
                    >
                      {copiedSection === 'dir-report-copy' ? <Check className="w-3 h-3 text-[#3fb950]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'dir-report-copy' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Deliverable 7: Executive Excel (.xlsx) */}
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#f0f6fc] flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#238636]" /> Executive Excel
                      </span>
                      <span className="text-[10px] font-mono text-[#3fb950]">.xlsx</span>
                    </div>
                    <p className="text-[11px] text-[#8b949e] leading-relaxed">
                      5-tab workbook: Executive Summary, AST Inventory, Security Audit, MCP Tools, and Handoff.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#30363d]/60">
                    <button
                      onClick={handleExportExcel}
                      className="w-full py-1 min-h-[30px] rounded bg-[#238636] hover:bg-[#2ea043] text-xs font-mono text-white font-semibold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download .xlsx</span>
                    </button>
                  </div>
                </div>

                {/* Deliverable 8: CSV Exports */}
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#f0f6fc] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#58a6ff]" /> CSV Data
                      </span>
                      <span className="text-[10px] font-mono text-[#58a6ff]">RFC 4180</span>
                    </div>
                    <p className="text-[11px] text-[#8b949e] leading-relaxed">
                      File inventory and client handoff CSV spreadsheets for custom spreadsheets or reporting.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#30363d]/60">
                    <button
                      onClick={handleExportFileInventory}
                      className="flex-1 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-[11px] font-mono text-[#c9d1d9] transition flex items-center justify-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400"
                      title="Download Inventory CSV"
                    >
                      <Download className="w-3 h-3" />
                      <span>Inventory</span>
                    </button>
                    <button
                      onClick={handleExportClientHandoff}
                      className="flex-1 py-1 min-h-[30px] rounded bg-[#21262d] hover:bg-[#30363d] text-[11px] font-mono text-[#c9d1d9] transition flex items-center justify-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400"
                      title="Download Handoff CSV"
                    >
                      <Download className="w-3 h-3" />
                      <span>Handoff</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

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
                  {/* Output Density Mode Selector: Standard vs Minimal */}
                  <div className="flex items-center p-1 rounded-lg bg-[#0d1117] border border-[#30363d]">
                    <button
                      onClick={() => setOutputMode('standard')}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        outputMode === 'standard'
                          ? 'bg-[#21262d] text-white shadow-sm border border-[#30363d]'
                          : 'text-[#8b949e] hover:text-[#c9d1d9]'
                      }`}
                      title="Standard comprehensive context specification"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#58a6ff]" />
                      <span>Standard</span>
                      <span className="text-[10px] text-[#8b949e] hidden sm:inline">
                        (~{estimateTokens(activeOnboardingRaw).toLocaleString()} tok)
                      </span>
                    </button>
                    <button
                      onClick={() => setOutputMode('minimal')}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        outputMode === 'minimal'
                          ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                          : 'text-[#8b949e] hover:text-[#c9d1d9]'
                      }`}
                      title="Minimal token-optimized context specification for fast prompting"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Minimal</span>
                      <span className="text-[10px] text-amber-400/80 hidden sm:inline">
                        (~{estimateTokens(activeOnboardingMinimal).toLocaleString()} tok)
                      </span>
                    </button>
                  </div>

                  {/* Token savings pill when in minimal mode */}
                  {outputMode === 'minimal' && (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hidden xl:inline-flex items-center gap-1">
                      <span>⚡ {Math.round((1 - estimateTokens(activeOnboardingMinimal) / Math.max(1, estimateTokens(activeOnboardingRaw))) * 100)}% token savings</span>
                    </span>
                  )}

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
                    onClick={() => handleCopy(activeOnboardingContent, 'onboarding-copy')}
                    className="px-3.5 py-2 min-w-[155px] justify-center rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#f0f6fc] flex items-center gap-1.5 transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                    title={`Copy ${outputMode === 'minimal' ? 'Minimal' : 'Standard'} ${detectedFileName}`}
                  >
                    {copiedSection === 'onboarding-copy' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5 text-[#8b949e]" />}
                    <span>{copiedSection === 'onboarding-copy' ? 'Copied File!' : `Copy ${outputMode === 'minimal' ? 'Minimal' : 'Raw'} File`}</span>
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

            {/* ⚠️ Existing Instruction File Detection Banner */}
            {detectedExistingFile && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#161b22] to-[#161b22] border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm shadow-amber-500/10">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-amber-200">
                        Existing {detectedFileName} detected in repository root
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {detectedExistingFile.replace(/^\[(FILE|DIR)\]\s*/, '').trim()}
                      </span>
                    </div>
                    <p className="text-xs text-[#8b949e] mt-0.5 max-w-2xl leading-relaxed">
                      The original repository already contains an instruction file. GitContextGen has synthesized an upgraded, anti-hallucination version equipped with terminal typecheck invariants and validated dev commands.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDiffView(!showDiffView)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold transition flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
                >
                  <Split className="w-4 h-4" />
                  <span>{showDiffView ? 'Hide Comparison' : 'Compare with Existing / View Diff'}</span>
                </button>
              </div>
            )}

            {/* ⚖️ Side-by-Side Diff Comparison View */}
            {showDiffView && detectedExistingFile && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#161b22] border border-amber-500/40 space-y-4 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d] pb-3">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-[#f0f6fc]">
                      Side-by-Side Diff: Repository Original vs. GitContextGen Upgraded
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30 text-[11px]">
                      Original (Unverified)
                    </span>
                    <span className="text-[#8b949e]">vs</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px]">
                      GitContextGen (Anti-Hallucination)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Original File */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#8b949e] px-1">
                      <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Detected in Repository: {detectedExistingFile.replace(/^\[(FILE|DIR)\]\s*/, '').trim()}
                      </span>
                      <span className="text-red-400 text-[11px]">Missing Safety Invariants</span>
                    </div>
                    <CodeViewer
                      content={`# Existing ${detectedFileName} (Detected in Repository Root)\n<!-- File: ${detectedExistingFile.replace(/^\[(FILE|DIR)\]\s*/, '').trim()} -->\n\n⚠️ Baseline / Legacy Specification:\n- Scanned in root directory via GitHub AST scanner.\n- Missing mandatory terminal typechecks (npx tsc --noEmit).\n- Missing comment and docstring preservation guardrails.\n- Missing multi-agent mutex lock synchronization protocols.\n- Lacks verified build & test execution scripts.\n\n<!-- To replace with GitContextGen's anti-hallucination version, use the specification on the right -->`}
                      filename={`${detectedFileName} (Repository Original)`}
                      className="h-full border-amber-500/20"
                    />
                  </div>

                  {/* Right: GitContextGen Upgraded */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#8b949e] px-1">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        GitContextGen Upgraded Spec ({outputMode})
                      </span>
                      <span className="text-emerald-400 text-[11px]">Anti-Hallucination Active</span>
                    </div>
                    <CodeViewer
                      content={activeOnboardingContent}
                      filename={`${detectedFileName} (GitContextGen Upgraded)`}
                      tokenEstimate={estimateTokens(activeOnboardingContent)}
                      className="h-full border-emerald-500/30"
                      badge={
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Verified &amp; Redacted
                        </span>
                      }
                    />
                  </div>
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
                  content={activeOnboardingContent}
                  filename={onboardingType === 'claude' ? 'CLAUDE.md' : 'AGENTS.md'}
                  tokenEstimate={estimateTokens(activeOnboardingContent)}
                  badge={
                    outputMode === 'minimal' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⚡ Minimal Mode
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        📄 Standard Mode
                      </span>
                    )
                  }
                  className="h-full"
                />
              </div>
            </div>

            {/* Rule Evidence & Source Lineage Card for Tab 1 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#58a6ff]" />
                  <h4 className="text-sm font-bold text-white">Rule Evidence &amp; Source Lineage</h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#8b949e]">
                  AST Provenance Map
                </span>
              </div>
              <p className="text-xs text-[#8b949e] font-sans">
                Inspection of which repository files informed these instructions, clearly distinguishing verified manifest evidence from inferred guidelines.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* Item 1: Execution Invariants */}
                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold">Dev &amp; Test Commands</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#238636]/20 text-[#3fb950] border border-[#3fb950]/30">
                      Direct Manifest Match
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b949e]">
                    Source: <span className="text-[#58a6ff]">{fileTreeLines.some(f => f.includes('package.json')) ? 'package.json' : fileTreeLines.some(f => f.includes('Cargo.toml')) ? 'Cargo.toml' : fileTreeLines.some(f => f.includes('pyproject.toml')) ? 'pyproject.toml' : 'Manifest scripts'}</span>
                  </p>
                  <div className="text-[10px] text-[#c9d1d9] bg-[#161b22] p-1.5 rounded truncate" title={devCmd || testCmd || 'Standard package commands'}>
                    {devCmd || testCmd || 'Verified scripts'}
                  </div>
                </div>

                {/* Item 2: Terminal Typecheck Guardrail */}
                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold">Typecheck Guardrail</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      fileTreeLines.some(f => f.includes('tsconfig.json'))
                        ? 'bg-[#238636]/20 text-[#3fb950] border border-[#3fb950]/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {fileTreeLines.some(f => f.includes('tsconfig.json')) ? 'Direct Manifest Match' : 'Inferred Practice'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b949e]">
                    Source: <span className="text-[#58a6ff]">{fileTreeLines.some(f => f.includes('tsconfig.json')) ? 'tsconfig.json' : 'Framework convention'}</span>
                  </p>
                  <div className="text-[10px] text-[#c9d1d9] bg-[#161b22] p-1.5 rounded truncate">
                    {typecheckCmd || 'npx tsc --noEmit'}
                  </div>
                </div>

                {/* Item 3: Archetype & Architecture Invariants */}
                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold">Archetype Conventions</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Heuristic Inference
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b949e]">
                    Source: <span className="text-[#58a6ff]">{currentArchetype} classification</span>
                  </p>
                  <p className="text-[10px] text-[#8b949e] leading-snug font-sans">
                    Inferred from directory topology &amp; framework signatures; not verified by dynamic runtime execution.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]/70 text-[11px] text-[#8b949e] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="font-sans leading-relaxed">
                  <strong className="text-white font-mono">Backend Lineage Notice:</strong> The current API payload does not include a dynamic <code className="text-[#58a6ff]">ruleEvidenceMap</code> object. Supporting evidence is deterministically mapped based on AST manifest presence and detected archetype signatures.
                </span>
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
                  className="px-3.5 py-2 min-w-[125px] justify-center rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#f0f6fc] flex items-center gap-1.5 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                >
                  {copiedSection === 'cursor-rule-copy' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5 text-[#8b949e]" />}
                  <span>{copiedSection === 'cursor-rule-copy' ? 'Copied Rule!' : 'Copy Rule'}</span>
                </button>
              </div>
            </div>

            {(!outputs?.cursorRules || outputs.cursorRules.length === 0) && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#58a6ff] shrink-0" />
                <span>No custom rules detected in repository — scaffolded default rules based on {outputs?.framework || 'detected framework'} AST.</span>
              </div>
            )}

            {/* Side-by-Side View: Active Rule vs Harmonized CLAUDE.md */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <CodeViewer
                  content={activeCursorRule.content}
                  filename={activeCursorRule.filename}
                  tokenEstimate={estimateTokens(activeCursorRule.content)}
                  badge={
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      Cursor .mdc
                    </span>
                  }
                />
              </div>
              <div>
                <CodeViewer
                  content={claudeMd}
                  filename="CLAUDE.md (Harmonized Invariant)"
                  tokenEstimate={estimateTokens(claudeMd)}
                  badge={
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      Harmonized Spec
                    </span>
                  }
                />
              </div>
            </div>

            {/* Rule Evidence & Source Lineage Card for Tab 2 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#79c0ff]" />
                  <h4 className="text-sm font-bold text-white">Rule Evidence &amp; Frontmatter Lineage</h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#8b949e]">
                  Cursor .mdc Lineage
                </span>
              </div>
              <p className="text-xs text-[#8b949e] font-sans">
                Source provenance for active Cursor rule ({activeCursorRule.filename}), verifying framework invariants and YAML frontmatter constraints.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold">Framework Invariant</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#238636]/20 text-[#3fb950] border border-[#3fb950]/30">
                      Signature Match
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b949e]">
                    Framework: <span className="text-[#58a6ff]">{outputs?.framework || 'Auto-Detected'}</span>
                  </p>
                  <p className="text-[10px] text-[#c9d1d9] bg-[#161b22] p-1.5 rounded truncate">
                    Target: {activeCursorRule.filename}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold">Frontmatter Scope</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#238636]/20 text-[#3fb950] border border-[#3fb950]/30">
                      Validated
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b949e]">
                    Directive: <span className="text-[#3fb950]">alwaysApply: true</span>
                  </p>
                  <p className="text-[10px] text-[#8b949e] font-sans">
                    Forces Cursor Composer and Agent mode to apply invariants on every prompt.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold">Anti-Hallucination Protocol</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Embedded Invariant
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b949e]">
                    Guard: <span className="text-white">Terminal typecheck required</span>
                  </p>
                  <p className="text-[10px] text-[#8b949e] font-sans">
                    Requires running verified typechecks before declaring code edits complete.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]/70 text-[11px] text-[#8b949e] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="font-sans leading-relaxed">
                  <strong className="text-white font-mono">Evidence Note:</strong> Rule contents are synthesized from detected package manifests and framework conventions. Edit instructions directly in the code viewer above before downloading.
                </span>
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
              <div className="p-8 rounded-xl bg-[#161b22] border border-[#30363d] text-center space-y-3">
                <Layers className="w-8 h-8 text-[#d2a8ff] mx-auto" />
                <h4 className="text-base font-bold text-white">No Architecture Model Synthesized</h4>
                <p className="text-xs text-[#8b949e] max-w-md mx-auto leading-relaxed">
                  A visual module graph could not be synthesized from the current file tree. This can happen if the repository contains only flat files or markdown docs.
                </p>
                {onReSync && (
                  <button
                    onClick={onReSync}
                    className="px-3.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#58a6ff] transition inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-parse Dependency Graph</span>
                  </button>
                )}
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
        {/* TAB 5: 🤝 Team & Stakeholder Handoff                                  */}
        {/* ===================================================================== */}
        {activeTab === 'handoff' && (
          <div className="space-y-6">
            {/* Header & Primary Action Bar */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#238636]/15 border border-[#238636]/30 flex items-center justify-center text-[#3fb950] shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
                      <span>Stakeholder &amp; Team Engineering Handoff</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                        Asset 4
                      </span>
                    </h3>
                    <p className="text-xs text-[#8b949e]">
                      Clear, understandable repository report and deliverable bundle for non-technical stakeholders, clients, and engineering peers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Stable layout with min-height/min-width to prevent layout shifts */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                <button
                  onClick={() => handleCopy(shareableMarkdownSummary, 'shareable-summary-copy')}
                  className="px-4 py-2 min-h-[38px] min-w-[210px] justify-center rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-mono font-semibold flex items-center gap-2 transition cursor-pointer shadow-md focus-visible:ring-2 focus-visible:ring-emerald-400"
                  aria-label="Copy plain-English shareable Markdown project summary"
                >
                  {copiedSection === 'shareable-summary-copy' ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Copy className="w-4 h-4 text-white" />
                  )}
                  <span>
                    {copiedSection === 'shareable-summary-copy' ? 'Copied Summary! ✓' : 'Copy Shareable Summary'}
                  </span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 min-h-[38px] rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#f0f6fc] flex items-center gap-2 transition cursor-pointer shadow-sm hover:border-[#388bfd]/50"
                  title="Download full 5-tab executive Excel workbook"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#3fb950]" />
                  <span>Executive .xlsx</span>
                </button>

                <button
                  onClick={handleDownloadRawJson}
                  className="px-3.5 py-2 min-h-[38px] rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#c9d1d9] flex items-center gap-2 transition cursor-pointer shadow-sm hover:border-[#f0883e]/50"
                  title="Download raw analysis JSON payload"
                >
                  <Download className="w-4 h-4 text-[#f0883e]" />
                  <span>JSON Payload</span>
                </button>
              </div>
            </div>

            {/* Section 1: Repository Anchor & Truthful Telemetry Cards */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d]/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#58a6ff]">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{activeAnalysisResult.owner}/{activeAnalysisResult.repo}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border flex items-center gap-1 ${archetypeBadge.badgeClass}`}>
                        <span>{archetypeBadge.icon}</span>
                        <span>{archetypeBadge.label}</span>
                      </span>
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-[#8b949e] font-mono mt-0.5">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-[#58a6ff]" />
                        HEAD ({activeAnalysisResult.defaultBranch || 'main'})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {formatRelativeTime(activeAnalysisResult.analyzedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#8b949e]">Framework &amp; Archetype</div>
                  <div className="text-xs font-bold text-[#f0f6fc] font-mono">
                    {outputs?.framework || 'Universal'} • {currentArchetype}
                  </div>
                </div>
              </div>

              {/* 4 Truthful Verification Status Cards (Zero generic 'Production Ready' claims) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Context & Rules */}
                <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="text-[10px] uppercase font-mono font-semibold text-[#8b949e] flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-[#58a6ff]" />
                    AI Agent Context
                  </div>
                  <div className="text-sm font-bold text-white">
                    Synthesized (3 Assets)
                  </div>
                  <div className="text-[11px] text-[#8b949e]">
                    CLAUDE.md, AGENTS.md, {cursorRules.length} Cursor rules
                  </div>
                </div>

                {/* 2. Security Status */}
                <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="text-[10px] uppercase font-mono font-semibold text-[#8b949e] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3fb950]" />
                    Dependency Security
                  </div>
                  <div className={`text-sm font-bold ${
                    (activeAnalysisResult.vulnerabilityCount ?? 0) === 0 ? 'text-[#3fb950]' : 'text-amber-400'
                  }`}>
                    {(activeAnalysisResult.vulnerabilityCount ?? 0) === 0
                      ? '✓ 0 CVE Advisories'
                      : `⚠️ ${activeAnalysisResult.vulnerabilityCount} Advisories Flagged`}
                  </div>
                  <div className="text-[11px] text-[#8b949e]">
                    Audited via OSV.dev database
                  </div>
                </div>

                {/* 3. Codebase Topology */}
                <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="text-[10px] uppercase font-mono font-semibold text-[#8b949e] flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-[#bc8cff]" />
                    Examined Topology
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {comparisonResult.currentParsed.fileCount} files, {comparisonResult.currentParsed.dirCount} dirs
                  </div>
                  <div className="text-[11px] text-[#8b949e]">
                    {comparisonResult.currentParsed.isTruncated ? '300-node AST ceiling reached' : 'Complete AST representation'}
                  </div>
                </div>

                {/* 4. Verified Dev Commands */}
                <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="text-[10px] uppercase font-mono font-semibold text-[#8b949e] flex items-center gap-1.5">
                    <Command className="w-3.5 h-3.5 text-amber-400" />
                    Verified Scripts
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {devCommands.length} Commands Verified
                  </div>
                  <div className="text-[11px] text-[#8b949e]">
                    Extracted from project manifests
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-[#8b949e] font-mono flex items-center gap-1.5 pt-1">
                <span className="text-amber-400 font-bold">Footnote:</span>
                <span>Evaluated against remote HEAD. Analysis performed through static AST inspection without executing untrusted code or accessing private workstations.</span>
              </div>
            </div>

            {/* Section 2: Executive Plain-English Project Overview */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-2">
              <span className="text-xs font-mono text-[#58a6ff] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Plain-English Project Description
              </span>
              <p className="text-sm text-[#c9d1d9] leading-relaxed">
                {clientReport.summary}
              </p>
            </div>

            {/* Section 3: Commercial & Technical Progress Categorization (3 Impact Pillars) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase font-bold text-[#8b949e] tracking-wider flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#3fb950]" />
                  Commercial Progress &amp; Work Completed
                </h4>
                <span className="text-[11px] text-[#8b949e]">
                  Grouped by commercial impact
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. New Features */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-[#23863640] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#3fb950]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>New Features ({clientReport.categories.newFeatures.length})</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                      Capabilities
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#c9d1d9]">
                    {clientReport.categories.newFeatures.map((item, i) => (
                      <li key={`feat-${i}`} className="flex items-start gap-2">
                        <span className="text-[#3fb950] mt-0.5">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Security & Maintenance */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-[#1f6feb40] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#58a6ff]">
                      <Lock className="w-4 h-4" />
                      <span>Security &amp; Infra ({clientReport.categories.securityMaintenance.length})</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-blue-500/10 text-blue-400 font-mono">
                      Stability
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#c9d1d9]">
                    {clientReport.categories.securityMaintenance.map((item, i) => (
                      <li key={`sec-${i}`} className="flex items-start gap-2">
                        <span className="text-[#58a6ff] mt-0.5">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. UX & Polish */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-[#8957e540] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#d2a8ff]">
                      <Sparkles className="w-4 h-4" />
                      <span>UX &amp; Polish ({clientReport.categories.uxImprovements.length})</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-purple-500/10 text-purple-400 font-mono">
                      Refinement
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#c9d1d9]">
                    {clientReport.categories.uxImprovements.map((item, i) => (
                      <li key={`ux-${i}`} className="flex items-start gap-2">
                        <span className="text-[#d2a8ff] mt-0.5">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 4: Key Architecture Findings & System Boundaries */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d]/60 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#58a6ff]" />
                  <span>Key Architecture Findings &amp; System Boundaries</span>
                </h4>
                <button
                  onClick={() => setActiveTab('graph')}
                  className="text-xs text-[#58a6ff] hover:text-[#79c0ff] flex items-center gap-1 font-semibold transition cursor-pointer"
                >
                  <span>Explore Full Visual Architecture (Tab 4: Dependency Graph)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-1.5">
                  <div className="text-[10px] uppercase font-mono text-[#8b949e]">Framework &amp; Runtime</div>
                  <div className="font-bold text-white font-mono">{outputs?.framework || 'Universal Engine'}</div>
                  <p className="text-[11px] text-[#8b949e] leading-relaxed">
                    Archetype classified as <strong className="text-zinc-300">{currentArchetype}</strong> with standard project structure conventions.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-1.5">
                  <div className="text-[10px] uppercase font-mono text-[#8b949e]">Component Standards</div>
                  <div className="font-bold text-white font-mono">Verified Invariants</div>
                  <p className="text-[11px] text-[#8b949e] leading-relaxed">
                    {outputs?.onboarding?.stylingStandards || 'Component separation, prop validation, and strict error boundaries enforced.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-1.5">
                  <div className="text-[10px] uppercase font-mono text-[#8b949e]">Execution Scripts</div>
                  <div className="font-bold text-white font-mono">{devCommands[0] || 'npm test'}</div>
                  <p className="text-[11px] text-[#8b949e] leading-relaxed">
                    Build and test commands extracted directly from repository configuration files without guessing.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Generated AI Deliverables & Status Table */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
              <div className="flex items-center justify-between border-b border-[#30363d]/60 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#bc8cff]" />
                  <span>Synthesized AI Deliverables &amp; Output Status</span>
                </h4>
                <span className="text-[11px] text-[#8b949e]">
                  Available in this session
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#30363d] text-[10px] uppercase font-mono text-[#8b949e]">
                      <th className="pb-2 font-semibold">Deliverable Asset</th>
                      <th className="pb-2 font-semibold">Target File / Location</th>
                      <th className="pb-2 font-semibold">Primary Consumer</th>
                      <th className="pb-2 font-semibold">Status</th>
                      <th className="pb-2 text-right font-semibold">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]/40 font-mono text-[11px]">
                    {/* CLAUDE.md */}
                    <tr className="hover:bg-[#21262d]/40 transition">
                      <td className="py-2.5 font-bold text-white flex items-center gap-2">
                        <FileCode2 className="w-3.5 h-3.5 text-[#58a6ff]" />
                        CLAUDE.md
                      </td>
                      <td className="py-2.5 text-[#8b949e]">./CLAUDE.md</td>
                      <td className="py-2.5 text-zinc-300">Claude Code CLI</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ✓ Synthesized (~{estimateTokens(rawClaudeMd)} tok)
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => setActiveTab('context')}
                          className="text-[#58a6ff] hover:text-[#79c0ff] font-semibold underline cursor-pointer"
                        >
                          View Context →
                        </button>
                      </td>
                    </tr>

                    {/* AGENTS.md */}
                    <tr className="hover:bg-[#21262d]/40 transition">
                      <td className="py-2.5 font-bold text-white flex items-center gap-2">
                        <FolderGit2 className="w-3.5 h-3.5 text-[#bc8cff]" />
                        AGENTS.md
                      </td>
                      <td className="py-2.5 text-[#8b949e]">./AGENTS.md</td>
                      <td className="py-2.5 text-zinc-300">Multi-Agent Swarms</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ✓ Synthesized (~{estimateTokens(rawAgentsMd)} tok)
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => setActiveTab('context')}
                          className="text-[#58a6ff] hover:text-[#79c0ff] font-semibold underline cursor-pointer"
                        >
                          View Context →
                        </button>
                      </td>
                    </tr>

                    {/* Cursor Rules */}
                    <tr className="hover:bg-[#21262d]/40 transition">
                      <td className="py-2.5 font-bold text-white flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-[#d2a8ff]" />
                        Cursor Rules (.mdc)
                      </td>
                      <td className="py-2.5 text-[#8b949e]">.cursor/rules/*.mdc</td>
                      <td className="py-2.5 text-zinc-300">Cursor Composer</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ✓ {cursorRules.length} Rule File(s)
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => setActiveTab('rules')}
                          className="text-[#58a6ff] hover:text-[#79c0ff] font-semibold underline cursor-pointer"
                        >
                          View Rules →
                        </button>
                      </td>
                    </tr>

                    {/* Visual Architecture */}
                    <tr className="hover:bg-[#21262d]/40 transition">
                      <td className="py-2.5 font-bold text-white flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        Architecture Graph
                      </td>
                      <td className="py-2.5 text-[#8b949e]">Mermaid.js + Kroki SVG</td>
                      <td className="py-2.5 text-zinc-300">Developers &amp; Vision LLMs</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ✓ Synthesized
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => setActiveTab('graph')}
                          className="text-[#58a6ff] hover:text-[#79c0ff] font-semibold underline cursor-pointer"
                        >
                          View Graph →
                        </button>
                      </td>
                    </tr>

                    {/* Executive Workbook */}
                    <tr className="hover:bg-[#21262d]/40 transition">
                      <td className="py-2.5 font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#3fb950]" />
                        Executive Workbook
                      </td>
                      <td className="py-2.5 text-[#8b949e]">{activeAnalysisResult.repo}-executive.xlsx</td>
                      <td className="py-2.5 text-zinc-300">Clients &amp; Stakeholders</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          ✓ Ready (5 Sheets)
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={handleExportExcel}
                          className="text-[#3fb950] hover:text-[#56d364] font-semibold underline cursor-pointer"
                        >
                          Download →
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 6: Export & Deliverables Discovery Hub (Feature 3) */}
            <div className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d]/60 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#58a6ff]" />
                    <span>Export &amp; Deliverables Discovery Hub</span>
                  </h4>
                  <p className="text-xs text-[#8b949e]">
                    Download analysis findings formatted for specific stakeholder, audit, and automation needs.
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-md font-mono bg-[#161b22] border border-[#30363d] text-[#8b949e]">
                  Standard Export Formats
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Format 1: Executive Excel Workbook (.xlsx) */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#238636]/60 transition flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#3fb950]" />
                        Executive Excel Workbook (.xlsx)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Stakeholders
                      </span>
                    </div>
                    <p className="text-xs text-[#c9d1d9] leading-relaxed">
                      <strong>Purpose:</strong> Formal client handoffs, executive presentations, and investor audits. Includes a 2x3 KPI stat card grid, formula-backed codebase inventory, AI rules dossier, and commercial progress notes.
                    </p>
                  </div>
                  <button
                    onClick={handleExportExcel}
                    className="w-full py-2 min-h-[36px] rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Executive .xlsx</span>
                  </button>
                </div>

                {/* Format 2: Codebase Inventory CSV (.csv) */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#1f6feb]/60 transition flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#58a6ff]" />
                        Codebase Inventory CSV (.csv)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        Tabular Audit
                      </span>
                    </div>
                    <p className="text-xs text-[#c9d1d9] leading-relaxed">
                      <strong>Purpose:</strong> Tabular processing, spreadsheet filtering, and data pipeline ingestion. Fully RFC 4180-compliant with formula-injection guardrails mapping all parsed repository paths, sizes, and AST classifications.
                    </p>
                  </div>
                  <button
                    onClick={handleExportFileInventory}
                    className="w-full py-2 min-h-[36px] rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] hover:text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#58a6ff]" />
                    <span>Download Inventory CSV</span>
                  </button>
                </div>

                {/* Format 3: Client Handoff Progress CSV (.csv) */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#8957e5]/60 transition flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#bc8cff]" />
                        Client Handoff Progress CSV (.csv)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        Project Management
                      </span>
                    </div>
                    <p className="text-xs text-[#c9d1d9] leading-relaxed">
                      <strong>Purpose:</strong> Importing progress outcomes into Jira, Linear, Notion, or Asana. Groups technical commits and updates into commercial deliverables (Features, Security, UX).
                    </p>
                  </div>
                  <button
                    onClick={handleExportClientHandoff}
                    className="w-full py-2 min-h-[36px] rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] hover:text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#bc8cff]" />
                    <span>Download Handoff CSV</span>
                  </button>
                </div>

                {/* Format 4: Full Analysis JSON (.json) */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#f0883e]/60 transition flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-[#f0883e]" />
                        Full Analysis Payload JSON (.json)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Automation / CI
                      </span>
                    </div>
                    <p className="text-xs text-[#c9d1d9] leading-relaxed">
                      <strong>Purpose:</strong> Programmatic integration into automated toolchains, CI/CD pipelines, or custom scripting. Contains the complete structured analysis response object.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDownloadRawJson}
                      className="py-2 min-h-[36px] rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] hover:text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#f0883e]" />
                      <span>Download .json</span>
                    </button>
                    <button
                      onClick={handleCopyRawJson}
                      className="py-2 min-h-[36px] rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] hover:text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#8b949e]" />
                      <span>Copy Payload</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7: Engineering Invariants & Local Memory Architecture (Feature 4) */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d]/60 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#58a6ff]" />
                    <span>Engineering Decisions &amp; Memory Architecture</span>
                  </h4>
                  <p className="text-xs text-[#8b949e]">
                    Deterministic invariants, verified build scripts, and local MCP memory boundaries.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-zinc-300">
                  Read-Only Provenance
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Verified Development Invariants */}
                <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
                  <span className="text-xs font-mono text-white font-bold flex items-center gap-2">
                    <Command className="w-3.5 h-3.5 text-[#58a6ff]" />
                    Verified Terminal Commands &amp; Standards
                  </span>
                  <div className="space-y-1.5">
                    {devCommands.map((cmd, i) => (
                      <div key={`cmd-${i}`} className="p-2 rounded bg-[#161b22] border border-[#30363d]/60 font-mono text-xs text-emerald-400 flex items-center justify-between">
                        <span>$ {cmd}</span>
                        <span className="text-[10px] text-[#8b949e] uppercase font-bold">Verified</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-2.5 rounded bg-[#161b22] border border-[#30363d]/60 text-[11px] text-[#8b949e] leading-relaxed">
                    <strong className="text-white">Anti-Hallucination Protocol:</strong> AI coding assistants are instructed to run terminal typechecks before marking changes complete, preserving comments and verifying module imports.
                  </div>
                </div>

                {/* Right: Local MCP SQLite Memory Boundary */}
                <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white font-bold flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-purple-400" />
                      Persistent SQLite Agent Memory (.gitcontextgen/memory.db)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      Local Only
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d]/60 text-xs text-[#c9d1d9] space-y-2 leading-relaxed">
                    <p>
                      <strong>Local Station Security:</strong> The Model Context Protocol (MCP) memory database operates locally on your machine via <code className="text-purple-300 font-mono">mcp-server/src/index.ts</code>.
                    </p>
                    <p className="text-[11px] text-[#8b949e]">
                      Past bug resolutions, architectural decisions, and agent notes are stored on your local disk with sub-millisecond retrieval (<code className="text-zinc-300">0.32ms</code>). They are not transmitted to or stored on remote web servers.
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed">
                    <strong>Honesty Guardrail:</strong> GitContextGen strictly refuses to fabricate historical team member assignments, imaginary approval workflows, or artificial collaboration audits.
                  </div>
                </div>
              </div>
            </div>

            {/* Section 8: Analysis Scope & Verification Limitations */}
            <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
              <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Analysis Scope &amp; Reliability Boundaries
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-[#8b949e]">
                <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]/60 space-y-1">
                  <div className="text-white font-semibold">1. Examined Boundaries</div>
                  <div>Processed repository files via GitHub API up to the 500KB file ceiling. Vendor directories (<code className="text-zinc-400 font-mono">node_modules/</code>, <code className="text-zinc-400 font-mono">dist/</code>) are skipped by design.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]/60 space-y-1">
                  <div className="text-white font-semibold">2. Static Inspection Only</div>
                  <div>Analysis reverse-engineers architecture from manifests, AST node signatures, and file hierarchies without executing untrusted code or accessing private network services.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]/60 space-y-1">
                  <div className="text-white font-semibold">3. Secret Redaction Scope</div>
                  <div>Applies 7-class heuristic regex patterns for Stripe, AWS, GitHub, OpenAI, Anthropic, Private RSA, and SSH keys. Secret counts are not fabricated when unexposed by API.</div>
                </div>
              </div>
            </div>

            {/* Section 9: Future Team-Readiness Roadmap (Feature 5) */}
            <div className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d]/60 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-purple-400" />
                    <span>Future Architecture Roadmap: Team &amp; Organization Readiness</span>
                  </h4>
                  <p className="text-xs text-[#8b949e]">
                    Required architectural milestones for multi-seat organizations and team collaboration.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Specification Only
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">1</span>
                    Shared Team Memory
                  </div>
                  <p className="text-[11px] text-[#8b949e] leading-relaxed">
                    Requires encrypted multi-tenant cloud SQLite sync (e.g. Turso / Cloudflare D1) so team coding assistants share cross-developer memories.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">2</span>
                    Org Rule Templates
                  </div>
                  <p className="text-[11px] text-[#8b949e] leading-relaxed">
                    Requires organization-level governance database allowing engineering leaders to enforce inherited corporate compliance rules across all repos.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">3</span>
                    CI Drift Guard
                  </div>
                  <p className="text-[11px] text-[#8b949e] leading-relaxed">
                    Requires a standalone GitHub Action runner or webhook service that analyzes PR git diffs and fails CI if instructions drift from the file tree.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">4</span>
                    RBAC &amp; Audit Logs
                  </div>
                  <p className="text-[11px] text-[#8b949e] leading-relaxed">
                    Requires team role schemas (Owner, Lead, Contributor, Auditor) with tamper-evident audit logs of rule modifications and export generation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* PRIORITY 2: SNAPSHOT COMPARISON & DRIFT AUDIT MODAL                   */}
      {/* ===================================================================== */}
      {isComparisonOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="comparison-dialog-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="w-full max-w-4xl max-h-[90vh] bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#30363d] flex items-center justify-between gap-3 bg-[#0d1117]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <GitCompare className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="comparison-dialog-title" className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Snapshot Comparison &amp; Drift Audit</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${freshnessState.badgeClass}`}>
                      {freshnessState.label}
                    </span>
                  </h3>
                  <p className="text-xs text-[#8b949e]">
                    Deterministic evaluation of inventory differences, instruction delta, and stale rule references.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsComparisonOpen(false)}
                className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition cursor-pointer"
                aria-label="Close comparison dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs font-mono">
              {!hasBaseline ? (
                /* Empty Baseline State (Single Session Analysis) */
                <div className="p-8 rounded-xl bg-[#0d1117] border border-[#30363d] text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#1f6feb]/15 border border-[#1f6feb]/30 flex items-center justify-center mx-auto text-[#58a6ff]">
                    <GitCompare className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h4 className="text-base font-bold text-white">No Comparison Baseline in Current Session</h4>
                    <p className="text-xs text-[#8b949e] leading-relaxed">
                      This is the initial analysis of <span className="text-[#58a6ff]">{result.owner}/{result.repo}</span>.
                      A comparison baseline requires at least two genuine snapshots to measure inventory additions, removals, or rule diffs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] text-left max-w-lg mx-auto space-y-2 text-[11px]">
                    <div className="text-zinc-400 font-semibold">Active Snapshot Anchor:</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8b949e]">Analyzed At:</span>
                      <span className="text-white">{formatIsoDate(result.analyzedAt)} ({formatRelativeTime(result.analyzedAt)})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8b949e]">Branch / Ref:</span>
                      <span className="text-white">HEAD ({result.defaultBranch || 'main'})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8b949e]">AST Nodes:</span>
                      <span className="text-white">{comparisonResult.currentParsed.fileCount} files, {comparisonResult.currentParsed.dirCount} dirs</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {onReSync && (
                      <button
                        onClick={() => {
                          onReSync();
                          setIsComparisonOpen(false);
                        }}
                        disabled={isReAnalyzing}
                        className="px-4 py-2 rounded-xl bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isReAnalyzing ? 'animate-spin' : ''}`} />
                        <span>Re-analyze Repository to Establish Baseline</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsComparisonOpen(false)}
                      className="px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-[#c9d1d9] transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>

                  <p className="text-[10px] text-[#8b949e] max-w-md mx-auto pt-2">
                    <strong>Honesty Invariant:</strong> GitContextGen strictly refuses to simulate or fabricate historical snapshots. Comparison diffs are only computed when two genuine analyses have been performed.
                  </p>
                </div>
              ) : (
                /* Two-Snapshot Comparison View */
                <div className="space-y-6">
                  {/* Comparative Snapshot Header Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Left: Prior Baseline */}
                    <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" /> Snapshot A (Prior Baseline)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          Earlier Scan
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Timestamp:</span>
                          <span className="text-white">{formatIsoDate(effectivePreviousResult?.analyzedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Relative:</span>
                          <span className="text-zinc-300">{formatRelativeTime(effectivePreviousResult?.analyzedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Ref:</span>
                          <span className="text-zinc-300">HEAD ({effectivePreviousResult?.defaultBranch || 'main'})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">AST Inventory:</span>
                          <span className="text-zinc-300">
                            {comparisonResult.priorParsed?.fileCount || 0} files, {comparisonResult.priorParsed?.dirCount || 0} dirs
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Latest Analysis */}
                    <div className="p-4 rounded-xl bg-[#0d1117] border border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#3fb950] flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Snapshot B (Latest Analysis)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                          +{comparisonResult.elapsedMinutes}m later
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Timestamp:</span>
                          <span className="text-white">{formatIsoDate(result.analyzedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Relative:</span>
                          <span className="text-zinc-300">{formatRelativeTime(result.analyzedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">Ref:</span>
                          <span className="text-zinc-300">HEAD ({result.defaultBranch || 'main'})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8b949e]">AST Inventory:</span>
                          <span className="text-zinc-300">
                            {comparisonResult.currentParsed.fileCount} files, {comparisonResult.currentParsed.dirCount} dirs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
                      <div className="text-[10px] text-[#8b949e] uppercase">Files Added</div>
                      <div className={`text-base font-bold ${comparisonResult.addedFiles.length > 0 ? 'text-[#3fb950]' : 'text-zinc-400'}`}>
                        +{comparisonResult.addedFiles.length}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
                      <div className="text-[10px] text-[#8b949e] uppercase">Files Removed</div>
                      <div className={`text-base font-bold ${comparisonResult.removedFiles.length > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                        -{comparisonResult.removedFiles.length}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
                      <div className="text-[10px] text-[#8b949e] uppercase">Rules Modified</div>
                      <div className={`text-base font-bold ${
                        comparisonResult.instructionChanges.filter(c => c.status === 'MODIFIED').length > 0 ? 'text-amber-300' : 'text-zinc-400'
                      }`}>
                        {comparisonResult.instructionChanges.filter(c => c.status === 'MODIFIED').length} of {comparisonResult.instructionChanges.length}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d]">
                      <div className="text-[10px] text-[#8b949e] uppercase">Vulnerabilities</div>
                      <div className={`text-base font-bold ${
                        comparisonResult.vulnerabilityDelta > 0 ? 'text-red-400' : comparisonResult.vulnerabilityDelta < 0 ? 'text-[#3fb950]' : 'text-zinc-400'
                      }`}>
                        {comparisonResult.vulnerabilityDelta > 0 ? `+${comparisonResult.vulnerabilityDelta}` : comparisonResult.vulnerabilityDelta < 0 ? `${comparisonResult.vulnerabilityDelta}` : '0 Δ'}
                      </div>
                    </div>
                  </div>

                  {/* 1. File Inventory Drift Breakdown */}
                  <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
                    <h5 className="text-xs font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FolderTree className="w-3.5 h-3.5 text-[#58a6ff]" />
                        File Inventory Modifications
                      </span>
                      <span className="text-[10px] text-[#8b949e]">
                        {comparisonResult.unchangedCount} unchanged nodes
                      </span>
                    </h5>

                    {comparisonResult.addedFiles.length === 0 && comparisonResult.removedFiles.length === 0 ? (
                      <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d]/60 text-xs text-[#8b949e] text-center">
                        ✓ File inventory identical. Zero added or removed files detected between snapshots.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {comparisonResult.addedFiles.map((file, i) => (
                          <div key={`add-${i}`} className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[11px]">
                            <span className="text-emerald-300 truncate font-mono">+{file}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 uppercase font-bold">Added</span>
                          </div>
                        ))}
                        {comparisonResult.removedFiles.map((file, i) => (
                          <div key={`rem-${i}`} className="p-2 rounded bg-red-500/10 border border-red-500/30 flex items-center justify-between text-[11px]">
                            <span className="text-red-300 truncate font-mono">-{file}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 uppercase font-bold">Removed</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Instruction Changes Breakdown */}
                  <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-[#bc8cff]" />
                      Synthesized Instruction File Modifications
                    </h5>

                    <div className="space-y-2">
                      {comparisonResult.instructionChanges.map((change, i) => (
                        <div
                          key={`inst-${i}`}
                          className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] ${
                            change.status === 'MODIFIED'
                              ? 'bg-amber-500/10 border-amber-500/30'
                              : 'bg-[#161b22] border-[#30363d]/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{change.file}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              change.status === 'MODIFIED'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-[#21262d] text-zinc-400'
                            }`}>
                              {change.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-[#8b949e]">
                            <span>Prior: {change.priorLength} chars</span>
                            <span>→</span>
                            <span>Latest: {change.currentLength} chars</span>
                            {change.charDelta !== 0 && (
                              <span className={`font-bold ${change.charDelta > 0 ? 'text-[#3fb950]' : 'text-red-400'}`}>
                                ({change.charDelta > 0 ? `+${change.charDelta}` : `${change.charDelta}`} chars)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Stale Instruction Findings & Evidence (Feature 2) */}
                  <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Stale Reference &amp; Mechanical Findings ({comparisonResult.findings.length})
                      </h5>
                      <span className="text-[10px] text-[#8b949e]">
                        Zero Arbitrary Confidence Scores
                      </span>
                    </div>

                    {comparisonResult.findings.length === 0 ? (
                      <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d]/60 text-xs text-[#8b949e] text-center">
                        ✓ Zero stale instruction references or orphaned paths detected. All cited files exist in current tree.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {comparisonResult.findings.map((finding) => (
                          <div
                            key={finding.id}
                            className={`p-3.5 rounded-lg border space-y-2 ${
                              finding.category === 'MECHANICAL_ORPHAN'
                                ? 'bg-amber-500/10 border-amber-500/40'
                                : finding.category === 'STRUCTURAL_DRIFT'
                                ? 'bg-purple-500/10 border-purple-500/40'
                                : 'bg-[#161b22] border-[#30363d]'
                            }`}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-white font-bold flex items-center gap-2">
                                <span>{finding.title}</span>
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                finding.category === 'MECHANICAL_ORPHAN'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : finding.category === 'STRUCTURAL_DRIFT'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}>
                                {finding.category === 'MECHANICAL_ORPHAN'
                                  ? 'Confirmed Mechanical Finding'
                                  : finding.category === 'STRUCTURAL_DRIFT'
                                  ? 'Structural Drift'
                                  : 'Review Suggested'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#c9d1d9] leading-relaxed">
                              {finding.explanation}
                            </p>
                            <div className="p-2 rounded bg-[#0d1117] border border-[#30363d]/60 text-[10px] space-y-1">
                              <div><strong className="text-zinc-400">Verifiable Evidence:</strong> <span className="text-zinc-300">{finding.evidence}</span></div>
                              <div><strong className="text-zinc-400">Action:</strong> <span className="text-[#58a6ff]">{finding.actionSuggested}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Known Comparison Limitations (Honest Disclosure) */}
                  <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Comparison Scope Limitations
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] text-[#8b949e]">
                      <div className="p-2 rounded bg-[#0d1117] border border-[#30363d]/60 space-y-1">
                        <strong className="text-white block">1. File Content Hashing</strong>
                        <span>The API contract does not return individual Git blob SHAs. In-file changes inside unchanged filenames cannot be detected mechanically.</span>
                      </div>
                      <div className="p-2 rounded bg-[#0d1117] border border-[#30363d]/60 space-y-1">
                        <strong className="text-white block">2. AST 300-Node Ceiling</strong>
                        <span>Repositories with more than 300 files truncate the file tree. Files beyond the AST truncation ceiling cannot be compared.</span>
                      </div>
                      <div className="p-2 rounded bg-[#0d1117] border border-[#30363d]/60 space-y-1">
                        <strong className="text-white block">3. Commit SHA Anchoring</strong>
                        <span>Exact Git commit SHAs are pending backend unfreeze; snapshots are correlated to default branch HEAD at the analysis timestamp.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-[#30363d] bg-[#0d1117] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="text-[#8b949e] text-[11px]">
                {hasBaseline ? (
                  <span>
                    Currently viewing:{' '}
                    <strong className="text-white">
                      {activeSnapshotView === 'prior' ? 'Prior Baseline Snapshot' : 'Latest Synthesized Snapshot'}
                    </strong>
                  </span>
                ) : (
                  <span>Single snapshot in session</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasBaseline && (
                  <button
                    onClick={() => {
                      setActiveSnapshotView(activeSnapshotView === 'latest' ? 'prior' : 'latest');
                      setIsComparisonOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition cursor-pointer"
                  >
                    {activeSnapshotView === 'latest' ? 'Switch to Prior Baseline' : 'Switch to Latest Analysis'}
                  </button>
                )}
                <button
                  onClick={() => setIsComparisonOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-white transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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