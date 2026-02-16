// ═══════════════════════════════════════════════════════════════════════
// Cadre v1 — Shared Types
// ═══════════════════════════════════════════════════════════════════════

export type Stage = "seed" | "a" | "b" | "c" | "d" | "public";
export type FunctionBucket = "eng" | "gtm" | "ops" | "exec";
export type EventType = "velocity_spike" | "zero_roles" | "new_department" | "new_exec" | "resumed_hiring" | "new_geo" | "stale_roles";
export type SeniorityLevel = "entry" | "mid" | "senior" | "staff" | "manager" | "director" | "vp" | "c_suite";

export interface FuncBreakdown {
  eng: number;
  gtm: number;
  ops: number;
  exec: number;
}

export interface Signal {
  type: EventType;
  label: string;
  variant: "alert" | "growth" | "caution" | "info";
}

export interface CompanyPulse {
  company_id: string;
  name: string;
  logo_url: string | null;
  stage: Stage;
  sector: string;
  hq_location: string;
  careers_url: string;
  description: string;
  open_roles: number;
  change_7d: number | null;
  change_30d: number | null;
  func_breakdown: FuncBreakdown;
  last_successful_scrape: string;
  investors: string[];
  signals: Signal[];
}

export interface JobEvent {
  id: string;
  company_id: string;
  company_name: string;
  event_type: EventType;
  description: string;
  magnitude: number;
  detected_at: string;
}

export interface Job {
  id: string;
  title: string;
  location: string | null;
  function_bucket: FunctionBucket | null;
  seniority_level: SeniorityLevel | null;
  first_seen_at: string;
  is_new: boolean;
}

export interface RoleGroup {
  function_name: string;
  bucket: FunctionBucket;
  roles: Job[];
  weekly_change: number;
}

export interface HistoryEvent {
  id: string;
  date: string;
  description: string;
  magnitude: number;
  direction: "up" | "down" | "neutral";
}
