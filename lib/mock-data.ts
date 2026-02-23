// ═══════════════════════════════════════════════════════════════════════
// Cadre v1 — Mock Data (used in demo mode)
// ═══════════════════════════════════════════════════════════════════════

import type { CompanyPulse, JobEvent, Job } from "./types";

export const MOCK_EVENTS: JobEvent[] = [
  { id: "e1", company_id: "c7", company_name: "Vanta", event_type: "zero_roles", description: "Dropped to 0 open roles", magnitude: 23, detected_at: "2026-02-14T06:00:00Z" },
  { id: "e2", company_id: "c1", company_name: "Ramp", event_type: "velocity_spike", description: "+18 roles this week · 3× avg velocity", magnitude: 18, detected_at: "2026-02-13T06:00:00Z" },
  { id: "e3", company_id: "c2", company_name: "Ironclad", event_type: "new_department", description: "First Sales roles posted (3 positions)", magnitude: 3, detected_at: "2026-02-12T06:00:00Z" },
  { id: "e4", company_id: "c3", company_name: "Watershed", event_type: "resumed_hiring", description: "Resumed hiring after 8 quiet weeks", magnitude: 9, detected_at: "2026-02-11T06:00:00Z" },
];

export const MOCK_COMPANIES: CompanyPulse[] = [
  { company_id: "c1", name: "Ramp", logo_url: null, stage: "d", sector: "Fintech", hq_location: "New York, NY", careers_url: "ramp.com/careers", description: "Corporate card and spend management platform for finance teams.", open_roles: 67, change_7d: 18, change_30d: 41, func_breakdown: { eng: 28, gtm: 22, ops: 12, exec: 5 }, last_successful_scrape: "2026-02-15T06:00:00Z", investors: ["a16z", "Founders Fund", "Thrive Capital"], signals: [{ type: "velocity_spike", label: "Velocity spike", variant: "growth" }] },
  { company_id: "c7", name: "Vanta", logo_url: null, stage: "c", sector: "Security", hq_location: "San Francisco, CA", careers_url: "vanta.com/careers", description: "Automated security compliance for SOC 2, ISO 27001, and HIPAA.", open_roles: 0, change_7d: -8, change_30d: -23, func_breakdown: { eng: 0, gtm: 0, ops: 0, exec: 0 }, last_successful_scrape: "2026-02-15T06:00:00Z", investors: ["Sequoia", "Y Combinator", "Craft Ventures"], signals: [{ type: "zero_roles", label: "Stopped hiring", variant: "alert" }] },
  { company_id: "c2", name: "Ironclad", logo_url: null, stage: "d", sector: "Legal Tech", hq_location: "San Francisco, CA", careers_url: "ironcladapp.com/careers", description: "Digital contracting platform for legal and business teams.", open_roles: 24, change_7d: 6, change_30d: 11, func_breakdown: { eng: 10, gtm: 8, ops: 6, exec: 0 }, last_successful_scrape: "2026-02-15T06:00:00Z", investors: ["a16z", "Accel", "Y Combinator"], signals: [{ type: "new_department", label: "New: Sales", variant: "caution" }] },
  { company_id: "c3", name: "Watershed", logo_url: null, stage: "c", sector: "Climate", hq_location: "San Francisco, CA", careers_url: "watershed.com/careers", description: "Enterprise climate platform for carbon measurement and reduction.", open_roles: 9, change_7d: 9, change_30d: 9, func_breakdown: { eng: 5, gtm: 3, ops: 1, exec: 0 }, last_successful_scrape: "2026-02-15T06:00:00Z", investors: ["Sequoia", "Kleiner Perkins", "Greenoaks"], signals: [{ type: "resumed_hiring", label: "Resumed", variant: "info" }] },
  { company_id: "c4", name: "Anyscale", logo_url: null, stage: "c", sector: "AI Infra", hq_location: "San Francisco, CA", careers_url: "anyscale.com/careers", description: "Platform for scalable AI/ML applications built on Ray.", open_roles: 31, change_7d: 4, change_30d: 8, func_breakdown: { eng: 22, gtm: 6, ops: 3, exec: 0 }, last_successful_scrape: "2026-02-15T06:00:00Z", investors: ["a16z", "NEA", "Addition"], signals: [] },
  { company_id: "c5", name: "Makeship", logo_url: null, stage: "b", sector: "E-Commerce", hq_location: "Toronto, ON", careers_url: "makeship.com/careers", description: "Creator-driven commerce platform for custom merchandise.", open_roles: 8, change_7d: 3, change_30d: 5, func_breakdown: { eng: 2, gtm: 4, ops: 2, exec: 0 }, last_successful_scrape: "2026-02-15T06:00:00Z", investors: ["a16z"], signals: [{ type: "new_exec", label: "New exec: CFO", variant: "caution" }] },
  { company_id: "c6", name: "Vercel", logo_url: null, stage: "d", sector: "DevTools", hq_location: "San Francisco, CA", careers_url: "vercel.com/careers", description: "Frontend cloud platform for web developers.", open_roles: 42, change_7d: 2, change_30d: 5, func_breakdown: { eng: 24, gtm: 12, ops: 6, exec: 0 }, last_successful_scrape: "2026-02-15T06:00:00Z", investors: ["Accel", "GV", "Bedrock"], signals: [] },
  { company_id: "c8", name: "Replicate", logo_url: null, stage: "b", sector: "AI Infra", hq_location: "San Francisco, CA", careers_url: "replicate.com/careers", description: "Platform for running open-source ML models in the cloud.", open_roles: 14, change_7d: 0, change_30d: -3, func_breakdown: { eng: 10, gtm: 3, ops: 1, exec: 0 }, last_successful_scrape: "2026-02-15T06:00:00Z", investors: ["a16z", "Y Combinator"], signals: [] },
  { company_id: "c9", name: "Coda", logo_url: null, stage: "d", sector: "Productivity", hq_location: "San Francisco, CA", careers_url: "coda.io/careers", description: "All-in-one doc for teams that blends docs, spreadsheets, and apps.", open_roles: 6, change_7d: -2, change_30d: -9, func_breakdown: { eng: 4, gtm: 1, ops: 1, exec: 0 }, last_successful_scrape: "2026-02-15T06:00:00Z", investors: ["Greylock", "GV", "Khosla"], signals: [] },
  { company_id: "c10", name: "Mutiny", logo_url: null, stage: "c", sector: "MarTech", hq_location: "San Francisco, CA", careers_url: "mutinyhq.com/careers", description: "AI-powered website personalization for B2B revenue teams.", open_roles: 16, change_7d: 4, change_30d: 7, func_breakdown: { eng: 6, gtm: 8, ops: 2, exec: 0 }, last_successful_scrape: "2026-02-15T06:00:00Z", investors: ["Sequoia", "Tiger Global"], signals: [{ type: "new_geo", label: "New geo: London", variant: "info" }] },
];

export const MOCK_ROLES: Record<string, Job[]> = {
  c1: [
    { id: "j1", title: "Senior Backend Engineer", location: "NYC", function_bucket: "eng", seniority_level: "senior", first_seen_at: "2026-02-13T00:00:00Z", is_new: true, is_remote: false },
    { id: "j2", title: "Staff Platform Engineer", location: "NYC", function_bucket: "eng", seniority_level: "staff", first_seen_at: "2026-02-12T00:00:00Z", is_new: true, is_remote: false },
    { id: "j3", title: "ML Engineer, Risk", location: "NYC", function_bucket: "eng", seniority_level: "senior", first_seen_at: "2026-02-10T00:00:00Z", is_new: true, is_remote: false },
    { id: "j4", title: "Senior Frontend Engineer", location: "Remote", function_bucket: "eng", seniority_level: "senior", first_seen_at: "2026-02-03T00:00:00Z", is_new: false, is_remote: true },
    { id: "j5", title: "Engineering Manager, Payments", location: "NYC", function_bucket: "eng", seniority_level: "manager", first_seen_at: "2026-02-01T00:00:00Z", is_new: false, is_remote: false },
    { id: "j6", title: "Enterprise Account Executive", location: "NYC", function_bucket: "gtm", seniority_level: "senior", first_seen_at: "2026-02-14T00:00:00Z", is_new: true, is_remote: false },
    { id: "j7", title: "Sr Product Marketing Manager", location: "NYC", function_bucket: "gtm", seniority_level: "senior", first_seen_at: "2026-02-13T00:00:00Z", is_new: true, is_remote: false },
    { id: "j8", title: "Account Executive, Mid-Market", location: "SF", function_bucket: "gtm", seniority_level: "mid", first_seen_at: "2026-02-06T00:00:00Z", is_new: false, is_remote: false },
    { id: "j9", title: "SDR, Enterprise", location: "Remote", function_bucket: "gtm", seniority_level: "entry", first_seen_at: "2026-02-04T00:00:00Z", is_new: false, is_remote: true },
    { id: "j10", title: "Head of People Operations", location: "NYC", function_bucket: "ops", seniority_level: "director", first_seen_at: "2026-02-11T00:00:00Z", is_new: true, is_remote: false },
    { id: "j11", title: "Senior Financial Analyst", location: "NYC", function_bucket: "ops", seniority_level: "senior", first_seen_at: "2026-02-04T00:00:00Z", is_new: false, is_remote: false },
    { id: "j12", title: "VP of Engineering", location: "NYC", function_bucket: "exec", seniority_level: "vp", first_seen_at: "2026-02-10T00:00:00Z", is_new: true, is_remote: false },
    { id: "j13", title: "VP of Sales, Enterprise", location: "NYC", function_bucket: "exec", seniority_level: "vp", first_seen_at: "2026-01-28T00:00:00Z", is_new: false, is_remote: false },
    { id: "j14", title: "Chief of Staff", location: "NYC", function_bucket: "exec", seniority_level: "director", first_seen_at: "2026-01-24T00:00:00Z", is_new: false, is_remote: false },
  ],
  c7: [],
  c3: [
    { id: "j20", title: "Senior Full-Stack Engineer", location: "SF", function_bucket: "eng", seniority_level: "senior", first_seen_at: "2026-02-12T00:00:00Z", is_new: true, is_remote: false },
    { id: "j21", title: "Backend Engineer, Data Pipeline", location: "Remote", function_bucket: "eng", seniority_level: "mid", first_seen_at: "2026-02-12T00:00:00Z", is_new: true, is_remote: true },
    { id: "j22", title: "Staff Engineer, Carbon Accounting", location: "SF", function_bucket: "eng", seniority_level: "staff", first_seen_at: "2026-02-11T00:00:00Z", is_new: true, is_remote: false },
    { id: "j23", title: "Enterprise Account Executive", location: "SF", function_bucket: "gtm", seniority_level: "senior", first_seen_at: "2026-02-11T00:00:00Z", is_new: true, is_remote: false },
    { id: "j24", title: "Customer Success Manager", location: "Distributed", function_bucket: "gtm", seniority_level: "mid", first_seen_at: "2026-02-11T00:00:00Z", is_new: true, is_remote: true },
    { id: "j25", title: "Head of Finance", location: "SF", function_bucket: "ops", seniority_level: "director", first_seen_at: "2026-02-12T00:00:00Z", is_new: true, is_remote: false },
  ],
};
