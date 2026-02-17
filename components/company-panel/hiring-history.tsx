"use client";

import type { HistoryEvent } from "@/lib/types";
import { HistoryItem } from "./history-item";

interface HiringHistoryProps {
  events: HistoryEvent[];
  trackingSince: string | null;
}

export function HiringHistory({ events, trackingSince }: HiringHistoryProps) {
  // If less than 3 weeks of data, show tracking message
  if (events.length === 0) {
    return (
      <div className="c-section">
        <div className="c-section-title">Hiring History</div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6 }}>
          Tracking since {trackingSince || "recently"}.
          History will build over time as daily snapshots accumulate.
        </div>
      </div>
    );
  }

  return (
    <div className="c-section">
      <div className="c-section-title">Hiring History</div>
      {events.slice(0, 4).map((ev) => (
        <HistoryItem key={ev.id} event={ev} />
      ))}
    </div>
  );
}
