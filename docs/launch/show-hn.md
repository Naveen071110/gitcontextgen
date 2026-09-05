# Show HN: GitContextGen – Prevent AI coding agents from burning your context window

**Target Community:** Hacker News (`news.ycombinator.com/show`)  
**Target Timing:** Tuesday or Wednesday, 08:00 AM EST (13:00 UTC)  
**URL Link:** https://github.com/Naveen071110/gitcontextgen  
**Live Demo:** https://repopulse-ai.singhnaveen360.workers.dev  

---

## 🏷️ Title
```text
Show HN: GitContextGen – Prevent AI coding agents from burning your context window
```

---

## 📝 First Comment / Post Submission Body

Hey HN,

We built **GitContextGen** because our team hit the "AI Context Debt Crisis" while building production applications with Cursor Composer and Claude Code CLI.

### The Problem
When you run modern AI coding agents (Claude Code, Cursor, Windsurf, Copilot Workspace) across non-trivial repositories, two costly problems happen:

1. **The Context Burn Loop:** The agent starts each task with zero domain context. It executes dozens of recursive ripgreps, `ls` calls, and file reads just to understand your architecture, directory boundaries, and coding conventions. In a 50k-line repo, the agent can easily burn 80,000+ input tokens before writing its first line of code.
2. **Rule Fragmentation & Drift:** Claude Code expects `CLAUDE.md`. Modern Cursor 0.40+ expects `.cursor/rules/*.mdc` with YAML frontmatter (`alwaysApply: true`). Windsurf expects `.windsurfrules`. Engineers end up manually duplicating guidelines across three files, which inevitably drift out of sync, leading to hallucinations and conflicting instructions.

### What GitContextGen Does
GitContextGen is a zero-dependency, local CLI (`gitcontextgen`) and stdio **Model Context Protocol (MCP)** server that acts as a deterministic knowledge layer for your coding agents:

- **Local AST Codebase Profiling:** Scans your repo in `<150ms` to detect tech stack conventions, framework paradigms (Next.js App Router, WordPress WPCS, Rust, Go, Python), and architectural boundaries without sending your code to any third-party API.
- **Bi-Directional Rule Harmonization:** Generates synchronized rule files (`CLAUDE.md`, `.cursor/rules/project-rules.mdc`, `AGENTS.md`) with a single source of truth.
- **Two-Tier L2 Caching Moat:** Implements a high-speed disk cache at `~/.gitcontextgen/cache/` using SHA-256 state signatures. Repeat scans drop from 12ms to 1ms, slashing redundant token re-reading by up to 92%.
- **Multi-Agent File Locks (`fileLock.ts`):** Prevents race conditions and "last-writer-wins" file corruptions when multiple agents work in parallel on the same codebase.
- **Client Proof-of-Work (`gitcontextgen handoff`):** Parses raw git commits into business-readable summaries of shipped capabilities for agencies and client deliverables.

### Quick Start (Zero Install)
You can test it right now on any local workspace:

```bash
# Analyze current repository & bootstrap rules
npx @gitcontextgen/core init

# Or audit your IDE setup & automatically wire MCP into Claude Code & Desktop
npx @gitcontextgen/core doctor

# Verify rule synchronization and check for credential leaks in CI
npx @gitcontextgen/core lint
```

Or connect it to Claude Desktop or Cursor via standard stdio MCP:

```json
{
  "mcpServers": {
    "gitcontextgen": {
      "command": "npx",
      "args": ["-y", "@gitcontextgen/core", "mcp"]
    }
  }
}
```

### Architecture & Privacy
- **100% Offline & Local Execution:** The MCP server and CLI run completely on your machine. Your proprietary source code never leaves localhost.
- **Open Standards:** Built on the official `@modelcontextprotocol/sdk` specification with JSON-RPC Draft-07 tools.
- **Zero Lock-In:** Generates standard Markdown and YAML files that you check into version control.

The web app is hosted on Cloudflare Workers edge via OpenNext, and the entire core engine is MIT licensed.

We’d love to hear how your teams are managing AI rulesets across different editors, and where context bottlenecks are hitting you hardest.

GitHub: https://github.com/Naveen071110/gitcontextgen  
Web Sandbox: https://repopulse-ai.singhnaveen360.workers.dev  

Cheers,  
The GitContextGen Team
