"use client";

import type { HistoryEvent } from "@/lib/types";

export function HistoryItem({ event }: { event: HistoryEvent }) {
  const barColor =
    event.direction === "up"
      ? "var(--signal-pos)"
      : event.direction === "down"
        ? "var(--signal-neg)"
        : "var(--text-tertiary)";

  // Scale magnitude bar relative to a reasonable max
  const barWidth = Math.max(4, Math.min(44, (event.magnitude / 30) * 44));

  return (
    <div className="c-hist-item">
      <span className="c-hist-time">
        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </span>
      <span className="c-hist-desc">{event.description}</span>
      <div className="c-hist-bar" style={{ width: barWidth, background: barColor }} />
    </div>
  );
}
