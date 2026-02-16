"use client";

import type { Job } from "@/lib/types";
import { seniorityLabel, timeAgo } from "@/lib/utils";

export function RoleItem({ role }: { role: Job }) {
  return (
    <div className="c-role">
      <div className="c-role-left">
        <span className="c-role-title">{role.title}</span>
        {role.is_new && <span className="c-role-new">new</span>}
      </div>
      <div className="c-role-meta">
        <span>{role.location || "—"}</span>
        <span>{seniorityLabel(role.seniority_level)}</span>
        <span>{timeAgo(role.first_seen_at)}</span>
      </div>
    </div>
  );
}
