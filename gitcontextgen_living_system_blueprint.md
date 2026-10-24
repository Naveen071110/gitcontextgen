# 🏛️ GitContextGen: Living System Blueprint & Agent Communication Companion

**Document Role**: Permanent System Guide & AI Agent Directive File  
**Target Audience**: Non-Technical Founders, Product Owners & Autonomous Coding Agents (Claude Code, Cursor, Windsurf, Manus)  
**System Name**: GitContextGen (`repopulse-ai`)  
**Core Purpose**: High-Fidelity Codebase Context Synthesizer & Zero-Drift Multi-Agent Memory Platform  
**System Status**: 🟢 **100% Production Certified** | **10/10 Test Suites Passing** | **Zero Static Type Errors** | **Cloudflare Workers Live (28ms startup)**  
**Live Production URL**: [https://repopulse-ai.singhnaveen360.workers.dev](https://repopulse-ai.singhnaveen360.workers.dev)  
**Current Release**: Commit `8760d14` (October 2026)

---

> [!IMPORTANT]
> **To the AI Coding Agent Reading This Document:**
> You are inspecting the living architectural blueprint of GitContextGen. **Before making any modifications or adding features to this codebase**, you must read this document in its entirety, adhere strictly to the **Backend Freeze Protocol** in Section 4, and preserve all existing data contracts, timeouts, and security vaults.

---

## Section 1: GitContextGen in Plain English (The Big Picture)

### 1.1 What Problem GitContextGen Solves

#### The "Contractor Amnesia" Paradox
Imagine you hire a world-class master builder to remodel your house. They arrive with genius-level carpentry, electrical, and plumbing skills. However, they suffer from a severe condition: **every single morning, they wake up with total amnesia**.

- They have forgotten where the load-bearing walls are.
- They have forgotten where the plumbing pipes run beneath the floorboards.
- They have forgotten the architectural style and building codes you agreed upon yesterday.

Because of this amnesia, one of two bad outcomes happens every day:
1. **The Contractor Guesses (AI Hallucination)**: They drill directly into a high-pressure water pipe because they assumed it was just empty drywall. In software, this is when an AI agent invents non-existent packages, deletes existing comments, or creates incompatible functions.
2. **You Re-Explain Everything Every Morning (Token Debt)**: You spend 4 hours and thousands of dollars every morning re-reading the entire architectural blueprint to the builder before they can hammer a single nail. In software, this means feeding 150,000 raw lines of code into an LLM prompt, burning through your budget in minutes.

#### The GitContextGen Solution
**GitContextGen is the master architectural blueprint binder and permanent memory vault** handed to the contractor the second they step onto the job site:
- It condenses the entire house into a 1-page, high-density map.
- It highlights all the danger zones (hidden water pipes = private API keys and database credentials).
- It provides a notebook in the hallway (local SQLite memory) where every past decision is logged in under 1 millisecond.

```mermaid
flowchart LR
    A["Raw GitHub Repo<br/>(10,000+ Files, Messy, Secret Leaks)"] --> B["⚡ GitContextGen Engine<br/>(Clean, Scrape, Categorize, Redact)"]
    B --> C["CLAUDE.md & Rules<br/>(Zero Hallucinations)"]
    B --> D["MCP Stdio Server<br/>(Sub-1ms SQLite Memory)"]
    B --> E["Executive .xlsx<br/>(Client & Investor Handoff)"]
```

---

### 1.2 The 3-Sentence Product Summary

1. **GitContextGen inspects any GitHub repository URL** and automatically reverse-engineers its tech stack, architecture, and business domain boundaries without downloading gigabytes of source files.
2. **It scrubs all private secrets** (Stripe keys, AWS tokens, `.env` files) and generates synchronized instruction files (`CLAUDE.md`, `.cursor/rules/*.mdc`) that force AI coding agents to write clean, type-safe code that adheres to project standards.
3. **It equips AI editors with an on-demand Model Context Protocol (MCP) server** backed by local SQLite memory (`.gitcontextgen/memory.db`) and exports publication-ready 5-tab Excel workbooks (`.xlsx`) to hand off to non-technical clients and stakeholders.

---

### 1.3 The 5 Core Capabilities Map

```
┌────────────────────────────────────────────────────────────────────────┐
│                     GITCONTEXTGEN CORE CAPABILITIES                    │
├────────────────────┬───────────────────────────────────────────────────┤
│ Capability         │ What It Does for You                              │
├────────────────────┼───────────────────────────────────────────────────┤
│ 1. Scan & Redact   │ Inspects files & scrubs 7 classes of credentials  │
│ 2. Context Rules   │ Generates CLAUDE.md & .cursor/rules/*.mdc         │
│ 3. Architecture    │ Converts code into interactive Mermaid diagrams   │
│ 4. Executive .xlsx │ Creates 5-sheet financial/progress workbooks      │
│ 5. Local Memory    │ Sub-1ms SQLite memory store across AI sessions    │
└────────────────────┴───────────────────────────────────────────────────┘
```

1. **Scanning & Secret Redaction**: Ingests repository trees through the GitHub API, enforces a 500KB file ceiling to prevent freeze-ups, and scrubs Stripe keys, AWS tokens, and private certificates before any AI reads them.
2. **Context & Rule Generation**: Synthesizes unified `CLAUDE.md` and `.cursor/rules/*.mdc` files with the embedded **Anti-Hallucination & Self-Verification Protocol**, ensuring agents run terminal typechecks before declaring tasks finished.
3. **Visual Architecture Mapping**: Translates raw code dependencies into clean, color-coded Mermaid.js flowcharts with vector SVG Kroki bridges.
4. **Executive Handoff Exports**: Translates dense engineering git commits into non-technical client progress updates and packages everything into an Excel workbook (`.xlsx`) with 2x3 KPI stat cards.
5. **Persistent MCP Memory**: Provides a local, zero-cost SQLite database (`.gitcontextgen/memory.db`) that allows coding assistants in Cursor, Claude Code, and Windsurf to recall past architectural decisions in **0.32ms**.

---

## Section 2: How GitContextGen Works Under the Hood (5-Step Pipeline)

```mermaid
flowchart TD
    Step1["Stage 1: Ingestion & URL Cleaning<br/><i>(The Airport Kiosk)</i>"] --> Step2["Stage 2: Secret Scrubbing & Archetype Detection<br/><i>(The X-Ray Security Shield)</i>"]
    Step2 --> Step3["Stage 3: Rule & Context Synthesis<br/><i>(The Universal Translator)</i>"]
    Step3 --> Step4["Stage 4: Persistent Memory & Mutex Locking<br/><i>(The Private Vault & Lock)</i>"]
    Step4 --> Step5["Stage 5: Workspace Rendering & Downloads<br/><i>(The Finished Vehicle Delivery)</i>"]
```

---

### Stage 1: Ingestion & URL Cleaning
* **The Plain-English Analogy**: **The Airport Kiosk**.  
  Before you enter airport security, an automated kiosk scans your boarding pass, verifies your name, and checks your flight time. If your ticket is invalid, it stops you at the gate instead of letting you get lost in the terminal.
* **What It Does**:
  - Accepts full URLs (`https://github.com/facebook/react`) or shorthand strings (`facebook/react`).
  - Cleans off trailing slashes, `.git` extensions, and query parameters using strict regular expressions.
  - Checks the **L1 Server RAM Cache** (< 1ms) and **L2 Disk Cache** (< 25ms) to see if this repository was analyzed recently. If so, it returns the result instantly without calling GitHub.
  - Activates a **double-ended timeout guard**: 45 seconds on your browser and 35 seconds on the server. If GitHub's servers hang, GitContextGen cuts the connection safely.
* **Input**: User-provided GitHub URL string.
* **Output**: Validated `{ owner, repo, defaultBranch }` object or a cached analysis snapshot.
* **What Happens If This Breaks?**: If the URL does not exist or the repository is private, GitContextGen displays a polite, actionable recovery card prompting the user to check the spelling or sign in with GitHub.

---

### Stage 2: Secret Scrubbing & Archetype Classification
* **The Plain-English Analogy**: **The X-Ray Security Scanner**.  
  Luggage moves along the conveyor belt. Anything oversized (heavy machinery) is routed around the delicate scanner, and any dangerous items (weapons or hazardous liquids) are confiscated before the bag boards the plane.
* **What It Does**:
  - **500KB File Ceiling Guard**: Any file larger than 500KB (or vendor nests like `node_modules/`, `dist/`, `.next/`) is automatically bypassed. This ensures huge data files never freeze the server's CPU.
  - **7-Class Secret Scrubber**: Scans text line-by-line and permanently redacts:
    1. Stripe Secret Keys (`sk_live_...`)
    2. AWS Access Tokens (`AKIA...`)
    3. GitHub Personal Access Tokens (`ghp_...`)
    4. OpenAI & Anthropic API Keys (`sk-proj-...`, `sk-ant-...`)
    5. Private Key Blocks (`-----BEGIN RSA PRIVATE KEY-----`)
    6. SSH Keys (`ssh-rsa AAAA...`)
    7. Database Passwords & `.env` connection strings
  - **Archetype Classifier**: Automatically detects what kind of project this is:
    - `AI_AGENT`: Repos with autonomous loops, prompt chains, or tools (e.g. `NousResearch/hermes-agent`).
    - `SAAS_WEB_APP`: Full-stack web apps (Next.js, Rails, Laravel, Django).
    - `LIBRARY_SDK`: Reusable packages published to npm, PyPI, or crates.io.
    - `CLI_TOOL`: Terminal utilities with flags and command-line interfaces.
    - `CMS_PLUGIN`: WordPress plugins, WooCommerce themes, or Drupal extensions.
* **Input**: Raw file tree and source text from GitHub.
* **Output**: Sanitized codebase topology and classified Archetype badge (`🤖 AI AGENT`, `🌐 SAAS WEB APP`, etc.).
* **What Happens If This Breaks?**: If a file contains invalid characters, the safe regex scrubber catches the exception and redacts the block, guaranteeing zero credential leaks.

---

### Stage 3: Rule & Context Synthesis
* **The Plain-English Analogy**: **The Universal Architectural Translator**.  
  A master translator takes the blueprints of a European train engine and rewrites the instructions in English, Japanese, and German—tailored specifically to the exact tools each mechanic uses in their workshop.
* **What It Does**:
  - Generates `CLAUDE.md` for terminal-based Claude Code sessions.
  - Generates `.cursor/rules/*.mdc` for Cursor Composer with `alwaysApply: true` frontmatter.
  - Generates path-scoped `.claude/rules/*.md` files that only activate when editing specific subdirectories.
  - Embeds the **Anti-Hallucination & Self-Verification Protocol** directly into every rule file:
    1. *Mandatory Terminal Typecheck*: Must run `npx tsc --noEmit` before finishing.
    2. *Comment Preservation*: Must never delete existing comments or docstrings.
    3. *Import Graph Check*: Must verify imported modules exist before using them.
* **Input**: Sanitized file tree, package manifests, and detected framework.
* **Output**: Ready-to-use AI configuration files (`CLAUDE.md`, `AGENTS.md`, Cursor `.mdc` rules).
* **What Happens If This Breaks?**: If the AI model or network times out, GitContextGen automatically falls back to its deterministic local generator (`[ 🛠️ Local Engine ]`), delivering 100% complete rule files at $0 cost.

---

### Stage 4: Persistent Memory & Mutex Locking
* **The Plain-English Analogy**: **The Private Bank Vault & Occupied Bathroom Lock**.  
  A company keeps a shared ledger inside a secure vault. When an employee enters to log an entry, they flip the deadbolt on the door to "Occupied". No other employee can barge in and mess up the ledger while it is being written. If an employee gets sick and leaves the door locked, an automated timer unlocks the deadbolt after 30 seconds.
* **What It Does**:
  - **Zero-Egress SQLite Memory**: Stores decisions, bug resolutions, and architecture choices in `.gitcontextgen/memory.db`. Operates completely locally—no data ever leaves your computer.
  - **Sub-1ms Query Speed**: Benchmarked at an average recall speed of **0.32ms** per query (15 times faster than the 5ms target).
  - **Multi-Agent Mutex Referee**: When two AI agents (e.g. Claude Code in the terminal and Cursor Composer in the editor) attempt to write to the project simultaneously, GitContextGen creates an atomic `.lock` file. Secondary agents wait safely instead of corrupting your code.
* **Input**: Tool calls, git commits, dependency upgrades, or manual notes.
* **Output**: Permanent local memory records and guaranteed collision-free file writes.
* **What Happens If This Breaks?**: If an AI agent process crashes while holding the lock, the Mutex Referee checks the process ID (`PID`) and reclaims the lock after 30 seconds, preventing permanent deadlocks.

---

### Stage 5: Workspace Rendering & Downloads
* **The Plain-English Analogy**: **The Finished Vehicle Delivery & Showroom**.  
  The car rolls off the factory assembly line into a clean showroom where every dial, button, and report is presented with crystal clarity, ready to drive off the lot or hand over to an auditor.
* **What It Does**:
  - Renders the interactive **6-Tab Workspace View** in your web browser:
    - **Tab 0: Analysis Overview (Default)**: Action-oriented landing hub featuring the **"Prepare My AI Coding Setup"** primary action card with **Manual Verification Checklists** (guided steps for Claude Code, Cursor, GitHub Copilot, and Windsurf, explicitly labeled as manual verification without local machine access), an **Analysis Scope & Transparency Receipt** (verifiable audit trail of examined files, commit ref, 300-node AST ceiling, exclusion rules, 7-class regex scrubbing scope, and known reliability limitations with explicit "Not reported by this analysis" badges for unexposed API fields), a **Change-Aware Context & Drift Detection Card (Section 2.6)** (in-session snapshot baseline comparison, mechanical orphaned file path checks, structural module drift, and 1-click access to the full audit modal), a **Genuine AST Findings Grid** (Repository Identity, Verified Dev Commands, AST summary, OSV.dev CVE & 7-secret heuristic redaction — strictly zero arbitrary health scores), and a compact **Deliverables Directory** linking to all synthesized assets.
    - **Tab 1: Code Context**: AI onboarding files (`CLAUDE.md`, `AGENTS.md`) with the **Standard vs. Minimal Output Toggle**, per-file token counts, **Side-by-Side Diff** against legacy files, and **Rule Evidence & Source Lineage** cards distinguishing Direct Manifest Matches from Heuristic Structural Inferences, accompanied by in-browser client-side instruction editing and previewing in `CodeViewer`.
    - **Tab 2: Synced Rules**: Native `.cursor/rules/*.mdc` files with `alwaysApply: true` frontmatter and framework invariants, backed by **Frontmatter & Invariant Lineage** inspection and helpful fallback empty states.
    - **Tab 3: MCP Config**: Local-first stdio MCP tool definitions and persistent SQLite memory sandbox.
    - **Tab 4: Dependency Graph**: Visual module architecture and Mermaid.js flowchart with Kroki vector bridge.
    - **Tab 5: Team Handoff**: Stakeholder-friendly executive and engineering handoff hub featuring truthful verification telemetry (zero arbitrary 'Production Ready' claims), a 1-click **Shareable Markdown Summary** copy action, 3-pillar commercial impact categorization (Features, Security, UX), an **Export & Deliverables Discovery Hub** (explaining the distinct purposes of Excel, File Inventory CSV, Client Handoff CSV, and JSON payloads with direct downloads), an **Engineering Invariants & Decisions** panel, a truthful **Local MCP SQLite Memory Provenance** boundary disclosure, and an informational **Team Readiness Roadmap**.
  - **5-State Clear Freshness Badge & Snapshot Switcher**: Replaces ambiguous indicators with truthful states: `🟢 HEAD Snapshot Verified` (first run baseline), `🟢 Zero Drift Detected` (re-analyzed identical match), `⚠️ Context Drift Detected (X Changes)` (file inventory or rule line changes), `⚠️ Orphaned Ref Detected (X)` (rule references absent from known file tree), and `⚪ Freshness Unknown`. Allows 1-click switching between `Viewing: Latest Analysis` and `Viewing: Prior Baseline` with an amber historical state banner.
  - **Snapshot Comparison & Drift Audit Modal**: Side-by-side delta engine contrasting `previousResult` against latest `result` with inventory additions/removals, rule line and character differences, vulnerability deltas, and explicit disclosure of uncomparable data (raw blob hashing and >300 AST node ceiling).
  - **Truthful Loading Telemetry**: `TerminalLoader` eliminates fake percentage bars in favor of honest in-flight stage telemetry, an active streaming indicator, live elapsed timer (`Elapsed: Xs / 45s`), and a 1-click cancel button.
  - **Categorized Error Recovery Cards**: Distinguishes invalid URLs, private repo 404s (with 1-click GitHub OAuth button), 403/429 rate limits, 45s timeouts, and network failures with plain-English recovery advice and 1-click retry.
  - **Instant Cache Indication & Re-Analyze Workflow**: Subtly indicates when results are loaded from local cache with age indicator and 1-click force re-sync with spinning re-analysis state (without claiming false automated background monitoring).
  - **Decoupled Edge SSR Bundle Architecture (`exceljs` Dynamic Loading)**: To ensure 100% compatibility with the Cloudflare Workers edge runtime where native Node.js streams and file APIs are restricted, `src/lib/export/excelExporter.ts` is dynamically imported client-side only when an export is triggered (`const { exportExecutiveExcelWorkbook } = await import('@/lib/export/excelExporter')`). The edge worker SSR bundle (`.open-next/worker.js`) remains lean, fast, and free of heavy spreadsheet engine bloat while client machines handle workbook formatting and downloads in-browser.
  - Generates a **5-Tab Executive Excel Workbook (`.xlsx`)** with:
    - *Tab 1*: 2x3 KPI stat card grid (Total LOC, Token Savings %, Security status, Health Score).
    - *Tab 2*: Codebase topology with Consolas monospace paths and `=SUM()` formulas.
    - *Tab 3*: Complete AI rules dossier.
    - *Tab 4*: Architecture diagram with Kroki vector links.
    - *Tab 5*: Plain-English Client Handoff report with status pill badges (`PRODUCTION READY`).
  - Generates flat CSV and JSON exports with formula-injection protection (RFC 4180).
* **Input**: Completed analysis payload.
* **Output**: Interactive web UI and 1-click downloadable `.xlsx`, `.csv`, and `.json` files.
* **What Happens If This Breaks?**: All column widths are mathematically calculated (`width = 26` per column, `startRow = 4`) so Excel never displays annoying `###` numerical clipping errors.

---

### 2.6 Responsive Design System & Mobile Viewport Containment Standards

To eliminate responsive regressions and preserve the dark obsidian branding across ultra-narrow mobile viewports (390px iPhone width) and 1440px desktop screens, the presentation layer strictly enforces the following UI layout rules:

| Design Token / Element | Mobile (< 640px) | Desktop (>= 1024px) | Implementation Invariant |
| :--- | :--- | :--- | :--- |
| **Section Vertical Padding** | `py-28` (112px) | `py-36` (144px) | Maintains consistent macro-rhythm without excessive empty lead-in. |
| **Heading to Content Gap** | `mb-7 sm:mb-10` (28px) | `md:mb-16` (40–64px) | Prevents tall empty blocks above interactive sandboxes. |
| **Mobile Card Grid Gap** | `gap-4` (16px) | `gap-6` to `gap-8` (32px) | Avoids continuous card walls when cards stack vertically. |
| **Card Internal Padding** | `p-5` | `p-7` to `p-8` | Reduces vertical scroll strain while preserving readability. |
| **Touch Target Minimum** | $\ge 44\text{px}$ (`min-h-11`) | $\ge 44\text{px}$ | All buttons, tabs, inputs, and FAQ accordions must be touch-friendly. |
| **Hero Preview Containment** | `max-h-[480px] overflow-hidden` | `sm:max-h-none` | Enforces `min-w-0 max-w-full` on `BrowserRedirectLoop` to eliminate 390px overflow. |
| **Hero Input & CTA Inset** | Unified `w-full max-w-xl px-4` | Side-by-side flex row | Prevents mismatched button and input widths on small devices. |
| **Horizontal Tab Navigation** | `overflow-x-auto` with fade cue | Standard flex row | Tab strips (`LiveDashboardPreview`, `AgentMemoryFeature`) use `overscroll-x-contain`, `pr-3`, and right-edge gradient masks. |
| **Comparison Tables** | Sticky Col 1 + `scroll-snap` | Proportional CSS grid | Column 1 remains fixed (`position: sticky; left: 0`); desktop uses `minmax(260px,1fr) repeat(4,minmax(120px,1fr))`. |

---

---

## Section 3: Output Inventory Reference Guide

The following table details every file and asset GitContextGen produces, which AI assistant consumes it, and why it is critical for development quality:

| Output File / Asset | Which AI Uses It? | What It Contains | Why It Matters for Quality & Reliability |
| :--- | :--- | :--- | :--- |
| **Overview & Setup Hub (Tab 0)** | **All AI Assistants & Developers** | Action-oriented landing hub with "Prepare My AI Coding Setup", AST telemetry findings, and 8-deliverable directory. | **Zero confusion next steps.** Ensures developers and non-technical founders immediately know how to apply context to Claude, Cursor, Copilot, or Windsurf with 1-click execution. |
| **Analysis Scope & Transparency Receipt** | **Developers, Security Auditors & Non-Tech Founders** | Verifiable receipt detailing audited ref, commit scope, examined node count, 300-file AST ceiling, excluded categories, 500KB ReDoS guard, and 7-class regex scrubbing scope with explicit "Not reported by this analysis" badges for unexposed API fields. | **Uncompromising honesty.** Eliminates false security claims and documents exact scan boundaries so users understand what was examined versus what was skipped. |
| **Rule Evidence & Source Lineage Map** | **Developers & AI Agents** | Provenance mapping distinguishing Direct Manifest Matches (e.g. `package.json`, `tsconfig.json`) from Heuristic Structural Inferences, accompanied by in-browser client-side instruction editing and previewing. | **Verifiable ground truth.** Allows users to trace every dev command and invariant back to source files and customize instructions before downloading. |
| **`CLAUDE.md` (Standard)** | **Claude Code** (Anthropic CLI) | Exact terminal build commands (`npm run build`), test scripts (`npm test`), static typechecks (`npx tsc --noEmit`), styling standards, and architectural boundaries. | **Primary ground truth.** This is the very first file Claude Code reads upon entering a directory. Prevents the AI from guessing build scripts or hallucinating fake dependencies. |
| **`CLAUDE.md` (Minimal)** | **Claude Code & Fast Models** | Token-condensed operational package preserving core invariants, terminal commands, and anti-hallucination checklists while stripping verbose prose (~35-45% fewer tokens). | **Saves token budget & latency.** Optimizes context window space for models with strict token ceilings or fast turnaround workflows. |
| **`.cursor/rules/*.mdc`** | **Cursor Composer** & Tab Autocomplete | Framework-tailored rules with YAML frontmatter (`alwaysApply: true`, `globs: *`). Includes framework-specific guidelines (e.g. Next.js App Router rules vs. WordPress WPCS standards). | **Guarantees editor obedience.** Forces Cursor to respect project boundaries, write strict TypeScript types, and prevents it from silently deleting comments. |
| **`.claude/rules/*.md`** | **Claude Code** (Path-Scoped) | Scoped rules that only trigger when an AI agent touches specific folders (e.g. `paths: ["src/app/api/**"]`). | **Saves token budget.** Instead of loading huge global rules into every prompt, Claude only loads API rules when editing API files. |
| **`AGENTS.md`** | **Multi-Agent Swarms** (Manus, Codex, Jules, AutoGPT) | Universal multi-agent coordination manifest defining subsystem invariants, database schemas, and shared contracts. Available in Standard and Minimal modes. | **Standardizes team agents.** Ensures an agent running on one developer's machine follows the exact same architectural rules as an agent running on another machine. |
| **Side-by-Side Diff Modal** | **Human Developers & Tech Leads** | Split visual comparison between detected legacy repository instruction files and GitContextGen's synthesized, anti-hallucination version. | **Upgrade verification.** Allows developers to immediately verify what security guardrails, verified commands, and anti-hallucination protocols were added. |
| **Mermaid Topology Graph** | **Human Developers & AI** | Clean flowchart representing system boundaries (Frontend $\rightarrow$ API Routes $\rightarrow$ Database $\rightarrow$ External Services). | **Instant mental map.** Gives both human developers and vision-capable LLMs an instant visual understanding of how data flows through the application. |
| **5-Tab Excel Workbook (`.xlsx`)** | **Stakeholders, Clients & Investors** | Multi-sheet executive workbook featuring 6 KPI stat cards, file inventories with formulas, AI rule inventories, and plain-English client progress notes. | **Professional deliverables.** Bridges the gap between technical engineering git commits and non-technical clients who need to see business value. |
| **Snapshot Comparison & Drift Audit Dossier** | **Human Developers, AI Agents & Lead Engineers** | Mechanical delta engine comparing sequential in-session analyses, tracking added/removed files, rule line/char diffs, OSV CVE shifts, and orphaned file path references. | **Detects context drift deterministically.** Prevents agents from generating code against deleted files or obsolete architecture patterns by flagging exact differences. |
| **5-State Freshness & Drift Telemetry** | **All Developers & AI Agents** | Real-time status indicator signaling `HEAD Snapshot Verified`, `Zero Drift Detected`, `Context Drift Detected`, `Orphaned Ref Detected`, or `Freshness Unknown`. | **Replaces deceptive static badges.** Gives developers and non-technical founders truthful, mechanical proof of synchronization status without fake background monitoring. |
| **Shareable Markdown Project Summary** | **Developers, Leads & Non-Technical Stakeholders** | Comprehensive plain-English repository summary formatted in Markdown, detailing repository identity, analyzed revision (`HEAD`), framework, commercial impact categorization, synthesized deliverables, and explicit verification limitations. | **Zero-friction team handoff.** Enables instantaneous sharing across Slack, email, PR descriptions, or documentation without external service uploads or private source leakage. |
| **Export & Deliverables Discovery Hub** | **Stakeholders, Auditors, PMs & Toolchains** | Purpose-driven multi-format export center providing 1-click downloads for Excel (`.xlsx`), Codebase Inventory (`.csv`), Client Handoff (`.csv`), and full analysis JSON (`.json`) with clear descriptions of when and why to use each format. | **Eliminates format ambiguity.** Ensures teams and auditors download the exact data shape required for their workflows using verified generated payloads. |
| **Local SQLite Memory (`memory.db`)** | **Model Context Protocol (MCP)** | Atomic database table (`agent_memories`) recording bug fixes, architectural choices, and dependency updates. | **Sub-millisecond recall.** Completely stops AI agents from repeating past mistakes by letting them query past resolutions in **0.32ms**. |

---

## Section 4: Non-Technical Founder's Agent Directives & Update Protocol

Whenever you hire or prompt an AI coding agent (in Cursor, Claude Code, Windsurf, or Manus) to make changes to GitContextGen, **copy and paste the following communication template into your prompt**:

### 4.1 Mandatory Communication Template for the Founder

```markdown
Hey Agent, I need you to update [Feature Name / Component Name].

Before writing or modifying any code, you MUST follow these 4 rules:
1. READ `gitcontextgen_living_system_blueprint.md` in the project root to understand how the system works.
2. EXPLAIN to me in simple, non-technical plain English what changes you plan to make and why.
3. ADHERE STRICTLY to the Backend Freeze Protocol: You must NEVER alter protected files in `/src/app/api/analyze/`, `/src/lib/analyzer/`, `/src/lib/mcp/`, `/src/lib/github.ts`, `/src/lib/cacheStore.ts`, `/src/lib/export/excelExporter.ts`, `/src/lib/export/csvExporter.ts`, or `/mcp-server/` without my explicit written permission.
4. VERIFY YOUR WORK: After making edits, run `npx tsc --noEmit` (confirm 0 type errors) and `npm test` (confirm 10/10 test suites pass) before telling me the task is complete.
```

---

### 4.2 Backend Freeze Protocol: The Protected Core Files

The following files represent the **core engine and safety vault** of GitContextGen. They have undergone extensive security auditing, timeout tuning, and secret-scrubbing verification.

> [!CAUTION]
> **PROTECTED SYSTEM ZONE (DO NOT MODIFY WITHOUT EXPLICIT SIGN-OFF):**
> 1. `src/app/api/analyze/route.ts` *(Core 35s timeout, rate limiter, and L1/L2 cache router)*
> 2. `src/lib/github.ts` *(GitHub API gateway, 500KB ReDoS ceiling, and 7-secret redaction vault)*
> 3. `src/lib/analyzer/engine.ts` *(Archetype classification engine and rule synthesizer)*
> 4. `src/lib/cacheStore.ts` *(L1 RAM cache and L2 SHA-256 disk cache persistence)*
> 5. `src/lib/export/excelExporter.ts` *(5-tab ExcelJS generator with balanced 2x3 KPI grid)*
> 6. `src/lib/export/csvExporter.ts` *(RFC 4180 formula-injection protection and CSV generator)*
> 7. `mcp-server/src/index.ts` *(JSON-RPC 2.0 stdio server and 11 MCP tool contracts)*

If an agent needs to add a feature (e.g. a new landing page section or a new dashboard button), they must make those changes in the **Presentation Layer** (`src/components/` or `src/app/`) without touching the protected backend engine.

> [!NOTE]
> **Data Contract & Transparency Audit Record (Priority 1):**
> To preserve the Backend Freeze Protocol while guaranteeing complete user honesty, the presentation layer implements explicit `"Not reported by this analysis"` states for fields not currently returned by the frozen API contract:
> 
> | Field Path | Payload Status | Presentation Layer Behavior |
> | :--- | :--- | :--- |
> | `result.owner`, `result.repo` | ✅ Available | Renders repository identity header. |
> | `result.defaultBranch` | ✅ Available | Renders default branch indicator (`main`). |
> | `result.commitSha` | ❌ Unreported | Renders `HEAD (${defaultBranch})` + `"Not reported by this analysis"`. Forward-compatible when backend unfreezes. |
> | `result.analyzedAt` | ✅ Available | Renders ISO 8601 UTC timestamp and relative time. |
> | `result.fileTreeSummary` | ✅ Available | Parsed into examined file and directory counts. Flags 300-node AST ceiling if truncated. |
> | `result.totalFiles`, `result.skippedFilesCount` | ❌ Unreported | Renders examined count from tree + `"Not reported by this analysis"` for total un-scanned count (documents standard vendor ignore rules). |
> | `result.vulnerabilityCount`, `criticalCount` | ✅ Available | Sourced from OSV.dev dependency audit. |
> | `result.licenseSpdx` | ✅ Available | Sourced from SPDX license identification. |
> | `result.sanitizedSecretsCount` | ❌ Unreported | Documents 7-class regex scope + `"Not reported by this analysis"` for numeric count. Strictly zero fabricated counts. |
> | `result.monetizableOutputs.ruleEvidenceMap` | ❌ Unreported | Lineage is deterministically resolved from AST manifest presence (`package.json`, `tsconfig.json`) and archetype signatures; structural conventions are labeled as **Inferred**. |
> 
> ---
> 
> > [!NOTE]
> > **Data Contract & Drift Detection Record (Priority 2):**
> > Priority 2 establishes a change-aware presentation layer while strictly adhering to the Backend Freeze Protocol:
> > 
> > | Snapshot & Drift Capability | Source & Implementation | Privacy & Limitation Disclosures |
> > | :--- | :--- | :--- |
> > | `previousResult` (Baseline Snapshot) | Retained in-memory via React state across re-analyses (`HeroSection`, `RepoViewClient`, `RepoDashboard`). | **Privacy Guardrail**: Never stored in insecure `localStorage` or `sessionStorage` to prevent unencrypted disk leakage of proprietary source code or private tokens. Discarded upon page refresh. |
> > | First Analysis Baseline State | Client checks `!previousResult`. | Explicitly displays `"No comparison baseline in current session"`. Zero fabricated historical records or simulated commits. |
> > | Inventory Addition & Removal Diffs | Path set diffing of parsed paths extracted from `result.fileTreeSummary`. | Captures all AST-indexed files up to the 300-node ceiling. For repos with >300 files, notes unindexed folder limitations. |
> > | Rule Instruction Diffs | Line and character count deltas computed across `CLAUDE.md`, `AGENTS.md`, and `.cursor/rules/*.mdc`. | Accurately identifies when rules were modified, added, or unchanged between analysis runs. |
> > | Stale Instruction & Orphan Detection | Deterministic regex scan of generated instruction text against `parseFileTreePaths()`. | Mechanically identifies referenced files (e.g. `src/server.ts`) that do not exist in the current file tree. Distinguishes confirmed missing paths from structural suggestions without arbitrary confidence scores. |
> > | Freshness Indicator Statuses | Evaluated in `computeFreshnessState()`. | Evaluates 5 truthful states: `HEAD Snapshot Verified`, `Zero Drift Detected`, `Context Drift Detected`, `Orphaned Ref Detected`, and `Freshness Unknown`. |
> > | Git Blob SHAs & Content Hashing | ❌ Unreported by GitHub Tree API payload. | Truthfully disclosed in the comparison modal as uncomparable data. |

---

### 4.3 Safe Feature Expansion Checklist for Coding Agents

When adding new capabilities to GitContextGen, coding agents must follow this safe step-by-step workflow:

1. **Step 1: Check Current System Health**
   ```bash
   npx tsc --noEmit
   npm test
   ```
   *Confirm all 10 test suites are passing before touching any code.*

2. **Step 2: Scope Changes to the Presentation Layer**
   - New UI sections go into `src/components/YourNewSection.tsx`.
   - New visual styling uses Tailwind CSS classes matching the existing GitHub dark palette (`#0d1117`, `#161b22`, `#30363d`, `#58a6ff`, `#3fb950`).
   - All interactive copy buttons must feature a `Copied! ✓` feedback state and fixed layout heights to prevent layout jitter.

3. **Step 3: Preserve Documentation & Comments**
   - Never remove existing JSDoc comments, explanatory docstrings, or architectural notes.

4. **Step 4: Execute Full Verification**
   ```bash
   # 1. Typecheck: Must produce zero errors
   npx tsc --noEmit

   # 2. Test Suite: Must pass 10/10 test suites (Phases 1 through 10)
   npm test

   # 3. Production Build: Must compile all 32 Next.js App Router routes cleanly (19 static + 13 dynamic/API routes)
   npm run build
   ```

5. **Step 5: Summarize Changes in Plain English**
   The agent must report back to the founder using clear, non-technical language:
   - What was added.
   - Which files were modified.
   - The exact test and build verification results.

---

### 4.4 Emergency Rollback Commands (For the Founder)

If an AI coding agent ever makes a mistake or leaves the app in a broken state, open your terminal in the project directory and run these safety commands:

```bash
# 1. See what files the agent modified:
git status

# 2. Discard all uncommitted changes and return to the last working state:
git reset --hard HEAD

# 3. Verify that the project is completely clean and healthy again:
npm test
```

---

## Section 5: Team Readiness & Collaboration Architecture Requirements

To prepare GitContextGen for multi-seat engineering teams and enterprise environments without violating the **Backend Freeze Protocol**, the following architectural specifications define the exact backend and infrastructure requirements for future collaboration capabilities:

### 5.1 Shared Team Memory Architecture
* **Current Limitation**: SQLite agent memory (`.gitcontextgen/memory.db`) is local-first and confined to the developer's personal machine via the stdio MCP server. Web analysis does not read or transmit local disk storage.
* **Required Future Architecture**:
  - **Encrypted Multi-Tenant Cloud Store**: A cloud-synchronized SQLite edge database (e.g. Cloudflare D1, Turso libSQL, or Supabase PostgreSQL) partitioned by `organization_id` and `repo_id`.
  - **Bidirectional Sync Protocol**: An MCP sync command (`gitcontextgen sync-memories`) in `mcp-server` that cryptographically signs and pushes local bug resolutions to the organization memory pool.
  - **Zero-Knowledge Encryption**: Agent memories containing proprietary code snippets must be encrypted at rest with client-managed keys before transmission.

### 5.2 Organization-Level Instruction Templates
* **Current Limitation**: Instruction rules (`CLAUDE.md`, `.cursor/rules/*.mdc`) are synthesized independently per repository based on AST archetype and manifests.
* **Required Future Architecture**:
  - **Centralized Template Hierarchy**: An organization-level rule repository (e.g. `.github-org/rules/` or database templates) that defines mandatory company invariants (e.g. corporate security standards, required linter flags, copyright headers).
  - **Inheritance Engine**: The rule synthesizer in `src/lib/analyzer/engine.ts` must accept an optional `orgTemplateRules` parameter, prepending organizational mandates above repository-specific framework guidelines.

### 5.3 Continuous Integration (CI) Context Drift Guard
* **Current Limitation**: Drift detection is evaluated on-demand within the client web session by diffing two completed snapshots.
* **Required Future Architecture**:
  - **Standalone GitHub Action**: A containerized CLI action (`repopulse-ai/context-drift-action@v1`) triggered on `pull_request` events.
  - **PR Diff Evaluator**: Compares changed files against backtick-quoted references in `CLAUDE.md` and `.cursor/rules/*.mdc`.
  - **Automated CI Failure**: If a PR deletes or renames a file referenced in the instructions, the CI step exits with code 1 and posts a suggested instruction fix directly as a PR comment.

### 5.4 Team Role-Based Access Control (RBAC) & Audit Logs
* **Current Limitation**: Analysis sessions are stateless or mapped to a single authenticated user in Supabase.
* **Required Future Architecture**:
  - **Role Taxonomy**:
    1. `Owner`: Manages billing, subscription tiers, and organization-wide API keys.
    2. `Tech Lead / Admin`: Approves and locks instruction templates, configures MCP daemon ports.
    3. `Contributor / Developer`: Views analysis, downloads rules, and queries MCP memory.
    4. `Stakeholder / Auditor`: Accesses read-only Executive Handoff reports, Excel exports, and license compliance audits.
  - **Tamper-Evident Audit Ledger**: An append-only log table recording all rule modifications, Excel workbook exports, and memory access events with ISO 8601 UTC timestamps, user IDs, and client IP addresses.

---

## Section 6: Production Deployment & Cloudflare Workers Pipeline

GitContextGen is built for global edge execution using the OpenNext Cloudflare adapter. The application compiles to an optimized edge worker bundle with static asset binding and lightweight Node.js compatibility.

### 6.1 Deployment Architecture & Configuration

| Parameter | Production Value | Architectural Notes |
| :--- | :--- | :--- |
| **Edge Adapter** | `@opennextjs/cloudflare` v1.20.2 | Bridges Next.js 16 App Router to Cloudflare `workerd`. |
| **Worker Script** | `.open-next/worker.js` | Edge SSR execution entrypoint with streaming support. |
| **Static Assets** | `.open-next/assets` (`env.ASSETS`) | Zero-latency edge asset delivery bypassing worker execution for static files. |
| **Compatibility Date** | `2026-07-29` | Strict Cloudflare Workers runtime API baseline. |
| **Compatibility Flags** | `["nodejs_compat"]` | Provides lightweight Node.js standard library polyfills at the edge. |
| **Deployment Command** | `npm run deploy` | Executes `opennextjs-cloudflare build && wrangler deploy`. |
| **Preview Command** | `npm run preview` | Local simulation via `opennextjs-cloudflare build && wrangler dev`. |
| **Live Production Host** | `https://repopulse-ai.singhnaveen360.workers.dev` | Production Cloudflare Workers custom subdomain. |
| **Edge Startup Latency** | **28 ms** (benchmarked) | Sub-30ms cold-start latency across global edge PoPs. |

### 6.2 Pre-Deployment Checklist for Coding Agents

Before running `npm run deploy`, agents must complete the following sequential gates:

1. **Gate 1: Static Typecheck**  
   Run `npx tsc --noEmit` and confirm **zero static type errors**.
2. **Gate 2: Automated Test Suite**  
   Run `npm test` and verify all **10/10 test phases pass** (Phases 1 through 10).
3. **Gate 3: Security & Credential Scan**  
   Confirm no uncommitted secrets or credentials exist (`npm run security:check-staged`).
4. **Gate 4: Next.js Production Compilation**  
   Run `npm run build` and verify clean generation across all 32 App Router routes (19 static + 13 dynamic/API).
5. **Gate 5: Edge Asset Size Check**  
   Verify that single static media assets do not exceed Cloudflare's 25MB per-file upload limit (large binary assets like walkthrough videos must be served externally via GitHub raw storage or cloud buckets).

---

*This Living System Blueprint is certified and maintained as the single source of truth for the GitContextGen project.*
