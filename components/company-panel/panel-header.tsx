"use client";

import type { CompanyPulse } from "@/lib/types";
import { stageLabel } from "@/lib/utils";
import { CompanyLogo } from "@/components/shared/company-logo";
import { Chip } from "@/components/shared/chip";

interface PanelHeaderProps {
  company: CompanyPulse;
  onClose: () => void;
}

export function PanelHeader({ company, onClose }: PanelHeaderProps) {
  return (
    <div className="c-panel-hdr">
      <div className="c-panel-top">
        <div className="c-panel-co">
          <CompanyLogo name={company.name} size="lg" />
          <div>
            <div className="c-panel-name">{company.name}</div>
            <a
              className="c-panel-url"
              href={`https://${company.careers_url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {company.careers_url}
            </a>
          </div>
        </div>
        <button className="c-panel-close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="c-panel-meta">
        <Chip label={stageLabel(company.stage)} />
        <Chip label={company.sector} />
        <Chip label={company.hq_location} />
      </div>
      <div className="c-panel-investors">{company.investors.join(" · ")}</div>
      <div className="c-panel-desc">{company.description}</div>
    </div>
  );
}
