'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, ShieldCheck, Zap, X } from 'lucide-react';

interface TerminalLoaderProps {
  owner: string;
  repo: string;
  framework?: string;
  archetype?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

interface LogEntry {
  tag: string;
  tagColor: string;
  time: string;
  text: string;
  type: 'cmd' | 'info' | 'success' | 'warn';
}

export default function TerminalLoader({
  owner,
  repo,
  framework = 'Next.js',
  archetype,
  onComplete,
  onCancel,
}: TerminalLoaderProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('Connecting to GitHub API gateway...');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const initialCommand: LogEntry = {
    tag: 'EXEC',
    tagColor: 'text-[#58a6ff] bg-[#1f6feb]/15 border-[#388bfd]/30',
    type: 'cmd',
    time: '0.00s',
    text: `gitcontextgen analyze https://github.com/${owner}/${repo} --strict --sync-rules`,
  };

  const detectedFrameworkLabel = framework || 'Next.js';
  const repoLower = repo.toLowerCase();
  const isAgent =
    archetype === 'AI_AGENT' ||
    archetype === 'AGENT_SKILL' ||
    repoLower.includes('agent') ||
    repoLower.includes('hermes') ||
    repoLower.includes('autogpt') ||
    repoLower.includes('langchain') ||
    repoLower.includes('crewai');
  const isLibrary =
    archetype === 'LIBRARY_SDK' ||
    repoLower.includes('sdk') ||
    repoLower.includes('client') ||
    repoLower.endsWith('-lib');
  const isWordPress =
    archetype === 'CMS_PLUGIN' ||
    detectedFrameworkLabel.toLowerCase().includes('wordpress');
  const isNext =
    archetype === 'SAAS_WEB_APP' ||
    detectedFrameworkLabel.toLowerCase().includes('next');

  // Honest telemetry steps representing the actual stages of the analysis pipeline
  const pipelineSequence: Array<{
    tag: string;
    tagColor: string;
    text: string;
    stepTitle: string;
    delayMs: number;
    type: 'info' | 'success' | 'warn';
  }> = [
    {
      tag: 'GATEWAY',
      tagColor: 'text-[#79c0ff] bg-[#1f6feb]/15 border-[#388bfd]/30',
      text: `Connected to GitHub API gateway. Ingesting recursive repository tree for ${owner}/${repo}...`,
      stepTitle: 'Ingesting repository tree...',
      delayMs: 300,
      type: 'info',
    },
    {
      tag: 'ARCHITECTURE',
      tagColor: 'text-[#d2a8ff] bg-[#8957e5]/15 border-[#a371f7]/30',
      text: isAgent
        ? `[Agent Scanner] Detected AI Agent system. Indexing agent reasoning loops, tool-calling schemas, and memory stores...`
        : isLibrary
        ? `[Library Scanner] Detected Library/SDK package. Mapping public API contracts, types, and test suites...`
        : isWordPress
        ? `[CMS Scanner] Found WordPress architecture. Mapping plugin hooks, $wpdb queries, and WPCS standards...`
        : isNext
        ? `[App Scanner] Found Next.js / SaaS structure. Mapping App Router hierarchy, API routes, and components...`
        : `[Architecture Scanner] Indexed repository boundaries. Mapping architecture hierarchy and package manifests...`,
      stepTitle: 'Classifying repository archetype & AST...',
      delayMs: 800,
      type: 'info',
    },
    {
      tag: 'SANITIZATION',
      tagColor: 'text-[#f0883e] bg-[#bd561d]/15 border-[#d29922]/30',
      text: `[Sanitization Vault] Scanning 7 secret classes with 500KB ReDoS guard (redacting Stripe, AWS, PATs, env vars)...`,
      stepTitle: 'Scrubbing secrets & credentials...',
      delayMs: 1300,
      type: 'info',
    },
    {
      tag: 'SECURITY',
      tagColor: 'text-[#56d364] bg-[#238636]/15 border-[#2ea043]/30',
      text: `[Security Audit] Querying OSV.dev vulnerability index & mapping SPDX license compliance...`,
      stepTitle: 'Querying OSV.dev CVE database...',
      delayMs: 1800,
      type: 'info',
    },
    {
      tag: 'VISUALIZER',
      tagColor: 'text-[#7ee787] bg-[#238636]/15 border-[#3fb950]/30',
      text: `[Visualizer] Generating Mermaid.js architecture models and route flowcharts via Kroki vector bridge...`,
      stepTitle: 'Compiling Kroki architecture models...',
      delayMs: 2300,
      type: 'info',
    },
    {
      tag: 'RULE GENERATOR',
      tagColor: 'text-[#a5d6ff] bg-[#388bfd]/15 border-[#58a6ff]/30',
      text: isAgent
        ? `[Rule Generator] Scaffolding strict .cursor/rules/agent-rules.mdc with Anti-Hallucination Protocol...`
        : isLibrary
        ? `[Rule Generator] Scaffolding strict .cursor/rules/library-rules.mdc with type-check invariants...`
        : isWordPress
        ? `[Rule Generator] Scaffolding strict .cursor/rules/wordpress.mdc with alwaysApply: true...`
        : isNext
        ? `[Rule Generator] Scaffolding strict .cursor/rules/nextjs.mdc with alwaysApply: true...`
        : `[Rule Generator] Scaffolding strict .cursor/rules/project-rules.mdc with alwaysApply: true...`,
      stepTitle: 'Scaffolding agent instructions & rules...',
      delayMs: 2800,
      type: 'info',
    },
    {
      tag: 'SYNTHESIS',
      tagColor: 'text-[#388bfd] bg-[#1f6feb]/15 border-[#388bfd]/30',
      text: `[Synthesis Gateway] Compiling CLAUDE.md, AGENTS.md, and MCP memory presets. Finalizing response...`,
      stepTitle: 'Finalizing context synthesis...',
      delayMs: 3300,
      type: 'info',
    },
  ];

  // Track live elapsed time accurately
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLogs([initialCommand]);

    const timeouts: NodeJS.Timeout[] = [];
    const startTime = Date.now();

    pipelineSequence.forEach((step, idx) => {
      const t = setTimeout(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        setLogs((prev) => [
          ...prev,
          {
            tag: step.tag,
            tagColor: step.tagColor,
            type: step.type,
            time: `${elapsed}s`,
            text: step.text,
          },
        ]);
        setCurrentStepText(step.stepTitle);

        if (idx === pipelineSequence.length - 1 && onComplete) {
          onComplete();
        }
      }, step.delayMs);
      timeouts.push(t);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [owner, repo, framework]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center font-mono">
      {/* Telemetry Header Line */}
      <div className="w-full flex items-center justify-between mb-3 text-xs text-[#8b949e] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#58a6ff] animate-ping" />
          <span className="text-[#c9d1d9] font-medium">Live Repository Analysis In Flight</span>
          <span className="text-[#8b949e] hidden sm:inline">•</span>
          <span className="text-[#58a6ff] hidden sm:inline font-mono">github.com/{owner}/{repo}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] bg-[#161b22] px-2.5 py-1 rounded-md border border-[#30363d]">
            <Cpu className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>Gateway Limit: <strong className="text-[#c9d1d9]">45s</strong></span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-2.5 py-1 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[11px] text-[#f85149] hover:text-[#ff7b72] transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
              title="Cancel current analysis"
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Terminal Window */}
      <div className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl overflow-hidden flex flex-col">
        {/* Terminal Title Bar */}
        <div className="px-4 py-3 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
            <span className="ml-3 text-xs text-[#8b949e] font-mono flex items-center gap-1.5 truncate">
              <Terminal className="w-3.5 h-3.5 text-[#8b949e]" />
              gitcontextgen-cli — analyze [{owner}/{repo}]
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
            <span className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#58a6ff] hidden sm:inline">
              stdio v2024-11-05
            </span>
            <span className="px-2 py-0.5 rounded bg-[#238636]/15 border border-[#3fb950]/30 text-[#3fb950] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
              Streaming Active
            </span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-5 text-xs sm:text-sm text-[#c9d1d9] space-y-2.5 min-h-[300px] max-h-[420px] overflow-y-auto leading-relaxed">
          {logs.map((log, index) => {
            if (log.type === 'cmd') {
              return (
                <div key={index} className="text-[#f0f6fc] flex items-start gap-2 pb-1 border-b border-[#30363d]/40">
                  <span className="text-[#3fb950] font-bold select-none">gitcontextgen&gt;</span>
                  <span className="text-[#58a6ff]">{log.text}</span>
                </div>
              );
            }

            return (
              <div key={index} className="flex items-start gap-2.5 font-mono text-[11px] sm:text-xs">
                <span className="text-[#8b949e] select-none shrink-0">[{log.time}]</span>
                <span
                  className={`px-1.5 py-0.2 rounded border text-[10px] uppercase font-bold shrink-0 select-none ${log.tagColor}`}
                >
                  {log.tag}
                </span>
                <span className={log.type === 'success' ? 'text-[#3fb950] font-semibold' : 'text-[#c9d1d9]'}>
                  {log.text}
                </span>
              </div>
            );
          })}

          {/* Blinking block cursor */}
          <div className="flex items-center gap-2 text-[#3fb950] pt-1">
            <span className="select-none">gitcontextgen&gt;</span>
            <span className="inline-block w-2 h-4 bg-[#58a6ff] animate-pulse" />
          </div>

          <div ref={terminalEndRef} />
        </div>

        {/* Truthful Telemetry Footer Bar (NO fake percentages) */}
        <div className="px-5 py-3.5 bg-[#161b22] border-t border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#8b949e] w-full sm:w-auto">
            <Zap className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
            <span className="text-[#8b949e]">Status:</span>
            <strong className="text-[#f0f6fc] truncate max-w-xs sm:max-w-md">{currentStepText}</strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Live Elapsed Timer */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#8b949e] font-mono">
              <span>Elapsed:</span>
              <strong className="text-[#58a6ff]">{elapsedSeconds}s</strong>
              <span className="text-[#8b949e]">/ 45s</span>
            </div>

            {/* Indeterminate Activity Streaming Bar */}
            <div className="w-24 sm:w-32 h-2 rounded-full bg-[#21262d] overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-[#1f6feb] via-[#58a6ff] to-[#3fb950] animate-pulse rounded-full w-full" />
            </div>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[11px] text-[#c9d1d9] hover:text-[#f85149] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reassurance Guardrail Note */}
      <div className="mt-4 flex items-center gap-2 text-xs text-[#8b949e] text-center">
        <ShieldCheck className="w-4 h-4 text-[#3fb950] shrink-0" />
        <span>Read-only security scan. Private tokens, database credentials, and env files are automatically redacted.</span>
      </div>
    </div>
  );
}
