# Next.js Agency Cold Outreach Sequence

**Target Audience:** Engineering Leads, CTOs, and Founders at boutique Next.js / React agencies.  
**Style Guide:** Zach Holman principles — brief, highly specific, zero fluff, value-first, non-demanding CTA.

---

## ✉️ Touchpoint 1: Initial Cold Email

**Subject:** Next.js AI prompt token waste (Quick question)

```text
Hey [Name], notice you guys do fantastic Next.js App Router work at [Agency].

Quick question: Are your developers using Claude Code or Cursor?

We built a local CLI tool called GitContextGen that automatically syncs context rules between them and implements L2 caching. It cuts their LLM token usage by up to 92% by stopping the AI from repeatedly grepping the same files.

Happy to gift your team a free license to try it. Worth a look?

Best,
[Your Name]
GitContextGen Lead Architect
https://github.com/Naveen071110/gitcontextgen
```

---

## ✉️ Touchpoint 2: Value Bump (Day 3)

**Subject:** Re: Next.js AI prompt token waste (Quick question)

```text
Hey [Name],

One quick technical detail I forgot to mention:

If your developers bounce between Cursor (`.cursor/rules/*.mdc`) and Claude Code (`CLAUDE.md`), GitContextGen harmonizes them with bidirectional syncing and adds a local atomic file lock (`fileLock.ts`) so multiple parallel agents don't overwrite each other's files.

You can run an instant audit on any of your repositories with zero install:

`npx @gitcontextgen/core doctor`

Still happy to hand your team an agency pass if you'd like to test it out.

Best,
[Your Name]
```

---

## ✉️ Touchpoint 3: The 9-Word Breakup (Day 7)

**Subject:** Re: Next.js AI prompt token waste (Quick question)

```text
Hey [Name],

Are you still interested in cutting your team's AI token waste this quarter?

[Your Name]
```

---

## 💼 LinkedIn Outreach Variant (InMail / Direct Message)

**Connection Request Note (under 300 characters):**
```text
Hey [Name], loved [Agency]'s recent Next.js App Router work. Built a local CLI that syncs Cursor & Claude Code rules and slashes token waste by 90%. Would love to share a free license with your team if relevant!
```

**Follow-up Message (after connection accepted):**
```text
Hey [Name], thanks for connecting!

Here's the GitHub repo: https://github.com/Naveen071110/gitcontextgen

You can run `npx @gitcontextgen/core init` in any Next.js repo to instantly bootstrap synchronized Cursor .mdc and CLAUDE.md rules with zero token burn.

If your team uses it, ping me anytime and I'll upgrade your account to our Agency Tier for free. Cheers!
```
