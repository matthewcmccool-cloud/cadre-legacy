"use client";

export function ShimmerBlock({ width, height = 12 }: { width: number; height?: number }) {
  return (
    <div
      className="c-skel"
      style={{ width, height, borderRadius: 3 }}
    />
  );
}
