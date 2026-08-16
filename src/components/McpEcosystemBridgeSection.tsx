'use client';

import { useState } from 'react';
import { Terminal, Copy, Check, Cpu, Sparkles, ExternalLink, Code2, Layers, FileCode2, History } from 'lucide-react';

export default function McpEcosystemBridgeSection() {
  const [activeTab, setActiveTab] = useState<'claude' | 'cursor' | 'antigravity' | 'windsurf'>('claude');
  const [copied, setCopied] = useState(false);

  const configs: Record<'claude' | 'cursor' | 'antigravity' | 'windsurf', { title: string; file: string; snippet: string; desc: string }> = {
    claude: {
      title: 'Claude Code CLI',
      file: '~/.claude.json',
      desc: 'Enables Claude Code terminal agent to dynamically index directory trees and extract execution commands.',
      snippet: `{
  "mcpServers": {
    "gitcontextgen": {
      "command": "npx",
      "args": ["-y", "gitcontextgen-mcp"]
    }
  }
}`,
    },
    cursor: {
      title: 'Cursor IDE',
      file: 'Cursor Settings > Features > MCP',
      desc: 'Add as a Command MCP server in Cursor settings. Cursor will automatically pull CLAUDE.md & .cursorrules specifications.',
      snippet: `{
  "name": "GitContextGen",
  "type": "command",
  "command": "npx -y gitcontextgen-mcp"
}`,
    },
    antigravity: {
      title: 'Antigravity / Gemini CLI',
      file: '~/.gemini/config/mcp_config.json',
      desc: 'Configures GitContextGen as a native stdio tool provider for autonomous coding sub-agents.',
      snippet: `{
  "mcpServers": {
    "gitcontextgen": {
      "command": "npx",
      "args": ["-y", "gitcontextgen-mcp"]
    }
  }
}`,
    },
    windsurf: {
      title: 'Windsurf Cascade IDE',
      file: '~/.codeium/windsurf/mcp_config.json',
      desc: 'Allows Cascade AI to load real-time Mermaid system diagrams and boundary safety constraints.',
      snippet: `{
  "mcpServers": {
    "gitcontextgen": {
      "command": "npx",
      "args": ["-y", "gitcontextgen-mcp"]
    }
  }
}`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(configs[activeTab].snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mcpTools = [
    {
      name: 'gitcontextgen_analyze',
      icon: <Terminal className="w-4 h-4 text-cyan-400" />,
      tag: 'DIRECTORY SCANNER',
      desc: 'Indexes local file tree, manifest dependencies, scripts, and runtime frameworks.',
    },
    {
      name: 'gitcontextgen_get_rules',
      icon: <FileCode2 className="w-4 h-4 text-purple-400" />,
      tag: 'UNIVERSAL AGENTS.MD',
      desc: 'Generates zero-hallucination rules for Claude, Cursor, Copilot, or Universal standard.',
    },
    {
      name: 'gitcontextgen_get_architecture',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      tag: 'KROKI MERMAID MAP',
      desc: 'Returns syntax-validated Mermaid graphs and direct Kroki SVG export links.',
    },
    {
      name: 'gitcontextgen_get_changelog',
      icon: <History className="w-4 h-4 text-emerald-400" />,
      tag: 'GIT RELEASE SYNTHESIS',
      desc: 'Parses local git commit logs and formats developer or marketing release notes.',
    },
  ];

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white relative">
      <div className="w-full flex flex-col items-center justify-center">

        {/* Section Pill Badge */}
        <div className="w-full flex justify-center mb-6">
          <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-white/80">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Universal IDE Ecosystem Bridge
          </div>
        </div>

        {/* Section Headline */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            One MCP Server.{' '}
            <span className="font-serif italic font-normal text-white/80">Every AI Agent on Earth.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            Add GitContextGen to your favorite AI developer tools in 30 seconds. Seamlessly supported across Claude Code, Cursor, Windsurf, and Antigravity.
          </p>
        </div>

        {/* 4 Registered MCP Tools Bar */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14 text-left">
          {mcpTools.map((t) => (
            <div
              key={t.name}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5 shadow-xl hover:border-cyan-500/30 transition duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">{t.icon}</div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                  {t.tag}
                </span>
              </div>
              <div className="font-mono text-xs font-bold text-white truncate">{t.name}</div>
              <p className="text-[11px] font-sans text-white/60 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Interactive Configuration Box */}
        <div className="w-full max-w-3xl mx-auto rounded-3xl bg-neutral-950 border border-white/15 overflow-hidden shadow-2xl text-left">
          {/* Tabs */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-black border-b border-white/10 overflow-x-auto no-scrollbar gap-2">
            <div className="flex items-center gap-2 shrink-0">
              {(['claude', 'cursor', 'antigravity', 'windsurf'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-white text-black shadow-sm'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {configs[tab].title}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-900/60 transition shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Config!' : 'Copy Config'}
            </button>
          </div>

          {/* Code Viewer Body */}
          <div className="p-6 sm:p-8 space-y-4 font-mono">
            <div className="flex items-center justify-between text-xs text-white/50 pb-2 border-b border-white/5">
              <span>Target File: <code className="text-cyan-300 font-bold">{configs[activeTab].file}</code></span>
              <span className="text-[10px] text-emerald-400">Transport: stdio</span>
            </div>

            <p className="text-xs text-white/70 font-sans leading-relaxed">
              {configs[activeTab].desc}
            </p>

            <pre className="p-5 rounded-2xl bg-black border border-white/10 text-xs text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
              {configs[activeTab].snippet}
            </pre>
          </div>
        </div>

      </div>
    </section>
  );
}
