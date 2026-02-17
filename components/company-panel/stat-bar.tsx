"use client";

import { DeltaValue } from "@/components/shared/delta-value";

interface StatBarProps {
  openRoles: number;
  change7d: number | null;
  change30d: number | null;
}

export function StatBar({ openRoles, change7d, change30d }: StatBarProps) {
  return (
    <div className="c-stats">
      <div className="c-stat">
        <div
          className="c-stat-val"
          style={openRoles === 0 ? { color: "var(--signal-neg)" } : undefined}
        >
          {openRoles}
        </div>
        <div className="c-stat-lbl">Open Roles</div>
      </div>
      <div className="c-stat">
        <div className="c-stat-val">
          <DeltaValue value={change7d} size="lg" />
        </div>
        <div className="c-stat-lbl">7-Day Δ</div>
      </div>
      <div className="c-stat">
        <div className="c-stat-val">
          <DeltaValue value={change30d} size="lg" />
        </div>
        <div className="c-stat-lbl">30-Day Δ</div>
      </div>
    </div>
  );
}
