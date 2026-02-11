'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFollows } from '@/hooks/useFollows';

interface FollowPortfolioButtonProps {
  investorSlug: string;
  investorName: string;
  companyCount: number;
  /** IDs of companies in this investor's portfolio */
  portfolioCompanyIds: string[];
}

export default function FollowPortfolioButton({
  investorSlug,
  investorName,
  companyCount,
  portfolioCompanyIds,
}: FollowPortfolioButtonProps) {
  const { isSignedIn, openSignIn } = useAuth();
  const { isFollowing, followPortfolio } = useFollows();
  const [hovering, setHovering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Consider portfolio "followed" if all portfolio companies are followed
  const followedCount = portfolioCompanyIds.filter((id) => isFollowing(id)).length;
  const allFollowed = companyCount > 0 && followedCount === companyCount;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleClick = async () => {
    if (!isSignedIn) {
      openSignIn({ companyName: investorName });
      return;
    }

    if (loading) return;

    if (allFollowed) {
      // For now, we don't have bulk unfollow — just show a message
      showToast(`Your individually followed companies are unchanged.`);
      return;
    }

    setLoading(true);
    try {
      const result = await followPortfolio(investorSlug);
      showToast(`Following ${result.newFollows} companies in ${result.investorName}'s portfolio.`);
    } catch {
      showToast('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (allFollowed) {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            hovering
              ? 'bg-zinc-600 text-white'
              : 'bg-purple-600 text-white'
          }`}
        >
          {hovering ? 'Unfollow Portfolio' : `★ Following Portfolio ✓`}
        </button>
        {toast && (
          <div className="absolute top-full mt-2 right-0 bg-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg border border-zinc-700 z-50">
            {toast}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors disabled:opacity-50"
      >
        {loading ? 'Following...' : `☆ Follow Portfolio (${companyCount})`}
      </button>
      {toast && (
        <div className="absolute top-full mt-2 right-0 bg-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg border border-zinc-700 z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
