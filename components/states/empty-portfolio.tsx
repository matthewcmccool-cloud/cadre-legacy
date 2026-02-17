"use client";

export function EmptyPortfolio() {
  return (
    <div style={{ textAlign: "center", padding: "120px 20px" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
        Your workspace is ready.
      </div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 360, margin: "0 auto" }}>
        We&apos;re mapping your portfolio now. Companies will appear here as they&apos;re onboarded and their career pages are indexed.
      </div>
    </div>
  );
}
