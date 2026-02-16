"use client";

import type { JobEvent } from "@/lib/types";
import { eventIconMap } from "@/lib/utils";

interface EventCardProps {
  event: JobEvent;
  onClick: () => void;
  index: number;
}

export function EventCard({ event, onClick, index }: EventCardProps) {
  const { icon, variant } = eventIconMap[event.event_type];

  return (
    <div
      className="c-event"
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`c-ev-icon ${variant}`}>{icon}</div>
      <div>
        <div className="c-ev-name">{event.company_name}</div>
        <div className="c-ev-desc">{event.description}</div>
      </div>
    </div>
  );
}
