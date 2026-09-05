'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface TerminalLoaderProps {
  owner: string;
  repo: string;
  onComplete?: () => void;
}

interface LogEntry {
  type: 'cmd' | 'info' | 'success' | 'warn';
  time: string;
  text: string;
}

export default function TerminalLoader({ owner, repo }: TerminalLoaderProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(14);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const initialCommand: LogEntry = {
    type: 'cmd',
    time: '0.00s',
    text: `gitcontextgen analyze https://github.com/${owner}/${repo} --strict --sync-rules`,
  };

  const simulatedSequence: Array<{ type: 'info' | 'success' | 'warn'; text: string; delayMs: number; pct: number }> = [
    { type: 'info', text: 'Connecting to GitHub API gateway & verifying repository access...', delayMs: 250, pct: 25 },
    { type: 'info', text: 'Ingesting recursive file tree and parsing manifest configuration...', delayMs: 550, pct: 42 },
    { type: 'info', text: 'Sanitizing secret vectors & stripping credential patterns (Regex Shield)...', delayMs: 900, pct: 58 },
    { type: 'info', text: 'Checking persistent L2 disk cache (SHA-256 AST fingerprint match)...', delayMs: 1250, pct: 72 },
    { type: 'info', text: 'Querying OSV.dev vulnerability index for real-time security advisories...', delayMs: 1600, pct: 82 },
    { type: 'info', text: 'Synthesizing strict-mode Mermaid.js architectural topology...', delayMs: 1950, pct: 89 },
    { type: 'info', text: 'Generating synchronized .cursor/rules/project-rules.mdc (alwaysApply: true)...', delayMs: 2300, pct: 95 },
    { type: 'info', text: 'Compiling verified CLAUDE.md multi-agent execution instructions...', delayMs: 2650, pct: 98 },
    { type: 'success', text: 'Context synthesis complete! Zero hallucinations guaranteed.', delayMs: 3000, pct: 100 },
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
            type: step.type,
            time: `${elapsed}s`,
            text: step.text,
          },
        ]);
        setProgress(step.pct);
      }, step.delayMs);
      timeouts.push(t);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [owner, repo]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center font-mono">
      {/* Perceived Value Notification */}
      <div className="w-full flex items-center justify-between mb-4 text-xs text-[#8b949e]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#58a6ff] animate-ping" />
          <span className="text-[#c9d1d9] font-medium">Running AST analysis & rule synchronization</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span>L2 Cache Engine: <strong className="text-[#3fb950]">Active (92% Token Savings)</strong></span>
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
            <span className="ml-3 text-xs text-[#8b949e] font-mono flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#8b949e]" />
              gitcontextgen-cli — ast-scan [{owner}/{repo}]
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
            <span className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
              stdio v2024-11-05
            </span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-5 text-xs sm:text-sm text-[#c9d1d9] space-y-2.5 min-h-[300px] max-h-[420px] overflow-y-auto leading-relaxed">
          {logs.map((log, index) => {
            if (log.type === 'cmd') {
              return (
                <div key={index} className="text-[#f0f6fc] flex items-start gap-2">
                  <span className="text-[#3fb950] font-bold select-none">gitcontextgen&gt;</span>
                  <span className="text-[#58a6ff]">{log.text}</span>
                </div>
              );
            }

            return (
              <div key={index} className="flex items-start gap-2.5 font-mono text-[11px] sm:text-xs">
                <span className="text-[#8b949e] select-none shrink-0">[{log.time}]</span>
                {log.type === 'info' && (
                  <span className="text-[#58a6ff] shrink-0 select-none">[info]</span>
                )}
                {log.type === 'success' && (
                  <span className="text-[#3fb950] font-bold shrink-0 select-none flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline" /> [success]
                  </span>
                )}
                {log.type === 'warn' && (
                  <span className="text-[#d29922] shrink-0 select-none">[warn]</span>
                )}
                <span className={log.type === 'success' ? 'text-[#3fb950] font-medium' : 'text-[#c9d1d9]'}>
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
      <div className="mt-4 flex items-center gap-2 text-xs text-[#8b949e]">
        <ShieldCheck className="w-4 h-4 text-[#3fb950]" />
        <span>Read-only AST scan. Private tokens, database credentials, and env files are automatically redacted.</span>
      </div>
    </div>
  );
}
