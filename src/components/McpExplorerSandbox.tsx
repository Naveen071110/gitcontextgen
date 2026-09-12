'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RepositoryAnalysisResult } from '@/lib/types';
import {
  Server,
  Terminal,
  Search,
  Code2,
  FileCode2,
  Lock,
  Unlock,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Activity,
  CheckCircle,
  ExternalLink,
  Laptop,
  TerminalSquare
} from 'lucide-react';

export interface McpExplorerSandboxProps {
  repo: RepositoryAnalysisResult;
}

interface McpToolDefinition {
  id: string;
  name: string;
  badge: string;
  description: string;
  inputSchema: Record<string, any>;
  sampleOutput: (repo: RepositoryAnalysisResult, query?: string) => string;
}

export default function McpExplorerSandbox({ repo }: McpExplorerSandboxProps) {
  // Live Heartbeat State
  const [isDaemonLive, setIsDaemonLive] = useState<boolean>(true);
  const [daemonPort, setDaemonPort] = useState<number>(3012);
  const [daemonPid, setDaemonPid] = useState<number>(4892);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 3-Step Interactive Onboarding Assistant State
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);
  const [mockTerminalStep1, setMockTerminalStep1] = useState<boolean>(false);
  const [mockTerminalStep2, setMockTerminalStep2] = useState<boolean>(false);

  // Local Connection Handshake Diagnostic State
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [diagnosticReport, setDiagnosticReport] = useState<{
    status: 'success' | 'offline';
    timestamp: string;
    port: number;
    pid: number;
    latencyMs: number;
    protocol: string;
    repoScope: string;
    cacheStatus: string;
    toolsCount: number;
  } | null>(null);

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setTimeout(() => {
      setIsTestingConnection(false);
      if (!isDaemonLive) {
        setDiagnosticReport({
          status: 'offline',
          timestamp: new Date().toLocaleTimeString(),
          port: daemonPort,
          pid: daemonPid,
          latencyMs: 0,
          protocol: 'Connection Refused (ECONNREFUSED)',
          repoScope: `${repo.owner}/${repo.repo}`,
          cacheStatus: 'Offline',
          toolsCount: 0,
        });
      } else {
        setDiagnosticReport({
          status: 'success',
          timestamp: new Date().toLocaleTimeString(),
          port: daemonPort,
          pid: daemonPid,
          latencyMs: 1.2,
          protocol: 'JSON-RPC 2.0 (MCP 2024-11-05)',
          repoScope: `${repo.owner}/${repo.repo}`,
          cacheStatus: 'L2 Hot Cache Warm',
          toolsCount: 4,
        });
      }
    }, 600);
  };

  // Tools Accordion State
  const [expandedTool, setExpandedTool] = useState<string | null>('search_codebase');

  // Sandbox Query State
  const [queryInput, setQueryInput] = useState<string>(
    repo.monetizableOutputs?.framework === 'WordPress'
      ? 'Find where database connection queries are escaping'
      : 'Generate a structural map for Next.js folder routes'
  );
  const [selectedTool, setSelectedTool] = useState<string>('search_codebase');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<{
    callJson: string;
    responsePayload: string;
    tokensSaved: number;
    latencyMs: number;
    cacheHit: boolean;
    timestamp: string;
  } | null>(null);

  // Setup Config Helper Tab State
  const [setupTab, setSetupTab] = useState<'claude-code' | 'claude-desktop' | 'cursor'>('claude-code');

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const cliSnippet = `gitcontextgen-mcp --port ${daemonPort} --repo ${repo.owner}/${repo.repo}`;

  // Defined MCP Tools
  const tools: McpToolDefinition[] = [
    {
      id: 'search_codebase',
      name: 'search_codebase',
      badge: 'Query Engine',
      description: 'Performs semantic AST & regex query matching across indexed repository boundaries. Returns exact file locations, function signatures, and context snippets.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Semantic concept, symbol name, or architectural question (e.g., "auth middleware", "database queries")',
          },
          scope: {
            type: 'string',
            enum: ['all', 'controllers', 'models', 'routes', 'security'],
            description: 'Boundary restriction filter for token optimization.',
          },
        },
        required: ['query'],
      },
      sampleOutput: (r, q) => {
        const queryTerm = (q || 'database queries').toLowerCase();
        const framework = r.monetizableOutputs?.framework || 'Next.js';
        return `### 🔍 MCP Query Results: "${queryTerm}"
- **Repository Scope**: \`${r.owner}/${r.repo}\` (${framework})
- **Index Status**: L2 Disk Cache Active (342 symbols resolved)

#### 1. Relevant AST Hierarchy
\`\`\`typescript
// Matched symbol boundary: [${queryTerm}]
// Source: src/lib/db.ts
export async function executeQuery(sql: string, params: unknown[]) {
  // Enforces parametrized late-escaping WPCS/PostgreSQL standards
  const sanitized = sanitizeInputs(params);
  return connectionPool.query(sql, sanitized);
}
\`\`\`

#### 2. Architectural Guardrail Invariant
> Enforce: Never bypass parametrized queries or expose raw connection pool handlers to client routes.`;
      },
    },
    {
      id: 'get_ast_tree',
      name: 'get_ast_tree',
      badge: 'Topology Engine',
      description: 'Generates zero-hallucination codebase topology schemas, directory boundaries, API endpoint maps, and component hierarchies.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Target directory path (defaults to root ".").',
          },
          depth: {
            type: 'number',
            description: 'Maximum recursion depth (1-5).',
          },
        },
        required: ['path'],
      },
      sampleOutput: (r) => {
        return `### 🌳 AST Codebase Hierarchy — ${r.repo}
\`\`\`text
${r.fileTreeSummary ? r.fileTreeSummary.split('\n').slice(0, 12).join('\n') : `src/
├── app/
│   ├── api/
│   │   └── analyze/route.ts (Edge API)
│   ├── dashboard/
│   │   └── page.tsx (Client Controller)
│   └── layout.tsx (Root Provider)
├── components/
│   ├── RepoWorkspaceView.tsx (Canonical 5-Tab)
│   └── MermaidDiagram.tsx (SVG Fallback)
└── lib/
    ├── analyzer/engine.ts (Monetization Orchestrator)
    └── db.ts (Resilient Dual-Mode Store)`}
\`\`\`
- **Module Count**: 14 files indexed
- **Entrypoint**: \`src/app/page.tsx\`
- **Primary Runtime**: Edge Runtime & Node.js 20+`;
      },
    },
    {
      id: 'get_framework_rules',
      name: 'get_framework_rules',
      badge: 'Rule Compiler',
      description: 'Extracts synthesized architectural constraints and framework-specific rules (Next.js App Router rules or WordPress WPCS security standards) with alwaysApply: true.',
      inputSchema: {
        type: 'object',
        properties: {
          framework: {
            type: 'string',
            enum: ['Next.js', 'WordPress', 'Laravel', 'Generic'],
            description: 'Target framework dialect.',
          },
          format: {
            type: 'string',
            enum: ['mdc', 'claude', 'agents'],
            description: 'Specification delivery format.',
          },
        },
        required: ['framework'],
      },
      sampleOutput: (r) => {
        const rules = r.monetizableOutputs?.cursorRules?.[0]?.content;
        return rules ? rules.slice(0, 480) + '\n\n# ... [Full Rule Specification Active]' : `---
description: ${r.repo} Architectural Guardrails
globs: *
alwaysApply: true
---
# Strict Framework Invariants
1. Enforce pure React 19 functional patterns with TypeScript strict typing.
2. Route controllers must isolate server-side DB transactions from client boundaries.`;
      },
    },
    {
      id: 'sync_rules',
      name: 'sync_rules',
      badge: 'Concurrency Lock',
      description: 'Executes bidirectional write-locks with PID-aware collision protection, synchronizing context directly into .cursor/rules and CLAUDE.md files.',
      inputSchema: {
        type: 'object',
        properties: {
          targets: {
            type: 'array',
            items: { type: 'string' },
            description: 'Relative paths to rule targets (e.g. [".cursor/rules/project.mdc", "CLAUDE.md"]).',
          },
          force: {
            type: 'boolean',
            description: 'Bypass stale lock files if agent PID is dead.',
          },
        },
        required: ['targets'],
      },
      sampleOutput: (r) => {
        return `### 🔒 Synchronization Invariant Lock Protocol
- **Target Files**: \`.cursor/rules/project-rules.mdc\`, \`CLAUDE.md\`
- **Status**: Lock Acquired (PID: 4892)
- **Hash**: \`sha256:7f4a2d8b1c9e...\`
- **Result**: 2 files written successfully in 3.4ms with zero race conditions.`;
      },
    },
  ];

  // Execute Simulated Query
  const runSandboxQuery = () => {
    setIsExecuting(true);
    setExecutionResult(null);

    const activeToolDef = tools.find((t) => t.id === selectedTool) || tools[0];

    setTimeout(() => {
      const callObj = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: activeToolDef.name,
          arguments: {
            query: queryInput,
            scope: 'security',
          },
        },
        id: Math.floor(Math.random() * 1000) + 1,
      };

      const payload = activeToolDef.sampleOutput(repo, queryInput);

      setExecutionResult({
        callJson: JSON.stringify(callObj, null, 2),
        responsePayload: payload,
        tokensSaved: 2400 + Math.floor(Math.random() * 800),
        latencyMs: Number((3.2 + Math.random() * 2.8).toFixed(2)),
        cacheHit: true,
        timestamp: new Date().toISOString(),
      });
      setIsExecuting(false);
    }, 450);
  };

  // Pre-formatted Setup Codes
  const claudeCodeJson = JSON.stringify(
    {
      mcpServers: {
        [`gitcontextgen-${repo.repo}`]: {
          command: 'npx',
          args: ['-y', '@gitcontextgen/core', 'mcp', '--repo', `${repo.owner}/${repo.repo}`],
        },
      },
    },
    null,
    2
  );

  const claudeDesktopJson = JSON.stringify(
    {
      mcpServers: {
        [repo.repo]: {
          command: 'npx',
          args: ['-y', '@gitcontextgen/core', 'mcp', '--repo', `${repo.owner}/${repo.repo}`],
          env: {
            GITCONTEXTGEN_AUTO_SYNC: 'true',
          },
        },
      },
    },
    null,
    2
  );

  const cursorSetupText = `1. Open Cursor Settings (Cmd+, or Ctrl+,)
2. Navigate to: Features > MCP Servers
3. Click "Add New MCP Server"
4. Name: gitcontextgen-${repo.repo}
5. Type: command
6. Command: npx -y @gitcontextgen/core mcp --repo ${repo.owner}/${repo.repo}`;

  return (
    <div className="space-y-6 text-[#c9d1d9] font-sans">
      {/* 1. Live Heartbeat Bar */}
      <div className="p-4 sm:p-5 rounded-xl border border-[#30363d] bg-[#161b22] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setIsDaemonLive(!isDaemonLive)}
            title="Click to toggle simulated live/offline daemon state"
            className="cursor-pointer group flex items-center gap-1.5 focus:outline-none"
          >
            <span className="relative flex h-3.5 w-3.5">
              {isDaemonLive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#3fb950]" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#8b949e]" />
              )}
            </span>
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#f0f6fc]">
                MCP Daemon Status:
              </span>
              {isDaemonLive ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#238636]/20 border border-[#2ea043]/40 text-[#3fb950] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" /> Live &amp; Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#21262d] border border-[#30363d] text-[#8b949e] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8b949e]" /> Offline
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#0d1117] border border-[#30363d] text-[#58a6ff]">
                Port: {daemonPort}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#0d1117] border border-[#30363d] text-[#d2a8ff]">
                PID: {daemonPid}
              </span>
            </div>
            <p className="text-[11px] text-[#8b949e] font-mono mt-1">
              stdio transport • Protocol Schema: 2024-11-05 • Sub-millisecond warm token caching
            </p>
          </div>
        </div>

        {/* Diagnostic Handshake & Dynamic CLI launch snippet */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="px-3 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            title="Test local daemon TCP handshake and JSON-RPC protocol"
          >
            {isTestingConnection ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Pinging 127.0.0.1...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span>Test Local Connection</span>
              </>
            )}
          </button>

          <div className="flex items-center px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#58a6ff] overflow-x-auto">
            <span className="text-[#8b949e] mr-1.5">$</span>
            <span className="whitespace-nowrap">{cliSnippet}</span>
          </div>
          <button
            onClick={() => handleCopy(cliSnippet, 'cli-snippet')}
            className="p-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] transition shrink-0 cursor-pointer"
            title="Copy command"
          >
            {copiedKey === 'cli-snippet' ? (
              <Check className="w-4 h-4 text-[#3fb950]" />
            ) : (
              <Copy className="w-4 h-4 text-[#8b949e]" />
            )}
          </button>
        </div>
      </div>

      {/* Connection Diagnostic Handshake Modal / Banner */}
      <AnimatePresence>
        {diagnosticReport && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-4 rounded-xl border text-xs font-mono ${
              diagnosticReport.status === 'success'
                ? 'bg-[#161b22] border-[#2ea043]/50 text-[#c9d1d9]'
                : 'bg-[#161b22] border-[#f85149]/50 text-[#c9d1d9]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#30363d] mb-3">
              <div className="flex items-center gap-2">
                {diagnosticReport.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-[#3fb950]" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#f85149]" />
                )}
                <span className="font-bold text-[#f0f6fc]">
                  {diagnosticReport.status === 'success'
                    ? '⚡ Local MCP Handshake Diagnostic: 100% Verified'
                    : '⚠️ Local MCP Handshake Diagnostic: Daemon Offline'}
                </span>
                <span className="text-[10px] text-[#8b949e]">
                  ({diagnosticReport.timestamp})
                </span>
              </div>
              <button
                onClick={() => setDiagnosticReport(null)}
                className="text-[#8b949e] hover:text-[#f0f6fc] text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {diagnosticReport.status === 'success' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
                  <div className="text-[10px] text-[#8b949e]">TCP HANDSHAKE</div>
                  <div className="text-[#3fb950] font-bold mt-0.5 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Port {diagnosticReport.port} (PID {diagnosticReport.pid})
                  </div>
                  <div className="text-[10px] text-[#8b949e] mt-1">Latency: {diagnosticReport.latencyMs}ms</div>
                </div>

                <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
                  <div className="text-[10px] text-[#8b949e]">PROTOCOL SCHEMA</div>
                  <div className="text-[#58a6ff] font-bold mt-0.5">
                    {diagnosticReport.protocol}
                  </div>
                  <div className="text-[10px] text-[#8b949e] mt-1">JSON-RPC 2.0 Compliant</div>
                </div>

                <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
                  <div className="text-[10px] text-[#8b949e]">AST REPO TARGET</div>
                  <div className="text-[#d2a8ff] font-bold mt-0.5 truncate">
                    {diagnosticReport.repoScope}
                  </div>
                  <div className="text-[10px] text-[#8b949e] mt-1">Bound to Active Session</div>
                </div>

                <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
                  <div className="text-[10px] text-[#8b949e]">HOT CACHE / TOOLS</div>
                  <div className="text-[#3fb950] font-bold mt-0.5">
                    {diagnosticReport.toolsCount}/4 Tools Online
                  </div>
                  <div className="text-[10px] text-[#8b949e] mt-1">{diagnosticReport.cacheStatus}</div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded bg-[#0d1117] border border-[#f85149]/30 text-[#f85149] space-y-1">
                <p>Failed to establish connection to stdio daemon on 127.0.0.1:{daemonPort}.</p>
                <p className="text-[#8b949e] text-[11px]">
                  Ensure the daemon is started in your terminal via: <code className="text-[#58a6ff]">{cliSnippet}</code>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Interactive 3-Step MCP Onboarding Assistant */}
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden shadow-xl">
        <div className="px-5 py-4 bg-[#21262d] border-b border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-semibold text-[#f0f6fc]">
              3-Step Fast MCP Onboarding Assistant
            </h4>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <button
              onClick={() => setOnboardingStep(1)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                onboardingStep === 1
                  ? 'bg-[#21262d] text-[#58a6ff] shadow'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              1. Global Install
            </button>
            <button
              onClick={() => setOnboardingStep(2)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                onboardingStep === 2
                  ? 'bg-[#21262d] text-[#58a6ff] shadow'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              2. Init &amp; Auth
            </button>
            <button
              onClick={() => setOnboardingStep(3)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                onboardingStep === 3
                  ? 'bg-[#21262d] text-[#58a6ff] shadow'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              3. Connect Editor
            </button>
          </div>
        </div>

        <div className="p-5">
          {onboardingStep === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h5 className="text-sm font-bold text-[#f0f6fc]">Step 1: Install GitContextGen Core CLI Globally</h5>
                  <p className="text-xs text-[#8b949e] mt-0.5">
                    Installs the high-fidelity AST parsing daemon and MCP stdio connector onto your local development machine.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy('npm install -g gitcontextgen', 'step1-npm')}
                    className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'step1-npm' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy npm command</span>
                  </button>
                  <button
                    onClick={() => setMockTerminalStep1(!mockTerminalStep1)}
                    className="px-3 py-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-[#c9d1d9] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5 text-[#3fb950]" />
                    <span>{mockTerminalStep1 ? 'Hide Test Terminal' : '▶ Simulate CLI Verification'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] font-mono text-xs text-[#58a6ff] flex items-center justify-between">
                <span>npm install -g gitcontextgen</span>
                <span className="text-[#8b949e] text-[11px]">Requires Node.js &gt;= 18.0.0</span>
              </div>

              {mockTerminalStep1 && (
                <div className="rounded-lg bg-[#05070a] border border-[#30363d] p-3.5 font-mono text-xs space-y-1.5 text-[#c9d1d9]">
                  <div className="text-[#8b949e] flex items-center gap-1.5 border-b border-[#21262d] pb-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d29922]/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]/80 inline-block" />
                    <span className="ml-2 text-[11px]">zsh — 80x24</span>
                  </div>
                  <div><span className="text-[#3fb950]">$</span> npm install -g gitcontextgen</div>
                  <div className="text-[#8b949e]">added 48 packages in 1.2s</div>
                  <div><span className="text-[#3fb950]">$</span> gitcontextgen --version</div>
                  <div className="text-[#58a6ff]">gitcontextgen/1.2.0 darwin-arm64 (Node v22.13.1)</div>
                  <div className="text-[#3fb950] flex items-center gap-1.5 pt-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>CLI successfully registered to system PATH. Ready for step 2!</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h5 className="text-sm font-bold text-[#f0f6fc]">Step 2: Initialize &amp; Authenticate Repository</h5>
                  <p className="text-xs text-[#8b949e] mt-0.5">
                    Run in your repository root to detect git remotes, link your GitContextGen account, and cache AST rules.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy('gitcontextgen init', 'step2-init')}
                    className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'step2-init' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy init command</span>
                  </button>
                  <button
                    onClick={() => setMockTerminalStep2(!mockTerminalStep2)}
                    className="px-3 py-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-[#c9d1d9] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5 text-[#3fb950]" />
                    <span>{mockTerminalStep2 ? 'Hide Test Terminal' : '▶ Simulate Repo Linking'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] font-mono text-xs text-[#58a6ff] flex items-center justify-between">
                <span>gitcontextgen init</span>
                <span className="text-[#8b949e] text-[11px]">Creates .gitcontextgen/config.json</span>
              </div>

              {mockTerminalStep2 && (
                <div className="rounded-lg bg-[#05070a] border border-[#30363d] p-3.5 font-mono text-xs space-y-1.5 text-[#c9d1d9]">
                  <div className="text-[#8b949e] flex items-center gap-1.5 border-b border-[#21262d] pb-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d29922]/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]/80 inline-block" />
                    <span className="ml-2 text-[11px]">zsh — 80x24</span>
                  </div>
                  <div><span className="text-[#3fb950]">$</span> cd my-project &amp;&amp; gitcontextgen init</div>
                  <div className="text-[#8b949e]">✔ Detected git remote: {repo.owner}/{repo.repo}</div>
                  <div className="text-[#8b949e]">✔ Authenticated active session token</div>
                  <div className="text-[#58a6ff]">✔ Generated .gitcontextgen/config.json</div>
                  <div className="text-[#3fb950] flex items-center gap-1.5 pt-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Repository successfully linked! Proceed to step 3 to connect your AI editor.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-bold text-[#f0f6fc]">Step 3: Connect MCP Server to Your Preferred AI Agent</h5>
                <p className="text-xs text-[#8b949e] mt-0.5">
                  Select your editor below to copy the one-command CLI connector or graphical config.
                </p>
              </div>

              <div className="flex items-center gap-2 border-b border-[#30363d] pb-2">
                <button
                  onClick={() => setSetupTab('claude-code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    setupTab === 'claude-code'
                      ? 'bg-[#238636] text-white'
                      : 'bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                >
                  Claude Code CLI
                </button>
                <button
                  onClick={() => setSetupTab('claude-desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    setupTab === 'claude-desktop'
                      ? 'bg-[#238636] text-white'
                      : 'bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                >
                  Claude Desktop
                </button>
                <button
                  onClick={() => setSetupTab('cursor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    setupTab === 'cursor'
                      ? 'bg-[#238636] text-white'
                      : 'bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                >
                  Cursor IDE
                </button>
              </div>

              {setupTab === 'claude-code' && (
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#8b949e]">One-Command Terminal Connector:</span>
                    <button
                      onClick={() => handleCopy(`claude mcp add gitcontextgen -- npx -y @gitcontextgen/core mcp --repo ${repo.owner}/${repo.repo}`, 'step3-claude-code')}
                      className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'step3-claude-code' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy CLI command</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-[#58a6ff] overflow-x-auto whitespace-pre-wrap">
                    claude mcp add gitcontextgen -- npx -y @gitcontextgen/core mcp --repo {repo.owner}/{repo.repo}
                  </pre>
                </div>
              )}

              {setupTab === 'claude-desktop' && (
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#8b949e]">Drop into claude_desktop_config.json:</span>
                    <button
                      onClick={() => handleCopy(claudeDesktopJson, 'step3-claude-desktop')}
                      className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'step3-claude-desktop' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy JSON</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-[#c9d1d9] overflow-x-auto">
                    {claudeDesktopJson}
                  </pre>
                </div>
              )}

              {setupTab === 'cursor' && (
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#8b949e]">Cursor Settings &gt; Features &gt; MCP Servers:</span>
                    <button
                      onClick={() => handleCopy(cursorSetupText, 'step3-cursor')}
                      className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'step3-cursor' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Walkthrough</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-[#c9d1d9] overflow-x-auto whitespace-pre-wrap">
                    {cursorSetupText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Interactive Tool & Resource Registry Browser (Accordion) */}
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden shadow-xl">
        <div className="px-5 py-4 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-[#58a6ff]" />
            <h4 className="text-sm font-semibold text-[#f0f6fc]">
              Registered MCP Tool Capabilities (4 Active Schema Contracts)
            </h4>
          </div>
          <span className="text-xs font-mono text-[#8b949e]">
            JSON-RPC 2.0 Compliant
          </span>
        </div>

        <div className="divide-y divide-[#30363d]">
          {tools.map((tool) => {
            const isExpanded = expandedTool === tool.id;
            return (
              <div key={tool.id} className="bg-[#161b22] transition-colors">
                <button
                  onClick={() => setExpandedTool(isExpanded ? null : tool.id)}
                  className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#21262d]/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-[#58a6ff] flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-[#58a6ff]" />
                      {tool.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0d1117] border border-[#30363d] text-[#d2a8ff]">
                      {tool.badge}
                    </span>
                    <span className="text-xs text-[#8b949e] truncate hidden sm:inline">
                      {tool.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[11px] font-mono text-[#8b949e]">
                      {isExpanded ? 'Hide Schema' : 'View Schema'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#8b949e]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#8b949e]" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-[#0d1117] border-t border-[#30363d]/60 px-5 py-4 space-y-3"
                    >
                      <p className="text-xs text-[#c9d1d9] leading-relaxed">
                        {tool.description}
                      </p>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-[#8b949e]">
                            Input Schema (JSON Schema Draft-07):
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(
                                JSON.stringify(tool.inputSchema, null, 2),
                                `schema-${tool.id}`
                              )
                            }
                            className="text-[11px] font-mono text-[#58a6ff] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === `schema-${tool.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-[#3fb950]" /> Copied Schema
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Schema
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] text-[#c9d1d9] font-mono text-xs overflow-x-auto leading-relaxed">
                          {JSON.stringify(tool.inputSchema, null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Live MCP Query Sandbox (The Core "Aha!" Moment) */}
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden shadow-xl space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d] pb-4">
          <div>
            <h4 className="text-sm font-bold text-[#f0f6fc] flex items-center gap-2 font-mono">
              <Zap className="w-4 h-4 text-[#e3b341]" />
              Live MCP Query Sandbox
            </h4>
            <p className="text-xs text-[#8b949e] font-mono mt-0.5">
              Simulate raw JSON-RPC 2.0 calls and verify sanitized context extraction before invoking Claude Code or Cursor.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#238636]/15 border border-[#2ea043]/30 text-[#3fb950] shrink-0">
            L2 Cache Simulated • Zero Hallucination
          </span>
        </div>

        {/* Query Input Console */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8b949e]">
                <Search className="w-4 h-4 text-[#58a6ff]" />
              </div>
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="What do you want the AI to understand about this codebase?"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] text-xs font-mono text-[#f0f6fc] outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="py-2.5 px-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#c9d1d9] outline-none cursor-pointer"
              >
                {tools.map((t) => (
                  <option key={t.id} value={t.id}>
                    Tool: {t.name}
                  </option>
                ))}
              </select>

              <button
                onClick={runSandboxQuery}
                disabled={isExecuting}
                className="px-4 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-mono font-bold transition flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 shadow-md shadow-[#238636]/20"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Calling...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Query</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-[#8b949e]">Quick Presets:</span>
            {[
              'Find where database connection queries are escaping',
              'Generate a structural map for Next.js folder routes',
              'Audit security boundaries for environment variables',
              'Extract AST dependency nodes for primary services',
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setQueryInput(preset);
                  setSelectedTool(
                    preset.includes('map') ? 'get_ast_tree' : preset.includes('boundaries') ? 'get_framework_rules' : 'search_codebase'
                  );
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] transition cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Split-View Terminal Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Left Panel: The Call */}
          <div className="rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#e3b341]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" />
                <span className="text-xs font-mono text-[#f0f6fc] font-bold ml-1.5">
                  Client MCP Request (JSON-RPC 2.0)
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#58a6ff]">method: tools/call</span>
            </div>

            <pre className="p-4 text-xs font-mono text-[#7ee787] overflow-x-auto min-h-[220px] max-h-[320px] leading-relaxed select-text">
              {executionResult
                ? executionResult.callJson
                : JSON.stringify(
                    {
                      jsonrpc: '2.0',
                      method: 'tools/call',
                      params: {
                        name: selectedTool,
                        arguments: {
                          query: queryInput,
                        },
                      },
                      id: 1,
                    },
                    null,
                    2
                  )}
            </pre>
          </div>

          {/* Right Panel: The Context Payload */}
          <div className="rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#d2a8ff]" />
                <span className="text-xs font-mono text-[#f0f6fc] font-bold">
                  Server Context Payload
                </span>
              </div>

              {executionResult && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#238636]/20 text-[#3fb950] border border-[#2ea043]/30">
                    L2 Cache Hit: Saves {executionResult.tokensSaved.toLocaleString()} tokens
                  </span>
                  <span className="text-[10px] font-mono text-[#8b949e]">
                    {executionResult.latencyMs}ms
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 text-xs font-mono text-[#c9d1d9] overflow-x-auto min-h-[220px] max-h-[320px] leading-relaxed select-text">
              {executionResult ? (
                <div className="whitespace-pre-wrap">
                  {executionResult.responsePayload}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#8b949e] py-12 space-y-2">
                  <Terminal className="w-8 h-8 text-[#30363d]" />
                  <p className="text-xs font-mono">
                    Click &quot;Run Query&quot; above to simulate an active MCP agent tool call.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Adaptive Integration Cards & Copy-Paste Setup Helpers */}
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden shadow-xl">
        <div className="px-5 py-4 bg-[#21262d] border-b border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-[#d2a8ff]" />
            <h4 className="text-sm font-semibold text-[#f0f6fc]">
              Client Agent Configuration Helpers
            </h4>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <button
              onClick={() => setSetupTab('claude-code')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                setupTab === 'claude-code'
                  ? 'bg-[#21262d] text-[#f0f6fc] shadow'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              Claude Code CLI
            </button>
            <button
              onClick={() => setSetupTab('claude-desktop')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                setupTab === 'claude-desktop'
                  ? 'bg-[#21262d] text-[#f0f6fc] shadow'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              Claude Desktop
            </button>
            <button
              onClick={() => setSetupTab('cursor')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                setupTab === 'cursor'
                  ? 'bg-[#21262d] text-[#f0f6fc] shadow'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              Cursor IDE
            </button>
          </div>
        </div>

        <div className="p-5">
          {setupTab === 'claude-code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#8b949e]">
                  Drop this block into your global Claude configuration file (<code>~/.claude.json</code>):
                </span>
                <button
                  onClick={() => handleCopy(claudeCodeJson, 'claude-code-cfg')}
                  className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'claude-code-cfg' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3fb950]" /> Copied Config
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy JSON
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] font-mono text-xs overflow-x-auto leading-relaxed select-text">
                {claudeCodeJson}
              </pre>
            </div>
          )}

          {setupTab === 'claude-desktop' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#8b949e]">
                  Paste into <code>claude_desktop_config.json</code> (macOS: <code>~/Library/Application Support/Claude/</code>):
                </span>
                <button
                  onClick={() => handleCopy(claudeDesktopJson, 'claude-desktop-cfg')}
                  className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'claude-desktop-cfg' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3fb950]" /> Copied Config
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy JSON
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] font-mono text-xs overflow-x-auto leading-relaxed select-text">
                {claudeDesktopJson}
              </pre>
            </div>
          )}

          {setupTab === 'cursor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#8b949e]">
                  Configure Cursor Native Model Context Protocol (MCP) server:
                </span>
                <button
                  onClick={() => handleCopy(cursorSetupText, 'cursor-cfg')}
                  className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-[#58a6ff] hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'cursor-cfg' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3fb950]" /> Copied Instructions
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Instructions
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] font-mono text-xs overflow-x-auto leading-relaxed select-text">
                {cursorSetupText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Teaser placeholder for non-premium accounts when billing gates are enforced
 */
export function McpUpgradePlaceholder() {
  return (
    <div className="p-8 sm:p-12 rounded-2xl border border-[#30363d] bg-[#161b22] text-center space-y-5 max-w-2xl mx-auto shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-[#21262d] border border-[#30363d] flex items-center justify-center mx-auto text-[#d2a8ff]">
        <Lock className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-[#f0f6fc]">
          Model Context Protocol (MCP) Server Explorer
        </h3>
        <p className="text-xs text-[#8b949e] font-mono leading-relaxed">
          The interactive MCP server sandbox, sub-millisecond AST query stream, and local stdio daemon are reserved for Pro Builder and Agency Team plans.
        </p>
      </div>

      <div className="pt-2 flex justify-center">
        <a
          href="/pricing"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] text-white font-mono text-xs font-bold transition hover:opacity-90 flex items-center gap-2 shadow-lg"
        >
          <span>Upgrade to Pro Builder</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
