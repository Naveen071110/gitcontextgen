import HeroSection from '@/components/HeroSection';
import DemoVideoSection from '@/components/DemoVideoSection';
import LiveDashboardPreview from '@/components/LiveDashboardPreview';
import HowItWorksStepper from '@/components/HowItWorksStepper';
import InteractiveCliTerminal from '@/components/InteractiveCliTerminal';
import ProblemAgitationSection from '@/components/ProblemAgitationSection';
import NonCoderAnalogySection from '@/components/NonCoderAnalogySection';
import ComparisonTableSection from '@/components/ComparisonTableSection';
import McpParadigmSection from '@/components/McpParadigmSection';
import KnowledgeModelSection from '@/components/KnowledgeModelSection';
import WorkflowSimulationSection from '@/components/WorkflowSimulationSection';
import OutputPreviewSection from '@/components/OutputPreviewSection';
import NonCoderOutputVisualizer from '@/components/NonCoderOutputVisualizer';
import FeatureGrid from '@/components/FeatureGrid';
import WhoItsForSection from '@/components/WhoItsForSection';
import ContextDriftSection from '@/components/ContextDriftSection';
import CompatibilityGridSection from '@/components/CompatibilityGridSection';
import McpEcosystemBridgeSection from '@/components/McpEcosystemBridgeSection';
import QuickSetupSection from '@/components/QuickSetupSection';
import SecurityTrustSection from '@/components/SecurityTrustSection';
import PricingSection from '@/components/PricingSection';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen overflow-x-hidden bg-[#030303] text-zinc-100 font-sans selection:bg-amber-400 selection:text-black">
      {/* 1. Hero Section (Compact Above-The-Fold with Address Bar Mock) */}
      <HeroSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 1.5. Demo Video (Full Product Walkthrough) */}
      <DemoVideoSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 2. GitHub-Inspired Interactive Feature Dashboard (3 Tabs: Code Map, L2 Cache, Client Handoff) */}
      <LiveDashboardPreview />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 3. Interactive "How It Works" Stepper (Framer Motion 3-Step Grid) */}
      <HowItWorksStepper />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 4. Interactive Mock CLI Terminal ("How It Works" One-Command Sequence) */}
      <InteractiveCliTerminal />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 5. Problem / Agitation Section (2-Column Before/After Comparison) */}
      <ProblemAgitationSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 6. Non-Coder Analogy Section ("Floor Plan for AI Assistant") */}
      <NonCoderAnalogySection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 7. How It Compares (Feature comparison vs manual, ChatGPT, generic tools) */}
      <ComparisonTableSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 8. MCP Paradigm Shift Section (Dynamic Pull vs Static Context Bloat) */}
      <McpParadigmSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 9. Knowledge Model Breakdown (Deep Repository Intelligence) */}
      <KnowledgeModelSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 10. Workflow Simulation (Preset Simulator) */}
      <WorkflowSimulationSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 11. Output Preview (Interactive sample output viewer for CLAUDE.md, .cursorrules, replit.md) */}
      <OutputPreviewSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 12. Plain-English Output Visualizer (Interactive callout breakdown for non-coders) */}
      <NonCoderOutputVisualizer />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 13. Core Features / How It Works */}
      <FeatureGrid />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 14. Who It's For (Persona cards: Agencies, Solo Devs, Non-Coders) */}
      <WhoItsForSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 15. Context Drift & Synchronization */}
      <ContextDriftSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 16. Multi-Agent Compatibility Grid */}
      <CompatibilityGridSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 17. Universal MCP Ecosystem Bridge (Cross-IDE & Agent Integration) */}
      <McpEcosystemBridgeSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 18. Quick Setup Section */}
      <QuickSetupSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 19. Security, Privacy & Data Governance */}
      <SecurityTrustSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 20. Pricing Section (B2B Tiers + $299 DFY Onboarding) */}
      <PricingSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 21. FAQ Section */}
      <FaqSection />

      <div className="w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-zinc-850/80 to-transparent my-4" />

      {/* 22. Minimalist Obsidian Footer */}
      <Footer />
    </main>
  );
}
