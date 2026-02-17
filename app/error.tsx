'use client';

import Link from 'next/link';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-cadre-bg flex items-center justify-center font-body">
      <div className="text-center px-4">
        <h1 className="text-lg font-medium text-cadre-text mb-2 font-heading">Something went wrong</h1>
        <p className="text-sm text-cadre-secondary mb-6">
          We couldn&apos;t load this page. This is usually temporary.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 text-cadre-text text-sm font-medium border border-cadre-border hover:bg-cadre-hover transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-cadre-secondary hover:text-cadre-text transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
