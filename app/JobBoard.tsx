"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
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

/** Generate a slug from a name */
function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
// Investor chips — uniform green outline style with working links
// ═══════════════════════════════════════════════════════════════════════

function InvestorChips({ investors }: { investors: string[] }) {
  if (!investors.length) return null;
  const visible = investors.slice(0, 3);
  const extra = investors.length - 3;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((inv) => (
        <Link
          key={inv}
          href={`/investors/${toSlug(inv)}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-normal border border-brand-green text-white whitespace-nowrap cursor-pointer hover:bg-brand-green-dim transition-colors duration-150"
        >
          {inv}
        </Link>
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-normal border border-brand-green text-white whitespace-nowrap">
          +{extra}
        </span>
      )}
    </div>
  );
}

function FunctionBadge({ func }: { func: string }) {
  if (!func) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight border border-cadre-border text-cadre-secondary whitespace-nowrap">
      {func}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Single-select filter dropdown — dark pill style with green accents
// ═══════════════════════════════════════════════════════════════════════

function SingleSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {

    label: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
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

  const hasSelection = Boolean(selected);
  const displayLabel = hasSelection ? selected : label;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-md border cursor-pointer outline-none transition-all duration-200 ${
          hasSelection
            ? "bg-brand-green-dim border-brand-green text-brand-green"
            : "bg-bg-surface border-cadre-border text-cadre-secondary hover:border-brand-green hover:text-white"
        }`}
        style={{ minWidth: 110 }}
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
          style={{ minWidth: 220, maxHeight: 320 }}
        >
          {hasSelection && (
            <button
              onClick={() => { onChange(""); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] text-brand-green hover:bg-bg-hover cursor-pointer border-b border-cadre-border"
            >
              Clear
            </button>
          )}
          <div className="overflow-y-auto" style={{ maxHeight: 288 }}>
            {options.map((opt) => {
              const isActive = selected === opt;
              return (
                <div
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-bg-hover cursor-pointer transition-colors duration-150 ${
                    isActive ? "text-brand-green" : "text-cadre-text"
                  }`}
                >
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
// Multi-select filter dropdown — checkboxes, green accents
// ═══════════════════════════════════════════════════════════════════════

function MultiSelectDropdown({
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
        className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-md border cursor-pointer outline-none transition-all duration-200 ${
          hasSelection
            ? "bg-brand-green-dim border-brand-green text-brand-green"
            : "bg-bg-surface border-cadre-border text-cadre-secondary hover:border-brand-green hover:text-white"
        }`}
        style={{ minWidth: 110 }}
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
          style={{ minWidth: 260, maxHeight: 320 }}
        >
          {hasSelection && (
            <button
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-1.5 text-[11px] text-brand-green hover:bg-bg-hover cursor-pointer border-b border-cadre-border"
            >
              Clear selection
            </button>
          )}
          <div className="overflow-y-auto" style={{ maxHeight: 288 }}>
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
// Active Filter Chips — removable pills showing applied filters
// ═══════════════════════════════════════════════════════════════════════

function ActiveFilterChips({
  search,
  selectedFunction,
  selectedIndustries,
  selectedLocation,
  remote,
  onClearSearch,
  onClearFunction,
  onRemoveIndustry,
  onClearLocation,
  onClearRemote,
}: {
  search: string;
  selectedFunction: string;
  selectedIndustries: string[];
  selectedLocation: string;
  remote: boolean;
  onClearSearch: () => void;
  onClearFunction: () => void;
  onRemoveIndustry: (industry: string) => void;
  onClearLocation: () => void;
  onClearRemote: () => void;
}) {
  const hasAny = search || selectedFunction || selectedIndustries.length > 0 || selectedLocation || remote;
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-3">
      {search && (
        <FilterChip label={`Search: "${search}"`} onRemove={onClearSearch} />
      )}
      {selectedFunction && (
        <FilterChip label={`Function: ${selectedFunction}`} onRemove={onClearFunction} />
      )}
      {selectedIndustries.map((ind) => (
        <FilterChip key={ind} label={`Industry: ${ind}`} onRemove={() => onRemoveIndustry(ind)} />
      ))}
      {selectedLocation && (
        <FilterChip label={`Location: ${selectedLocation}`} onRemove={onClearLocation} />
      )}
      {remote && (
        <FilterChip label="Remote" onRemove={onClearRemote} />
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-bg-elevated text-cadre-secondary border border-cadre-border">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 text-cadre-muted hover:text-white cursor-pointer transition-colors"
        aria-label={`Remove ${label}`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Tab views: Companies & Investors (with working links)
// ═══════════════════════════════════════════════════════════════════════

function CompaniesTab({
  companies,
  companyDomains,
  companyLogos,
}: {
  companies: CompanyListing[];
  companyDomains: Record<string, string>;
  companyLogos: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-4">
      {companies.map((c) => {
        const domain = companyDomains[c.name] || getDomain(c.website);
        const logoUrl = companyLogos[c.name] || c.logoUrl || undefined;
        return (
          <Link
            key={c.id}
            href={`/companies/${c.slug}`}
            className="flex items-start gap-3 p-4 bg-bg-surface border border-cadre-border rounded-lg hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:border-brand-green transition-all duration-200 cursor-pointer"
          >
            <CompanyLogo name={c.name} logoUrl={logoUrl} domain={domain} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-white truncate">{c.name}</div>
              <div className="text-xs text-cadre-secondary mt-0.5">
                {[c.industry, c.stage].filter(Boolean).join(" · ")}
              </div>
              {c.jobCount > 0 && (
                <div className="text-xs text-brand-green mt-1">
                  {c.jobCount} open {c.jobCount === 1 ? "role" : "roles"}
                </div>
              )}
              {c.investors.length > 0 && (
                <div className="mt-2">
                  <InvestorChips investors={c.investors} />
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function InvestorsTab({ investors }: { investors: InvestorListing[] }) {
  const [showAll, setShowAll] = useState(false);
  const withPortfolio = investors.filter((inv) => inv.portfolioCount > 0);
  const visible = showAll ? withPortfolio : withPortfolio.slice(0, 20);

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((inv) => {
          const domain = getDomain(inv.website);
          const logoSrc = inv.logoUrl || undefined;
          return (
            <Link
              key={inv.id}
              href={`/investors/${inv.slug}`}
              className="flex items-center gap-3 p-4 bg-bg-surface border border-cadre-border rounded-lg hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:border-brand-green transition-all duration-200 cursor-pointer"
            >
              <CompanyLogo name={inv.name} logoUrl={logoSrc} domain={domain} />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm text-white">{inv.name}</span>
                {inv.type && (
                  <div className="text-xs text-cadre-secondary mt-0.5">{inv.type}</div>
                )}
              </div>
              <div className="text-xs text-cadre-secondary text-right whitespace-nowrap">
                {inv.portfolioCount} {inv.portfolioCount === 1 ? "company" : "companies"}
              </div>
            </Link>
          );
        })}
      </div>
      {!showAll && withPortfolio.length > 20 && (
        <div className="pt-4 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-brand-green hover:brightness-110 transition-all duration-150 cursor-pointer"
          >
            Show all {withPortfolio.length} investors &rarr;
          </button>
        </div>
      )}
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL search params
  const [activeTab, setActiveTab] = useState<Tab>("jobs");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedFunction, setSelectedFunction] = useState(searchParams.get("function") || "");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(() => {
    const param = searchParams.get("industry") || "";
    return param ? param.split(",").filter(Boolean) : [];
  });
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "");
  const [remote, setRemote] = useState(searchParams.get("remote") === "true");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search for URL sync
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync filters to URL params (shallow navigation)
  const syncUrlParams = useCallback(
    (overrides: Record<string, string | string[] | undefined> = {}) => {
      const params = new URLSearchParams();
      const s = overrides.search !== undefined ? overrides.search as string : search;
      const fn = overrides.function !== undefined ? overrides.function as string : selectedFunction;
      const ind = overrides.industry !== undefined ? overrides.industry as string[] : selectedIndustries;
      const loc = overrides.location !== undefined ? overrides.location as string : selectedLocation;
      const rem = overrides.remote !== undefined ? overrides.remote === "true" : remote;

      if (s) params.set("search", s);
      if (fn) params.set("function", fn);
      if (ind.length > 0) params.set("industry", ind.map(toSlug).join(","));
      if (loc) params.set("location", loc);
      if (rem) params.set("remote", "true");

      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, search, selectedFunction, selectedIndustries, selectedLocation, remote]
  );

  // Derive filter options from data
  const functions = useMemo(() => {
    const set = new Set(initialJobs.map((j) => j.function).filter(Boolean));
    return Array.from(set).sort();
  }, [initialJobs]);

  const industries = useMemo(() => {
    const set = new Set(initialJobs.map((j) => j.industry).filter(Boolean));
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
          j.company.toLowerCase().includes(q)
      );
    }

    if (selectedFunction) {
      result = result.filter((j) => j.function === selectedFunction);
    }

    if (selectedIndustries.length > 0) {
      result = result.filter((j) => selectedIndustries.includes(j.industry));
    }

    if (selectedLocation) {
      result = result.filter((j) => j.location.split(",")[0].trim() === selectedLocation);
    }

    if (remote) {
      result = result.filter(
        (j) => j.isRemote || /remote|distributed|anywhere|work from home|wfh/i.test(j.location)
      );
    }

    return result;
  }, [initialJobs, search, selectedFunction, selectedIndustries, selectedLocation, remote]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedJobs = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasFilters = search || selectedFunction || selectedIndustries.length > 0 || selectedLocation || remote;

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedFunction("");
    setSelectedIndustries([]);
    setSelectedLocation("");
    setRemote(false);
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const getJobLogo = useCallback(
    (job: JobListing) => {
      const logoUrl = companyLogos[job.company] || undefined;
      const domain = companyDomains[job.company] || (job.companyWebsite ? getDomain(job.companyWebsite) : "");
      return { logoUrl, domain };
    },
    [companyDomains, companyLogos]
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "jobs", label: "Jobs", count: filtered.length },
    { key: "companies", label: "Companies", count: totalCompanies },
    { key: "investors", label: "Investors", count: totalInvestors },
  ];

  // Handler helpers that sync to URL
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setCurrentPage(1);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        syncUrlParams({ search: value });
      }, 300);
    },
    [syncUrlParams]
  );

  const handleFunctionChange = useCallback(
    (value: string) => {
      setSelectedFunction(value);
      setCurrentPage(1);
      syncUrlParams({ function: value });
    },
    [syncUrlParams]
  );

  const handleIndustriesChange = useCallback(
    (values: string[]) => {
      setSelectedIndustries(values);
      setCurrentPage(1);
      syncUrlParams({ industry: values });
    },
    [syncUrlParams]
  );

  const handleRemoveIndustry = useCallback(
    (industry: string) => {
      const next = selectedIndustries.filter((i) => i !== industry);
      setSelectedIndustries(next);
      setCurrentPage(1);
      syncUrlParams({ industry: next });
    },
    [selectedIndustries, syncUrlParams]
  );

  const handleLocationChange = useCallback(
    (value: string) => {
      setSelectedLocation(value);
      setCurrentPage(1);
      syncUrlParams({ location: value });
    },
    [syncUrlParams]
  );

  const handleRemoteToggle = useCallback(() => {
    const next = !remote;
    setRemote(next);
    setCurrentPage(1);
    syncUrlParams({ remote: next ? "true" : "" });
  }, [remote, syncUrlParams]);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
      {/* HEADER */}
      <header className="py-4 border-b border-cadre-border">
        <Logo size="md" />
        <h2 className="text-brand-green text-sm font-medium mt-2 tracking-wide">
          Jobs at the world&apos;s elite technology companies
        </h2>
      </header>

      {/* FILTER BAR — single row, wraps on mobile */}
      <div className="flex flex-wrap items-center gap-2 py-4">
        {/* Search input — full width on mobile, flexible on desktop */}
        <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[200px]">
          <input
            type="text"
            placeholder="Search roles, companies..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-bg-elevated border border-cadre-border text-white placeholder-cadre-muted rounded-md outline-none focus:border-brand-green transition-all duration-200"
            style={{ boxShadow: search ? "0 0 0 2px var(--brand-green-dim)" : "none" }}
          />
        </div>

        {/* Function dropdown */}
        <SingleSelectDropdown
          label="Function"
          options={functions}
          selected={selectedFunction}
          onChange={handleFunctionChange}
        />

        {/* Industry dropdown (multi-select) */}
        <MultiSelectDropdown
          label="Industry"
          options={industries}
          selected={selectedIndustries}
          onChange={handleIndustriesChange}
        />

        {/* Location dropdown */}
        <SingleSelectDropdown
          label="Location"
          options={locations}
          selected={selectedLocation}
          onChange={handleLocationChange}
        />

        {/* Remote toggle */}
        <button
          onClick={handleRemoteToggle}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-md border cursor-pointer outline-none transition-all duration-200 ${
            remote
              ? "bg-brand-green text-black border-brand-green font-semibold"
              : "bg-bg-surface border-cadre-border text-cadre-secondary hover:border-brand-green hover:text-white"
          }`}
        >
          Remote
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-xs text-cadre-secondary hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ACTIVE FILTER CHIPS */}
      <ActiveFilterChips
        search={search}
        selectedFunction={selectedFunction}
        selectedIndustries={selectedIndustries}
        selectedLocation={selectedLocation}
        remote={remote}
        onClearSearch={() => handleSearchChange("")}
        onClearFunction={() => handleFunctionChange("")}
        onRemoveIndustry={handleRemoveIndustry}
        onClearLocation={() => handleLocationChange("")}
        onClearRemote={handleRemoteToggle}
      />

      {/* LIVE JOB COUNT */}
      <div className="pb-3">
        <span className="text-sm font-semibold text-white">
          Jobs
        </span>{" "}
        <span className="text-sm text-cadre-muted">
          ({filtered.length.toLocaleString()})
        </span>
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
            {paginatedJobs.map((job) => {
              const { logoUrl, domain } = getJobLogo(job);
              const isNew = isNewRole(job.postedDate);
              return (
                <a
                  key={job.id}
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-bg-surface border border-cadre-border rounded-lg py-3 px-4 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:border-brand-green transition-all duration-200 cursor-pointer"
                >
                  {/* Desktop: 5-col grid */}
                  <div
                    className="hidden sm:grid items-center gap-x-4"
                    style={{
                      gridTemplateColumns: "32px minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.5fr) auto",
                    }}
                  >
                    <CompanyLogo name={job.company} logoUrl={logoUrl} domain={domain} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white truncate">{job.title}</span>
                        {isNew && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-brand-green text-black whitespace-nowrap leading-tight">New</span>
                        )}
                      </div>
                      <Link href={`/companies/${job.companySlug}`} onClick={(e) => e.stopPropagation()} className="text-xs text-cadre-secondary hover:text-brand-green transition-colors truncate block">{job.company}</Link>
                    </div>
                    <div className="min-w-0 flex flex-col items-start gap-1">
                      {job.location && <span className="text-xs text-cadre-muted truncate max-w-full">{job.location}</span>}
                      <FunctionBadge func={job.function} />
                    </div>
                    <div className="min-w-0"><InvestorChips investors={job.investors} /></div>
                    <div className="text-xs text-cadre-muted whitespace-nowrap text-right">{timeAgo(job.postedDate)}</div>
                  </div>

                  {/* Mobile: stacked layout */}
                  <div className="flex sm:hidden gap-3">
                    <CompanyLogo name={job.company} logoUrl={logoUrl} domain={domain} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-white break-words">{job.title}</span>
                        {isNew && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-brand-green text-black whitespace-nowrap leading-tight shrink-0">New</span>
                        )}
                      </div>
                      <Link href={`/companies/${job.companySlug}`} onClick={(e) => e.stopPropagation()} className="text-xs text-cadre-secondary hover:text-brand-green transition-colors block mt-0.5">{job.company}</Link>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs text-cadre-muted">
                        {job.location && <span>{job.location}</span>}
                        {job.function && <FunctionBadge func={job.function} />}
                        <span>{timeAgo(job.postedDate)}</span>
                      </div>
                      {job.investors.length > 0 && (
                        <div className="mt-2"><InvestorChips investors={job.investors} /></div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6">
            <p className="text-xs text-cadre-secondary">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} roles
              {hasFilters && filtered.length !== totalJobs && ` (${totalJobs.toLocaleString()} total)`}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-3 py-1.5 text-xs rounded-md border border-cadre-border text-cadre-secondary hover:text-white hover:border-brand-green disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
                >
                  Prev
                </button>
                <span className="text-xs text-cadre-secondary">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="px-3 py-1.5 text-xs rounded-md border border-cadre-border text-cadre-secondary hover:text-white hover:border-brand-green disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "companies" && (
        <CompaniesTab
          companies={companies}
          companyDomains={companyDomains}
          companyLogos={companyLogos}
        />
      )}
      {activeTab === "investors" && <InvestorsTab investors={investors} />}

      {/* FOOTER */}
      <footer className="py-6 text-center border-t border-cadre-border">
        <span className="text-xs text-cadre-secondary">CADRE &middot; 2026</span>
      </footer>
    </div>
  );
}
