"use client";

import type { CompanyPulse } from "@/lib/types";
import { stageLabel } from "@/lib/utils";
import { CompanyLogo } from "@/components/shared/company-logo";
import { Chip } from "@/components/shared/chip";
import { DeltaValue } from "@/components/shared/delta-value";
import { FuncMix } from "@/components/shared/func-mix";
import { SignalFlag } from "@/components/shared/signal-flag";

interface PulseRowProps {
  company: CompanyPulse;
  focused?: boolean;
  onClick: () => void;
}

export function PulseRow({ company, focused, onClick }: PulseRowProps) {
  const co = company;

  return (
    <tr
      tabIndex={0}
      onClick={onClick}
      style={
        focused
          ? { background: "var(--surface-hover)", boxShadow: "inset 2px 0 0 0 var(--border-focus)" }
          : undefined
      }
    >
      <td>
        <div className="c-co">
          <CompanyLogo name={co.name} />
          <span className="c-co-name">{co.name}</span>
        </div>
      </td>
      <td>
        <Chip label={stageLabel(co.stage)} />
      </td>
      <td>
        <Chip label={co.sector} />
      </td>
      <td
        className="r"
        style={co.open_roles === 0 ? { color: "var(--signal-neg)", fontWeight: 600 } : { fontWeight: 600 }}
      >
        {co.open_roles}
      </td>
      <td className="r">
        <DeltaValue value={co.change_7d} />
      </td>
      <td className="r col-30d">
        <DeltaValue value={co.change_30d} />
      </td>
      <td>
        <FuncMix breakdown={co.func_breakdown} />
      </td>
      <td>
        {co.signals.map((s, i) => (
          <SignalFlag key={i} signal={s} />
        ))}
      </td>
      <td
        className="col-notable"
        style={{
          fontSize: 11,
          color: "var(--text-secondary)",
          maxWidth: 200,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {co.change_7d && co.change_7d > 5
          ? `+${co.change_7d} roles in 7d`
          : co.open_roles === 0
            ? "All roles removed"
            : co.change_7d === 0
              ? "No changes in 14d"
              : `${co.change_7d && co.change_7d > 0 ? "+" : ""}${co.change_7d} net this week`}
      </td>
    </tr>
  );
}
