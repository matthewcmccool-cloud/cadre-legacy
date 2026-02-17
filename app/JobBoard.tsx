"use client";

import { useState, useMemo } from "react";
import type { JobListing } from "@/lib/airtable";

const ACCENT_COLORS = ["#EA4335", "#4285F4", "#FBBC04", "#34A853"] as const;
const PAGE_SIZE = 25;

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

function CompanyInitial({ name }: { name: string }) {
  return (
    <div
      className="flex items-center justify-center shrink-0 rounded bg-cadre-border text-cadre-secondary"
      style={{ width: 24, height: 24, fontSize: 11, fontWeight: 600 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function InvestorChips({ investors }: { investors: string[] }) {
  if (!investors.length) return null;
  const visible = investors.slice(0, 3);
  const extra = investors.length - 3;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {visible.map((inv) => {
        const bg = getInvestorColor(inv);
        const textColor = bg === "#FBBC04" ? "#1A1A1A" : "#FFFFFF";
        return (
          <span
            key={inv}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight"
            style={{ backgroundColor: bg, color: textColor }}
          >
            {inv}
          </span>
        );
      })}
      {extra > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight bg-cadre-border text-cadre-secondary">
          +{extra}
        </span>
      )}
    </div>
  );
}

function DepartmentBadge({ department }: { department: string }) {
  if (!department) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight border border-cadre-border text-cadre-secondary">
      {department}
    </span>
  );
}

export default function JobBoard({
  initialJobs,
  totalJobs,
}: {
  initialJobs: JobListing[];
  totalJobs: number;
}) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Extract unique values for filters
  const departments = useMemo(() => {
    const set = new Set(initialJobs.map((j) => j.department).filter(Boolean));
    return Array.from(set).sort();
  }, [initialJobs]);

  const locations = useMemo(() => {
    const set = new Set(
      initialJobs
        .map((j) => {
          if (!j.location) return "";
          // Normalize to city-level
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

    if (department) {
      result = result.filter((j) => j.department === department);
    }

    if (location) {
      result = result.filter((j) => j.location.split(",")[0].trim() === location);
    }

    if (remote === "remote") {
      result = result.filter((j) => j.isRemote);
    } else if (remote === "onsite") {
      result = result.filter((j) => !j.isRemote);
    }

    return result;
  }, [initialJobs, search, department, location, remote]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6">
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
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          className="w-full px-4 py-2.5 text-sm bg-white border border-cadre-border text-cadre-text placeholder-cadre-secondary outline-none focus:border-cadre-text transition-colors"
        />
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 pb-4">
        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          className="px-3 py-1.5 text-xs bg-cadre-bg border border-cadre-border text-cadre-text rounded-none appearance-none cursor-pointer outline-none"
        >
          <option value="">Department</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          className="px-3 py-1.5 text-xs bg-cadre-bg border border-cadre-border text-cadre-text rounded-none appearance-none cursor-pointer outline-none"
        >
          <option value="">Location</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={remote}
          onChange={(e) => {
            setRemote(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          className="px-3 py-1.5 text-xs bg-cadre-bg border border-cadre-border text-cadre-text rounded-none appearance-none cursor-pointer outline-none"
        >
          <option value="">Remote</option>
          <option value="remote">Remote only</option>
          <option value="onsite">On-site only</option>
        </select>

        {(search || department || location || remote) && (
          <button
            onClick={() => {
              setSearch("");
              setDepartment("");
              setLocation("");
              setRemote("");
              setVisibleCount(PAGE_SIZE);
            }}
            className="px-3 py-1.5 text-xs text-cadre-secondary hover:text-cadre-text transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* JOB LIST */}
      <div>
        {visible.map((job) => (
          <a
            key={job.id}
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block border-b border-cadre-border py-4 px-2 hover:bg-cadre-hover transition-colors -mx-2"
          >
            <div className="flex items-start gap-3">
              <CompanyInitial name={job.company} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="font-semibold text-sm text-cadre-text">
                    {job.title}
                  </span>
                  <span className="text-sm text-cadre-secondary">
                    {job.company}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                  {job.location && (
                    <span className="text-xs text-cadre-secondary">
                      {job.location}
                    </span>
                  )}
                  <DepartmentBadge department={job.department} />
                  <span className="text-xs text-cadre-secondary">
                    {timeAgo(job.postedDate)}
                  </span>
                </div>
                <InvestorChips investors={job.investors} />
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* FOOTER OF LIST */}
      <div className="py-6 text-center">
        <p className="text-xs text-cadre-secondary mb-2">
          Showing {visible.length} of {filtered.length} roles
          {filtered.length !== totalJobs && ` (${totalJobs} total)`}
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

      {/* FOOTER */}
      <footer className="py-6 text-center border-t border-cadre-border">
        <span className="text-xs text-cadre-secondary">CADRE &middot; 2026</span>
      </footer>
    </div>
  );
}
