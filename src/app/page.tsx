import HeroSection from '@/components/HeroSection';
import InteractiveCliTerminal from '@/components/InteractiveCliTerminal';
import LiveDashboardPreview from '@/components/LiveDashboardPreview';
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
      {/* 1. Hero Section (PLG Sandbox & Viral Redirection Browser Mock) */}
      <HeroSection />

      {/* 2. Interactive Mock CLI Terminal ("How It Works" One-Command Sequence) */}
      <InteractiveCliTerminal />

      {/* 3. GitHub-Familiar Live Interactive Dashboard Preview (5 Tabs, Token Caching SVG Area Chart) */}
      <LiveDashboardPreview />

      {/* 4. Problem / Agitation Section (2-Column Before/After Comparison) */}
      <ProblemAgitationSection />

      {/* 5. Non-Coder Analogy Section ("Floor Plan for AI Assistant") */}
      <NonCoderAnalogySection />

      {/* 6. How It Compares (Feature comparison vs manual, ChatGPT, generic tools) */}
      <ComparisonTableSection />

      {/* 7. MCP Paradigm Shift Section (Dynamic Pull vs Static Context Bloat) */}
      <McpParadigmSection />

      {/* 8. Knowledge Model Breakdown (Deep Repository Intelligence) */}
      <KnowledgeModelSection />

      {/* 9. Workflow Simulation (Preset Simulator) */}
      <WorkflowSimulationSection />

      {/* 10. Output Preview (Interactive sample output viewer for CLAUDE.md, .cursorrules, replit.md) */}
      <OutputPreviewSection />

      {/* 11. Plain-English Output Visualizer (Interactive callout breakdown for non-coders) */}
      <NonCoderOutputVisualizer />

      {/* 12. Core Features / How It Works */}
      <FeatureGrid />

      {/* 13. Who It's For (Persona cards: Agencies, Solo Devs, Non-Coders) */}
      <WhoItsForSection />

      {/* 14. Context Drift & Synchronization */}
      <ContextDriftSection />

      {/* 15. Multi-Agent Compatibility Grid */}
      <CompatibilityGridSection />

      {/* 16. Universal MCP Ecosystem Bridge (Cross-IDE & Agent Integration) */}
      <McpEcosystemBridgeSection />

      {/* 17. Quick Setup Section */}
      <QuickSetupSection />

      {/* 18. Security, Privacy & Data Governance */}
      <SecurityTrustSection />

      {/* 19. Pricing Section (B2B Tiers + $299 DFY Onboarding) */}
      <PricingSection />

      {/* 20. FAQ Section */}
      <FaqSection />

      {/* 21. Minimalist Obsidian Footer */}
      <Footer />
    </main>
  );
}
