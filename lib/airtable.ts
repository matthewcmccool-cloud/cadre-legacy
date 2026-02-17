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
  location: string;
  department: string;
  postedDate: string;
  jobUrl: string;
  investors: string[];
  isRemote: boolean;
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

// ═══════════════════════════════════════════════════════════════════════
// Mock data for when Airtable is not configured
// ═══════════════════════════════════════════════════════════════════════

const MOCK_JOBS: JobListing[] = [
  { id: "1", title: "Senior Backend Engineer", company: "Ramp", companySlug: "ramp", companyLogo: null, location: "New York, NY", department: "Engineering", postedDate: "2026-02-16", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "2", title: "Staff Platform Engineer", company: "Ramp", companySlug: "ramp", companyLogo: null, location: "New York, NY", department: "Engineering", postedDate: "2026-02-15", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "3", title: "ML Engineer, Risk", company: "Vercel", companySlug: "vercel", companyLogo: null, location: "San Francisco, CA", department: "Engineering", postedDate: "2026-02-15", jobUrl: "#", investors: ["Accel", "GV", "Bedrock", "CRV"], isRemote: false },
  { id: "4", title: "Enterprise Account Executive", company: "Ironclad", companySlug: "ironclad", companyLogo: null, location: "San Francisco, CA", department: "Sales", postedDate: "2026-02-14", jobUrl: "#", investors: ["a16z", "Accel", "Y Combinator", "Sequoia", "Bond"], isRemote: false },
  { id: "5", title: "Senior Product Designer", company: "Watershed", companySlug: "watershed", companyLogo: null, location: "Remote", department: "Design", postedDate: "2026-02-14", jobUrl: "#", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], isRemote: true },
  { id: "6", title: "Senior Full-Stack Engineer", company: "Anyscale", companySlug: "anyscale", companyLogo: null, location: "San Francisco, CA", department: "Engineering", postedDate: "2026-02-13", jobUrl: "#", investors: ["a16z", "NEA", "Addition"], isRemote: false },
  { id: "7", title: "Head of People Operations", company: "Ramp", companySlug: "ramp", companyLogo: null, location: "New York, NY", department: "Operations", postedDate: "2026-02-13", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "8", title: "Sr Product Marketing Manager", company: "Mutiny", companySlug: "mutiny", companyLogo: null, location: "San Francisco, CA", department: "Marketing", postedDate: "2026-02-12", jobUrl: "#", investors: ["Sequoia", "Tiger Global"], isRemote: false },
  { id: "9", title: "Backend Engineer, Data Pipeline", company: "Watershed", companySlug: "watershed", companyLogo: null, location: "San Francisco, CA", department: "Engineering", postedDate: "2026-02-12", jobUrl: "#", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], isRemote: false },
  { id: "10", title: "VP of Engineering", company: "Ramp", companySlug: "ramp", companyLogo: null, location: "New York, NY", department: "Engineering", postedDate: "2026-02-11", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "11", title: "Staff Engineer, Carbon Accounting", company: "Watershed", companySlug: "watershed", companyLogo: null, location: "San Francisco, CA", department: "Engineering", postedDate: "2026-02-11", jobUrl: "#", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], isRemote: false },
  { id: "12", title: "Customer Success Manager", company: "Coda", companySlug: "coda", companyLogo: null, location: "Remote", department: "Sales", postedDate: "2026-02-10", jobUrl: "#", investors: ["Greylock", "GV", "Khosla"], isRemote: true },
  { id: "13", title: "Senior Frontend Engineer", company: "Vercel", companySlug: "vercel", companyLogo: null, location: "Remote", department: "Engineering", postedDate: "2026-02-10", jobUrl: "#", investors: ["Accel", "GV", "Bedrock", "CRV"], isRemote: true },
  { id: "14", title: "Engineering Manager, Payments", company: "Ramp", companySlug: "ramp", companyLogo: null, location: "New York, NY", department: "Engineering", postedDate: "2026-02-09", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "15", title: "Account Executive, Mid-Market", company: "Mutiny", companySlug: "mutiny", companyLogo: null, location: "San Francisco, CA", department: "Sales", postedDate: "2026-02-09", jobUrl: "#", investors: ["Sequoia", "Tiger Global"], isRemote: false },
  { id: "16", title: "SDR, Enterprise", company: "Ironclad", companySlug: "ironclad", companyLogo: null, location: "San Francisco, CA", department: "Sales", postedDate: "2026-02-08", jobUrl: "#", investors: ["a16z", "Accel", "Y Combinator", "Sequoia", "Bond"], isRemote: false },
  { id: "17", title: "Senior Financial Analyst", company: "Replicate", companySlug: "replicate", companyLogo: null, location: "San Francisco, CA", department: "Operations", postedDate: "2026-02-07", jobUrl: "#", investors: ["a16z", "Y Combinator"], isRemote: false },
  { id: "18", title: "Growth Marketing Lead", company: "Makeship", companySlug: "makeship", companyLogo: null, location: "Toronto, ON", department: "Marketing", postedDate: "2026-02-07", jobUrl: "#", investors: ["a16z"], isRemote: false },
  { id: "19", title: "DevOps Engineer", company: "Anyscale", companySlug: "anyscale", companyLogo: null, location: "Remote", department: "Engineering", postedDate: "2026-02-06", jobUrl: "#", investors: ["a16z", "NEA", "Addition"], isRemote: true },
  { id: "20", title: "VP of Sales, Enterprise", company: "Ramp", companySlug: "ramp", companyLogo: null, location: "New York, NY", department: "Sales", postedDate: "2026-02-05", jobUrl: "#", investors: ["a16z", "Founders Fund", "Thrive Capital"], isRemote: false },
  { id: "21", title: "Chief of Staff", company: "Coda", companySlug: "coda", companyLogo: null, location: "San Francisco, CA", department: "Operations", postedDate: "2026-02-04", jobUrl: "#", investors: ["Greylock", "GV", "Khosla"], isRemote: false },
  { id: "22", title: "AI/ML Research Engineer", company: "Replicate", companySlug: "replicate", companyLogo: null, location: "San Francisco, CA", department: "Engineering", postedDate: "2026-02-03", jobUrl: "#", investors: ["a16z", "Y Combinator"], isRemote: false },
  { id: "23", title: "Solutions Architect", company: "Vercel", companySlug: "vercel", companyLogo: null, location: "Remote", department: "Engineering", postedDate: "2026-02-02", jobUrl: "#", investors: ["Accel", "GV", "Bedrock", "CRV"], isRemote: true },
  { id: "24", title: "Product Manager, Platform", company: "Anyscale", companySlug: "anyscale", companyLogo: null, location: "San Francisco, CA", department: "Product", postedDate: "2026-02-01", jobUrl: "#", investors: ["a16z", "NEA", "Addition"], isRemote: false },
  { id: "25", title: "Head of Finance", company: "Watershed", companySlug: "watershed", companyLogo: null, location: "San Francisco, CA", department: "Operations", postedDate: "2026-01-30", jobUrl: "#", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], isRemote: false },
  { id: "26", title: "Senior Data Engineer", company: "Mutiny", companySlug: "mutiny", companyLogo: null, location: "San Francisco, CA", department: "Engineering", postedDate: "2026-01-28", jobUrl: "#", investors: ["Sequoia", "Tiger Global"], isRemote: false },
  { id: "27", title: "Technical Writer", company: "Vercel", companySlug: "vercel", companyLogo: null, location: "Remote", department: "Engineering", postedDate: "2026-01-27", jobUrl: "#", investors: ["Accel", "GV", "Bedrock", "CRV"], isRemote: true },
  { id: "28", title: "Security Engineer", company: "Vanta", companySlug: "vanta", companyLogo: null, location: "San Francisco, CA", department: "Engineering", postedDate: "2026-01-25", jobUrl: "#", investors: ["Sequoia", "Y Combinator", "Craft Ventures"], isRemote: false },
  { id: "29", title: "Revenue Operations Analyst", company: "Ironclad", companySlug: "ironclad", companyLogo: null, location: "San Francisco, CA", department: "Operations", postedDate: "2026-01-23", jobUrl: "#", investors: ["a16z", "Accel", "Y Combinator", "Sequoia", "Bond"], isRemote: false },
  { id: "30", title: "Senior iOS Engineer", company: "Makeship", companySlug: "makeship", companyLogo: null, location: "Toronto, ON", department: "Engineering", postedDate: "2026-01-20", jobUrl: "#", investors: ["a16z"], isRemote: false },
];
