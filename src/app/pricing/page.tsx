export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Navbar from '@/components/Navbar';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Pricing & Plans — GitContextGen',
  description:
    'Transparent pricing plans for solo builders, freelancers, and multi-repo agencies. Eliminate token waste with instant local MCP servers and unified AI rule orchestration.',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      <Navbar />
      <div className="pt-20">
        <PricingSection />
      </div>
      <Footer />
    </main>
  );
}
