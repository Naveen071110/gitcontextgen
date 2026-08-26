import Link from 'next/link';
import { Zap, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/[0.06] py-16 md:py-20 text-white/70 flex justify-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center">
        
        {/* Logo & Brand Info */}
        <div className="flex flex-col items-center gap-3.5 mb-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-mono">GitContextGen</span>
          </Link>
          <p className="text-xs sm:text-sm text-white/50 max-w-md leading-relaxed font-sans">
            Automated CLAUDE.md, .cursorrules, AGENTS.md, and MCP codebase context generator.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs sm:text-sm text-white/70 font-mono mb-10">
          <Link href="/" className="hover:text-white transition-colors cursor-pointer">
            Free AI Sandbox
          </Link>
          <Link href="/agent-readme-generator" className="hover:text-white transition-colors cursor-pointer text-cyan-400 font-bold">
            AGENT_README.md
          </Link>
          <Link href="/claude-md-generator" className="hover:text-white transition-colors cursor-pointer">
            CLAUDE.md Generator
          </Link>
          <Link href="/cursor-rules-generator" className="hover:text-white transition-colors cursor-pointer">
            .cursorrules Exporter
          </Link>
          <Link href="/agents-md-generator" className="hover:text-white transition-colors cursor-pointer">
            AGENTS.md Standard
          </Link>
          <Link href="/copilot-instructions-generator" className="hover:text-white transition-colors cursor-pointer">
            Copilot Instructions
          </Link>
        </div>

        {/* Minimalist Bottom Bar with Attribution Badge */}
        <div className="w-full pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-white/40 font-mono">
          
          {/* Copyright */}
          <p className="order-2 md:order-1">
            © {new Date().getFullYear()} GitContextGen. All rights reserved.
          </p>

          {/* Clean Interactive Attribution Badge */}
          <div className="order-1 md:order-2 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs text-white/60 transition-all duration-300 shadow-sm hover:border-white/[0.15]">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block animate-pulse shrink-0" />
            <span>by</span>
            <a
              href="https://naveenguru.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white/90 hover:text-cyan-400 transition-colors inline-flex items-center gap-1 group/author underline decoration-white/20 hover:decoration-cyan-400 underline-offset-4"
            >
              <span>Naveen</span>
              <ExternalLink className="w-3 h-3 text-white/40 group-hover/author:text-cyan-400 group-hover/author:translate-x-0.5 group-hover/author:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Quick Doc & Legal Links */}
          <div className="order-3 flex items-center justify-center gap-5">
            <Link href="/agents-md-generator" className="hover:text-white transition-colors cursor-pointer">
              Documentation
            </Link>
            <Link href="/#pricing" className="hover:text-white transition-colors cursor-pointer">
              Pricing & Terms
            </Link>
            <Link href="/claude-md-generator" className="hover:text-white transition-colors cursor-pointer">
              Public Specs
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
