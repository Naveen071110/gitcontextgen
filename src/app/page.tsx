import HeroSection from '@/components/HeroSection';
import ProblemAgitationSection from '@/components/ProblemAgitationSection';
import NonCoderAnalogySection from '@/components/NonCoderAnalogySection';
import ComparisonTableSection from '@/components/ComparisonTableSection';
import KnowledgeModelSection from '@/components/KnowledgeModelSection';
import WorkflowSimulationSection from '@/components/WorkflowSimulationSection';
import OutputPreviewSection from '@/components/OutputPreviewSection';
import NonCoderOutputVisualizer from '@/components/NonCoderOutputVisualizer';
import FeatureGrid from '@/components/FeatureGrid';
import WhoItsForSection from '@/components/WhoItsForSection';
import ContextDriftSection from '@/components/ContextDriftSection';
import CompatibilityGridSection from '@/components/CompatibilityGridSection';
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

      {/* 5. Knowledge Model Breakdown (Deep Repository Intelligence) */}
      <KnowledgeModelSection />

      {/* 6. Workflow Simulation (Client Component: Preset Simulator) */}
      <WorkflowSimulationSection />

      {/* 7. Output Preview (Interactive sample output viewer for CLAUDE.md, .cursorrules, replit.md) */}
      <OutputPreviewSection />

      {/* 8. Plain-English Output Visualizer (Interactive callout breakdown for non-coders) */}
      <NonCoderOutputVisualizer />

      {/* 9. Core Features / How It Works */}
      <FeatureGrid />

      {/* 8. Who It's For (Persona cards: Agencies, Solo Devs, Non-Coders) */}
      <WhoItsForSection />

      {/* 9. Context Drift & Synchronization */}
      <ContextDriftSection />

      {/* 10. Multi-Agent Compatibility Grid */}
      <CompatibilityGridSection />

      {/* 11. Quick Setup Section */}
      <QuickSetupSection />

      {/* 12. Security, Privacy & Data Governance */}
      <SecurityTrustSection />

      {/* 13. Pricing Section */}
      <PricingSection />

      {/* 14. FAQ Section */}
      <FaqSection />

      {/* 15. Pure Black Centered Footer */}
      <Footer />
    </main>
  );
}
