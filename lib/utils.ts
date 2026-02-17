// ═══════════════════════════════════════════════════════════════════════
// Cadre v1 — Utility Functions
// ═══════════════════════════════════════════════════════════════════════

import type { Stage, FunctionBucket, SeniorityLevel, EventType } from "./types";

export const stageLabel = (s: Stage): string => {
  const map: Record<Stage, string> = { seed: "Seed", a: "Series A", b: "Series B", c: "Series C", d: "Series D", public: "Public" };
  return map[s] || s;
};

export const bucketLabel = (b: FunctionBucket): string => {
  const map: Record<FunctionBucket, string> = { eng: "Engineering", gtm: "Go-to-Market", ops: "Operations", exec: "Executive" };
  return map[b];
};

export const seniorityLabel = (s: SeniorityLevel | null): string => {
  if (!s) return "—";
  const map: Record<SeniorityLevel, string> = { entry: "Entry", mid: "Mid", senior: "Senior", staff: "Staff", manager: "Manager", director: "Director", vp: "VP", c_suite: "C-Suite" };
  return map[s] || "—";
};

export const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

export const logoColors: Record<string, { bg: string; fg: string; border: string }> = {
  Ramp: { bg: "#0c2d1f", fg: "#34d399", border: "#1a3d2d" },
  Vanta: { bg: "#2c0f0f", fg: "#f87171", border: "#3d1a1a" },
  Ironclad: { bg: "#1c1a0f", fg: "#f59e0b", border: "#2d2a1a" },
  Watershed: { bg: "#0f1a2c", fg: "#60a5fa", border: "#1a2a3d" },
  Anyscale: { bg: "#1a0f2c", fg: "#a78bfa", border: "#2a1a3d" },
  Makeship: { bg: "#1c1a0f", fg: "#f59e0b", border: "#2a2a1a" },
  Vercel: { bg: "#18181c", fg: "#e8e8ec", border: "#2a2a32" },
  Replicate: { bg: "#18181c", fg: "#8a8a96", border: "#222228" },
  Coda: { bg: "#18181c", fg: "#8a8a96", border: "#222228" },
  Mutiny: { bg: "#1a0f1f", fg: "#c084fc", border: "#2a1a2f" },
};

export const eventIconMap: Record<EventType, { icon: string; variant: string }> = {
  velocity_spike: { icon: "⬆", variant: "pos" },
  zero_roles: { icon: "⬇", variant: "neg" },
  new_department: { icon: "★", variant: "caution" },
  new_exec: { icon: "★", variant: "caution" },
  resumed_hiring: { icon: "↻", variant: "info" },
  new_geo: { icon: "📍", variant: "info" },
  stale_roles: { icon: "—", variant: "muted" },
};
