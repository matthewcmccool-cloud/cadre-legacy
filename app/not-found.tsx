import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cadre-bg flex items-center justify-center font-body">
      <div className="text-center px-4">
        <h1 className="text-5xl font-bold text-cadre-text mb-2 font-heading">404</h1>
        <p className="text-cadre-secondary text-sm mb-6">
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-4 py-2 text-sm text-cadre-secondary hover:text-cadre-text transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
