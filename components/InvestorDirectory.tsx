'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { InvestorDirectoryItem } from '@/lib/airtable';

interface InvestorDirectoryProps {
  investors: InvestorDirectoryItem[];
}

export default function InvestorDirectory({ investors }: InvestorDirectoryProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return investors;
    const q = search.toLowerCase();
    return investors.filter(inv => inv.name.toLowerCase().includes(q));
  }, [investors, search]);

  return (
    <>
      {/* Header */}
      <div className="mt-8 mb-6">
        <Link href="/" className="text-[#888] hover:text-white text-sm inline-flex items-center gap-1 transition-colors mb-4">
          ← Back to jobs
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-3">Investors</h1>
        <p className="text-sm text-[#888] mt-1">
          {investors.length} VC firms tracked on Cadre. Click any to see their portfolio companies and open roles.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search investors..."
          className="w-full pl-10 pr-10 py-2.5 bg-[#1a1a1b] text-[#e8e8e8] placeholder-[#999] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/50 transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#e8e8e8] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-[#555] mb-4">
        {filtered.length === investors.length
          ? `${investors.length} investors`
          : `${filtered.length} of ${investors.length} investors`}
      </p>

      {/* Investor grid */}
      <div className="flex flex-wrap gap-2">
        {filtered.map((investor) => (
          <Link
            key={investor.slug}
            href={`/investors/${investor.slug}`}
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#1a1a1b] hover:bg-[#252526] rounded-lg text-sm text-[#e8e8e8] transition-colors group"
          >
            <span className="whitespace-nowrap">{investor.name}</span>
            {investor.companyCount > 0 && (
              <span className="text-[10px] text-[#555] font-medium">
                {investor.companyCount} {investor.companyCount === 1 ? 'co' : 'cos'}
              </span>
            )}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#888]">No investors found matching your search.</p>
          <p className="text-[#999] text-sm mt-1">Try a different search term.</p>
        </div>
      )}
    </>
  );
}
