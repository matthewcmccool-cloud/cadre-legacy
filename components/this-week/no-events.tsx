"use client";

interface NoEventsProps {
  companyCount: number;
  lastUpdated: Date | null;
}

export function NoEvents({ companyCount, lastUpdated }: NoEventsProps) {
  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })
    : "—";

  return (
    <div className="c-no-events">
      No notable changes across your portfolio this week.
      <span>
        {companyCount} companies tracked · updated {timeStr}
      </span>
    </div>
  );
}
