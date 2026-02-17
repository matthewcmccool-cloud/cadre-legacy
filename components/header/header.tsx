"use client";

import { FreshnessDot } from "./freshness-dot";

interface HeaderProps {
  workspaceName: string;
  lastUpdated: Date | null;
  isRefreshing?: boolean;
}

function formatTimestamp(lastUpdated: Date | null, isRefreshing?: boolean): string {
  if (isRefreshing) return "Refreshing…";
  if (!lastUpdated) return "—";

  const now = new Date();
  const diffMs = now.getTime() - lastUpdated.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = diffMs / 3600000;

  if (diffHrs < 1) {
    return `Updated ${diffMin} min ago`;
  }
  const timeStr = lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  if (diffHrs < 12) {
    return `Updated ${timeStr}`;
  }
  if (diffHrs < 24) {
    return `Updated yesterday, ${timeStr}`;
  }
  const dateStr = lastUpdated.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Last updated ${dateStr} · ${timeStr}`;
}

export function Header({ workspaceName, lastUpdated, isRefreshing }: HeaderProps) {
  return (
    <header className="c-header">
      <div className="c-header-left">
        <div className="c-logo">Cadre</div>
        <div className="c-workspace">{workspaceName}</div>
      </div>
      <div className="c-timestamp">
        <FreshnessDot lastUpdated={lastUpdated || new Date()} isRefreshing={isRefreshing} />
        {formatTimestamp(lastUpdated, isRefreshing)}
      </div>
    </header>
  );
}
