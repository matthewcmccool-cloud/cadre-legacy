"use client";

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  compact?: boolean;
}

export function Section({ children, title, compact }: SectionProps) {
  return (
    <div className="c-section" style={compact ? { padding: "14px 16px" } : undefined}>
      {title && <div className="c-section-title">{title}</div>}
      {children}
    </div>
  );
}
