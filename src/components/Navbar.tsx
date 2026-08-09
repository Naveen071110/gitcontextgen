'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, Sparkles, LayoutDashboard, Compass, HelpCircle, ArrowRight, DollarSign, LogOut } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check active user session and subscribe to auth state changes
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    }).catch(() => {});

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setMobileMenuOpen(false);
    } catch {}
  };

  const navLinks = [
    { id: 'sandbox', label: 'Live Sandbox', href: '/', icon: Sparkles, color: 'text-cyan-400' },
    { id: 'guide', label: 'Floor Plan Guide', href: '/#non-coder-guide', icon: Compass, color: 'text-indigo-400' },
    { id: 'pricing', label: 'Pricing', href: '/#pricing', icon: DollarSign, color: 'text-emerald-400' },
    { id: 'faq', label: 'FAQ', href: '/#faq', icon: HelpCircle, color: 'text-amber-400' },
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-cyan-300' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 flex justify-center pointer-events-none">
      {/* 2026 Layout-Morphing Capsule Pill Container */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 280, damping: 28, mass: 0.8 }}
        className={`pointer-events-auto flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? 'mt-3 sm:mt-4 w-[calc(100%-2rem)] max-w-5xl h-16 rounded-full bg-black/85 backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(6,182,212,0.15)] px-6 sm:px-8'
            : 'w-full h-20 bg-black/90 border-b border-white/10 backdrop-blur-xl rounded-none px-4 sm:px-8 md:px-12 max-w-7xl mx-auto'
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0 cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-white via-slate-100 to-slate-300 flex items-center justify-center shadow-lg shrink-0 cursor-pointer"
          >
            <Zap className="w-5 h-5 text-black fill-black" />
          </motion.div>
          <span className="font-bold text-base sm:text-lg text-white tracking-tight font-mono group-hover:text-cyan-300 transition-colors">
            GitContextGen
          </span>
        </Link>

        {/* Center Desktop Links with Animated Sliding Pill Highlight */}
        <nav
          aria-label="Primary Navigation"
          onMouseLeave={() => setHoveredLink(null)}
          className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06] relative"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isHovered = hoveredLink === link.id;

            return (
              <Link
                key={link.id}
                href={link.href}
                onMouseEnter={() => setHoveredLink(link.id)}
                className="relative px-4 py-1.5 rounded-full text-xs font-mono text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2 z-10 cursor-pointer"
              >
                {isHovered && (
                  <motion.span
                    layoutId="hoverPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-white/10 border border-white/10 -z-10 shadow-sm"
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${link.color}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA & Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs font-mono hover:opacity-90 transition-all duration-200 shadow-lg cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> My Workspace <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 rounded-full bg-white/10 hover:bg-rose-950/60 hover:text-rose-300 text-white/70 border border-white/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-bold text-xs font-mono hover:bg-slate-200 transition-all duration-200 shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
              >
                Sign In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </motion.div>

          {/* Mobile Hamburger Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 shrink-0 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-white" />}
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto md:hidden absolute top-full left-4 right-4 mt-3 rounded-2xl bg-black/95 backdrop-blur-2xl border border-white/15 p-5 shadow-2xl space-y-4 text-left font-mono"
          >
            <div className="space-y-1 pb-3 border-b border-white/10">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <Icon className={`w-4 h-4 ${link.color}`} />
                    </div>
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-1 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-center font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" /> My Workspace <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-center font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out ({user.email?.slice(0, 15)}...)
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-white text-black text-center font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  Sign In to Workspaces <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
