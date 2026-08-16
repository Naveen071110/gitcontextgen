import HeroSection from '@/components/HeroSection';
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
    <main className="flex flex-col items-center w-full min-h-screen overflow-x-hidden bg-black text-white font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Hero Section (Client Component: PLG Sandbox & Video Background) */}
      <HeroSection />

      {/* 2. Problem / Agitation Section (Server Component: 2-Column Comparison) */}
      <ProblemAgitationSection />

      {/* 3. Non-Coder Analogy Section ("Floor Plan for AI Assistant") */}
      <NonCoderAnalogySection />

      {/* 4. How It Compares (Feature comparison vs manual, ChatGPT, generic tools) */}
      <ComparisonTableSection />

      {/* 5. MCP Paradigm Shift Section (Dynamic Pull vs Static Context Bloat) */}
      <McpParadigmSection />

      {/* 6. Knowledge Model Breakdown (Deep Repository Intelligence) */}
      <KnowledgeModelSection />

      {/* 7. Workflow Simulation (Client Component: Preset Simulator) */}
      <WorkflowSimulationSection />

      {/* 8. Output Preview (Interactive sample output viewer for CLAUDE.md, .cursorrules, replit.md) */}
      <OutputPreviewSection />

      {/* 9. Plain-English Output Visualizer (Interactive callout breakdown for non-coders) */}
      <NonCoderOutputVisualizer />

      {/* 10. Core Features / How It Works */}
      <FeatureGrid />

      {/* 11. Who It's For (Persona cards: Agencies, Solo Devs, Non-Coders) */}
      <WhoItsForSection />

      {/* 12. Context Drift & Synchronization */}
      <ContextDriftSection />

      {/* 13. Multi-Agent Compatibility Grid */}
      <CompatibilityGridSection />

      {/* 14. Universal MCP Ecosystem Bridge (Cross-IDE & Agent Integration) */}
      <McpEcosystemBridgeSection />

      {/* 15. Quick Setup Section */}
      <QuickSetupSection />

      {/* 16. Security, Privacy & Data Governance */}
      <SecurityTrustSection />

      {/* 17. Pricing Section */}
      <PricingSection />

      {/* 18. FAQ Section */}
      <FaqSection />

      {/* 19. Pure Black Centered Footer */}
      <Footer />
    </main>
  );
}
