"use client";

interface ColumnHeaderProps {
  label: string;
  align?: "left" | "right";
  className?: string;
  style?: React.CSSProperties;
}

export function ColumnHeader({ label, align, className, style }: ColumnHeaderProps) {
  return (
    <th className={`${align === "right" ? "r" : ""} ${className || ""}`} style={style}>
      {label}
    </th>
  );
}
