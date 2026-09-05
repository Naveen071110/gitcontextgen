# 🚀 GitContextGen: Community-First Launch Content & Distribution Blueprints

This document contains three educational, problem-first launch templates for Hacker News, DEV Community, and Reddit (r/SaaS). Each post avoids marketing buzzwords and directly addresses common developer pain points with open-source code, reproducible benchmarks, and technical architectural breakdowns.

---

## 📄 Draft 1: Hacker News (HN) "Show HN" Pitch

**Target Destination**: [news.ycombinator.com/submit](https://news.ycombinator.com/submit)  
**Title**: `Show HN: GitContextGen – Universal context sync and local MCP for Cursor and Claude Code`  
**URL / Source**: [https://github.com/Naveen071110/gitcontextgen](https://github.com/Naveen071110/gitcontextgen)  

### Body Content:

Hey HN,

I built GitContextGen because I hit a wall juggling two AI tools that refuse to talk to each other: **Cursor** in my editor and **Claude Code** in my terminal.

If you use both, you’ve probably experienced the "Context Debt" problem:
1. **Rule Fragmentation**: You create a `CLAUDE.md` with your build, dev, and test commands. Then Cursor ignores it because Cursor expects `.cursorrules`. Recently, Cursor 0.40+ moved to `.cursor/rules/*.mdc`, and if you don't declare `alwaysApply: true` in the YAML frontmatter, Cursor silently ignores your rules in Composer mode.
2. **Context Window Burning**: When an agent tries to answer a question about an unknown project, it starts running recursive `find` and `grep` commands across your repo. It dumps thousands of tokens of build artifacts, test caches, and vendor manifests into the context window, burning your rate limits before writing a line of code.
3. **Sensitive Data Leaks**: Without strict AST boundaries, AI agents frequently read `.env` files, certificates, or local SQLite databases into their prompt contexts.

GitContextGen is an open-source, local-first engine designed to solve this:

- **Universal Context Sync**: Run `gitcontextgen init`. It scans your workspace's AST, recognizes your framework (Next.js, FastAPI, Rust, Go), and generates bi-directionally linked `.cursor/rules/project-rules.mdc` (with `alwaysApply: true`) and `CLAUDE.md`. One source of truth across all tools.
- **Local-First Stdio MCP Server**: Instead of stuffing 50-page markdown documents into system prompts, it exposes your codebase over a Model Context Protocol (`stdio`) server. Claude Code or Claude Desktop queries only the specific modules, schemas, or git diffs it needs on demand.
- **Persistent Two-Tier Caching (L1/L2)**: It caches codebase signatures using SHA-256 hashes under `~/.gitcontextgen/cache/` with a 1-hour TTL. Submitting repeat queries takes 2ms instead of 3,500ms, and it survives IDE and terminal restarts.
- **Defensive Leak Guards**: Local directory traversals enforce a strict regex boundary that automatically ignores `.env*`, `*.pem`, `*.key`, `id_rsa`, and local databases. It also halts circular symlink recursion using inode `realpath` checks.

You can run it without installing anything via npx:
```bash
npx @gitcontextgen/core analyze https://github.com/facebook/react
```

Or initialize your project locally:
```bash
npm install -g @gitcontextgen/core
gitcontextgen init
```

The core engine is zero-telemetry, runs 100% offline, and doesn't store your code anywhere.

- **GitHub Repository**: https://github.com/Naveen071110/gitcontextgen
- **Edge Sandbox (Cloudflare Workers)**: https://repopulse-ai.singhnaveen360.workers.dev

I’d love to hear how other developers are managing rule synchronization and context budgets across multi-agent workflows.

---

## 📄 Draft 2: DEV Community Article

**Target Destination**: [dev.to/new](https://dev.to/new)  
**Title**: `Stop maintaining separate AI rules. How we unified CLAUDE.md and .cursorrules.`  
**Tags**: `#ai`, `#devtools`, `#webdev`, `#opensource`  
**Cover Image Idea**: Side-by-side terminal showing Cursor Composer and Claude Code CLI loading the same rules.

### Body Content:

If you are using AI coding assistants in 2026, your repository probably looks like this:

```
my-project/
├── .cursorrules              # Outdated flat rules
├── .cursor/rules/rules.mdc   # Half-configured Composer rules
├── CLAUDE.md                 # CLI execution instructions
└── AGENTS.md                 # Universal guidelines you forgot to update
```

Every time you change your build command, update an environment variable convention, or adopt a new library, you have to update three different files. And if you forget one, your terminal agent and your editor agent give you conflicting code.

Here is what went wrong with AI context management, and how we unified the stack.

---

### The Silent Failure of the `.mdc` Format

Cursor 0.40 introduced the `.mdc` format under `.cursor/rules/`. It allows glob-scoped rules, which is fantastic for monorepos. But it introduced a major silent failure mode:

```markdown
---
description: Next.js App Router rules
globs: src/app/**/*.tsx
---
```

If you omit `alwaysApply: true`, Cursor treats this rule as **optional**. In chat mode or composer mode, if the model decides it doesn’t need this rule to answer your question, it won’t load it. Suddenly, your agent is writing Pages Router code in an App Router project.

To guarantee that your AI agent always obeys critical invariants (like never touching `.env`, always using Server Components, or using specific build flags), your frontmatter must include:

```yaml
---
description: Project Core Rules & Architectural Guardrails
globs: *
alwaysApply: true
---
```

---

### Establishing a Single Source of Truth

Rather than duplicating instructions, we established a bidirectional synchronization pattern:

1. **`.cursor/rules/project-rules.mdc`** is the execution guardrail inside the editor:
   ```markdown
   ---
   description: Core Project Rules & Invariants
   globs: *
   alwaysApply: true
   ---

   # .cursor/rules/project-rules.mdc
   > **Single Source of Truth**: Synchronized with [CLAUDE.md](CLAUDE.md).
   ```

2. **`CLAUDE.md`** references the same invariants for terminal agents:
   ```markdown
   @AGENTS.md

   # Claude Code Developer Context
   > **Cursor Interoperability**: Compatible with `.cursor/rules/project-rules.mdc` (`alwaysApply: true`).
   ```

---

### Preventing Secret Leaks at Commit Time

One of the biggest risks of giving AI agents full repository context is that they inadvertently index sensitive files. We created a pre-commit Git hook that scans staged files against this pattern in under 20ms:

```javascript
const SENSITIVE_FILE_REGEX = /\.(pem|key|pkcs12|pfx|p12|kdb|sqlite|sqlite3|rdb|env(\..+)?)$|^(id_rsa|id_dsa|id_ecdsa|id_ed25519|secrets?|credentials|service-account|master\.key)$/i;
```

If any staged file matches, the commit aborts with an actionable error before the code can ever touch git history or an AI context window.

---

### How Stdio MCP Changes the Game

Instead of pasting large markdown rule files into your prompts, you can expose your repository as a **Model Context Protocol (MCP)** server running over `stdio`:

```json
{
  "mcpServers": {
    "gitcontextgen": {
      "command": "gitcontextgen",
      "args": ["mcp"]
    }
  }
}
```

When Claude Code or Cursor needs to know the tech stack, entry points, or architectural dependencies, it sends a JSON-RPC request over standard input/output:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"gitcontextgen_get_rules","arguments":{"path":".","format":"cursor"}}}
```

The server returns only the exact slice of context needed.

---

### Try It in Your Project

We open-sourced the tool under the MIT license:

```bash
# Bootstrap your workspace in 5 seconds
npm install -g @gitcontextgen/core
gitcontextgen init
```

Check out the code on GitHub: [https://github.com/Naveen071110/gitcontextgen](https://github.com/Naveen071110/gitcontextgen).

---

## 📄 Draft 3: r/SaaS Subreddit Post

**Target Destination**: [reddit.com/r/SaaS](https://reddit.com/r/SaaS)  
**Title**: `We built GitContextGen to solve our own context debt. Here is the MVP teardown.`  
**Flair**: `Build in Public / Feedback`  

### Body Content:

Hey r/SaaS,

Over the past few months, our team transitioned almost entirely to building with AI-first workflows (Claude 3.7 Sonnet, Cursor Composer, and Claude Code).

Within weeks, we noticed a recurring friction point that cost us hours of debugging: **Context Debt**.

Every developer on the team had their own `.cursorrules` file or local prompt templates. Half of them were using outdated build scripts, several files were missing the `alwaysApply: true` header in Cursor's `.mdc` format, and our token consumption was skyrocketing because AI agents were reading whole directories just to figure out what package manager we were using.

We decided to build an internal tool to solve it, and today we are open-sourcing the core engine: **GitContextGen**.

Here is a technical teardown of the bugs we uncovered, how we solved them, and what we learned building this MVP.

---

### 1. The Security Bug: DOM-Based XSS in Mermaid Rendering
Early in development, we added automated Mermaid.js architecture diagrams to visualize repository dependencies. When testing diagrams generated from user repos, our security audit flagged a high-risk DOM XSS vector.

By default, Mermaid’s initialization configuration often runs with `securityLevel: 'loose'`. If an AST generator creates an SVG containing unescaped HTML entities or script blocks, they can execute directly in the browser DOM.

**The Fix**:
We hardened Mermaid’s configuration to `securityLevel: 'strict'`. This forces Mermaid to sanitize dynamic vector SVGs, stripping script tags while preserving complete graph rendering accuracy.

---

### 2. The Performance Bottleneck: Redundant File Scans
Running an AST scan across a monorepo with 5,000+ files took ~3.5 seconds. When hooked up to an MCP server that gets polled on every developer prompt, this introduced noticeable latency.

**The Solution: L2 SHA-256 Disk Caching**
We built a two-tier cache:
1. **L1 (Memory)**: Instant in-process Map for active sessions.
2. **L2 (Disk)**: Scanned directories are fingerprinted by hashing `${path}::${excludes.join(',')}` with SHA-256. The result is stored under `~/.gitcontextgen/cache/<hash>.json` with a 1-hour TTL.

On subsequent prompts, cache hit latency dropped from **3,500ms down to 2ms**. It survives IDE restarts and terminal relaunches.

---

### 3. Packaging into Zero-Dependency Binaries
Many developers work in secure corporate environments where global `npm install` permissions are restricted.

To solve this, we configured an automated release pipeline using Node.js Single Executable Applications (SEA) and `pkg`. On every git semver tag (`v*.*.*`), GitHub Actions compiles self-contained standalone executables for **macOS, Linux, and Windows**. Zero runtime dependencies required.

---

### 4. Interactive Onboarding (`gitcontextgen init`)
To make onboarding frictionless, we built a one-line CLI wizard:
```bash
npx @gitcontextgen/core init
```
It detects whether you have Cursor, VS Code, or Claude Code installed, generates bi-directionally synchronized rules (`CLAUDE.md` and `.cursor/rules/project-rules.mdc`), and automatically registers the local stdio MCP server in `~/.claude.json`.

---

### What's Next?
The project is 100% open-source under the MIT license.

- **GitHub**: https://github.com/Naveen071110/gitcontextgen
- **Edge Web Sandbox**: https://repopulse-ai.singhnaveen360.workers.dev

If you're building with Cursor or Claude Code, I'd love to hear how you handle rule drift and token efficiency across your team!
