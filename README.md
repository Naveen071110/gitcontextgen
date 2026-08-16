# ⚡ GitContextGen

> **High-Fidelity AI Context Engine & Official MCP Server for Sonnet 5, Claude Code, Cursor, Copilot, Replit & Windsurf.**  
> *Stop fighting your AI co-pilot. Automatically audit any repository, detect CVE vulnerabilities, render live architecture diagrams, and deliver a zero-hallucination context specification directly to your AI developer tools.*

---

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Standard_Protocol-06B6D4?style=for-the-badge&logo=anthropic)](https://modelcontextprotocol.io/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-SSR-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com/)

---

## 🌟 About GitContextGen

**GitContextGen** ([repopulse-ai.singhnaveen360.workers.dev](https://repopulse-ai.singhnaveen360.workers.dev/)) is an open-standard developer platform and **Model Context Protocol (MCP) Server** built for **Solopreneurs, Agencies, and No-Code Builders**.

When developers ask AI coding assistants (like Sonnet 5, Cursor, or Claude Code) to build features without structured architectural context, AI models hallucinate non-existent modules, invent outdated APIs, and break build pipelines.

GitContextGen solves this by parsing repository trees, manifests, execution scripts, and security boundaries to synthesize a **zero-drift "Floor Plan" specification** for AI agents.

---

## ⚡ Two Ways to Use GitContextGen

### 1. 🌐 Web Sandbox & Context Exporter
Analyze any public GitHub repository instantly in your browser at **[repopulse-ai.singhnaveen360.workers.dev](https://repopulse-ai.singhnaveen360.workers.dev/)** to generate:
- `AGENTS.md` (Universal Cross-Agent Standard)
- `CLAUDE.md` (Sonnet 5 & Claude Code)
- `.cursorrules` (Cursor IDE System Prompt)
- `.github/copilot-instructions.md` (GitHub Copilot)
- `replit.md` (Replit Agent Workspace)
- `windsurf.json` (Windsurf Cascade AI)

### 2. 🔌 Official Model Context Protocol (MCP) Server
Instead of copying huge markdown files into prompts, connect the **GitContextGen MCP Server** over `stdio` to let AI agents dynamically query repository manifests and rules on demand—saving up to **90% in token consumption**.

```bash
# Run standalone MCP Server via npx
npx -y gitcontextgen-mcp
```

#### Claude Code (`~/.claude.json`)
```json
{
  "mcpServers": {
    "gitcontextgen": {
      "command": "npx",
      "args": ["-y", "gitcontextgen-mcp"]
    }
  }
}
```

#### Cursor IDE (Cursor Settings > Features > MCP)
- **Type**: `command`
- **Name**: `GitContextGen`
- **Command**: `npx -y gitcontextgen-mcp`

#### Antigravity / Gemini CLI (`~/.gemini/config/mcp_config.json`)
```json
{
  "mcpServers": {
    "gitcontextgen": {
      "command": "npx",
      "args": ["-y", "gitcontextgen-mcp"]
    }
  }
}
```

---

## 🛠️ Integrated Developer APIs

| Integration | Provider | Purpose |
| :--- | :--- | :--- |
| **🛡️ Google OSV.dev** | [OSV.dev](https://osv.dev) | Real-time batch vulnerability scanning for npm, PyPI, Crates.io, and Go dependencies to inject safety boundary warnings. |
| **📊 Kroki Serverless** | [Kroki.io](https://kroki.io) | 1-Click Mermaid architecture diagram export to vector SVG & PNG URLs for README embedding. |
| **📦 Multi-Ecosystem Registries** | npm, PyPI, Crates.io | Detects modern framework milestones (Next.js 16 App Router, React 19, Tailwind v4) and enforces syntax rules. |
| **📈 QuickChart 5-Axis Radar** | [QuickChart.io](https://quickchart.io) | High-res dark-themed radar scorecards visualizing Setup, Test, Architecture, Boundary Safety, and Multi-Agent coverage. |
| **⚖️ SPDX License Guardrails** | SPDX / GitHub API | Automatically maps open-source licenses (MIT, Apache-2.0, GPL-3.0, AGPL) and writes copyright boundaries. |

---

## ✨ Key Platform Features

- ⚡ **Zero-Decision 3-Line Truth Stream**: Verified evidence-backed tech stack topology, build/dev/test execution commands, and boundary constraints.
- 📊 **Agent Readiness Score Meter**: 5-part repository clarity score with interactive radar chart download.
- 🔄 **Context Drift Webhook Sync**: GitHub push event listener that automatically keeps context files in sync with repository changes.
- 👤 **Stripe-Style Workspace Dashboard**: Manage repository streams, inspect dependencies, and view subscriber changelogs.
- 🔒 **100% In-Memory Privacy**: Code is parsed statelessly in-memory during edge execution and is never stored or used for AI model training.
- ⚡ **Automated Supabase Keep-Alive Heartbeat**: Built-in GitHub Action ([`.github/workflows/keep-supabase-alive.yml`](.github/workflows/keep-supabase-alive.yml)) preventing database auto-pause.

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/Naveen071110/gitcontextgen.git
cd gitcontextgen
npm install
```

### 2. Configure Environment (`.env.local`)
```env
NEXT_PUBLIC_APP_URL=https://repopulse-ai.singhnaveen360.workers.dev
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GITHUB_TOKEN=your-github-token
GITHUB_WEBHOOK_SECRET=your-webhook-secret
RESEND_API_KEY=re_your_resend_api_key
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```
gitcontextgen/
├── mcp-server/                 # Official Model Context Protocol (MCP) Server package
│   ├── src/
│   │   ├── index.ts            # MCP stdio server & tool dispatcher
│   │   ├── localScanner.ts     # Local directory tree & manifest parser
│   │   ├── remoteScanner.ts    # Public GitHub API scanner
│   │   ├── rulesEngine.ts      # Multi-format context generator (CLAUDE, Cursor, AGENTS)
│   │   ├── architectureEngine.ts # Mermaid.js topology & Kroki URL builder
│   │   └── changelogEngine.ts  # Git commit & release notes synthesizer
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── app/                    # Next.js 16 App Router (Landing, Generators, Dashboard)
│   ├── components/             # Reusable UI sections (Hero, MCP Bridge, Readiness, etc.)
│   ├── lib/
│   │   ├── integrations/       # OSV.dev, Kroki, Registries, QuickChart, Licenses
│   │   ├── actions.ts          # Next.js Server Actions
│   │   ├── ai-engine.ts        # AI Context & Readiness scoring engine
│   │   ├── github.ts           # GitHub API client
│   │   └── mockStore.ts        # In-memory global store fallback
│   └── middleware.ts           # Supabase edge session middleware
├── .github/workflows/          # Keep-alive heartbeat workflows
├── package.json
└── wrangler.jsonc              # Cloudflare Workers OpenNext configuration
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Built for Solopreneurs, Agencies, and No-Code Builders everywhere.
