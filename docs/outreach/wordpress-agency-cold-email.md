# WordPress Agency Cold Outreach Sequence

**Target Audience:** Technical Directors, Agency Owners, and Senior WordPress Engineers at custom WordPress / WooCommerce development shops.  
**Style Guide:** Zach Holman principles — brief, highly specific, zero fluff, value-first, non-demanding CTA.

---

## ✉️ Touchpoint 1: Initial Cold Email

**Subject:** Broken queries in WordPress AI projects

```text
Hey [Name], notice your team ships some beautiful WordPress work at [Agency].

If your developers are using AI coding agents, they've probably hit 'doom loops' where the model hallucinates or writes insecure database queries.

We built GitContextGen to auto-detect WordPress structures and instantly inject strict WP Coding Standards, $wpdb->prepare safety gates, and secure sanitization parameters directly into Cursor rules and Claude Code.

Happy to set up your core repo for free to show you. Let me know if that sounds useful.

Best,
[Your Name]
GitContextGen Lead Architect
https://github.com/Naveen071110/gitcontextgen
```

---

## ✉️ Touchpoint 2: Technical Value Bump (Day 3)

**Subject:** Re: Broken queries in WordPress AI projects

```text
Hey [Name],

Quick technical follow-up:

Beyond WPCS and `$wpdb->prepare()`, GitContextGen also includes an automated client handoff generator:

`npx @gitcontextgen/core handoff --client "[Client Name]"`

It parses your git commits and generates an executive, jargon-free Proof-of-Work document that you can attach directly to your client invoices to eliminate billing pushback.

If you have 10 minutes this week, I'd be glad to hop on a quick call and configure your team's local MCP servers for free.

Best,
[Your Name]
```

---

## ✉️ Touchpoint 3: The 9-Word Breakup (Day 7)

**Subject:** Re: Broken queries in WordPress AI projects

```text
Hey [Name],

Have you given up on standardizing WordPress AI rules for your team?

[Your Name]
```

---

## 💼 LinkedIn Outreach Variant (InMail / Direct Message)

**Connection Request Note (under 300 characters):**
```text
Hey [Name], love [Agency]'s custom WordPress work. Built a CLI that auto-injects WPCS and $wpdb->prepare rules into Cursor & Claude Code so AI agents don't write insecure queries. Would love to share a free license with your engineers!
```

**Follow-up Message (after connection accepted):**
```text
Hey [Name], thanks for connecting!

Here's the open-source CLI: https://github.com/Naveen071110/gitcontextgen

You can test it on any WordPress theme or plugin directory:
`npx @gitcontextgen/core init`

It automatically recognizes `wp-config.php`, plugin headers, and Gutenberg `block.json`, then outputs strict WordPress rules with `alwaysApply: true`.

Happy to gift your agency a complimentary team license if your developers find it helpful!
```
