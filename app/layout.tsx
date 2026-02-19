import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = 'https://cadre.careers';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'CADRE — Jobs at the best venture-backed companies',
    template: '%s | CADRE',
  },
  description: 'Find jobs at top VC-backed companies. Filter by function, industry, and location.',
  openGraph: {
    type: 'website',
    siteName: 'CADRE',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CADRE',
  url: 'https://cadre.careers',
  description: 'Jobs at the best venture-backed companies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          defer
          data-domain="cadre.careers"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="bg-bg-base text-white font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
