"use client";

import { logoColors } from "@/lib/utils";

export function CompanyLogo({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const c = logoColors[name] || { bg: "#18181c", fg: "#8a8a96", border: "#222228" };
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
