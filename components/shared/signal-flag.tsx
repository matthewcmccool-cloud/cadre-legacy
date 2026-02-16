"use client";

import type { Signal } from "@/lib/types";

const iconMap: Record<string, string> = {
  growth: "▲",
  alert: "⬇",
  caution: "★",
  info: "↻",
};

export function SignalFlag({ signal }: { signal: Signal }) {
  return (
    <span className={`c-flag ${signal.variant}`}>
      {iconMap[signal.variant] || "●"} {signal.label}
    </span>
  );
}
