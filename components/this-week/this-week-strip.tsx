"use client";

import type { JobEvent } from "@/lib/types";
import { EventCard } from "./event-card";
import { NoEvents } from "./no-events";
import { ShimmerBlock } from "@/components/shared/shimmer-block";

interface ThisWeekStripProps {
  events: JobEvent[];
  companyCount: number;
  lastUpdated: Date | null;
  loading?: boolean;
  onEventClick: (companyId: string) => void;
}

export function ThisWeekStrip({ events, companyCount, lastUpdated, loading, onEventClick }: ThisWeekStripProps) {
  if (loading) {
    return (
      <div className="c-strip">
        <div className="c-strip-label">This week</div>
        <div className="c-events">
          {[180, 200, 150].map((w, i) => (
            <div key={i} className="c-event" style={{ pointerEvents: "none", opacity: 0.5 }}>
              <ShimmerBlock width={26} height={26} />
              <div>
                <div style={{ marginBottom: 4 }}><ShimmerBlock width={80} height={12} /></div>
                <ShimmerBlock width={w} height={10} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="c-strip">
      <div className="c-strip-label">This week</div>
      {events.length === 0 ? (
        <NoEvents companyCount={companyCount} lastUpdated={lastUpdated} />
      ) : (
        <div className="c-events">
          {events.slice(0, 5).map((ev, index) => (
            <EventCard
              key={ev.id}
              event={ev}
              onClick={() => onEventClick(ev.company_id)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
