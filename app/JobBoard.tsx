"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { JobListing, CompanyListing, InvestorListing } from "@/lib/airtable";
import { Logo } from "@/components/Logo";

const PAGE_SIZE = 25;

type Tab = "jobs" | "companies" | "investors";

// ═══════════════════════════════════════════════════════════════════════
// Utility helpers
// ═══════════════════════════════════════════════════════════════════════

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
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

/** Check if a role was posted within the last 48 hours */
function isNewRole(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return Date.now() - d.getTime() < 48 * 60 * 60 * 1000;
}

// ═══════════════════════════════════════════════════════════════════════
// Company Logo — tries: direct Airtable URL → logo.dev → Google favicon → letter circle
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
        className="flex items-center justify-center shrink-0 rounded-full bg-bg-elevated text-cadre-secondary"
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
      style={{ border: "1px solid var(--border-default)" }}
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
// Investor chips — uniform green outline style
// ═══════════════════════════════════════════════════════════════════════

function InvestorChips({ investors }: { investors: string[] }) {
  if (!investors.length) return null;
  const visible = investors.slice(0, 3);
  const extra = investors.length - 3;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((inv) => (
        <span
          key={inv}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-normal border border-brand-green text-white whitespace-nowrap cursor-pointer hover:bg-brand-green-dim transition-colors duration-150"
        >
          {inv}
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-normal border border-brand-green text-white whitespace-nowrap cursor-pointer hover:bg-brand-green-dim transition-colors duration-150">
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
// Custom filter dropdown — dark pill style with green accents
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

  const hasSelection = selected.length > 0;
  const displayLabel = hasSelection ? `${label} (${selected.length})` : label;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border cursor-pointer outline-none transition-all duration-200 ${
          hasSelection
            ? "bg-brand-green-dim border-brand-green text-brand-green"
            : "bg-bg-surface border-cadre-border text-cadre-secondary hover:border-brand-green hover:text-white"
        }`}
        style={{ minWidth: 100 }}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-bg-elevated border border-cadre-border shadow-lg z-50 rounded-lg"
          style={{ minWidth: 220, maxHeight: 280 }}
        >
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-1.5 text-[11px] text-brand-green hover:bg-bg-hover cursor-pointer border-b border-cadre-border"
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
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-cadre-text hover:bg-bg-hover cursor-pointer transition-colors duration-150"
                >
                  <span
                    className="flex items-center justify-center shrink-0 border rounded-sm"
                    style={{
                      width: 14,
                      height: 14,
                      borderColor: isChecked ? "var(--brand-green)" : "var(--border-default)",
                      backgroundColor: isChecked ? "var(--brand-green)" : "transparent",
                    }}
                  >
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="var(--text-inverse)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className={`truncate ${isChecked ? "text-brand-green" : ""}`}>{opt}</span>
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
            className="flex items-start gap-3 p-4 bg-bg-surface border border-cadre-border rounded-lg hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:border-brand-green transition-all duration-200 cursor-pointer"
          >
            <CompanyLogo name={c.name} logoUrl={c.logoUrl || undefined} domain={domain} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-white truncate">{c.name}</div>
              <div className="text-xs text-cadre-secondary mt-0.5">
                {[c.industry, c.stage].filter(Boolean).join(" · ")}
              </div>
              {c.jobCount > 0 && (
                <div className="text-xs text-brand-green mt-1 cursor-pointer hover:brightness-110">
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
  const visible = investors.filter((inv) => inv.portfolioCount > 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-4">
      {visible.map((inv) => {
        const domain = getDomain(inv.website);
        return (
          <div
            key={inv.id}
            className="flex items-center gap-3 p-4 bg-bg-surface border border-cadre-border rounded-lg hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:border-brand-green transition-all duration-200 cursor-pointer"
          >
            <CompanyLogo name={inv.name} logoUrl={inv.logoUrl || undefined} domain={domain} />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm text-white">{inv.name}</span>
              {inv.type && (
                <div className="text-xs text-cadre-secondary mt-0.5">{inv.type}</div>
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
}: {
  initialJobs: JobListing[];
  totalJobs: number;
  companies: CompanyListing[];
  totalCompanies: number;
  investors: InvestorListing[];
  totalInvestors: number;
  companyDomains: Record<string, string>;
  companyLogos: Record<string, string>;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("jobs");
  const [search, setSearch] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [remote, setRemote] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const departments = useMemo(() => {
    const set = new Set(initialJobs.map((j) => j.department).filter(Boolean));
    return Array.from(set).sort();
  }, [initialJobs]);

  const locations = useMemo(() => {
    const set = new Set(
      initialJobs
        .map((j) => {
          if (!j.location) return "";
          const parts = j.location.split(",");
          return parts[0].trim();
        })
        .filter((l) => l && l.toLowerCase() !== "remote")
    );
    return Array.from(set).sort();
  }, [initialJobs]);

  // Filter jobs
  const filtered = useMemo(() => {
    let result = initialJobs;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q) ||
          j.investors.some((inv) => inv.toLowerCase().includes(q))
      );
    }

    if (selectedDepartments.length > 0) {
      result = result.filter((j) => selectedDepartments.includes(j.department));
    }

    if (selectedLocations.length > 0) {
      result = result.filter((j) => selectedLocations.includes(j.location.split(",")[0].trim()));
    }

    if (remote === "remote") {
      result = result.filter((j) => j.isRemote);
    } else if (remote === "onsite") {
      result = result.filter((j) => !j.isRemote);
    }

    return result;
  }, [initialJobs, search, selectedDepartments, selectedLocations, remote]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const hasFilters = search || selectedDepartments.length > 0 || selectedLocations.length > 0 || remote;

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
        <Logo size="md" />
        <h2 className="text-brand-green text-sm font-medium mt-2 tracking-wide">
          Jobs at the world&apos;s elite technology companies
        </h2>
      </header>

      {/* SEARCH */}
      <div className="py-4">
        <input
          type="text"
          placeholder="Search roles, companies, skills..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          className="w-full px-4 py-2.5 text-sm bg-bg-elevated border border-cadre-border text-white placeholder-cadre-muted rounded-md outline-none focus:border-brand-green transition-all duration-200"
          style={{ boxShadow: search ? "0 0 0 2px var(--brand-green-dim)" : "none" }}
        />
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-2 pb-4">
        <FilterDropdown
          label="Department"
          options={departments}
          selected={selectedDepartments}
          onChange={(v) => {
            setSelectedDepartments(v);
            setVisibleCount(PAGE_SIZE);
          }}
        />

        <FilterDropdown
          label="Location"
          options={locations}
          selected={selectedLocations}
          onChange={(v) => {
            setSelectedLocations(v);
            setVisibleCount(PAGE_SIZE);
          }}
        />

        {/* Remote filter — cycles: off → remote → onsite → off */}
        <button
          onClick={() => setRemote(remote === "" ? "remote" : remote === "remote" ? "onsite" : "")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border cursor-pointer outline-none transition-all duration-200 ${
            remote
              ? "bg-brand-green text-black border-brand-green font-semibold"
              : "bg-bg-surface border-cadre-border text-cadre-secondary hover:border-brand-green hover:text-white"
          }`}
        >
          {remote === "remote" ? "Remote" : remote === "onsite" ? "On-site" : "Remote / On-site"}
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-xs text-cadre-secondary hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* TABS — animated green underline */}
      <div className="flex gap-6 border-b border-cadre-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-underline pb-2 text-sm cursor-pointer outline-none transition-colors duration-200 ${
              activeTab === tab.key
                ? "active text-white font-semibold"
                : "text-cadre-secondary font-normal"
            }`}
            style={{ marginBottom: -1 }}
          >
            {tab.label}{" "}
            <span className="text-xs text-cadre-muted">
              ({tab.count.toLocaleString()})
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "jobs" && (
        <>
          {/* JOB LIST — card style */}
          <div className="flex flex-col gap-2 pt-4">
            {visible.map((job) => {
              const { logoUrl, domain } = getJobLogo(job);
              const isNew = isNewRole(job.postedDate);
              return (
                <a
                  key={job.id}
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid items-center gap-x-4 bg-bg-surface border border-cadre-border rounded-lg py-3 px-4 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:border-brand-green transition-all duration-200 cursor-pointer"
                  style={{
                    gridTemplateColumns: "32px minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.5fr) auto",
                  }}
                >
                  {/* Col 1: Logo */}
                  <CompanyLogo name={job.company} logoUrl={logoUrl} domain={domain} />

                  {/* Col 2: Title + Company */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white truncate">
                        {job.title}
                      </span>
                      {isNew && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-brand-green text-black whitespace-nowrap leading-tight">
                          New
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-cadre-secondary truncate">
                      {job.company}
                    </div>
                  </div>

                  {/* Col 3: Location + Department */}
                  <div className="min-w-0 flex flex-col items-start gap-1">
                    {job.location && (
                      <span className="text-xs text-cadre-muted truncate max-w-full">
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
                  <div className="text-xs text-cadre-muted whitespace-nowrap text-right">
                    {timeAgo(job.postedDate)}
                  </div>
                </a>
              );
            })}
          </div>

          {/* FOOTER OF LIST */}
          <div className="py-6 text-center">
            <p className="text-xs text-cadre-secondary mb-2">
              Showing {visible.length} of {filtered.length} roles
              {hasFilters && filtered.length !== totalJobs && ` (${totalJobs.toLocaleString()} total)`}
            </p>
            {hasMore && (
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="text-sm text-brand-green hover:brightness-110 transition-all duration-150 cursor-pointer underline"
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
