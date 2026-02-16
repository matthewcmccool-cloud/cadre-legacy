"use client";

import { ShimmerBlock } from "@/components/shared/shimmer-block";

export function PulseSkeleton({ rows = 6 }: { rows?: number }) {
  const widths = [
    [120, 52, 52, 28, 28, 28, 140, 80, 160],
    [95, 52, 52, 28, 28, 28, 120, 0, 140],
    [110, 52, 52, 28, 28, 28, 140, 68, 155],
    [120, 52, 52, 28, 28, 28, 130, 0, 130],
    [85, 52, 52, 28, 28, 28, 140, 80, 160],
    [100, 52, 52, 28, 28, 28, 115, 0, 130],
    [110, 52, 52, 28, 28, 28, 125, 68, 145],
    [95, 52, 52, 28, 28, 28, 140, 0, 155],
  ];

  return (
    <div className="c-table-wrap">
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
        <tbody>
          {widths.slice(0, rows).map((row, ri) => (
            <tr key={ri} style={{ pointerEvents: "none" }}>
              <td>
                <div className="c-co">
                  <ShimmerBlock width={26} height={26} />
                  <ShimmerBlock width={row[0]} height={14} />
                </div>
              </td>
              <td><ShimmerBlock width={row[1]} height={16} /></td>
              <td><ShimmerBlock width={row[2]} height={16} /></td>
              <td className="r"><ShimmerBlock width={row[3]} /></td>
              <td className="r"><ShimmerBlock width={row[4]} /></td>
              <td className="r col-30d"><ShimmerBlock width={row[5]} /></td>
              <td><ShimmerBlock width={row[6]} /></td>
              <td>{row[7] > 0 && <ShimmerBlock width={row[7]} height={16} />}</td>
              <td className="col-notable"><ShimmerBlock width={row[8]} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
