import type { Metadata } from 'next';
import DocsClient from './DocsClient';

export const metadata: Metadata = {
  title: 'CADRE API — Hiring Intelligence for VC-Backed Companies',
  description:
    'CADRE is an API that connects investors, companies, and real-time hiring signals across the VC-backed ecosystem. Query jobs, funding rounds, investor portfolios, and hiring velocity in a single call.',
  keywords: [
    'hiring intelligence API',
    'VC company data',
    'investor portfolio API',
    'hiring signals',
    'job postings API',
    'startup hiring data',
    'venture capital data API',
    'AI recruiting data',
  ],
  openGraph: {
    title: 'CADRE API — Hiring Intelligence for VC-Backed Companies',
    description:
      'One API connecting investors, companies, and real-time hiring signals. Jobs linked to funding linked to investors — with hiring velocity built in.',
    type: 'website',
    url: 'https://cadre.careers/docs',
  },
  twitter: {
    card: 'summary',
    title: 'CADRE API — Hiring Intelligence for VC-Backed Companies',
    description:
      'Structured access to jobs, companies, investors, and hiring signals across VC-backed companies.',
  },
  alternates: {
    canonical: 'https://cadre.careers/docs',
  },
};

const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CADRE API',
  applicationCategory: 'BusinessApplication',
  description:
    'CADRE is a hiring intelligence API that provides structured access to job postings, company profiles, investor portfolios, funding rounds, and hiring signals across VC-backed companies. It connects investors to companies to real-time hiring data in a single knowledge graph.',
  url: 'https://cadre.careers/docs',
  operatingSystem: 'Web API',
  offers: {
    '@type': 'Offer',
    description: 'API access with tiered pricing based on usage',
  },
  creator: {
    '@type': 'Organization',
    name: 'Cadre Talent Intelligence',
    url: 'https://cadre.careers',
  },
  featureList: [
    'Real-time job postings from Greenhouse, Lever, and Ashby ATS integrations',
    'Company profiles with funding history and investor relationships',
    'Investor portfolio browsing with aggregate hiring activity',
    'Hiring velocity signals and surge detection',
    'Funding round data with hiring context attached',
    'Graph-connected data: investors to companies to jobs in one call',
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the CADRE API?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "CADRE is a hiring intelligence API that connects investors, companies, and real-time hiring signals across the VC-backed ecosystem. It lets you query which companies a specific investor backs, what roles those companies have open, how fast they're hiring, and what funding they've raised — all in a single API call.",
      },
    },
    {
      '@type': 'Question',
      name: 'What data does CADRE provide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CADRE provides five types of connected data: company profiles (industry, stage, headcount, ATS, funding history), job postings (title, department, location, seniority, posting date), investor data (portfolio companies, lead/follow designation), funding rounds (type, amount, date, investors), and hiring signals (surges, new departments, velocity changes).',
      },
    },
    {
      '@type': 'Question',
      name: 'Who uses the CADRE API?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CADRE is used by AI recruiting agents, AI SDR and sales tools, research and due diligence platforms, and data enrichment services. Any product that needs structured company intelligence with investor and hiring context — not just static firmographics — is a fit.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is CADRE different from Crunchbase or LinkedIn?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "CADRE connects the data that other platforms keep separate. Crunchbase has funding data but no live job postings. LinkedIn has jobs but no investor relationships. Job boards have listings but no funding context. CADRE joins investor portfolios to company profiles to real-time hiring activity in one structured API — so you can query 'Sequoia-backed Series B companies hiring ML engineers right now' in a single call.",
      },
    },
    {
      '@type': 'Question',
      name: 'What ATS integrations does CADRE support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CADRE pulls job postings directly from Greenhouse, Lever, and Ashby APIs, plus career page scraping for companies not on a standard ATS. Data is refreshed continuously.',
      },
    },
  ],
};

export default function DocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <DocsClient />
    </>
  );
}
