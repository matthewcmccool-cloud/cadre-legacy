"use client";

interface FreshnessDotProps {
  lastUpdated: Date;
  isRefreshing?: boolean;
}

export function FreshnessDot({ lastUpdated, isRefreshing }: FreshnessDotProps) {
  const now = new Date();
  const diffHrs = (now.getTime() - lastUpdated.getTime()) / 3600000;

  let color = "var(--signal-pos)"; // green
  let pulse = false;

  if (isRefreshing) {
    color = "var(--signal-pos)";
    pulse = true;
  } else if (diffHrs < 1) {
    pulse = true;
  } else if (diffHrs < 12) {
    // static green
  } else if (diffHrs < 24) {
    color = "var(--signal-caution)"; // amber
  } else {
    color = "var(--signal-neg)"; // red
  }

  return (
    <span
      className={pulse ? "c-dot" : undefined}
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        ...(pulse ? {} : { animation: "none" }),
      }}
    />
  );
}
