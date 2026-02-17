// ═══════════════════════════════════════════════════════════════════════
// Cadre v1 — Supabase Queries with Demo Mode Fallback
// ═══════════════════════════════════════════════════════════════════════

import { getSupabase, isDemoMode } from "./supabase";
import { MOCK_COMPANIES, MOCK_EVENTS, MOCK_ROLES } from "./mock-data";
import type { CompanyPulse, JobEvent, Job, Signal, FuncBreakdown } from "./types";

// ── QUERY 1: Portfolio Pulse ────────────────────────────────────────
// Drives the main table. Fetches company_pulse materialized view + investors.

export async function fetchCompanyPulse(): Promise<CompanyPulse[]> {
  if (isDemoMode) {
    return MOCK_COMPANIES;
  }

  // Fetch company pulse data
  const { data: pulseData, error: pulseError } = await getSupabase()
    .from("company_pulse")
    .select("*")
    .order("change_7d", { ascending: false, nullsFirst: false });

  if (pulseError) {
    console.error("Failed to fetch company_pulse:", pulseError);
    return MOCK_COMPANIES; // Fallback to mock on error
  }

  if (!pulseData || pulseData.length === 0) {
    return MOCK_COMPANIES; // Fallback if no data yet
  }

  const companyIds = pulseData.map((c: { company_id: string }) => c.company_id);

  // Fetch investors for these companies
  const { data: investorData } = await getSupabase()
    .from("fund_portfolios")
    .select("company_id, investors(name)")
    .in("company_id", companyIds);

  // Build investor map
  const investorMap: Record<string, string[]> = {};
  if (investorData) {
    for (const row of investorData) {
      const cid = row.company_id as string;
      const investors = row.investors as unknown;
      const investorName = investors && typeof investors === "object" && "name" in (investors as Record<string, unknown>)
        ? (investors as { name: string }).name
        : Array.isArray(investors) && investors.length > 0
          ? (investors[0] as { name: string }).name
          : null;
      if (investorName) {
        if (!investorMap[cid]) investorMap[cid] = [];
        investorMap[cid].push(investorName);
      }
    }
  }

  // Fetch signals (recent job_events) for these companies
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: eventData } = await getSupabase()
    .from("job_events")
    .select("company_id, event_type, description, magnitude")
    .in("company_id", companyIds)
    .gte("detected_at", sevenDaysAgo.toISOString());

  // Build signal map
  const signalMap: Record<string, Signal[]> = {};
  if (eventData) {
    for (const ev of eventData) {
      const cid = ev.company_id as string;
      if (!signalMap[cid]) signalMap[cid] = [];
      const signal = eventToSignal(ev.event_type as string, ev.description as string);
      if (signal) signalMap[cid].push(signal);
    }
  }

  return pulseData.map((row: Record<string, unknown>) => ({
    company_id: row.company_id as string,
    name: row.name as string,
    logo_url: (row.logo_url as string) || null,
    stage: row.stage as CompanyPulse["stage"],
    sector: (row.sector as string) || "",
    hq_location: (row.hq_location as string) || "",
    careers_url: (row.careers_url as string) || "",
    description: (row.description as string) || "",
    open_roles: (row.open_roles as number) || 0,
    change_7d: (row.change_7d as number) ?? null,
    change_30d: (row.change_30d as number) ?? null,
    func_breakdown: (row.func_breakdown as FuncBreakdown) || { eng: 0, gtm: 0, ops: 0, exec: 0 },
    last_successful_scrape: (row.last_successful_scrape as string) || "",
    investors: investorMap[row.company_id as string] || [],
    signals: signalMap[row.company_id as string] || [],
  }));
}

// ── QUERY 2: This Week Events ───────────────────────────────────────
// Drives the strip. Top 5 events by magnitude in the last 7 days.

export async function fetchThisWeekEvents(): Promise<JobEvent[]> {
  if (isDemoMode) {
    return MOCK_EVENTS;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await getSupabase()
    .from("job_events")
    .select("*, companies(name)")
    .gte("detected_at", sevenDaysAgo.toISOString())
    .order("magnitude", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Failed to fetch events:", error);
    return MOCK_EVENTS;
  }

  if (!data || data.length === 0) {
    return MOCK_EVENTS;
  }

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    company_id: row.company_id as string,
    company_name: (row.companies as { name: string } | null)?.name || "Unknown",
    event_type: row.event_type as JobEvent["event_type"],
    description: (row.description as string) || "",
    magnitude: (row.magnitude as number) || 0,
    detected_at: (row.detected_at as string) || "",
  }));
}

// ── QUERY 3: Company Roles ──────────────────────────────────────────
// Drives the company detail panel. Active, primary roles grouped by function.

export async function fetchCompanyRoles(companyId: string): Promise<Job[]> {
  if (isDemoMode) {
    return MOCK_ROLES[companyId] || [];
  }

  const { data, error } = await getSupabase()
    .from("jobs")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .eq("is_primary", true)
    .order("first_seen_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch roles:", error);
    return MOCK_ROLES[companyId] || [];
  }

  if (!data || data.length === 0) {
    return MOCK_ROLES[companyId] || [];
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: (row.title as string) || "",
    location: (row.location as string) || null,
    function_bucket: (row.function_bucket as Job["function_bucket"]) || null,
    seniority_level: (row.seniority_level as Job["seniority_level"]) || null,
    first_seen_at: (row.first_seen_at as string) || "",
    is_new: new Date(row.first_seen_at as string) > sevenDaysAgo,
  }));
}

// ── Helper: Map event_type to Signal ────────────────────────────────

function eventToSignal(eventType: string, description: string): Signal | null {
  const map: Record<string, { label: string; variant: Signal["variant"] }> = {
    velocity_spike: { label: "Velocity spike", variant: "growth" },
    zero_roles: { label: "Stopped hiring", variant: "alert" },
    new_department: { label: `New: ${extractDepartment(description)}`, variant: "caution" },
    new_exec: { label: `New exec: ${extractExecTitle(description)}`, variant: "caution" },
    resumed_hiring: { label: "Resumed", variant: "info" },
    new_geo: { label: `New geo: ${extractGeo(description)}`, variant: "info" },
    stale_roles: { label: "Stale roles", variant: "info" },
  };

  const entry = map[eventType];
  if (!entry) return null;
  return { type: eventType as Signal["type"], ...entry };
}

function extractDepartment(desc: string): string {
  const match = desc.match(/First (\w+) roles/i);
  return match ? match[1] : "Dept";
}

function extractExecTitle(desc: string): string {
  const match = desc.match(/New (?:executive[- ]level )?(?:search|role):?\s*(.+)/i);
  return match ? match[1].trim() : "role";
}

function extractGeo(desc: string): string {
  const match = desc.match(/new (?:geo(?:graphic)?[: ]*)?(\w[\w\s,]+)/i);
  return match ? match[1].trim() : "location";
}
