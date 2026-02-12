import type { Metadata } from 'next';
import { getStats } from '@/lib/data';
import FeedPageContent from '@/components/FeedPageContent';

export const metadata: Metadata = {
  title: 'Intelligence | Cadre',
  description: 'Your personalized hiring intelligence feed. Stay updated on the companies you follow.',
  robots: { index: false },
};

export const revalidate = 3600;

export default async function IntelligencePage() {
  const stats = await getStats();

  return (
    <FeedPageContent
      stats={{
        companyCount: stats.companyCount,
        investorCount: stats.investorCount,
        jobCount: stats.jobCount,
      }}
    />
  );
}
