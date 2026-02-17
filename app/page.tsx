import type { Metadata } from 'next';
import { fetchJobs } from '@/lib/airtable';
import JobBoard from './JobBoard';

export const metadata: Metadata = {
  title: 'CADRE — Jobs at the best venture-backed companies',
  description: 'Find jobs at top VC-backed companies. Filter by investor, department, and location.',
  alternates: { canonical: 'https://cadre-ui-psi.vercel.app' },
};

export const revalidate = 300; // revalidate every 5 minutes

export default async function Home() {
  const { jobs, total } = await fetchJobs();
  return <JobBoard initialJobs={jobs} totalJobs={total} />;
}
