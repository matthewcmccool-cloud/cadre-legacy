// ═══════════════════════════════════════════════════════════════════════
// Cadre — Airtable Data Fetching (legacy)
// Uses response.text() + JSON.parse() per CLAUDE.md (never .json())
// Falls back to mock data when AIRTABLE_API_KEY is not configured
// ═══════════════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types - keep legacy names for backward compat with consuming components

import { detectRemoteFromLocation } from "./remote-detect";

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

// New aliases
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

// --- Jobs ---

export async function fetchJobs(): Promise<{ jobs: JobListing[]; total: number }> {
  if (!isAirtableConfigured) {
    return { jobs: MOCK_JOBS, total: MOCK_JOBS.length };
  }

  try {
    // Fetch jobs + ALL lookup tables in parallel to resolve linked record IDs
    const [jobRecords, companyRecords, investorRecords, functionRecords, industryRecords] = await Promise.all([
      airtableFetch("Jobs", {
        "sort[0][field]": "Posted Date",
        "sort[0][direction]": "desc",
        pageSize: "100",
        maxRecords: "1000",
      }),
      airtableFetch("Companies", { pageSize: "100" }),
      airtableFetchSafe("tblH6MmoXCn3Ve0K2", { pageSize: "100" }), // Investors table by ID
      airtableFetchSafe("Functions", { pageSize: "100" }),
      airtableFetchSafe("Industries", { pageSize: "100" }),
    ]);

    // Build record ID → name lookup maps (try multiple field names for robustness)
    const companyNameMap = buildNameMap(companyRecords, "Company", "Name");
    const companyWebsiteMap = new Map<string, string>();
    for (const rec of companyRecords) {
      const f = rec.fields as Record<string, unknown>;
      const url = (f["URL"] as string) || (f["Website"] as string) || "";
      if (url) companyWebsiteMap.set(rec.id as string, url);
    }

    const investorNameMap = buildNameMap(investorRecords, "Firm Name", "Name");
    const functionNameMap = buildNameMap(functionRecords, "Name", "Function");
    const industryNameMap = buildNameMap(industryRecords, "Name");
    // Merge industry names into function map as fallback (Function might link to Industries)
    for (const [k, v] of industryNameMap) {
      if (!functionNameMap.has(k)) functionNameMap.set(k, v);
    }

    // Build company ID → industry name map (for resolving job industry through company)
    const companyIndustryMap = new Map<string, string>();
    for (const rec of companyRecords) {
      const f = rec.fields as Record<string, unknown>;
      const indRaw = f["Industry"];
      const indArr = resolveLinkedField(indRaw, industryNameMap);
      if (indArr[0]) companyIndustryMap.set(rec.id as string, indArr[0]);
    }

    const jobs: JobListing[] = jobRecords.map((rec: Record<string, unknown>) => {
      const fields = rec.fields as Record<string, unknown>;

      // Company — linked record, resolve ID to name
      const companyRaw = fields["Companies"] || fields["Company"];
      const companyIds = Array.isArray(companyRaw) ? companyRaw.map(String) : [];
      const companyId = companyIds[0] || "";
      const companyName = companyNameMap.get(companyId)
        || (companyRaw && !Array.isArray(companyRaw) && !isRecordId(companyRaw) ? String(companyRaw) : "")
        || "Unknown";
      const companyWebsite = companyWebsiteMap.get(companyId) || "";

      // Investors — linked records, resolve IDs to names
      const investorsRaw = fields["Investors"] || fields["VCs"] || [];
      const investors = resolveLinkedField(investorsRaw, investorNameMap);

      // Function (formerly "Department") — may be linked record, resolve if needed
      const funcRaw = fields["Function"] || fields["Department"] || fields["Functions"];
      const funcArr = resolveLinkedField(funcRaw, functionNameMap);
      const funcName = funcArr[0] || "";

      // Date — prefer "Posted Date", fall back to "Last Seen At" or "Created Time"
      const postedDate = (fields["Posted Date"] as string)
        || (fields["Last Seen At"] as string)
        || (fields["Created Time"] as string)
        || "";

      const location = (fields["Location"] as string) || "";

      // Industry — resolve through company's linked industry
      const jobIndustry = companyIndustryMap.get(companyId) || "";

      return {
        id: rec.id as string,
        title: (fields["Title"] as string) || "",
        company: companyName,
        companySlug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        companyLogo: null,
        companyWebsite,
        location,
        function: funcName,
        industry: jobIndustry,
        postedDate,
        jobUrl: (fields["Job URL"] as string) || "",
        investors,
        isRemote: detectRemoteFromLocation(location),
      };
    });

    return { jobs, total: jobs.length };
  } catch (err) {
    console.error("Failed to fetch from Airtable:", err);
    return { jobs: MOCK_JOBS, total: MOCK_JOBS.length };
  }

export interface JobFilters {
  search?: string;
  functions?: string[];
  industries?: string[];
  locations?: string[];
  remote?: "remote" | "onsite";
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

// --- Companies ---

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

// --- Investors ---

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

// --- Detail pages ---

export async function fetchCompanyBySlug(slug: string): Promise<{ company: CompanyListing | null; jobs: JobListing[] }> {
  const [{ companies }, { jobs }] = await Promise.all([fetchCompanies(), fetchJobs()]);
  const company = companies.find((c) => c.slug === slug) || null;
  if (!company) return { company: null, jobs: [] };
  const companyJobs = jobs.filter((j) => j.companySlug === company.slug || j.company === company.name);
  return { company, jobs: companyJobs };
}

// Fetch unique function names (resolved from linked records)
export async function fetchAllFunctions(): Promise<string[]> {
  if (!isAirtableConfigured) {
    return [...new Set(MOCK_JOBS.map((j) => j.function).filter(Boolean))].sort();
  }
  try {
    const [functionRecords, industryRecords] = await Promise.all([
      airtableFetchSafe("Functions", { pageSize: "100" }),
      airtableFetchSafe("Industries", { pageSize: "100" }),
    ]);
    // Collect all names from Functions table
    const names = new Set<string>();
    for (const rec of functionRecords) {
      const f = rec.fields as Record<string, unknown>;
      const name = (f["Name"] as string) || (f["Function"] as string) || "";
      if (name) names.add(name);
    }
    // If Functions table was empty, try Industries
    if (names.size === 0) {
      for (const rec of industryRecords) {
        const f = rec.fields as Record<string, unknown>;
        const name = (f["Name"] as string) || "";
        if (name) names.add(name);
      }
    }
    return [...names].sort();
  } catch {
    return [];
  }
}

export async function fetchAllLocations(): Promise<string[]> {
  const { jobs } = await fetchJobs();
  const set = new Set(
    jobs.map((j) => j.location.split(',')[0].trim()).filter((l) => l && l.toLowerCase() !== 'remote')
  );
  return [...set].sort();
}

// Fetch unique industry names from Companies (through industry linked field)
export async function fetchAllIndustries(): Promise<string[]> {
  if (!isAirtableConfigured) {
    return [...new Set(MOCK_COMPANIES.map((c) => c.industry).filter(Boolean))].sort();
  }
  try {
    const [industryRecords] = await Promise.all([
      airtableFetchSafe("Industries", { pageSize: "100" }),
    ]);
    const names = new Set<string>();
    for (const rec of industryRecords) {
      const f = rec.fields as Record<string, unknown>;
      const name = (f["Name"] as string) || "";
      if (name) names.add(name);
    }
    // Fallback: extract from companies if Industries table is empty
    if (names.size === 0) {
      const companyRecords = await airtableFetch("Companies", { pageSize: "100" });
      for (const rec of companyRecords) {
        const f = rec.fields as Record<string, unknown>;
        const ind = (f["Industry"] as string) || "";
        if (ind && !isRecordId(ind)) names.add(ind);
      }
    }
    return [...names].sort();
  } catch {
    return [];
  }
}

// Fetch a single company by slug
export async function fetchCompanyBySlug(slug: string): Promise<{ company: CompanyListing | null; jobs: JobListing[] }> {
  const [{ companies }, { jobs }] = await Promise.all([
    fetchCompanies(),
    fetchJobs(),
  ]);
  const company = companies.find((c) => c.slug === slug) || null;
  if (!company) return { company: null, jobs: [] };
  const companyJobs = jobs.filter((j) => j.companySlug === company.slug || j.company === company.name);
  return { company, jobs: companyJobs };
}

// Fetch a single investor by slug with their portfolio companies and aggregate jobs
export async function fetchInvestorBySlug(slug: string): Promise<{ investor: InvestorListing | null; portfolioCompanies: CompanyListing[]; jobs: JobListing[] }> {
  const [{ investors }, { companies }, { jobs }] = await Promise.all([
    fetchInvestors(),
    fetchCompanies(),
    fetchJobs(),
  ]);
  const investor = investors.find((inv) => inv.slug === slug) || null;
  if (!investor) return { investor: null, portfolioCompanies: [], jobs: [] };
  // Find companies backed by this investor
  const portfolioCompanies = companies.filter((c) => c.investors.includes(investor.name));
  const portfolioNames = new Set(portfolioCompanies.map((c) => c.name));
  const portfolioJobs = jobs.filter((j) => portfolioNames.has(j.company));
  return { investor, portfolioCompanies, jobs: portfolioJobs };
}

// Helper to build a company name → logo URL map from company data
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

// ═══════════════════════════════════════════════════════════════════════
// Mock data for when Airtable is not configured
// ═══════════════════════════════════════════════════════════════════════

const MOCK_JOBS: JobListing[] = [
  { id: "1", title: "Senior Backend Engineer", company: "Ramp", companySlug: "ramp", companyLogo: null, companyWebsite: "https://ramp.com", location: "New York, NY", function: "Engineering", industry: "Fintech", postedDate: "2026-02-16", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "2", title: "Staff Platform Engineer", company: "Ramp", companySlug: "ramp", companyLogo: null, companyWebsite: "https://ramp.com", location: "New York, NY", function: "Engineering", industry: "Fintech", postedDate: "2026-02-15", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "3", title: "ML Engineer, Risk", company: "Vercel", companySlug: "vercel", companyLogo: null, companyWebsite: "https://vercel.com", location: "San Francisco, CA", function: "Engineering", industry: "Developer Tools", postedDate: "2026-02-15", jobUrl: "#", investors: ["Accel", "GV", "Bedrock", "CRV"], isRemote: false },
  { id: "4", title: "Enterprise Account Executive", company: "Ironclad", companySlug: "ironclad", companyLogo: null, companyWebsite: "https://ironcladapp.com", location: "San Francisco, CA", function: "Sales", industry: "Legal Tech", postedDate: "2026-02-14", jobUrl: "#", investors: ["a16z", "Accel", "Y Combinator", "Sequoia", "Bond"], isRemote: false },
  { id: "5", title: "Senior Product Designer", company: "Watershed", companySlug: "watershed", companyLogo: null, companyWebsite: "https://watershed.com", location: "Remote", function: "Design", industry: "Climate Tech", postedDate: "2026-02-14", jobUrl: "#", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], isRemote: true },
  { id: "6", title: "Senior Full-Stack Engineer", company: "Anyscale", companySlug: "anyscale", companyLogo: null, companyWebsite: "https://anyscale.com", location: "San Francisco, CA", function: "Engineering", industry: "AI/ML", postedDate: "2026-02-13", jobUrl: "#", investors: ["a16z", "NEA", "Addition"], isRemote: false },
  { id: "7", title: "Head of People Operations", company: "Ramp", companySlug: "ramp", companyLogo: null, companyWebsite: "https://ramp.com", location: "New York, NY", function: "Operations", industry: "Fintech", postedDate: "2026-02-13", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "8", title: "Sr Product Marketing Manager", company: "Mutiny", companySlug: "mutiny", companyLogo: null, companyWebsite: "https://mutinyhq.com", location: "San Francisco, CA", function: "Marketing", industry: "MarTech", postedDate: "2026-02-12", jobUrl: "#", investors: ["Sequoia", "Tiger Global"], isRemote: false },
  { id: "9", title: "Backend Engineer, Data Pipeline", company: "Watershed", companySlug: "watershed", companyLogo: null, companyWebsite: "https://watershed.com", location: "San Francisco, CA", function: "Engineering", industry: "Climate Tech", postedDate: "2026-02-12", jobUrl: "#", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], isRemote: false },
  { id: "10", title: "VP of Engineering", company: "Ramp", companySlug: "ramp", companyLogo: null, companyWebsite: "https://ramp.com", location: "New York, NY", function: "Engineering", industry: "Fintech", postedDate: "2026-02-11", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
];

const MOCK_COMPANIES: CompanyListing[] = [
  { id: "c1", name: "Ramp", slug: "ramp", website: "https://ramp.com", logoUrl: null, stage: "Series D", industry: "Fintech", investors: ["a16z", "Founders Fund", "Thrive Capital"], jobCount: 6 },
  { id: "c2", name: "Vercel", slug: "vercel", website: "https://vercel.com", logoUrl: null, stage: "Series D", industry: "Developer Tools", investors: ["Accel", "GV", "Bedrock", "CRV"], jobCount: 5 },
  { id: "c3", name: "Watershed", slug: "watershed", website: "https://watershed.com", logoUrl: null, stage: "Series C", industry: "Climate Tech", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], jobCount: 4 },
  { id: "c4", name: "Ironclad", slug: "ironclad", website: "https://ironcladapp.com", logoUrl: null, stage: "Series E", industry: "Legal Tech", investors: ["a16z", "Accel", "Y Combinator", "Sequoia", "Bond"], jobCount: 3 },
  { id: "c5", name: "Anyscale", slug: "anyscale", website: "https://anyscale.com", logoUrl: null, stage: "Series C", industry: "AI/ML", investors: ["a16z", "NEA", "Addition"], jobCount: 3 },
];

const MOCK_INVESTORS: InvestorListing[] = [
  { id: "i1", name: "a16z", slug: "a16z", website: "https://a16z.com", logoUrl: null, type: "Venture Capital", portfolioCount: 6 },
  { id: "i2", name: "Sequoia", slug: "sequoia", website: "https://sequoiacap.com", logoUrl: null, type: "Venture Capital", portfolioCount: 4 },
  { id: "i3", name: "Accel", slug: "accel", website: "https://accel.com", logoUrl: null, type: "Venture Capital", portfolioCount: 2 },
  { id: "i4", name: "Y Combinator", slug: "y-combinator", website: "https://ycombinator.com", logoUrl: null, type: "Accelerator", portfolioCount: 3 },
  { id: "i5", name: "Founders Fund", slug: "founders-fund", website: "https://foundersfund.com", logoUrl: null, type: "Venture Capital", portfolioCount: 1 },
];
