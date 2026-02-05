'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-[#0e0e0f]">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white tracking-tight">
              HighSignal.Jobs
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm text-[#888] hover:text-[#e8e8e8] hover:bg-[#1a1a1b] rounded transition-colors"
            >
              Jobs
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
