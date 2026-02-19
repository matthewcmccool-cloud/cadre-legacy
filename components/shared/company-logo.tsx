"use client";

import { logoColors } from "@/lib/utils";

export function CompanyLogo({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const c = logoColors[name] || { bg: "#1A1A1A", fg: "#999999", border: "#2A2A2A" };
  const px = size === "sm" ? 26 : 36;
  const fs = size === "sm" ? 10 : 14;
  const br = size === "sm" ? 5 : 8;

  return (
    <div
      className={size === "sm" ? "c-co-logo" : "c-panel-logo"}
      style={{
        width: px,
        height: px,
        borderRadius: br,
        background: c.bg,
        color: c.fg,
        borderColor: c.border,
        fontSize: fs,
      }}
    >
      {name === "Vercel" ? "▲" : name[0]}
    </div>
  );
}
