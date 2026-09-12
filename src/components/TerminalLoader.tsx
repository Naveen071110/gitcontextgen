'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, CheckCircle2, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';

interface TerminalLoaderProps {
  owner: string;
  repo: string;
  framework?: string;
  onComplete?: () => void;
}

interface LogEntry {
  tag: string;
  tagColor: string;
  time: string;
  text: string;
  type: 'cmd' | 'info' | 'success' | 'warn';
}

export default function TerminalLoader({ owner, repo, framework = 'Next.js', onComplete }: TerminalLoaderProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(12);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const initialCommand: LogEntry = {
    tag: 'EXEC',
    tagColor: 'text-[#58a6ff] bg-[#1f6feb]/15 border-[#388bfd]/30',
    type: 'cmd',
    time: '0.00s',
    text: `gitcontextgen analyze https://github.com/${owner}/${repo} --strict --sync-rules`,
  };

  const detectedFrameworkLabel = framework || 'Next.js';
  const isWordPress = detectedFrameworkLabel.toLowerCase().includes('wordpress');
  const isNext = detectedFrameworkLabel.toLowerCase().includes('next');

  const simulatedSequence: Array<{
    tag: string;
    tagColor: string;
    text: string;
    delayMs: number;
    pct: number;
    type: 'info' | 'success' | 'warn';
  }> = [
    {
      tag: 'GATEWAY',
      tagColor: 'text-[#79c0ff] bg-[#1f6feb]/15 border-[#388bfd]/30',
      text: `Connected to GitHub API gateway. Ingesting recursive file tree for ${owner}/${repo}...`,
      delayMs: 250,
      pct: 22,
      type: 'info',
    },
    {
      tag: 'AST SCANNER',
      tagColor: 'text-[#d2a8ff] bg-[#8957e5]/15 border-[#a371f7]/30',
      text: isWordPress
        ? `[AST Scanner] Found WordPress architecture. Mapping plugin hooks, $wpdb queries, and WPCS standards...`
        : isNext
        ? `[AST Scanner] Found Next.js 16 structure. Mapping App Router hierarchy and Server Actions...`
        : `[AST Scanner] Indexed repository boundaries. Mapping architecture hierarchy and package manifests...`,
      delayMs: 650,
      pct: 42,
      type: 'info',
    },
    {
      tag: 'SANITIZATION',
      tagColor: 'text-[#f0883e] bg-[#bd561d]/15 border-[#d29922]/30',
      text: `[Sanitization] Redacting potential API secrets, private certs, and credentials (500KB ReDoS Guard active)...`,
      delayMs: 1100,
      pct: 58,
      type: 'info',
    },
    {
      tag: 'SECURITY',
      tagColor: 'text-[#56d364] bg-[#238636]/15 border-[#2ea043]/30',
      text: `[Security Audit] Querying OSV.dev vulnerability index & mapping SPDX license compliance...`,
      delayMs: 1550,
      pct: 72,
      type: 'info',
    },
    {
      tag: 'VISUALIZER',
      tagColor: 'text-[#7ee787] bg-[#238636]/15 border-[#3fb950]/30',
      text: `[Visualizer] Generating Mermaid.js database models and route flowcharts with Kroki vector bridge...`,
      delayMs: 1950,
      pct: 84,
      type: 'info',
    },
    {
      tag: 'RULE GENERATOR',
      tagColor: 'text-[#a5d6ff] bg-[#388bfd]/15 border-[#58a6ff]/30',
      text: isWordPress
        ? `[Rule Generator] Scaffolding strict .cursor/rules/wordpress.mdc with alwaysApply: true...`
        : isNext
        ? `[Rule Generator] Scaffolding strict .cursor/rules/nextjs.mdc with alwaysApply: true...`
        : `[Rule Generator] Scaffolding strict .cursor/rules/project-rules.mdc with alwaysApply: true...`,
      delayMs: 2350,
      pct: 94,
      type: 'info',
    },
    {
      tag: 'L2 CACHE',
      tagColor: 'text-[#388bfd] bg-[#1f6feb]/15 border-[#388bfd]/30',
      text: `[L2 Cache] 12-hour warm cache synced. Assembling verified CLAUDE.md & AGENTS.md execution dossiers...`,
      delayMs: 2750,
      pct: 98,
      type: 'info',
    },
    {
      tag: 'COMPLETE',
      tagColor: 'text-[#3fb950] bg-[#238636]/20 border-[#3fb950]/40',
      text: `Context synthesis complete! Multi-agent dossiers compiled with zero hallucinations guaranteed.`,
      delayMs: 3100,
      pct: 100,
      type: 'success',
    },
  ];

  useEffect(() => {
    setLogs([initialCommand]);

    const timeouts: NodeJS.Timeout[] = [];
    const startTime = Date.now();

    simulatedSequence.forEach((step) => {
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
        setProgress(step.pct);

        if (step.pct === 100 && onComplete) {
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
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center font-mono">
      {/* Perceived Value Notification */}
      <div className="w-full flex items-center justify-between mb-4 text-xs text-[#8b949e] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#58a6ff] animate-ping" />
          <span className="text-[#c9d1d9] font-medium">Running AST analysis &amp; multi-agent rule synchronization</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span>L2 Cache Engine: <strong className="text-[#3fb950]">Active (12h TTL • 94% Rate-Limit Shield)</strong></span>
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
              gitcontextgen-cli — ast-scan [{owner}/{repo}]
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
            <span className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#58a6ff] hidden sm:inline">
              stdio v2024-11-05
            </span>
            <span className="px-2 py-0.5 rounded bg-[#238636]/15 border border-[#3fb950]/30 text-[#3fb950]">
              AST Online
            </span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-5 text-xs sm:text-sm text-[#c9d1d9] space-y-2.5 min-h-[320px] max-h-[440px] overflow-y-auto leading-relaxed">
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

        {/* Progress Bar Footer */}
        <div className="px-5 py-3 bg-[#161b22] border-t border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#8b949e] w-full sm:w-auto">
            <Zap className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>Analyzing repository AST topology:</span>
            <strong className="text-[#f0f6fc]">{progress}%</strong>
          </div>
          <div className="w-full sm:w-48 h-2 rounded-full bg-[#21262d] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1f6feb] via-[#58a6ff] to-[#3fb950] transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reassurance Guardrail Note */}
      <div className="mt-4 flex items-center gap-2 text-xs text-[#8b949e] text-center">
        <ShieldCheck className="w-4 h-4 text-[#3fb950] shrink-0" />
        <span>Read-only AST scan. Private tokens, database credentials, and env files are automatically redacted.</span>
      </div>
    </div>
  );
}
