"use client";

import type { CompanyPulse } from "@/lib/types";
import { SignalFlag } from "@/components/shared/signal-flag";

interface SignalSectionProps {
  company: CompanyPulse;
}

export function SignalSection({ company }: SignalSectionProps) {
  if (company.signals.length === 0) return null;

  return (
    <div className="c-section">
      <div className="c-section-title">Active Signals</div>
      {company.signals.map((sig, i) => (
        <div key={i} className="c-sig-row">
          <SignalFlag signal={sig} />
          <span className="c-sig-desc">
            {sig.type === "velocity_spike" && `${company.change_7d} new roles in 7 days`}
            {sig.type === "zero_roles" && `All roles removed; was ${Math.abs(company.change_30d ?? 0)} roles 30 days ago`}
            {sig.type === "new_department" && "First roles in this function in company history"}
            {sig.type === "new_exec" && "New executive-level search opened"}
            {sig.type === "resumed_hiring" && "Roles posted after extended hiring pause"}
            {sig.type === "new_geo" && "First roles in a new geographic market"}
          </span>
        </div>
      ))}
    </div>
  );
}
