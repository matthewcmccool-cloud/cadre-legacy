import { getAllCompaniesForDirectory } from '@/lib/airtable';
import CompanyDirectory from '@/components/CompanyDirectory';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Companies | Cadre — VC-Backed Startup Directory',
  description: 'Browse 1,300+ VC-backed companies hiring now. Search by name, stage, or investor. Every company tracked on Cadre with direct links to open roles.',
};

export default async function CompaniesPage() {
  const companies = await getAllCompaniesForDirectory();

  return (
    <main className="min-h-screen bg-[#0e0e0f]">
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <CompanyDirectory companies={companies} />
      </div>
    </main>
  );
}
