"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CompanyPulse } from "@/lib/types";
import { PulseRow } from "./pulse-row";
import { PulseSkeleton } from "./pulse-skeleton";

interface PulseTableProps {
  companies: CompanyPulse[];
  loading?: boolean;
  onRowClick: (id: string) => void;
}

export function PulseTable({ companies, loading, onRowClick }: PulseTableProps) {
  const [focusIdx, setFocusIdx] = useState(-1);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  const sorted = [...companies].sort(
    (a, b) => Math.abs(b.change_7d ?? 0) - Math.abs(a.change_7d ?? 0),
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 1, sorted.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && focusIdx >= 0) {
        onRowClick(sorted[focusIdx].company_id);
      } else if (e.key === "Escape") {
        setFocusIdx(-1);
      }
    },
    [focusIdx, sorted, onRowClick],
  );

  useEffect(() => {
    if (focusIdx >= 0 && tbodyRef.current) {
      const row = tbodyRef.current.children[focusIdx] as HTMLElement;
      row?.focus();
    }
  }, [focusIdx]);

  if (loading) return <PulseSkeleton />;

  return (
    <div className="c-table-wrap" onKeyDown={handleKeyDown}>
      <table className="c-table">
        <thead>
          <tr>
            <th style={{ width: 180 }}>Company</th>
            <th>Stage</th>
            <th>Sector</th>
            <th className="r">Open</th>
            <th className="r">7d Δ</th>
            <th className="r col-30d">30d Δ</th>
            <th>Functional Mix</th>
            <th>Signals</th>
            <th className="col-notable">Last Notable</th>
          </tr>
        </thead>
        <tbody ref={tbodyRef}>
          {sorted.map((co, idx) => (
            <PulseRow
              key={co.company_id}
              company={co}
              focused={focusIdx === idx}
              onClick={() => onRowClick(co.company_id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
