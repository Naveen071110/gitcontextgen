'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Users,
  ShieldCheck,
  Zap,
  CreditCard,
  ExternalLink,
  Cpu,
  FolderGit2,
  Key,
  Clock,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Plus,
  RefreshCw,
  Lock,
  ChevronRight
} from 'lucide-react';

interface DeveloperSeat {
  id: string;
  name: string;
  email: string;
  ide: 'Cursor' | 'Claude Code' | 'Windsurf' | 'WordPress Studio';
  role: 'Lead Architect' | 'Senior Engineer' | 'Full-Stack Dev';
  lastActive: string;
  status: 'active' | 'invited';
}

interface LicensedRepo {
  id: string;
  name: string;
  ecosystem: string;
  lastSynced: string;
  ruleStatus: 'Synchronized' | 'Pending Sync';
  mcpHits: number;
}

interface McpKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  scope: string;
}

export default function AgencyDashboardPage() {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  // Customer & Subscription State
  const customerId = 'cus_agency_enterprise_01';
  const tierName = 'Agency Team Plan';
  const billingCycle = 'Annual ($59/month billed annually)';

  // Mocked live data for Agency management
  const [seats, setSeats] = useState<DeveloperSeat[]>([
    {
      id: 'seat-1',
      name: 'Elena Rostova',
      email: 'elena@agencyhub.io',
      ide: 'Cursor',
      role: 'Lead Architect',
      lastActive: '12 mins ago',
      status: 'active',
    },
    {
      id: 'seat-2',
      name: 'Marcus Vance',
      email: 'marcus@agencyhub.io',
      ide: 'Claude Code',
      role: 'Senior Engineer',
      lastActive: '45 mins ago',
      status: 'active',
    },
    {
      id: 'seat-3',
      name: 'Devon Wright',
      email: 'devon@agencyhub.io',
      ide: 'WordPress Studio',
      role: 'Full-Stack Dev',
      lastActive: '2 hours ago',
      status: 'active',
    },
    {
      id: 'seat-4',
      name: 'Sofia Chen',
      email: 'sofia@agencyhub.io',
      ide: 'Windsurf',
      role: 'Full-Stack Dev',
      lastActive: '5 hours ago',
      status: 'active',
    },
    {
      id: 'seat-5',
      name: 'Liam Gallagher',
      email: 'liam@agencyhub.io',
      ide: 'Cursor',
      role: 'Senior Engineer',
      lastActive: '1 day ago',
      status: 'active',
    },
  ]);

  const repos: LicensedRepo[] = [
    {
      id: 'repo-1',
      name: 'client-core-ecommerce-plugin',
      ecosystem: 'WordPress (WPCS)',
      lastSynced: '8 mins ago',
      ruleStatus: 'Synchronized',
      mcpHits: 14230,
    },
    {
      id: 'repo-2',
      name: 'enterprise-saas-frontend',
      ecosystem: 'Next.js 16 + React 19',
      lastSynced: '24 mins ago',
      ruleStatus: 'Synchronized',
      mcpHits: 18940,
    },
    {
      id: 'repo-3',
      name: 'payment-router-microservice',
      ecosystem: 'Rust / Actix',
      lastSynced: '1 hour ago',
      ruleStatus: 'Synchronized',
      mcpHits: 8120,
    },
    {
      id: 'repo-4',
      name: 'telex-block-builder-suite',
      ecosystem: 'WordPress / Gutenberg',
      lastSynced: '3 hours ago',
      ruleStatus: 'Synchronized',
      mcpHits: 7000,
    },
  ];

  const mcpKeys: McpKey[] = [
    {
      id: 'key-1',
      name: 'Production Stdio MCP Token',
      prefix: 'gcg_live_8f3a...90e1',
      created: 'Sep 01, 2026',
      scope: 'mcp:stdio:full',
    },
    {
      id: 'key-2',
      name: 'CI/CD Pull-Request Linter Token',
      prefix: 'gcg_live_4b7c...21d8',
      created: 'Sep 03, 2026',
      scope: 'ci:lint:read',
    },
  ];

  // L2 Cache Metrics
  const totalRequests = 48290;
  const warmRequests = 45489;
  const coldRequests = 2801;
  const hitRate = ((warmRequests / totalRequests) * 100).toFixed(1);
  const tokensSavedMillions = 48.7;
  const dollarsSaved = 974.0;

  const handleOpenCustomerPortal = async () => {
    try {
      setLoadingPortal(true);
      const res = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.href,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(`Customer Portal Error: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Portal redirect error:', err);
      alert('Unable to open Dodo Payments customer portal. Please try again.');
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleCopyKey = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Breadcrumb & Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-white/50">
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Agency Team Workspace</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {tierName} Active
            </span>

            <button
              type="button"
              onClick={handleOpenCustomerPortal}
              disabled={loadingPortal}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.99] border border-white/20 text-xs font-mono font-bold text-white transition-all flex items-center gap-2 cursor-pointer touch-manipulation disabled:opacity-50"
            >
              {loadingPortal ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Connecting Portal...
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                  Manage Billing (Dodo Portal)
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Agency Hero Summary Header */}
        <div className="rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-black border border-white/10 p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Merchant of Record Protected Workspace
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                Agency Control Center
              </h1>
              <p className="text-sm text-white/70 max-w-2xl font-sans">
                Centralized multi-agent context governance, team seat distribution, and L2 cache cost analytics powered by Dodo Payments.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-xs">
                <span className="text-white/50 block text-[10px] uppercase">Plan Type</span>
                <span className="font-bold text-white text-sm">$59/mo (Annual)</span>
                <span className="text-emerald-400 block text-[10px] mt-0.5">Next Renewal: Sep 05, 2027</span>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 font-mono text-xs">
                <span className="text-cyan-300/60 block text-[10px] uppercase">Local File Lock Engine</span>
                <span className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" /> Multi-Agent Active
                </span>
                <span className="text-white/50 block text-[10px] mt-0.5">Zero Write Conflicts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Metric Cards: Seat & License Tracker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Active Seats */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-xs font-mono font-medium">Developer Seats</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{seats.length}</span>
              <span className="text-xs text-white/50 font-mono">/ 10 seats</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(seats.length / 10) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-white/60 font-mono mt-2 block">
              2 seats remaining on plan
            </span>
          </div>

          {/* Licensed Repos */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-xs font-mono font-medium">Licensed Repositories</span>
              <FolderGit2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{repos.length}</span>
              <span className="text-xs text-emerald-400 font-mono">Unlimited</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full w-full" />
            </div>
            <span className="text-[11px] text-white/60 font-mono mt-2 block">
              4 active AST context maps
            </span>
          </div>

          {/* L2 Token Savings */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-xs font-mono font-medium">Tokens Saved (L2 Cache)</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{tokensSavedMillions}M</span>
              <span className="text-xs text-yellow-400 font-mono">tokens</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-yellow-400 h-full rounded-full w-[94%]" />
            </div>
            <span className="text-[11px] text-white/60 font-mono mt-2 block">
              94.2% token burn reduction
            </span>
          </div>

          {/* Cumulative Dollar Savings */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-xs font-mono font-medium">Cost Savings (Est.)</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-cyan-300 font-mono">${dollarsSaved.toFixed(2)}</span>
              <span className="text-xs text-white/50 font-mono">saved</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full w-[88%]" />
            </div>
            <span className="text-[11px] text-emerald-400 font-mono mt-2 block">
              vs un-cached LLM requests
            </span>
          </div>
        </div>

        {/* Step 4 Part 2: L2 Cache Analytics Widget (Layout-Stable Modern Chart) */}
        <div className="rounded-3xl bg-neutral-950 border border-white/10 p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h2 className="text-lg sm:text-xl font-bold font-mono text-white">
                  L2 Persistent Disk Cache Performance
                </h2>
              </div>
              <p className="text-xs text-white/60 font-sans">
                Measures response latency and token reuse across all developer stdio MCP sessions.
              </p>
            </div>

            <div className="flex items-center p-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  timeRange === '7d' ? 'bg-cyan-500 text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  timeRange === '30d' ? 'bg-cyan-500 text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          {/* Cache Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/10 mb-6">
            <div className="space-y-1">
              <span className="text-xs text-white/50 font-mono uppercase">L2 Cache Hit Rate</span>
              <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
                {hitRate}%
              </div>
              <p className="text-[11px] text-white/60 font-mono">
                {warmRequests.toLocaleString()} warm hits / {totalRequests.toLocaleString()} total scans
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-white/50 font-mono uppercase">Latency Advantage</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">1ms</span>
                <span className="text-xs text-white/50 font-mono">warm (vs 12ms cold)</span>
              </div>
              <p className="text-[11px] text-emerald-300 font-mono">
                ⚡ 91.7% latency reduction per tool execution
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-white/50 font-mono uppercase">Dodo Billing Protection</span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                100%
              </div>
              <p className="text-[11px] text-cyan-300 font-mono">
                Zero surprise token overages or API lockouts
              </p>
            </div>
          </div>

          {/* Visual Histogram / Latency Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-white/60">
              <span>Traffic Distribution (Cold Scans vs. Warm Instant Responses)</span>
              <span className="text-cyan-400">Warm Hit Ratio: 94.2%</span>
            </div>

            {/* Layout-stable stacked horizontal progress bar */}
            <div className="w-full h-8 bg-neutral-900 rounded-xl overflow-hidden flex border border-white/10 shadow-inner">
              <div
                style={{ width: `${hitRate}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 flex items-center justify-center text-black font-mono text-xs font-bold transition-all duration-700"
              >
                Warm Cache: {hitRate}%
              </div>
              <div
                style={{ width: `${(100 - Number(hitRate)).toFixed(1)}%` }}
                className="h-full bg-neutral-800 flex items-center justify-center text-white/60 font-mono text-[11px]"
              >
                Cold: 5.8%
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-white/50 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Warm hits served from ~/.gitcontextgen/cache/ (1ms latency)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                Initial cold repository AST walks (12ms latency)
              </span>
            </div>
          </div>
        </div>

        {/* Section: Active Team Seats & Licensed Repos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Active Developer Seats */}
          <div className="rounded-3xl bg-neutral-950 border border-white/10 p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-lg font-bold font-mono text-white">
                    Team Members ({seats.length}/10)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Invite seat modal: Please enter teammate email')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] text-black text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Seat
                </button>
              </div>

              <div className="divide-y divide-white/10">
                {seats.map((seat) => (
                  <div key={seat.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white font-mono truncate">
                          {seat.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-white/70">
                          {seat.ide}
                        </span>
                      </div>
                      <span className="text-xs text-white/50 font-mono block truncate">
                        {seat.email} • {seat.role}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono text-cyan-300 block">
                        {seat.lastActive}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-white/60 flex items-center justify-between">
              <span>Agency Seat Plan: 10 Seats Included</span>
              <button
                type="button"
                onClick={handleOpenCustomerPortal}
                className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Expand Seats <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Licensed Workspaces & Repos */}
          <div className="rounded-3xl bg-neutral-950 border border-white/10 p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <FolderGit2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-lg font-bold font-mono text-white">
                    Active Codebases ({repos.length})
                  </h3>
                </div>
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-[0.99] border border-white/20 text-xs font-mono font-bold text-white transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Connect Repo
                </Link>
              </div>

              <div className="divide-y divide-white/10">
                {repos.map((repo) => (
                  <div key={repo.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white font-mono truncate">
                          {repo.name}
                        </span>
                      </div>
                      <span className="text-xs text-white/50 font-mono block truncate">
                        {repo.ecosystem}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {repo.ruleStatus}
                      </span>
                      <span className="text-[10px] text-white/50 font-mono block mt-0.5">
                        {repo.mcpHits.toLocaleString()} MCP queries
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-white/60 flex items-center justify-between">
              <span>Automated WPCS & Telex Preset Verification</span>
              <span className="text-emerald-400">100% Pass</span>
            </div>
          </div>

        </div>

        {/* Section: API & MCP Security Keys */}
        <div className="rounded-3xl bg-neutral-950 border border-white/10 p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-cyan-400" />
              <h3 className="text-lg font-bold font-mono text-white">
                Team MCP & CI/CD Security Keys
              </h3>
            </div>
            <button
              type="button"
              onClick={() => alert('New key generated: gcg_live_99d1...28ff')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.99] border border-white/20 text-xs font-mono font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation"
            >
              <Plus className="w-3.5 h-3.5" /> Generate Key
            </button>
          </div>

          <div className="space-y-3">
            {mcpKeys.map((key) => (
              <div
                key={key.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono text-sm">{key.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                      {key.scope}
                    </span>
                  </div>
                  <span className="text-xs text-white/50 font-mono mt-1 block">
                    Key: <code className="text-white/80">{key.prefix}</code> • Created {key.created}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyKey(key.id, key.prefix)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-white/80 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer touch-manipulation"
                  >
                    {copiedKeyId === key.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white/60" /> Copy
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Revoke key ${key.name}?`)}
                    className="px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-xs font-mono text-red-400 border border-red-500/30 transition-colors cursor-pointer touch-manipulation"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding Call Reminder ($299 DFY Integration) */}
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/30 via-neutral-900 to-black border-2 border-cyan-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-[11px] font-mono font-bold border border-cyan-500/40">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> 1-on-1 Agency Onboarding Call Included
            </div>
            <h3 className="text-xl font-bold font-mono text-white">
              Need Us to Configure Your Team&apos;s IDEs and CI Pipelines?
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
              Schedule your dedicated 60-minute onboarding call with our principal engineer. We will audit your private repositories, set up automatic PR rule linting, and connect your team&apos;s Cursor and Claude Code configurations.
            </p>
          </div>

          <a
            href="mailto:singhnaveen360@gmail.com?subject=Agency%20Onboarding%20Call%20Request%20-%20GitContextGen"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 active:scale-[0.99] text-black font-mono text-xs sm:text-sm font-extrabold transition-all shrink-0 flex items-center gap-2 shadow-lg cursor-pointer touch-manipulation"
          >
            Book Onboarding Session <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}
