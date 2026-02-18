"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { JobListing, CompanyListing, InvestorListing } from "@/lib/airtable";

const ACCENT_COLORS = ["#EA4335", "#4285F4", "#FBBC04", "#34A853"] as const;
const PAGE_SIZE = 25;

type Tab = "jobs" | "companies" | "investors";

// ═══════════════════════════════════════════════════════════════════════
// Utility helpers
// ═══════════════════════════════════════════════════════════════════════

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInvestorColor(name: string): string {
  return ACCENT_COLORS[hashString(name) % ACCENT_COLORS.length];
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getDomain(website: string): string {
  if (!website) return "";
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Company Logo — tries: direct Airtable URL → Google favicon → letter circle
// ═══════════════════════════════════════════════════════════════════════

function CompanyLogo({
  name,
  logoUrl,
  domain,
}: {
  name: string;
  logoUrl?: string;
  domain?: string;
}) {
  const [srcIndex, setSrcIndex] = useState(0);

  const srcs: string[] = [];
  if (logoUrl) srcs.push(logoUrl);
  if (domain) srcs.push(`https://img.logo.dev/${domain}?token=pk_a8CO5glvSNOJpPBxGBm3Iw&size=64&format=png`);
  if (domain) srcs.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);

  const currentSrc = srcs[srcIndex];

  if (!currentSrc) {
    return (
      <div
        className="flex items-center justify-center shrink-0 rounded-full bg-cadre-border text-cadre-secondary"
        style={{ width: 32, height: 32, fontSize: 13, fontWeight: 600 }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={name}
      width={32}
      height={32}
      className="shrink-0 rounded-full object-cover"
      style={{ border: "1px solid #E0E0E0" }}
      onError={() => {
        if (srcIndex < srcs.length - 1) {
          setSrcIndex(srcIndex + 1);
        } else {
          setSrcIndex(srcs.length);
        }
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Investor chips
// ═══════════════════════════════════════════════════════════════════════

function InvestorChips({ investors }: { investors: string[] }) {
  if (!investors.length) return null;
  const visible = investors.slice(0, 3);
  const extra = investors.length - 3;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((inv) => {
        const bg = getInvestorColor(inv);
        const textColor = bg === "#FBBC04" ? "#1A1A1A" : "#FFFFFF";
        return (
          <span
            key={inv}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight whitespace-nowrap"
            style={{ backgroundColor: bg, color: textColor }}
          >
            {inv}
          </span>
        );
      })}
      {extra > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight bg-cadre-border text-cadre-secondary whitespace-nowrap">
          +{extra}
        </span>
      )}
    </div>
  );
}

function DepartmentBadge({ department }: { department: string }) {
  if (!department) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight border border-cadre-border text-cadre-secondary whitespace-nowrap">
      {department}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Custom filter dropdown (replaces native <select>)
// ═══════════════════════════════════════════════════════════════════════

function FilterDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((s) => s !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const displayLabel = selected.length > 0 ? `${label} (${selected.length})` : label;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-cadre-border text-cadre-text cursor-pointer outline-none hover:border-cadre-text transition-colors"
        style={{ minWidth: 100 }}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1L5 5L9 1" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-white border border-cadre-border shadow-lg z-50"
          style={{ minWidth: 220, maxHeight: 280 }}
        >
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-1.5 text-[11px] text-cadre-blue hover:bg-cadre-hover cursor-pointer border-b border-cadre-border"
            >
              Clear selection
            </button>
          )}
          <div className="overflow-y-auto" style={{ maxHeight: 248 }}>
            {options.map((opt) => {
              const isChecked = selected.includes(opt);
              return (
                <div
                  key={opt}
                  onClick={() => toggle(opt)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-cadre-text hover:bg-cadre-hover cursor-pointer"
                >
                  <span
                    className="flex items-center justify-center shrink-0 border rounded-sm"
                    style={{
                      width: 14,
                      height: 14,
                      borderColor: isChecked ? "#4285F4" : "#ccc",
                      backgroundColor: isChecked ? "#4285F4" : "transparent",
                    }}
                  >
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Tab views: Companies & Investors
// ═══════════════════════════════════════════════════════════════════════

function CompaniesTab({ companies }: { companies: CompanyListing[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-4">
      {companies.map((c) => {
        const domain = getDomain(c.website);
        return (
          <div
            key={c.id}
            className="flex items-start gap-3 p-4 bg-white border border-cadre-border hover:border-cadre-text transition-colors"
          >
            <CompanyLogo name={c.name} logoUrl={c.logoUrl || undefined} domain={domain} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-cadre-text truncate">{c.name}</div>
              <div className="text-xs text-cadre-secondary mt-0.5">
                {[c.industry, c.stage].filter(Boolean).join(" · ")}
              </div>
              {c.jobCount > 0 && (
                <div className="text-xs text-cadre-blue mt-1">
                  {c.jobCount} open {c.jobCount === 1 ? "role" : "roles"}
                </div>
              )}
              {c.investors.length > 0 && (
                <div className="mt-2">
                  <InvestorChips investors={c.investors} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InvestorsTab({ investors }: { investors: InvestorListing[] }) {
  return (
    <div className="py-4">
      {investors.map((inv) => {
        const domain = getDomain(inv.website);
        return (
          <div
            key={inv.id}
            className="flex items-center gap-3 py-3 px-2 border-b border-cadre-border hover:bg-cadre-hover transition-colors -mx-2"
          >
            <CompanyLogo name={inv.name} logoUrl={inv.logoUrl || undefined} domain={domain} />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm text-cadre-text">{inv.name}</span>
              {inv.type && (
                <span className="text-xs text-cadre-secondary ml-2">{inv.type}</span>
              )}
            </div>
            <div className="text-xs text-cadre-secondary text-right whitespace-nowrap">
              {inv.portfolioCount} {inv.portfolioCount === 1 ? "company" : "companies"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Main JobBoard component
// ═══════════════════════════════════════════════════════════════════════

export default function JobBoard({
  initialJobs,
  totalJobs,
  companies,
  totalCompanies,
  investors,
  totalInvestors,
  companyDomains,
  companyLogos,
  departments,
  locations,
}: {
  initialJobs: JobListing[];
  totalJobs: number;
  companies: CompanyListing[];
  totalCompanies: number;
  investors: InvestorListing[];
  totalInvestors: number;
  companyDomains: Record<string, string>;
  companyLogos: Record<string, string>;
  departments: string[];
  locations: string[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("jobs");
  const [search, setSearch] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [remote, setRemote] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Jobs state: starts with server-rendered initial jobs, updated by API
  const [jobs, setJobs] = useState<JobListing[]>(initialJobs);
  const [filteredTotal, setFilteredTotal] = useState(totalJobs);
  const [isFiltering, setIsFiltering] = useState(false);

  // Track whether any filter is active
  const hasFilters = search || selectedDepartments.length > 0 || selectedLocations.length > 0 || remote;

  // Debounce timer ref for search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch filtered jobs from API route
  const fetchFromAPI = useCallback(async (params: {
    search: string;
    departments: string[];
    locations: string[];
    remote: string;
  }) => {
    // If no filters, revert to initial server-rendered jobs
    if (!params.search && params.departments.length === 0 && params.locations.length === 0 && !params.remote) {
      setJobs(initialJobs);
      setFilteredTotal(totalJobs);
      setIsFiltering(false);
      return;
    }

    setIsFiltering(true);
    try {
      const url = new URL("/api/jobs", window.location.origin);
      if (params.search) url.searchParams.set("search", params.search);
      if (params.departments.length > 0) url.searchParams.set("departments", params.departments.join(","));
      if (params.locations.length > 0) url.searchParams.set("locations", params.locations.join(","));
      if (params.remote) url.searchParams.set("remote", params.remote);

      const res = await fetch(url.toString());
      const text = await res.text();
      const data = JSON.parse(text);

      if (data.jobs) {
        setJobs(data.jobs);
        setFilteredTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch filtered jobs:", err);
    } finally {
      setIsFiltering(false);
    }
  }, [initialJobs, totalJobs]);

  // Trigger API fetch when filters change (debounced for search)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchFromAPI({
        search,
        departments: selectedDepartments,
        locations: selectedLocations,
        remote,
      });
      setVisibleCount(PAGE_SIZE);
    }, search ? 300 : 0); // debounce search input, immediate for dropdowns

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, selectedDepartments, selectedLocations, remote, fetchFromAPI]);

  const visible = jobs.slice(0, visibleCount);
  const hasMore = visibleCount < jobs.length;

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setRemote("");
    setVisibleCount(PAGE_SIZE);
  }, []);

  const getJobLogo = useCallback(
    (job: JobListing) => {
      const logoUrl = companyLogos[job.company] || undefined;
      const domain = companyDomains[job.company] || (job.companyWebsite ? getDomain(job.companyWebsite) : "");
      return { logoUrl, domain };
    },
    [companyDomains, companyLogos]
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "jobs", label: "Jobs", count: totalJobs },
    { key: "companies", label: "Companies", count: totalCompanies },
    { key: "investors", label: "Investors", count: totalInvestors },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
      {/* HEADER */}
      <header className="py-4 border-b border-cadre-border">
        <span className="font-heading font-bold text-cadre-text text-lg tracking-tight uppercase">
          CADRE
        </span>
      </header>

      {/* SEARCH */}
      <div className="py-4">
        <input
          type="text"
          placeholder="Search roles, companies, skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-white border border-cadre-border text-cadre-text placeholder-cadre-secondary outline-none focus:border-cadre-text transition-colors"
        />
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-2 pb-4">
        <FilterDropdown
          label="Department"
          options={departments}
          selected={selectedDepartments}
          onChange={setSelectedDepartments}
        />

        <FilterDropdown
          label="Location"
          options={locations}
          selected={selectedLocations}
          onChange={setSelectedLocations}
        />

        {/* Remote filter stays simple — single choice */}
        <div className="relative">
          <button
            onClick={() => setRemote(remote === "" ? "remote" : remote === "remote" ? "onsite" : "")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border cursor-pointer outline-none transition-colors"
            style={{
              backgroundColor: remote ? "#4285F4" : "white",
              borderColor: remote ? "#4285F4" : "#E0E0E0",
              color: remote ? "white" : "#1A1A1A",
            }}
          >
            {remote === "remote" ? "Remote" : remote === "onsite" ? "On-site" : "Remote / On-site"}
          </button>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-xs text-cadre-secondary hover:text-cadre-text transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        )}

        {isFiltering && (
          <span className="text-xs text-cadre-secondary animate-pulse">Loading…</span>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b border-cadre-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="pb-2 text-sm cursor-pointer transition-colors outline-none"
            style={{
              color: activeTab === tab.key ? "#1A1A1A" : "#666666",
              fontWeight: activeTab === tab.key ? 600 : 400,
              borderBottom: activeTab === tab.key ? "2px solid #4285F4" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {tab.label}{" "}
            <span
              className="text-xs"
              style={{ color: activeTab === tab.key ? "#666666" : "#999999" }}
            >
              ({tab.count.toLocaleString()})
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "jobs" && (
        <>
          {/* JOB LIST — horizontal spread layout */}
          <div>
            {visible.map((job) => {
              const { logoUrl, domain } = getJobLogo(job);
              return (
                <a
                  key={job.id}
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid items-center gap-x-4 border-b border-cadre-border py-3 px-2 hover:bg-cadre-hover transition-colors -mx-2"
                  style={{
                    gridTemplateColumns: "32px minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.5fr) auto",
                  }}
                >
                  {/* Col 1: Logo */}
                  <CompanyLogo name={job.company} logoUrl={logoUrl} domain={domain} />

                  {/* Col 2: Title + Company */}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-cadre-text truncate">
                      {job.title}
                    </div>
                    <div className="text-xs text-cadre-secondary truncate">
                      {job.company}
                    </div>
                  </div>

                  {/* Col 3: Location + Department */}
                  <div className="min-w-0 flex flex-col items-start gap-1">
                    {job.location && (
                      <span className="text-xs text-cadre-secondary truncate max-w-full">
                        {job.location}
                      </span>
                    )}
                    <DepartmentBadge department={job.department} />
                  </div>

                  {/* Col 4: Investor chips */}
                  <div className="min-w-0">
                    <InvestorChips investors={job.investors} />
                  </div>

                  {/* Col 5: Date */}
                  <div className="text-xs text-cadre-secondary whitespace-nowrap text-right">
                    {timeAgo(job.postedDate)}
                  </div>
                </a>
              );
            })}
          </div>

          {/* FOOTER OF LIST */}
          <div className="py-6 text-center">
            <p className="text-xs text-cadre-secondary mb-2">
              Showing {visible.length} of {filteredTotal} roles
              {hasFilters && filteredTotal !== totalJobs && ` (${totalJobs.toLocaleString()} total)`}
            </p>
            {hasMore && (
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="text-sm text-cadre-secondary hover:text-cadre-text transition-colors underline cursor-pointer"
              >
                Load more
              </button>
            )}
          </div>
        </>
      )}

      {activeTab === "companies" && <CompaniesTab companies={companies} />}
      {activeTab === "investors" && <InvestorsTab investors={investors} />}

      {/* FOOTER */}
      <footer className="py-6 text-center border-t border-cadre-border">
        <span className="text-xs text-cadre-secondary">CADRE &middot; 2026</span>
      </footer>
    </div>
  );
}
