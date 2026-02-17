"use client";

import type { FuncBreakdown } from "@/lib/types";

export function FuncMix({ breakdown }: { breakdown: FuncBreakdown }) {
  const total = breakdown.eng + breakdown.gtm + breakdown.ops + breakdown.exec;
  if (total === 0)
    return (
      <div className="c-fmix" style={{ color: "var(--text-tertiary)" }}>
        No open roles
      </div>
    );

  return (
    <div className="c-fmix">
      <span>
        <span className="lbl">Eng</span>&nbsp;{breakdown.eng}
      </span>
      <span className="sep">·</span>
      <span>
        <span className="lbl">GTM</span>&nbsp;{breakdown.gtm}
      </span>
      <span className="sep">·</span>
      <span>
        <span className="lbl">Ops</span>&nbsp;{breakdown.ops}
      </span>
      {breakdown.exec > 0 && (
        <>
          <span className="sep">·</span>
          <span>
            <span className="lbl">Exec</span>&nbsp;{breakdown.exec}
          </span>
        </>
      )}
    </div>
  );
}
