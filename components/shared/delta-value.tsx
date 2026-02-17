"use client";

export function DeltaValue({ value, size = "sm" }: { value: number | null; size?: "sm" | "lg" }) {
  if (value === null)
    return (
      <span
        style={{
          color: "var(--text-tertiary)",
          fontFamily: "var(--font-data)",
          fontSize: size === "lg" ? 22 : 12,
        }}
      >
        —
      </span>
    );

  const cls = value > 0 ? "c-d-pos" : value < 0 ? "c-d-neg" : "c-d-zero";
  const arrow = value > 0 ? "▲ +" : value < 0 ? "▼ " : "— ";
  const fs = size === "lg" ? 22 : 12;

  return (
    <span
      className={cls}
      style={{
        fontFamily: "var(--font-data)",
        fontSize: fs,
        fontWeight: size === "lg" ? 600 : 500,
      }}
    >
      {arrow}
      {Math.abs(value)}
    </span>
  );
}
