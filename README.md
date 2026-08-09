# ⚡ GitContextGen

> **High-Fidelity AI Context Engine & Specification Exporter for Cursor, Claude Code, GitHub Copilot, Replit & Windsurf.**  
> *Stop fighting your AI co-pilot. Automatically audit any repository, resolve complex logic, and deliver a zero-hallucination 'Floor Plan' directly to your favorite AI developer tools.*

---

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-SSR-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![AI Engine](https://img.shields.io/badge/AI_Engine-High--Fidelity_LLM-4F46E5?style=for-the-badge)]()
[![Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com/)

---

## 🌟 About GitContextGen

**GitContextGen** ([repopulse-ai.singhnaveen360.workers.dev](https://repopulse-ai.singhnaveen360.workers.dev/)) is an open-standard developer platform built for **Solopreneurs, Agencies, and No-Code Builders**. 

When developers ask AI coding assistants (like Claude 3.7 Sonnet, Cursor, or Copilot) to build features without a structured context specification file, AI models hallucinate non-existent modules, invent fake file paths, and break build pipelines.

GitContextGen solves this by parsing repository file trees, `package.json` scripts, Makefile targets, and framework entry points to synthesize a **zero-drift "Floor Plan" specification** for AI agents.

---

## ✨ Key Features

- ⚡ **PLG Live Sandbox**: Zero-setup instant public GitHub repository analysis without requiring an account.
- 🎯 **Universal Specification Exporter**: Export native specification files in one click:
  - `AGENTS.md` (Open Cross-Agent Standard)
  - `CLAUDE.md` (Claude 3.7 Sonnet & Claude Code CLI)
  - `.cursorrules` (Cursor IDE System Prompt)
  - `.github/copilot-instructions.md` (GitHub Copilot)
  - `replit.md` (Replit Agent Workspace)
  - `windsurf.json` (Windsurf Cascade Specs)
- 📊 **Agent Readiness Score Meter**: 5-part repository clarity score evaluating setup clarity, test execution, architectural mapping, boundary safety, and multi-agent coverage.
- 🔄 **Context Drift Webhook Synchronization**: Automatic GitHub push event listener that detects codebase changes and generates Pull Requests with updated context specifications.
- 👤 **Stripe-Style Personal Workspace Dashboard**: Auth-aware user space for managing repository context streams, rate-limit delegation, and custom showcase links.
- 🔒 **100% In-Memory Code Security**: Analysis runs statelessly in-memory via edge functions. Source code is never stored or used to train public AI models.
- ⚡ **Automated Supabase Keep-Alive Heartbeat**: Built-in GitHub Action ([`.github/workflows/keep-supabase-alive.yml`](.github/workflows/keep-supabase-alive.yml)) that queries the database every 3 days to prevent free-tier auto-pausing.

---

## 🛠️ Tech Stack & Architecture

- **Frontend & App Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components & Turbopack)
- **Styling & System Design**: Vanilla Tailwind CSS v4, Lucide React Icons, Framer Motion
- **Authentication**: Supabase SSR (`@supabase/ssr`) with 1-Click GitHub OAuth
- **Database & Data Layer**: Supabase PostgreSQL with RLS policies
- **AI Intelligence Engine**: High-Fidelity Multi-Agent LLM Engine
- **Deployment & Edge Runtime**: Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)

---

## 🚀 Quick Start & Installation

### Prerequisites

- Node.js 20+ installed
- npm or pnpm package manager

### 1. Clone the Repository

```bash
git clone https://github.com/Naveen071110/gitcontextgen.git
cd gitcontextgen
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Application URLs
NEXT_PUBLIC_APP_URL=https://repopulse-ai.singhnaveen360.workers.dev

# Supabase Authentication & Database
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# GitHub API & Webhooks
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_WEBHOOK_SECRET=your-github-webhook-secret

# Email Dispatch
RESEND_API_KEY=re_your_resend_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### 5. Production Build Verification

```bash
npm run build
```

---

## 📂 Project Structure

```
gitcontextgen/
├── .agents/                    # Reusable AGY agent skills (ui-ux-engineer, codebase-analyst, etc.)
├── .github/workflows/          # GitHub Actions (Supabase keep-alive cron & CI checks)
├── public/                     # Static assets & media
├── src/
│   ├── app/                    # Next.js 16 App Router pages & API routes
│   │   ├── agents-md-generator/
│   │   ├── api/                # Health, keepalive, and webhook handlers
│   │   ├── auth/               # GitHub OAuth login, signup & callback routes
│   │   ├── claude-md-generator/
│   │   ├── copilot-instructions-generator/
│   │   ├── cursor-rules-generator/
│   │   ├── dashboard/          # Stripe-style personal workspace dashboard
│   │   ├── for/                # Targeted persona landing pages (/for/cursor, /for/claude-code, etc.)
│   │   ├── p/[slug]/           # Public showcase changelog pages
│   │   ├── layout.tsx          # Root layout & SEO metadata
│   │   ├── page.tsx            # Main PLG sandbox landing page
│   │   ├── robots.ts           # Dynamic robots.txt
│   │   └── sitemap.ts          # Dynamic sitemap.xml
│   ├── components/             # Reusable UI components & section blocks
│   ├── lib/                    # AI context engine, GitHub parser, actions & Supabase clients
│   └── proxy.ts                # Next.js 16 session proxy (middleware)
├── package.json
└── tsconfig.json
```

---

## 🏷️ Repository Tags & Topics

Add these topics to your GitHub repository under **About -> Settings**:

`nextjs`, `typescript`, `ai-context-engine`, `agents-md`, `claude-md`, `cursorrules`, `copilot-instructions`, `supabase`, `cloudflare-workers`, `developer-tools`, `solopreneur-tools`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Built for Solopreneurs, Agencies, and No-Code Builders everywhere.
