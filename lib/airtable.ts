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

// Safe fetch that returns [] if table doesn't exist
async function airtableFetchSafe(tableIdOrName: string, params: Record<string, string> = {}): Promise<Record<string, unknown>[]> {
  try {
    return await airtableFetch(tableIdOrName, params);
  } catch {
    return [];
  }
}

// Check if a value looks like an Airtable record ID (e.g. "recABC123xyz")
function isRecordId(val: unknown): boolean {
  return typeof val === "string" && /^rec[A-Za-z0-9]{10,}$/.test(val);
}

// Resolve a linked record field: if values are record IDs, look them up; otherwise return as-is
function resolveLinkedField(raw: unknown, nameMap: Map<string, string>): string[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw.map(String) : [String(raw)];
  return arr
    .map((val) => isRecordId(val) ? (nameMap.get(val) || "") : val)
    .filter(Boolean);
}

// Build a recordId → fieldValue map from a set of records, trying multiple field name candidates
function buildNameMap(records: Record<string, unknown>[], ...fieldCandidates: string[]): Map<string, string> {
  const fields = fieldCandidates.length > 0 ? fieldCandidates : ["Name"];
  const map = new Map<string, string>();
  for (const rec of records) {
    const f = rec.fields as Record<string, unknown>;
    let name = "";
    for (const field of fields) {
      const val = f[field];
      if (typeof val === "string" && val.trim()) {
        name = val.trim();
        break;
      }
    }
    if (name) map.set(rec.id as string, name);
  }
  return map;
}

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

      // Department/Function — may be linked record, resolve if needed
      const funcRaw = fields["Function"] || fields["Department"] || fields["Functions"];
      const departmentArr = resolveLinkedField(funcRaw, functionNameMap);
      const department = departmentArr[0] || "";

      // Date — prefer "Posted Date", fall back to "Last Seen At" or "Created Time"
      const postedDate = (fields["Posted Date"] as string)
        || (fields["Last Seen At"] as string)
        || (fields["Created Time"] as string)
        || "";

      const location = (fields["Location"] as string) || "";

      return {
        id: rec.id as string,
        title: (fields["Title"] as string) || "",
        company: companyName,
        companySlug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        companyLogo: null,
        companyWebsite,
        location,
        department,
        postedDate,
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

export interface JobFilters {
  search?: string;
  departments?: string[];
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
        j.department.toLowerCase().includes(q) ||
        j.investors.some((inv) => inv.toLowerCase().includes(q))
    );
  }

  if (filters.departments && filters.departments.length > 0) {
    result = result.filter((j) => filters.departments!.includes(j.department));
  }

  if (filters.locations && filters.locations.length > 0) {
    result = result.filter((j) => {
      const city = j.location.split(",")[0].trim();
      return filters.locations!.includes(city);
    });
  }

  if (filters.remote === "remote") {
    result = result.filter((j) => j.isRemote);
  } else if (filters.remote === "onsite") {
    result = result.filter((j) => !j.isRemote);
  }

  return { jobs: result, total: result.length };
}

export async function fetchCompanies(): Promise<{ companies: CompanyListing[]; total: number }> {
  if (!isAirtableConfigured) {
    return { companies: MOCK_COMPANIES, total: MOCK_COMPANIES.length };
  }

  try {
    // Fetch companies + lookup tables for resolving VCs and Industry linked records
    const [companyRecords, investorRecords, industryRecords] = await Promise.all([
      airtableFetch("Companies", {
        "sort[0][field]": "Company",
        "sort[0][direction]": "asc",
        pageSize: "100",
      }),
      airtableFetchSafe("tblH6MmoXCn3Ve0K2", { pageSize: "100" }), // Investors table by ID
      airtableFetchSafe("Industries", { pageSize: "100" }),
    ]);

    const investorNameMap = buildNameMap(investorRecords, "Firm Name", "Name");
    const industryNameMap = buildNameMap(industryRecords, "Name");

    const companies: CompanyListing[] = companyRecords.map((rec: Record<string, unknown>) => {
      const fields = rec.fields as Record<string, unknown>;
      const name = (fields["Company"] as string) || (fields["Name"] as string) || "";

      // VCs — linked record, resolve IDs to investor names
      const investorsRaw = fields["VCs"] || fields["Investors"] || [];
      const investors = resolveLinkedField(investorsRaw, investorNameMap);

      // Industry — may be linked record, resolve if needed
      const industryRaw = fields["Industry"];
      const industryArr = resolveLinkedField(industryRaw, industryNameMap);
      const industry = industryArr[0] || "";

      const jobCountRaw = fields["Job Count"] || fields["Jobs"] || 0;
      const jobCount = Array.isArray(jobCountRaw) ? jobCountRaw.length : (typeof jobCountRaw === "number" ? jobCountRaw : 0);

      return {
        id: rec.id as string,
        name,
        slug: (fields["Slug"] as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        website: (fields["URL"] as string) || (fields["Website"] as string) || "",
        logoUrl: (fields["Logo URL"] as string) || null,
        stage: (fields["Stage"] as string) || "",
        industry,
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
    const records = await airtableFetch("tblH6MmoXCn3Ve0K2", {
      "sort[0][field]": "Firm Name",
      "sort[0][direction]": "asc",
      pageSize: "100",
      maxRecords: "300",
    });

    const investors: InvestorListing[] = records
      .map((rec: Record<string, unknown>) => {
        const fields = rec.fields as Record<string, unknown>;
        const name = (fields["Firm Name"] as string) || (fields["Name"] as string) || "";
        const portfolioRaw = fields["PortCo's"] || fields["Portfolio Companies"] || [];
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
      })
      // Filter out corrupted entries: names with pipe chars, dashes-only, empty, or record IDs
      .filter((inv) => {
        if (!inv.name) return false;
        if (/^\|[\s\-|]*\|?$/.test(inv.name)) return false;
        if (/^[-\s]+$/.test(inv.name)) return false;
        if (isRecordId(inv.name)) return false;
        return true;
      });

    return { investors, total: investors.length };
  } catch (err) {
    console.error("Failed to fetch investors from Airtable:", err);
    return { investors: MOCK_INVESTORS, total: MOCK_INVESTORS.length };
  }
}

// Fetch unique department names (resolved from linked records)
export async function fetchAllDepartments(): Promise<string[]> {
  if (!isAirtableConfigured) {
    return [...new Set(MOCK_JOBS.map((j) => j.department).filter(Boolean))].sort();
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

// Fetch unique location strings from Jobs
export async function fetchAllLocations(): Promise<string[]> {
  if (!isAirtableConfigured) {
    const set = new Set(
      MOCK_JOBS.map((j) => j.location.split(",")[0].trim())
        .filter((l) => l && l.toLowerCase() !== "remote")
    );
    return [...set].sort();
  }
  try {
    const jobRecords = await airtableFetch("Jobs", { pageSize: "100" });
    const set = new Set<string>();
    for (const rec of jobRecords) {
      const f = rec.fields as Record<string, unknown>;
      const loc = (f["Location"] as string) || "";
      const city = loc.split(",")[0].trim();
      if (city && city.toLowerCase() !== "remote") {
        set.add(city);
      }
    }
    return [...set].sort();
  } catch {
    return [];
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
