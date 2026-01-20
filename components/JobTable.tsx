'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Job } from '@/lib/airtable';

interface JobTableProps {
  jobs: Job[];
}

function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return diffDays + 'd ago';

  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function JobTable({ jobs }: JobTableProps) {
  const router = useRouter();

  const handleCompanyClick = (company: string) => {
    router.push('/?company=' + encodeURIComponent(company));
  };

  const handleInvestorClick = (investor: string) => {
    router.push('/?investor=' + encodeURIComponent(investor));
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No jobs found matching your filters.</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Title</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Function</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Industry</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Investors</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4 text-sm text-gray-500">
                {formatDate(job.datePosted)}
              </td>
              <td className="py-4 px-4">
                <Link
                  href={job.applyUrl || job.jobUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-900 hover:underline"
                >
                  {job.title}
                </Link>
              </td>
              <td className="py-4 px-4 text-sm text-gray-600">
                {job.functionName || '-'}
              </td>
              <td className="py-4 px-4">
                <button
                  onClick={() => handleCompanyClick(job.company)}
                  className="text-gray-700 hover:underline text-left"
                >
                  {job.company}
                </button>
              </td>
              <td className="py-4 px-4 text-sm text-gray-600">
                {job.industry || '-'}
              </td>
              <td className="py-4 px-4">
                {job.investors.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {job.investors.slice(0, 2).map((inv, i) => (
                      <button
                        key={i}
                        onClick={() => handleInvestorClick(inv)}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        {inv}{i < Math.min(job.investors.length - 1, 1) ? ',' : ''}
                      </button>
                    ))}
                    {job.investors.length > 2 && (
                      <span className="text-sm text-gray-400">+{job.investors.length - 2}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>
              <td className="py-4 px-4 text-sm text-gray-600">
                {job.location ? (
                  job.remoteFirst ? `${job.location} (Remote)` : job.location
                ) : (
                  job.remoteFirst ? 'Remote' : '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
