// ═══════════════════════════════════════════════════════════════════════
// Cadre — Airtable Data Fetching
// Uses response.text() + JSON.parse() per CLAUDE.md (never .json())
// Falls back to mock data when AIRTABLE_API_KEY is not configured
// ═══════════════════════════════════════════════════════════════════════

export interface JobListing {
  id: string;
  title: string;
  company: string;
  companySlug: string;
  companyLogo: string | null;
  companyWebsite: string;
  location: string;
  department: string;
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

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appnDXaCfmGtgt6gk";

const isAirtableConfigured = Boolean(AIRTABLE_API_KEY && AIRTABLE_BASE_ID);

async function airtableFetch(tableIdOrName: string, params: Record<string, string> = {}): Promise<Record<string, unknown>[]> {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableIdOrName)}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const allRecords: Record<string, unknown>[] = [];
  let offset: string | undefined;

  do {
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      next: { revalidate: 300 }, // cache 5 min
    });

    // CRITICAL: use .text() + JSON.parse(), NEVER .json() (see CLAUDE.md)
    const text = await res.text();
    const json = JSON.parse(text);

    if (!res.ok) {
      console.error("Airtable error:", json);
      throw new Error(`Airtable API error: ${res.status}`);
    }

    if (json.records) {
      allRecords.push(...json.records);
    }
    offset = json.offset;
  } while (offset);

  return allRecords;
}

export async function fetchJobs(): Promise<{ jobs: JobListing[]; total: number }> {
  if (!isAirtableConfigured) {
    return { jobs: MOCK_JOBS, total: MOCK_JOBS.length };
  }

  try {
    // Fetch jobs sorted by Posted Date descending
    const records = await airtableFetch("Jobs", {
      "sort[0][field]": "Posted Date",
      "sort[0][direction]": "desc",
      pageSize: "100",
    });

    const jobs: JobListing[] = records.map((rec: Record<string, unknown>) => {
      const fields = rec.fields as Record<string, unknown>;
      // Company is a linked record — comes as array of strings
      const companyRaw = fields["Company"];
      const companyName = Array.isArray(companyRaw)
        ? String(companyRaw[0])
        : (companyRaw as string) || "Unknown";
      // Investors are linked through Companies, not directly on Jobs
      const investorsRaw = fields["Investors"] || fields["VCs"] || [];
      const investors = Array.isArray(investorsRaw)
        ? (investorsRaw as string[])
        : [];
      const location = (fields["Location"] as string) || "";

      return {
        id: rec.id as string,
        title: (fields["Title"] as string) || "",
        company: companyName,
        companySlug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        companyLogo: null,
        companyWebsite: (fields["Company Website"] as string) || "",
        location,
        department: (fields["Function"] as string) || "",
        postedDate: (fields["Posted Date"] as string) || "",
        jobUrl: (fields["Job URL"] as string) || "",
        investors,
        isRemote: location.toLowerCase().includes("remote"),
      };
    });

    return { jobs, total: jobs.length };
  } catch (err) {
    console.error("Failed to fetch from Airtable:", err);
    return { jobs: MOCK_JOBS, total: MOCK_JOBS.length };
  }
}

export async function fetchCompanies(): Promise<{ companies: CompanyListing[]; total: number }> {
  if (!isAirtableConfigured) {
    return { companies: MOCK_COMPANIES, total: MOCK_COMPANIES.length };
  }

  try {
    const records = await airtableFetch("Companies", {
      "sort[0][field]": "Name",
      "sort[0][direction]": "asc",
      pageSize: "100",
    });

    const companies: CompanyListing[] = records.map((rec: Record<string, unknown>) => {
      const fields = rec.fields as Record<string, unknown>;
      const name = (fields["Name"] as string) || "";
      const investorsRaw = fields["VCs"] || [];
      const investors = Array.isArray(investorsRaw) ? (investorsRaw as string[]) : [];
      const jobCountRaw = fields["Job Count"] || fields["Jobs"] || 0;
      const jobCount = Array.isArray(jobCountRaw) ? jobCountRaw.length : (typeof jobCountRaw === "number" ? jobCountRaw : 0);

      return {
        id: rec.id as string,
        name,
        slug: (fields["Slug"] as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        website: (fields["Website"] as string) || "",
        logoUrl: (fields["Logo URL"] as string) || null,
        stage: (fields["Stage"] as string) || "",
        industry: Array.isArray(fields["Industry"]) ? (fields["Industry"] as string[])[0] || "" : (fields["Industry"] as string) || "",
        investors,
        jobCount,
      };
    });

    return { companies, total: companies.length };
  } catch (err) {
    console.error("Failed to fetch companies from Airtable:", err);
    return { companies: MOCK_COMPANIES, total: MOCK_COMPANIES.length };
  }
}

export async function fetchInvestors(): Promise<{ investors: InvestorListing[]; total: number }> {
  if (!isAirtableConfigured) {
    return { investors: MOCK_INVESTORS, total: MOCK_INVESTORS.length };
  }

  try {
    const records = await airtableFetch("Investors", {
      "sort[0][field]": "Name",
      "sort[0][direction]": "asc",
      pageSize: "100",
    });

    const investors: InvestorListing[] = records.map((rec: Record<string, unknown>) => {
      const fields = rec.fields as Record<string, unknown>;
      const name = (fields["Name"] as string) || "";
      const portfolioRaw = fields["Portfolio Companies"] || [];
      const portfolioCount = Array.isArray(portfolioRaw) ? portfolioRaw.length : 0;

      return {
        id: rec.id as string,
        name,
        slug: (fields["Slug"] as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        website: (fields["Website"] as string) || "",
        logoUrl: (fields["Logo URL"] as string) || null,
        type: (fields["Type"] as string) || "Venture Capital",
        portfolioCount,
      };
    });

    return { investors, total: investors.length };
  } catch (err) {
    console.error("Failed to fetch investors from Airtable:", err);
    return { investors: MOCK_INVESTORS, total: MOCK_INVESTORS.length };
  }
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

// Helper to build a company name → website domain map from company data
export function buildCompanyDomainMap(companies: CompanyListing[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of companies) {
    if (c.website) {
      try {
        const domain = new URL(c.website.startsWith("http") ? c.website : `https://${c.website}`).hostname.replace(/^www\./, "");
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
  { id: "1", title: "Senior Backend Engineer", company: "Ramp", companySlug: "ramp", companyLogo: null, companyWebsite: "https://ramp.com", location: "New York, NY", department: "Engineering", postedDate: "2026-02-16", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "2", title: "Staff Platform Engineer", company: "Ramp", companySlug: "ramp", companyLogo: null, companyWebsite: "https://ramp.com", location: "New York, NY", department: "Engineering", postedDate: "2026-02-15", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "3", title: "ML Engineer, Risk", company: "Vercel", companySlug: "vercel", companyLogo: null, companyWebsite: "https://vercel.com", location: "San Francisco, CA", department: "Engineering", postedDate: "2026-02-15", jobUrl: "#", investors: ["Accel", "GV", "Bedrock", "CRV"], isRemote: false },
  { id: "4", title: "Enterprise Account Executive", company: "Ironclad", companySlug: "ironclad", companyLogo: null, companyWebsite: "https://ironcladapp.com", location: "San Francisco, CA", department: "Sales", postedDate: "2026-02-14", jobUrl: "#", investors: ["a16z", "Accel", "Y Combinator", "Sequoia", "Bond"], isRemote: false },
  { id: "5", title: "Senior Product Designer", company: "Watershed", companySlug: "watershed", companyLogo: null, companyWebsite: "https://watershed.com", location: "Remote", department: "Design", postedDate: "2026-02-14", jobUrl: "#", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], isRemote: true },
  { id: "6", title: "Senior Full-Stack Engineer", company: "Anyscale", companySlug: "anyscale", companyLogo: null, companyWebsite: "https://anyscale.com", location: "San Francisco, CA", department: "Engineering", postedDate: "2026-02-13", jobUrl: "#", investors: ["a16z", "NEA", "Addition"], isRemote: false },
  { id: "7", title: "Head of People Operations", company: "Ramp", companySlug: "ramp", companyLogo: null, companyWebsite: "https://ramp.com", location: "New York, NY", department: "Operations", postedDate: "2026-02-13", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "8", title: "Sr Product Marketing Manager", company: "Mutiny", companySlug: "mutiny", companyLogo: null, companyWebsite: "https://mutinyhq.com", location: "San Francisco, CA", department: "Marketing", postedDate: "2026-02-12", jobUrl: "#", investors: ["Sequoia", "Tiger Global"], isRemote: false },
  { id: "9", title: "Backend Engineer, Data Pipeline", company: "Watershed", companySlug: "watershed", companyLogo: null, companyWebsite: "https://watershed.com", location: "San Francisco, CA", department: "Engineering", postedDate: "2026-02-12", jobUrl: "#", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], isRemote: false },
  { id: "10", title: "VP of Engineering", company: "Ramp", companySlug: "ramp", companyLogo: null, companyWebsite: "https://ramp.com", location: "New York, NY", department: "Engineering", postedDate: "2026-02-11", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "11", title: "Staff Engineer, Carbon Accounting", company: "Watershed", companySlug: "watershed", companyLogo: null, companyWebsite: "https://watershed.com", location: "San Francisco, CA", department: "Engineering", postedDate: "2026-02-11", jobUrl: "#", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], isRemote: false },
  { id: "12", title: "Customer Success Manager", company: "Coda", companySlug: "coda", companyLogo: null, companyWebsite: "https://coda.io", location: "Remote", department: "Sales", postedDate: "2026-02-10", jobUrl: "#", investors: ["Greylock", "GV", "Khosla"], isRemote: true },
  { id: "13", title: "Senior Frontend Engineer", company: "Vercel", companySlug: "vercel", companyLogo: null, companyWebsite: "https://vercel.com", location: "Remote", department: "Engineering", postedDate: "2026-02-10", jobUrl: "#", investors: ["Accel", "GV", "Bedrock", "CRV"], isRemote: true },
  { id: "14", title: "Engineering Manager, Payments", company: "Ramp", companySlug: "ramp", companyLogo: null, companyWebsite: "https://ramp.com", location: "New York, NY", department: "Engineering", postedDate: "2026-02-09", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "15", title: "Account Executive, Mid-Market", company: "Mutiny", companySlug: "mutiny", companyLogo: null, companyWebsite: "https://mutinyhq.com", location: "San Francisco, CA", department: "Sales", postedDate: "2026-02-09", jobUrl: "#", investors: ["Sequoia", "Tiger Global"], isRemote: false },
  { id: "16", title: "SDR, Enterprise", company: "Ironclad", companySlug: "ironclad", companyLogo: null, companyWebsite: "https://ironcladapp.com", location: "San Francisco, CA", department: "Sales", postedDate: "2026-02-08", jobUrl: "#", investors: ["a16z", "Accel", "Y Combinator", "Sequoia", "Bond"], isRemote: false },
  { id: "17", title: "Senior Financial Analyst", company: "Replicate", companySlug: "replicate", companyLogo: null, companyWebsite: "https://replicate.com", location: "San Francisco, CA", department: "Operations", postedDate: "2026-02-07", jobUrl: "#", investors: ["a16z", "Y Combinator"], isRemote: false },
  { id: "18", title: "Growth Marketing Lead", company: "Makeship", companySlug: "makeship", companyLogo: null, companyWebsite: "https://makeship.com", location: "Toronto, ON", department: "Marketing", postedDate: "2026-02-07", jobUrl: "#", investors: ["a16z"], isRemote: false },
  { id: "19", title: "DevOps Engineer", company: "Anyscale", companySlug: "anyscale", companyLogo: null, companyWebsite: "https://anyscale.com", location: "Remote", department: "Engineering", postedDate: "2026-02-06", jobUrl: "#", investors: ["a16z", "NEA", "Addition"], isRemote: true },
  { id: "20", title: "VP of Sales, Enterprise", company: "Ramp", companySlug: "ramp", companyLogo: null, companyWebsite: "https://ramp.com", location: "New York, NY", department: "Sales", postedDate: "2026-02-05", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "21", title: "Chief of Staff", company: "Coda", companySlug: "coda", companyLogo: null, companyWebsite: "https://coda.io", location: "San Francisco, CA", department: "Operations", postedDate: "2026-02-04", jobUrl: "#", investors: ["Greylock", "GV", "Khosla"], isRemote: false },
  { id: "22", title: "AI/ML Research Engineer", company: "Replicate", companySlug: "replicate", companyLogo: null, companyWebsite: "https://replicate.com", location: "San Francisco, CA", department: "Engineering", postedDate: "2026-02-03", jobUrl: "#", investors: ["a16z", "Y Combinator"], isRemote: false },
  { id: "23", title: "Solutions Architect", company: "Vercel", companySlug: "vercel", companyLogo: null, companyWebsite: "https://vercel.com", location: "Remote", department: "Engineering", postedDate: "2026-02-02", jobUrl: "#", investors: ["Accel", "GV", "Bedrock", "CRV"], isRemote: true },
  { id: "24", title: "Product Manager, Platform", company: "Anyscale", companySlug: "anyscale", companyLogo: null, companyWebsite: "https://anyscale.com", location: "San Francisco, CA", department: "Product", postedDate: "2026-02-01", jobUrl: "#", investors: ["a16z", "NEA", "Addition"], isRemote: false },
  { id: "25", title: "Head of Finance", company: "Watershed", companySlug: "watershed", companyLogo: null, companyWebsite: "https://watershed.com", location: "San Francisco, CA", department: "Operations", postedDate: "2026-01-30", jobUrl: "#", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], isRemote: false },
  { id: "26", title: "Senior Data Engineer", company: "Mutiny", companySlug: "mutiny", companyLogo: null, companyWebsite: "https://mutinyhq.com", location: "San Francisco, CA", department: "Engineering", postedDate: "2026-01-28", jobUrl: "#", investors: ["Sequoia", "Tiger Global"], isRemote: false },
  { id: "27", title: "Technical Writer", company: "Vercel", companySlug: "vercel", companyLogo: null, companyWebsite: "https://vercel.com", location: "Remote", department: "Engineering", postedDate: "2026-01-27", jobUrl: "#", investors: ["Accel", "GV", "Bedrock", "CRV"], isRemote: true },
  { id: "28", title: "Security Engineer", company: "Vanta", companySlug: "vanta", companyLogo: null, companyWebsite: "https://vanta.com", location: "San Francisco, CA", department: "Engineering", postedDate: "2026-01-25", jobUrl: "#", investors: ["Sequoia", "Y Combinator", "Craft Ventures"], isRemote: false },
  { id: "29", title: "Revenue Operations Analyst", company: "Ironclad", companySlug: "ironclad", companyLogo: null, companyWebsite: "https://ironcladapp.com", location: "San Francisco, CA", department: "Operations", postedDate: "2026-01-23", jobUrl: "#", investors: ["a16z", "Accel", "Y Combinator", "Sequoia", "Bond"], isRemote: false },
  { id: "30", title: "Senior iOS Engineer", company: "Makeship", companySlug: "makeship", companyLogo: null, companyWebsite: "https://makeship.com", location: "Toronto, ON", department: "Engineering", postedDate: "2026-01-20", jobUrl: "#", investors: ["a16z"], isRemote: false },
];

const MOCK_COMPANIES: CompanyListing[] = [
  { id: "c1", name: "Ramp", slug: "ramp", website: "https://ramp.com", logoUrl: null, stage: "Series D", industry: "Fintech", investors: ["a16z", "Founders Fund", "Thrive Capital"], jobCount: 6 },
  { id: "c2", name: "Vercel", slug: "vercel", website: "https://vercel.com", logoUrl: null, stage: "Series D", industry: "Developer Tools", investors: ["Accel", "GV", "Bedrock", "CRV"], jobCount: 5 },
  { id: "c3", name: "Watershed", slug: "watershed", website: "https://watershed.com", logoUrl: null, stage: "Series C", industry: "Climate Tech", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], jobCount: 4 },
  { id: "c4", name: "Ironclad", slug: "ironclad", website: "https://ironcladapp.com", logoUrl: null, stage: "Series E", industry: "Legal Tech", investors: ["a16z", "Accel", "Y Combinator", "Sequoia", "Bond"], jobCount: 3 },
  { id: "c5", name: "Anyscale", slug: "anyscale", website: "https://anyscale.com", logoUrl: null, stage: "Series C", industry: "AI/ML", investors: ["a16z", "NEA", "Addition"], jobCount: 3 },
  { id: "c6", name: "Mutiny", slug: "mutiny", website: "https://mutinyhq.com", logoUrl: null, stage: "Series C", industry: "Marketing Tech", investors: ["Sequoia", "Tiger Global"], jobCount: 3 },
  { id: "c7", name: "Coda", slug: "coda", website: "https://coda.io", logoUrl: null, stage: "Series D", industry: "Productivity", investors: ["Greylock", "GV", "Khosla"], jobCount: 2 },
  { id: "c8", name: "Replicate", slug: "replicate", website: "https://replicate.com", logoUrl: null, stage: "Series B", industry: "AI/ML", investors: ["a16z", "Y Combinator"], jobCount: 2 },
  { id: "c9", name: "Vanta", slug: "vanta", website: "https://vanta.com", logoUrl: null, stage: "Series C", industry: "Security", investors: ["Sequoia", "Y Combinator", "Craft Ventures"], jobCount: 1 },
  { id: "c10", name: "Makeship", slug: "makeship", website: "https://makeship.com", logoUrl: null, stage: "Series A", industry: "E-Commerce", investors: ["a16z"], jobCount: 2 },
];

const MOCK_INVESTORS: InvestorListing[] = [
  { id: "i1", name: "a16z", slug: "a16z", website: "https://a16z.com", logoUrl: null, type: "Venture Capital", portfolioCount: 6 },
  { id: "i2", name: "Sequoia", slug: "sequoia", website: "https://sequoiacap.com", logoUrl: null, type: "Venture Capital", portfolioCount: 4 },
  { id: "i3", name: "Accel", slug: "accel", website: "https://accel.com", logoUrl: null, type: "Venture Capital", portfolioCount: 2 },
  { id: "i4", name: "Y Combinator", slug: "y-combinator", website: "https://ycombinator.com", logoUrl: null, type: "Accelerator", portfolioCount: 3 },
  { id: "i5", name: "Founders Fund", slug: "founders-fund", website: "https://foundersfund.com", logoUrl: null, type: "Venture Capital", portfolioCount: 1 },
  { id: "i6", name: "GV", slug: "gv", website: "https://gv.com", logoUrl: null, type: "Venture Capital", portfolioCount: 2 },
  { id: "i7", name: "Thrive Capital", slug: "thrive-capital", website: "https://thrivecap.com", logoUrl: null, type: "Venture Capital", portfolioCount: 1 },
  { id: "i8", name: "Kleiner Perkins", slug: "kleiner-perkins", website: "https://kleinerperkins.com", logoUrl: null, type: "Venture Capital", portfolioCount: 1 },
  { id: "i9", name: "Tiger Global", slug: "tiger-global", website: "https://tigerglobal.com", logoUrl: null, type: "Hedge Fund", portfolioCount: 1 },
  { id: "i10", name: "NEA", slug: "nea", website: "https://nea.com", logoUrl: null, type: "Venture Capital", portfolioCount: 1 },
];
