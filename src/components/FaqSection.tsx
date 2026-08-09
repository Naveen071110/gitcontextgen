'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, FileCode2, Sparkles, RefreshCw, GitBranch, Cpu, Lock } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'What is a CLAUDE.md, .cursorrules, or AGENTS.md file?',
      answer:
        'A context file gives AI assistants (like Claude, Cursor, or Copilot) clear instructions about your project structure, build commands, and coding conventions. It acts as a specification manual so AI agents write working code for your specific app without hallucinating or breaking files.',
      icon: <FileCode2 className="w-5 h-5 text-cyan-400 shrink-0" />,
    },
    {
      question: 'What is AGENTS.md and how does it differ from vendor formats?',
      answer:
        'AGENTS.md is an open, vendor-neutral specification format supported across the AI developer ecosystem. Instead of maintaining separate instruction files for every vendor, AGENTS.md serves as a single open source of truth that works across Claude, Copilot, Cursor, Replit, and Windsurf.',
      icon: <Cpu className="w-5 h-5 text-indigo-400 shrink-0" />,
    },
    {
      question: 'What is Context Drift and why do AI instructions become stale?',
      answer:
        'Context Drift occurs when your codebase evolves — such as when build scripts change, dependencies update, or API routes get refactored — but your prompt instructions remain static. AI agents then use outdated assumptions and write broken code. GitContextGen detects changes via webhooks and automatically proposes updated context via GitHub Pull Requests.',
      icon: <RefreshCw className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    {
      question: 'Do I need coding experience to use GitContextGen?',
      answer:
        'No! GitContextGen is designed so anyone — including founders and builders with zero coding background — can paste a public GitHub URL and generate perfect AI context files for Claude, Cursor, Replit, or Bolt in seconds.',
      icon: <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    {
      question: 'How does GitContextGen verify instructions with evidence?',
      answer:
        'Rather than making unsupported AI guesses, GitContextGen parses your actual package.json scripts, Makefile targets, and CI workflows. Every generated instruction is linked to its exact repository source (e.g., Evidence: package.json#scripts.build) with a confidence rating.',
      icon: <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0" />,
    },
    {
      question: 'Can GitContextGen analyze private GitHub repositories?',
      answer:
        'Yes! With our Professional and Enterprise plans, you can connect private client repositories securely using a read-only GitHub Personal Access Token or GitHub App integration with fine-grained repository access controls.',
      icon: <GitBranch className="w-5 h-5 text-indigo-400 shrink-0" />,
    },
    {
      question: 'How does GitContextGen protect sensitive data and secrets?',
      answer:
        'All repository analysis runs in-memory via stateless edge functions. We automatically filter out .env files, credentials, API keys, and protected paths. Your source code is never stored on our servers or used to train public AI models.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    {
      question: 'Which AI coding tools and frameworks are supported?',
      answer:
        'GitContextGen supports Next.js, React, Node.js, Python, Go, Rust, and more. It exports native specifications for Claude 3.5 Sonnet / Claude Code (CLAUDE.md), GitHub Copilot (.github/copilot-instructions.md), Cursor (.cursorrules), Replit (replit.md), Windsurf (windsurf.json), and AGENTS.md.',
      icon: <Lock className="w-5 h-5 text-amber-400 shrink-0" />,
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 bg-black text-white">
      <div className="w-full flex flex-col items-center justify-center">
        
        {/* Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-20">
          <div className="w-full flex justify-center mb-6">
            <div className="w-fit inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-xs font-mono text-white/80">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Frequently Asked Questions
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight text-center">
            Everything You Need to{' '}
            <span className="font-serif italic font-normal text-white/80">Know.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed text-center">
            Clear, detailed answers about AI context files, AGENTS.md, context drift, and code security.
          </p>
        </div>

        {/* Accordion List - Borderless Floating Cards */}
        <div className="w-full max-w-4xl mx-auto space-y-4 text-left flex flex-col items-center">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="w-full rounded-2xl bg-white/[0.02] overflow-hidden transition-all duration-200 shadow-xl"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 focus:outline-none group cursor-pointer"
                >
                  <div className="flex items-center gap-4 font-semibold text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors">
                    {faq.icon}
                    <span>{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-white/60 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-7 pb-7 pt-0 text-xs sm:text-sm text-white/70 font-mono leading-relaxed">
                    <p className="pt-4 border-t border-white/5">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
