import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-black py-24 md:py-32 text-white/70 flex justify-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center">
        
        {/* Logo & Brand Name */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-mono">GitContextGen</span>
          </Link>
          <p className="text-xs sm:text-sm text-white/60 max-w-md leading-relaxed">
            Automated CLAUDE.md, .cursorrules, replit.md, and Windsurf AI codebase context generator.
          </p>
        </div>

        {/* Centered Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-white/80 font-mono mb-12">
          <Link href="/" className="hover:text-white transition-colors cursor-pointer">
            Free AI Sandbox
          </Link>
          <Link href="/claude-md-generator" className="hover:text-white transition-colors cursor-pointer">
            CLAUDE.md Generator
          </Link>
          <Link href="/cursor-rules-generator" className="hover:text-white transition-colors cursor-pointer">
            .cursorrules Exporter
          </Link>
          <Link href="/agents-md-generator" className="hover:text-white transition-colors cursor-pointer">
            AGENTS.md Generator
          </Link>
          <Link href="/copilot-instructions-generator" className="hover:text-white transition-colors cursor-pointer">
            Copilot Instructions
          </Link>
          <Link href="/p/repopulse-ai-demo" className="hover:text-white transition-colors cursor-pointer">
            Demo Changelog
          </Link>
        </div>

        {/* Bottom Bar */}
        <div className="w-full pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 font-mono">
          <p>© {new Date().getFullYear()} GitContextGen. All rights reserved.</p>
          <div className="flex items-center justify-center gap-6">
            <Link href="/agents-md-generator" className="hover:text-white transition-colors cursor-pointer">Documentation</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors cursor-pointer">Pricing & Terms</Link>
            <Link href="/p/repopulse-ai-demo" className="hover:text-white transition-colors cursor-pointer">Public Specs</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
