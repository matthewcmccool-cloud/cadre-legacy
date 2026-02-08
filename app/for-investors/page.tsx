import Link from 'next/link';
import Header from '@/components/Header';

export const metadata = {
  title: 'Cadre — For Investors',
  description: 'Portfolio hiring visibility for venture capital firms.',
};

const FEATURES = [
  {
    title: 'Portfolio Hiring Dashboard',
    description:
      'See every open role across your portfolio companies in one view. Filter by function, location, and seniority.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Talent Pipeline Visibility',
    description:
      'Track which roles are filling, which are stale, and where your portfolio needs recruiting support.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Featured Placement',
    description:
      'Boost your portfolio companies to the top of search results. Drive more qualified applicants to key roles.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    title: 'Portfolio Branding',
    description:
      'Dedicated investor page showcasing your portfolio companies, open roles, and firm profile — all in one place.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

const STATS = [
  { value: '16,000+', label: 'Open roles' },
  { value: '1,300+', label: 'Companies' },
  { value: '200+', label: 'Investors tracked' },
];

export default function ForInvestorsPage() {
  return (
    <main className="min-h-screen bg-[#0e0e0f]">
      <Header />

      <div className="max-w-6xl mx-auto px-4 pt-12 pb-16">
        {/* Hero */}
        <div className="max-w-2xl mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
            Your portfolio&apos;s hiring,<br />in one place.
          </h1>
          <p className="text-lg text-[#999] mb-8">
            Cadre gives venture firms real-time visibility into open roles across
            their portfolio — and tools to help their companies hire faster.
          </p>
          <div className="flex gap-3">
            <a
              href="mailto:matt@cadre.work?subject=Cadre for Investors"
              className="px-5 py-2.5 bg-[#5e6ad2] hover:bg-[#4f5bc3] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get early access
            </a>
            <Link
              href="/"
              className="px-5 py-2.5 bg-[#1a1a1b] hover:bg-[#252526] text-[#e8e8e8] text-sm font-medium rounded-lg transition-colors"
            >
              Browse jobs
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mb-16 pb-16 border-b border-[#1a1a1b]">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-[#666]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-lg font-semibold text-white mb-8">
            Built for portfolio operations teams
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-xl bg-[#131314] border border-[#1a1a1b]"
              >
                <div className="text-[#5e6ad2] mb-3">{feature.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#888] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-[#131314] border border-[#1a1a1b] p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Interested?
          </h2>
          <p className="text-sm text-[#888] mb-6 max-w-md mx-auto">
            We&apos;re onboarding a small group of VC firms for early access.
            Get portfolio-level hiring analytics before anyone else.
          </p>
          <a
            href="mailto:matt@cadre.work?subject=Cadre for Investors — Early Access"
            className="inline-block px-6 py-2.5 bg-[#5e6ad2] hover:bg-[#4f5bc3] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Request early access
          </a>
        </div>
      </div>
    </main>
  );
}
