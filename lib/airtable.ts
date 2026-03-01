// ═══════════════════════════════════════════════════════════════════════
// Cadre — Data Layer (Supabase)
// Uses Supabase for ALL reads: jobs, companies, investors.
// No Airtable dependency. No mock data fallback — errors surface clearly.
// ═══════════════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types — keep legacy names for backward compat with consuming components

export interface JobListing {
  id: string;
  title: string;
  company: string;
  companySlug: string;
  companyLogo: string | null;
  companyWebsite: string;
  location: string;
  function: string;
  industry: string;
  postedDate: string;
  jobUrl: string;
  investors: string[];
  isRemote: boolean;
}

export interface CompanyListing {
  id: string;
  name: string;
  slug: string;
  website: string;
  logoUrl: string | null;
  stage: string;
  industry: string;
  investors: string[];
  jobCount: number;
}

export interface InvestorListing {
  id: string;
  name: string;
  slug: string;
  website: string;
  logoUrl: string | null;
  type: string;
  portfolioCount: number;
}

// Aliases for cleaner imports elsewhere
export type Job = JobListing;
export type Company = CompanyListing;
export type Investor = InvestorListing;

export interface JobFilters {
  search?: string;
  functions?: string[];
  industries?: string[];
  locations?: string[];
  remote?: 'remote' | 'onsite';
}

// ── Jobs ─────────────────────────────────────────────────────────────

export async function fetchJobs(): Promise<{ jobs: JobListing[]; total: number }> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id, title, location, function, ats_url, posted_at, first_seen_at, created_at, is_active, is_remote,
      companies (
        name, slug, website, logo_url, stage,
        company_industries ( industries ( name ) ),
        company_investors ( investors ( name ) )
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(2000);

  if (error) {
    console.error('fetchJobs error', error);
    return { jobs: [], total: 0 };
  }

  // Supabase returns max 1000 rows by default. Fetch in pages to get all results.
  let allData = data || [];
  if (allData.length === 1000) {
    // There may be more rows — fetch next page
    const { data: page2 } = await supabase
      .from('jobs')
      .select(`
        id, title, location, function, ats_url, posted_at, first_seen_at, created_at, is_active, is_remote,
        companies (
          name, slug, website, logo_url, stage,
          company_industries ( industries ( name ) ),
          company_investors ( investors ( name ) )
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(1000, 1999);
    if (page2) allData = [...allData, ...page2];
  }

  const jobs: JobListing[] = allData.map((job: any) => {
    const loc = job.location || '';
    return {
      id: job.id,
      title: job.title,
      company: job.companies?.name || '',
      companySlug: job.companies?.slug || '',
      companyLogo: job.companies?.logo_url || null,
      companyWebsite: job.companies?.website || '',
      location: loc,
      function: job.function || '',
      industry: job.companies?.company_industries?.[0]?.industries?.name || '',
      postedDate: job.posted_at || job.first_seen_at || job.created_at || '',
      jobUrl: job.ats_url || '',
      investors: job.companies?.company_investors?.map((ci: any) => ci.investors?.name).filter(Boolean) || [],
      isRemote: job.is_remote === true || loc.toLowerCase().includes('remote'),
    };
  });

  return { jobs, total: jobs.length };
}

export async function fetchFilteredJobs(filters: JobFilters): Promise<{ jobs: JobListing[]; total: number }> {
  const { jobs } = await fetchJobs();
  let result = jobs;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.function.toLowerCase().includes(q) ||
        j.investors.some((inv) => inv.toLowerCase().includes(q))
    );
  }
  if (filters.functions && filters.functions.length > 0) {
    result = result.filter((j) => filters.functions!.includes(j.function));
  }
  if (filters.industries && filters.industries.length > 0) {
    result = result.filter((j) => filters.industries!.includes(j.industry));
  }
  if (filters.locations && filters.locations.length > 0) {
    result = result.filter((j) => {
      const city = j.location.split(',')[0].trim();
      return filters.locations!.includes(city);
    });
  }
  if (filters.remote === 'remote') {
    result = result.filter((j) => j.isRemote);
  } else if (filters.remote === 'onsite') {
    result = result.filter((j) => !j.isRemote);
  }

  return { jobs: result, total: result.length };
}

// ── Companies ────────────────────────────────────────────────────────

export async function fetchCompanies(): Promise<{ companies: CompanyListing[]; total: number }> {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      id, name, slug, website, logo_url, stage, hq_location, about,
      linkedin_url, twitter_url, ats_platform, total_raised, headcount_range,
      company_industries ( industries ( name ) ),
      company_investors ( investors ( name ) ),
      jobs ( id, is_active )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('fetchCompanies error', error);
    return { companies: [], total: 0 };
  }

  const companies: CompanyListing[] = (data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    website: c.website || '',
    logoUrl: c.logo_url || null,
    stage: c.stage || '',
    industry: c.company_industries?.map((ci: any) => ci.industries?.name).filter(Boolean)?.[0] || '',
    investors: c.company_investors?.map((ci: any) => ci.investors?.name).filter(Boolean) || [],
    jobCount: c.jobs?.filter((j: any) => j.is_active).length || 0,
  }));

  return { companies, total: companies.length };
}

// ── Investors ────────────────────────────────────────────────────────

export async function fetchInvestors(): Promise<{ investors: InvestorListing[]; total: number }> {
  const { data, error } = await supabase
    .from('investors')
    .select(`
      id, name, slug, website, logo_url, bio, location, type,
      company_investors ( companies ( name, slug ) )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('fetchInvestors error', error);
    return { investors: [], total: 0 };
  }

  const investors: InvestorListing[] = (data || []).map((inv: any) => ({
    id: inv.id,
    name: inv.name,
    slug: inv.slug,
    website: inv.website || '',
    logoUrl: inv.logo_url || null,
    type: inv.type || 'Venture Capital',
    portfolioCount: inv.company_investors?.length || 0,
  }));

  return { investors, total: investors.length };
}

// ── Detail pages ─────────────────────────────────────────────────────

export async function fetchCompanyBySlug(slug: string): Promise<{ company: CompanyListing | null; jobs: JobListing[] }> {
  const [{ companies }, { jobs }] = await Promise.all([fetchCompanies(), fetchJobs()]);
  const company = companies.find((c) => c.slug === slug) || null;
  if (!company) return { company: null, jobs: [] };
  const companyJobs = jobs.filter((j) => j.companySlug === company.slug || j.company === company.name);
  return { company, jobs: companyJobs };
}

export async function fetchInvestorBySlug(slug: string): Promise<{ investor: InvestorListing | null; portfolioCompanies: CompanyListing[]; jobs: JobListing[] }> {
  const [{ investors }, { companies }, { jobs }] = await Promise.all([fetchInvestors(), fetchCompanies(), fetchJobs()]);
  const investor = investors.find((inv) => inv.slug === slug) || null;
  if (!investor) return { investor: null, portfolioCompanies: [], jobs: [] };
  const portfolioCompanies = companies.filter((c) => c.investors.includes(investor.name));
  const portfolioNames = new Set(portfolioCompanies.map((c) => c.name));
  const portfolioJobs = jobs.filter((j) => portfolioNames.has(j.company));
  return { investor, portfolioCompanies, jobs: portfolioJobs };
}

// ── Filter option fetchers ───────────────────────────────────────────

export async function fetchAllFunctions(): Promise<string[]> {
  const { jobs } = await fetchJobs();
  return [...new Set(jobs.map((j) => j.function).filter(Boolean))].sort();
}

export async function fetchAllLocations(): Promise<string[]> {
  const { jobs } = await fetchJobs();
  const set = new Set(
    jobs.map((j) => j.location.split(',')[0].trim()).filter((l) => l && l.toLowerCase() !== 'remote')
  );
  return [...set].sort();
}

export async function fetchAllIndustries(): Promise<string[]> {
  const { companies } = await fetchCompanies();
  return [...new Set(companies.map((c) => c.industry).filter(Boolean))].sort();
}

// ── Helper maps ──────────────────────────────────────────────────────

export function buildCompanyLogoMap(companies: CompanyListing[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of companies) {
    if (c.logoUrl) {
      map[c.name] = c.logoUrl;
    }
  }
  return map;
}

export function buildCompanyDomainMap(companies: CompanyListing[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of companies) {
    if (c.website) {
      try {
        const domain = new URL(c.website.startsWith('http') ? c.website : `https://${c.website}`).hostname.replace(/^www\./, '');
        map[c.name] = domain;
      } catch {
        // skip invalid URLs
      }
    }
  }
  return map;
}
