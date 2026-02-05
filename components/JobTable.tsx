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
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function JobTable({ jobs }: JobTableProps) {
  const router = useRouter();

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#888]">No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {jobs.map((job) => {
        const displayedInvestors = job.investors?.slice(0, 2) || [];
        const remainingInvestors = (job.investors?.length || 0) - 2;

        return (
          <div
            key={job.id}
            onClick={() => router.push(`/jobs/${job.id}`)}
            className="flex items-center gap-4 px-4 py-3 hover:bg-[#1a1a1b] cursor-pointer transition-colors border-b border-[#252526]"
          >
            {/* Left: Job info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-medium text-white truncate">
                  {job.title}
                </span>
                <span className="text-[13px] text-[#666]">
                  {formatDate(job.datePosted)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Link
                  href={`/companies/${toSlug(job.company)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[13px] text-[#888] hover:text-[#5e6ad2] transition-colors"
                >
                  {job.company}
                </Link>
                <span className="text-[#444]">·</span>
                <span className="text-[13px] text-[#666]">
                  {job.location}
                </span>
              </div>
            </div>

            {/* Middle: Industry */}
            <div className="flex-shrink-0 w-40">
              {job.industry && (
                <Link
                  href={`/industry/${toSlug(job.industry)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center px-2.5 py-1 text-[12px] text-[#a3a3a3] bg-[#1e1e20] hover:bg-[#252528] border border-[#333] rounded transition-colors"
                >
                  {job.industry}
                </Link>
              )}
            </div>

            {/* Right: Investors */}
            <div className="flex-shrink-0 flex items-center gap-1.5 justify-end w-64">
              {displayedInvestors.map((investor) => (
                <Link
                  key={investor}
                  href={`/investors/${toSlug(investor)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center px-2.5 py-1 text-[12px] text-[#c4c4c4] bg-[#252526] hover:bg-[#2a2a2b] rounded transition-colors"
                >
                  {investor}
                </Link>
              ))}
              {remainingInvestors > 0 && (
                <span className="inline-flex items-center px-2 py-1 text-[12px] text-[#666] bg-[#1a1a1b] rounded">
                  +{remainingInvestors}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
