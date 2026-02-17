"use client";

import type { CompanyPulse, Job, FunctionBucket, RoleGroup as RoleGroupType } from "@/lib/types";
import { bucketLabel } from "@/lib/utils";
import { PanelHeader } from "./panel-header";
import { StatBar } from "./stat-bar";
import { HiringHistory } from "./hiring-history";
import { RoleGroup } from "./role-group";
import { EmptyRoles } from "./empty-roles";
import { SignalSection } from "./signal-section";

interface CompanyPanelProps {
  company: CompanyPulse | null;
  roles: Job[];
  open: boolean;
  onClose: () => void;
}

export function CompanyPanel({ company, roles, open, onClose }: CompanyPanelProps) {
  if (!company) return null;

  // Group roles by function
  const grouped: RoleGroupType[] = (["eng", "gtm", "ops", "exec"] as FunctionBucket[])
    .map((bucket) => {
      const matching = roles.filter((r) => r.function_bucket === bucket);
      const newCount = matching.filter((r) => r.is_new).length;
      return {
        function_name: bucketLabel(bucket),
        bucket,
        roles: matching,
        weekly_change: newCount,
      };
    })
    .filter((g) => g.roles.length > 0);

  // TODO: Replace with real tracking date from job_snapshots
  const trackingSince = "Feb 1, 2026";

  return (
    <>
      <div className={`c-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`c-panel ${open ? "open" : ""}`}>
        <PanelHeader company={company} onClose={onClose} />

        <StatBar
          openRoles={company.open_roles}
          change7d={company.change_7d}
          change30d={company.change_30d}
        />

        <HiringHistory events={[]} trackingSince={trackingSince} />

        <div className="c-section">
          <div className="c-section-title">Current Roles by Function</div>
          {roles.length === 0 ? (
            <EmptyRoles />
          ) : (
            grouped.map((group) => (
              <RoleGroup key={group.bucket} group={group} />
            ))
          )}
        </div>

        <SignalSection company={company} />
      </div>
    </>
  );
}
