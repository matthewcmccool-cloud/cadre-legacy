"use client";

import { useState, useEffect, useCallback } from "react";
import "./cadre.css";
import type { CompanyPulse, JobEvent, Job } from "@/lib/types";
import { fetchCompanyPulse, fetchThisWeekEvents, fetchCompanyRoles } from "@/lib/queries";
import { AppShell } from "@/components/layout/app-shell";
import { Header } from "@/components/header/header";
import { ThisWeekStrip } from "@/components/this-week/this-week-strip";
import { PulseTable } from "@/components/pulse-table/pulse-table";
import { CompanyPanel } from "@/components/company-panel/company-panel";

export default function PulsePage() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyPulse[]>([]);
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Job[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [companiesData, eventsData] = await Promise.all([
          fetchCompanyPulse(),
          fetchThisWeekEvents(),
        ]);
        setCompanies(companiesData);
        setEvents(eventsData);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Failed to load pulse data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openCompany = useCallback(async (id: string) => {
    setSelectedId(id);
    setPanelOpen(true);
    const roles = await fetchCompanyRoles(id);
    setSelectedRoles(roles);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const selectedCompany = companies.find((c) => c.company_id === selectedId) || null;

  return (
    <AppShell panelOpen={panelOpen} onPanelClose={closePanel}>
      <Header
        workspaceName="a16z Growth"
        lastUpdated={lastUpdated}
        isRefreshing={loading}
      />

      <ThisWeekStrip
        events={events}
        companyCount={companies.length}
        lastUpdated={lastUpdated}
        loading={loading}
        onEventClick={openCompany}
      />

      <PulseTable
        companies={companies}
        loading={loading}
        onRowClick={openCompany}
      />

      <CompanyPanel
        company={selectedCompany}
        roles={selectedRoles}
        open={panelOpen}
        onClose={closePanel}
      />
    </AppShell>
  );
}
