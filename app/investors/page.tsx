import { getAllInvestorsForDirectory } from '@/lib/airtable';
import InvestorDirectory from '@/components/InvestorDirectory';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Investors | Cadre — VC Firms & Their Portfolio Jobs',
  description: 'Browse 200+ VC firms tracked on Cadre. See portfolio companies and open roles for a16z, Sequoia, Benchmark, and more.',
};

export default async function InvestorsPage() {
  const investors = await getAllInvestorsForDirectory();

  return (
    <main className="min-h-screen bg-[#0e0e0f]">
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <InvestorDirectory investors={investors} />
      </div>
    </main>
  );
}
