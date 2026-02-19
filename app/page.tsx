import type { Metadata } from 'next';
import { fetchJobs, fetchCompanies, fetchInvestors, buildCompanyDomainMap, buildCompanyLogoMap } from '@/lib/airtable';
import JobBoard from './JobBoard';

export const metadata: Metadata = {
  title: 'CADRE — Jobs at the best venture-backed companies',
  description: 'Find jobs at top VC-backed companies. Filter by function, industry, and location.',
  alternates: { canonical: 'https://cadre.careers' },
};

export const revalidate = 300; // revalidate every 5 minutes

export default async function Home() {
  const [
    { jobs, total: totalJobs },
    { companies, total: totalCompanies },
    { investors, total: totalInvestors },
  ] = await Promise.all([
    fetchJobs(),
    fetchCompanies(),
    fetchInvestors(),
  ]);

  // Build lookup maps for logos
  const companyDomains = buildCompanyDomainMap(companies);
  const companyLogos = buildCompanyLogoMap(companies);

  return (
    <JobBoard
      initialJobs={jobs}
      totalJobs={totalJobs}
      companies={companies}
      totalCompanies={totalCompanies}
      investors={investors}
      totalInvestors={totalInvestors}
      companyDomains={companyDomains}
      companyLogos={companyLogos}
    />
  );
}
