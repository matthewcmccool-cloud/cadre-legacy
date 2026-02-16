"use client";

import { useState } from "react";
import type { RoleGroup as RoleGroupType } from "@/lib/types";
import { RoleItem } from "./role-item";

interface RoleGroupProps {
  group: RoleGroupType;
  defaultCollapsed?: boolean;
}

export function RoleGroup({ group, defaultCollapsed }: RoleGroupProps) {
  const [collapsed, setCollapsed] = useState(
    defaultCollapsed ?? group.roles.length > 10,
  );

  const visible = collapsed ? [] : group.roles.slice(0, 5);
  const remaining = group.roles.length - 5;

  return (
    <div className="c-rg">
      <div className="c-rg-hdr" onClick={() => setCollapsed((c) => !c)}>
        <div className="c-rg-left">
          <span className="c-rg-name">{group.function_name}</span>
          {group.weekly_change > 0 && (
            <span className="c-rg-change c-d-pos">
              +{group.weekly_change} this week
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="c-rg-count">
            {group.roles.length} role{group.roles.length !== 1 ? "s" : ""}
          </span>
          <span className={`c-rg-chev ${collapsed ? "collapsed" : ""}`}>▼</span>
        </div>
      </div>
      {!collapsed && (
        <div>
          {visible.map((role) => (
            <RoleItem key={role.id} role={role} />
          ))}
          {remaining > 0 && (
            <div className="c-role-more">
              + {remaining} more {group.function_name.toLowerCase()} roles
            </div>
          )}
        </div>
      )}
    </div>
  );
}
