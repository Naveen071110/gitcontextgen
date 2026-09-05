# Reddit r/SaaS Teardown & Case Study

**Subreddit:** r/SaaS  
**Flair:** Case Study / Feedback  
**Best Posting Window:** Monday or Wednesday, 10:00 AM EST  

---

## 🏷️ Post Title
```text
We built a developer tool to solve our own context debt. Here's our MVP teardown and B2B pricing strategy.
```

---

## 📝 Post Content

Hey r/SaaS,

Two months ago, our team noticed an expensive leak in our agency balance sheet:

Our developers were using Cursor Composer, Claude Code CLI, and Windsurf all day. We loved the speed, but our AI API credits were evaporating. When we investigated, we discovered that **over 70% of our prompt token consumption wasn't generating code—it was the AI agent recursively grepping our repos** trying to figure out which framework we used, how files were structured, and what coding conventions to follow.

Worse, as multiple developers and autonomous subagents worked in the same repositories, we kept hitting silent "last-writer-wins" file corruptions when two agents attempted to modify rule configs at the same moment.

To solve this, we built **GitContextGen**—initially as an internal script, now a full-blown developer tool and B2B SaaS.

Here is the complete teardown of our product architecture, our pivot from $9 consumer pricing to a $59 B2B tier, and how we handle Merchant of Record billing globally.

---

### 1. What the Product Actually Does
GitContextGen solves the "Context Debt Crisis" for AI coding assistants:

1. **Local AST Repository Profiler:** In under 150ms, it maps out your full architecture, dependencies, and coding conventions (Next.js App Router, WordPress WPCS, Rust, Python, Go) without sending code off your machine.
2. **Synchronized Rules Engine:** Generates bidirectional rule sets for Cursor (`.cursor/rules/*.mdc` with `alwaysApply: true`), Claude Code (`CLAUDE.md`), and multi-agent systems (`AGENTS.md`).
3. **Two-Tier L2 Caching Moat:** Caches parsed AST states in `~/.gitcontextgen/cache/` using SHA-256 signatures. Subsequent agent inquiries drop from 12ms to 1ms, saving up to 92% of redundant context tokens.
4. **Multi-Agent Write Protection (`fileLock.ts`):** Implements atomic cross-platform file locks and Git-state intent verification so multiple AI agents can code in parallel without overwriting each other's work.
5. **Client Handoff Generator (`gitcontextgen handoff`):** Converts raw git commit history into clean, executive-ready business value reports for client billing cycles.

---

### 2. The Pricing Pivot: Why We Ditched $9 Solo Plans for $59 B2B Retainers

Our initial pricing plan was typical developer SaaS:
- **Free:** 5 repo scans/month
- **Starter:** $9/month for solo developers
- **Pro:** $24/month for power users

**What we learned within 3 weeks:**
- Solo developers are notoriously price-sensitive. A solo builder will spend 4 hours hacking together a bash script to save $9.
- Meanwhile, **boutique software agencies and WordPress shops were begging us for team features.** An agency with 5 developers was burning $400+/month in Claude 3.5 Sonnet token costs alone. A tool that saved them 90% on context grepping while providing automated client proof-of-work reports wasn't a $9 impulse buy—it was an essential $500+/month ROI.

#### Our New B2B Pricing Structure:
- **Starter Pass:** $9/mo ($6/mo billed annually at $72) — For solo hobbyists.
- **Pro Builder:** $24/mo ($19/mo billed annually at $228) — For elite freelancers & Cursor power users.
- **Agency Team:** $79/mo ($59/mo billed annually at $708) — Includes 10 developer seats, unlimited repositories, WordPress WPCS presets, multi-agent lock APIs, and automated client handoff generation.
- **High-Margin Upsell:** **$299 Done-For-You (DFY) Team Onboarding Pack** — A 60-minute 1-on-1 implementation call where our principal engineer audits their repos and configures their team’s local MCP and CI/CD pipelines.

By setting **annual billing as the default toggle** with a 25% savings incentive, our average initial order value jumped from $24 to $708 upfront.

---

### 3. Merchant of Record Integration (Dodo Payments)
Because our target market includes software agencies in the US, Europe, India, and Latin America, managing global sales tax, EU VAT, and reverse-charge invoicing would have eaten weeks of engineering time if we implemented raw Stripe Connect.

We chose **Dodo Payments as our Merchant of Record**:
- **Zero Tax Overhead:** Dodo handles cross-border compliance, currency conversions, and automated compliant PDF invoicing.
- **Hosted Checkout & Overlay Modal:** We use `dodopayments-checkout` for friction-free in-app checkout, with direct redirect fallbacks.
- **Self-Service Customer Portal:** Managers can add team seats, update VAT IDs, and download corporate invoices in one click via `/api/customer-portal`.

---

### 4. Key Takeaways for DevTool SaaS Founders
1. **Don't sell to solo developers if you can sell to agencies:** Agencies have budgets, urgent client deadlines, and measurable token waste costs.
2. **Build features that help your customers make money:** Our client handoff command (`gitcontextgen handoff`) became our #1 conversion driver because it helps agencies prove value to their clients and get invoices paid faster.
3. **Package high-touch onboarding:** Adding a $299 Done-For-You setup option gives serious B2B buyers the white-glove confidence they need to convert immediately.

Would love feedback from other SaaS founders on our positioning and B2B pricing model!

GitHub: https://github.com/Naveen071110/gitcontextgen  
Web App: https://repopulse-ai.singhnaveen360.workers.dev  
