"use client";

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      {children}
    </div>
  );
}
