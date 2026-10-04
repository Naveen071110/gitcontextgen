'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Database,
  Lock,
  Zap,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Terminal,
  Cpu,
  Sparkles,
  Layers,
  ArrowRight,
  GitBranch,
  Server
} from 'lucide-react';

export default function AgentMemoryFeature() {
  const [activeTab, setActiveTab] = useState<'recall' | 'remember' | 'schema' | 'mutex'>('recall');

  return (
    <section id="agent-memory" className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-[#030303] text-white relative">
      <div className="w-full flex flex-col items-center justify-center">

        {/* Section Pill Badge */}
        <div className="w-full flex justify-center mb-6">
          <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>MODEL CONTEXT PROTOCOL (MCP) MEMORY ENGINE</span>
          </div>
        </div>

        {/* Section Headline */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            The AI Agent Amnesia Crisis,{' '}
            <span className="font-serif italic font-normal text-cyan-300">Solved.</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed text-center max-w-2xl mx-auto">
            AI coding agents (Claude Code, Cursor Composer, Windsurf) operate with zero cross-session memory—burning tens of thousands of tokens re-grepping your repo and colliding on parallel edits. GitContextGen adds an on-device, sub-millisecond SQLite brain and atomic PID write-locking.
          </p>
        </div>

        {/* 2-Column Comparison Grid: Without vs With GitContextGen */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 text-left">

          {/* Left Column: Without GitContextGen (Agent Amnesia) */}
          <div className="p-8 rounded-3xl bg-red-950/10 border border-red-900/30 space-y-6 relative overflow-hidden group hover:border-red-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
                Without GitContextGen
              </span>
              <ShieldAlert className="w-5 h-5 text-red-400/70" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-mono mb-2 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                The Agent Amnesia Crisis
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Every new prompt or terminal session starts from a blank slate. Your agent has forgotten all past architecture decisions and team conventions.
              </p>
            </div>

            {/* Pain Point Items */}
            <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-300 font-mono leading-relaxed">
              <li className="flex items-start gap-2.5 text-red-300/90">
                <span className="text-red-400 font-bold shrink-0">✕</span>
                <span><strong>Zero Cross-Session Memory:</strong> Forgets database schemas, auth flows, and edge cases the moment the chat resets.</span>
              </li>
              <li className="flex items-start gap-2.5 text-red-300/90">
                <span className="text-red-400 font-bold shrink-0">✕</span>
                <span><strong>Token Window Exhaustion:</strong> Burns 30,000–80,000 tokens re-reading directory trees and source files every single turn.</span>
              </li>
              <li className="flex items-start gap-2.5 text-red-300/90">
                <span className="text-red-400 font-bold shrink-0">✕</span>
                <span><strong>Multi-Agent Write Collisions:</strong> Cursor and Claude Code overwrite each other&apos;s active files without mutex coordination.</span>
              </li>
              <li className="flex items-start gap-2.5 text-red-300/90">
                <span className="text-red-400 font-bold shrink-0">✕</span>
                <span><strong>$20–$40/Day Context Waste:</strong> Escalating LLM API invoices due to repetitive context re-injection.</span>
              </li>
              <li className="flex items-start gap-2.5 text-red-300/90">
                <span className="text-red-400 font-bold shrink-0">✕</span>
                <span><strong>Architectural Hallucinations:</strong> Imports deleted components or violates modular boundaries.</span>
              </li>
            </ul>

            {/* Simulated Failed Agent Terminal Output */}
            <div className="p-4 rounded-xl bg-black/80 border border-red-950 font-mono text-[11px] text-red-400 space-y-1">
              <p className="text-zinc-500">// Terminal Session: No local memory index</p>
              <p className="text-red-300">&gt; Claude Code: Searching repository tree...</p>
              <p className="text-red-400">&gt; Scanned 1,420 files. 48,210 tokens added to context.</p>
              <p className="text-red-500 font-bold">&gt; Error: File collision with Cursor Agent on auth.ts</p>
            </div>
          </div>

          {/* Right Column: With GitContextGen (Local Persistent Memory Engine) */}
          <div className="p-8 rounded-3xl bg-cyan-950/10 border border-cyan-500/30 space-y-6 relative overflow-hidden group hover:border-cyan-400/50 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.08)]">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
                With GitContextGen
              </span>
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-mono mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Persistent Local Memory Brain
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Powered by a zero-cost local SQLite engine (<code className="text-cyan-300 font-mono">.gitcontextgen/memory.db</code>) with sub-millisecond MCP tool lookups and atomic PID locking.
              </p>
            </div>

            {/* Advantage Items */}
            <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-200 font-mono leading-relaxed">
              <li className="flex items-start gap-2.5 text-cyan-200/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Local SQLite Memory Engine:</strong> Persistent <code className="text-cyan-300">.gitcontextgen/memory.db</code> records decisions, schemas, and lessons permanently.</span>
              </li>
              <li className="flex items-start gap-2.5 text-cyan-200/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>92% Token Reduction:</strong> Sub-agents query pre-indexed AST entries via <code className="text-cyan-300">gitcontextgen_recall</code> (&lt; 1ms).</span>
              </li>
              <li className="flex items-start gap-2.5 text-cyan-200/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Atomic PID Mutex Locks:</strong> Prevents file collisions when Cursor Composer and Claude Code work concurrently.</span>
              </li>
              <li className="flex items-start gap-2.5 text-cyan-200/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>$0 Egress &amp; 100% Privacy:</strong> Runs locally over stdio transport—no cloud databases, zero data leakage.</span>
              </li>
              <li className="flex items-start gap-2.5 text-cyan-200/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Universal MCP Compatibility:</strong> Works natively with Claude Code, Cursor, Windsurf, Copilot, and custom scripts.</span>
              </li>
            </ul>

            {/* Simulated Optimized Agent Terminal Output */}
            <div className="p-4 rounded-xl bg-black/80 border border-cyan-900/50 font-mono text-[11px] space-y-1">
              <p className="text-zinc-500">// Terminal Session: Connected to GitContextGen MCP</p>
              <p className="text-cyan-300">&gt; gitcontextgen_recall(&quot;auth_middleware&quot;)</p>
              <p className="text-emerald-400 font-bold">&gt; [✓ 0.8ms] 2 memories loaded. Mutex lock acquired (PID: 4912).</p>
              <p className="text-zinc-400">&gt; Tokens burned: 0. Context window preserved: 99.4%.</p>
            </div>
          </div>

        </div>

        {/* Interactive Deep-Dive: The MCP Memory Architecture Explorer */}
        <div className="w-full max-w-5xl mx-auto rounded-3xl bg-zinc-950/70 border border-zinc-800 p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-cyan-400" />
                <h4 className="text-base sm:text-lg font-bold text-white font-mono">
                  Live MCP Memory &amp; Locking Protocol
                </h4>
              </div>
              <p className="text-xs text-zinc-400">
                Inspect how GitContextGen delivers zero-latency memory to Claude Code, Cursor, and Windsurf via stdio JSON-RPC 2.0.
              </p>
            </div>

            {/* Interactive Tab Selectors */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 self-start sm:self-auto overflow-x-auto max-w-full">
              {[
                { id: 'recall', label: '1. gitcontextgen_recall', icon: Zap },
                { id: 'remember', label: '2. gitcontextgen_remember', icon: Brain },
                { id: 'schema', label: '3. memory.db Schema', icon: Database },
                { id: 'mutex', label: '4. Multi-Agent Mutex', icon: Lock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'recall' && (
                <motion.div
                  key="recall"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black border border-zinc-900 font-mono text-xs text-zinc-300 space-y-2">
                      <div className="text-zinc-500 text-[11px] pb-1 border-b border-zinc-900 flex justify-between">
                        <span>// AGENT DISPATCH (stdio JSON-RPC 2.0)</span>
                        <span className="text-cyan-400 font-bold">Claude Code / Cursor</span>
                      </div>
                      <pre className="text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
{`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "gitcontextgen_recall",
    "arguments": {
      "query": "jwt_refresh_mechanism",
      "tags": ["auth", "security"],
      "limit": 2
    }
  },
  "id": 104
}`}
                      </pre>
                    </div>

                    <div className="p-4 rounded-xl bg-black border border-cyan-900/40 font-mono text-xs text-zinc-300 space-y-2">
                      <div className="text-zinc-500 text-[11px] pb-1 border-b border-zinc-900 flex justify-between">
                        <span>// SUB-MILLISECOND SQLITE RETURN</span>
                        <span className="text-emerald-400 font-bold">&lt; 0.9ms Latency</span>
                      </div>
                      <pre className="text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
{`{
  "content": [{
    "type": "text",
    "text": "VERIFIED ARCHITECTURE RULE:\\nUse HTTP-only secure cookie \\"app_session\\" with 15-minute rotation. Never persist tokens in localStorage. (Session: ses_891, Commit: 4fa90c)"
  }],
  "isError": false
}`}
                      </pre>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Result: 0 tokens burned re-reading files. Precise architecture enforcement guaranteed.</span>
                    </span>
                    <span className="text-cyan-400 font-bold hidden sm:inline">$0 Cloud Cost</span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'remember' && (
                <motion.div
                  key="remember"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black border border-zinc-900 font-mono text-xs text-zinc-300 space-y-2">
                      <div className="text-zinc-500 text-[11px] pb-1 border-b border-zinc-900 flex justify-between">
                        <span>// RECORDING DECISION (Agent Tool Call)</span>
                        <span className="text-cyan-400 font-bold">gitcontextgen_remember</span>
                      </div>
                      <pre className="text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
{`{
  "name": "gitcontextgen_remember",
  "arguments": {
    "content": "Migrated from Axios to native Fetch with retry backoff in src/lib/api.ts",
    "memory_type": "decision",
    "tags": ["refactor", "network", "api"]
  }
}`}
                      </pre>
                    </div>

                    <div className="p-4 rounded-xl bg-black border border-zinc-900 font-mono text-xs text-zinc-300 space-y-2">
                      <div className="text-zinc-500 text-[11px] pb-1 border-b border-zinc-900 flex justify-between">
                        <span>// AUTOMATIC SQLITE COMMIT</span>
                        <span className="text-emerald-400 font-bold">WAL Mode Enabled</span>
                      </div>
                      <pre className="text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
{`{
  "status": "stored",
  "memory_id": "mem_01hq82k9",
  "file": ".gitcontextgen/memory.db",
  "indexed": true,
  "commit_sha": "a1b2c3d4"
}`}
                      </pre>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      <span>Future agents and teammate sessions instantly inherit this decision without prompt bloat.</span>
                    </span>
                    <span className="text-emerald-400 font-bold hidden sm:inline">100% Offline</span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'schema' && (
                <motion.div
                  key="schema"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-black border border-zinc-900 font-mono text-xs text-zinc-300 space-y-2">
                    <div className="text-zinc-500 text-[11px] pb-1 border-b border-zinc-900 flex justify-between">
                      <span>// LOCAL SQLITE DDL (.gitcontextgen/memory.db)</span>
                      <span className="text-cyan-400">Zero Cloud Egress</span>
                    </div>
                    <pre className="text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
{`CREATE TABLE IF NOT EXISTS agent_memories (
  id TEXT PRIMARY KEY,
  repo_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  memory_type TEXT CHECK(memory_type IN ('decision', 'rule', 'pattern', 'fix', 'note')),
  content TEXT NOT NULL,
  tags TEXT, -- JSON array of tags
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  commit_sha TEXT
);

CREATE INDEX IF NOT EXISTS idx_memories_repo ON agent_memories(repo_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON agent_memories(memory_type);`}
                    </pre>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-zinc-400">
                    <div className="p-3 rounded-lg bg-black border border-zinc-900">
                      <span className="text-white font-bold block mb-1">Lightweight Storage</span>
                      <span>Average database size is &lt; 250KB for entire 50k-line projects.</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black border border-zinc-900">
                      <span className="text-cyan-400 font-bold block mb-1">Git Versioned Option</span>
                      <span>Commit memory.db to share memory across the entire development team.</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black border border-zinc-900">
                      <span className="text-emerald-400 font-bold block mb-1">Sub-Millisecond Read</span>
                      <span>SQLite B-Tree indexes return tag queries in under 1 millisecond.</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'mutex' && (
                <motion.div
                  key="mutex"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black border border-zinc-900 font-mono text-xs text-zinc-300 space-y-2">
                      <div className="text-zinc-500 text-[11px] pb-1 border-b border-zinc-900 flex justify-between">
                        <span>// ATOMIC PID FILE LOCK MECHANISM</span>
                        <span className="text-amber-400">Locking Referee</span>
                      </div>
                      <pre className="text-amber-300 overflow-x-auto text-[11px] leading-relaxed">
{`// .gitcontextgen/locks/auth.ts.lock
{
  "locked_by": "claude_code_daemon",
  "pid": 4821,
  "acquired_at": "2026-09-28T00:30:15Z",
  "expires_in_sec": 30
}`}
                      </pre>
                    </div>

                    <div className="p-4 rounded-xl bg-black border border-zinc-900 font-mono text-xs text-zinc-300 space-y-2">
                      <div className="text-zinc-500 text-[11px] pb-1 border-b border-zinc-900 flex justify-between">
                        <span>// COLLISION GUARD FOR CURSOR / WINDSURF</span>
                        <span className="text-cyan-400">Zero Overwrites</span>
                      </div>
                      <pre className="text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
{`// Parallel Cursor Agent Request
&gt; Acquire lock: src/app/auth.ts
&gt; Status: BUSY (Held by PID 4821)
&gt; Action: Agent queues task or switches to non-colliding module.
&gt; Result: Zero lost code & zero git merge conflicts.`}
                      </pre>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Enables safe parallel multi-agent coding sessions without destructive race conditions.</span>
                    </span>
                    <span className="text-amber-400 font-bold hidden sm:inline">Stale Lock Auto-Eviction</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
