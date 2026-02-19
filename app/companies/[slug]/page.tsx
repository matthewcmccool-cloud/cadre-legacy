import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCompanyBySlug, buildCompanyDomainMap, buildCompanyLogoMap, fetchCompanies } from "@/lib/airtable";
import { Logo } from "@/components/Logo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { company } = await fetchCompanyBySlug(slug);
  if (!company) return { title: "Company Not Found | CADRE" };
  return {
    title: `${company.name} — Open Roles | CADRE`,
    description: `Browse open roles at ${company.name}. ${company.industry ? `Industry: ${company.industry}.` : ""} ${company.stage ? `Stage: ${company.stage}.` : ""}`,
  };
}

function getDomain(website: string): string {
  if (!website) return "";
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const { company, jobs } = await fetchCompanyBySlug(slug);

  if (!company) notFound();

  const domain = getDomain(company.website);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <header className="py-4 border-b border-cadre-border">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </header>

      {/* Company Info */}
      <div className="py-8">
        <div className="flex items-start gap-4">
          {/* Logo */}
          {domain ? (
            <img
              src={`https://img.logo.dev/${domain}?token=pk_a8CO5glvSNOJpPBxGBm3Iw&size=64&format=png`}
              alt={company.name}
              width={48}
              height={48}
              className="shrink-0 rounded-full object-cover"
              style={{ border: "1px solid var(--border-default)" }}
            />
          ) : (
            <div
              className="flex items-center justify-center shrink-0 rounded-full bg-bg-elevated text-cadre-secondary"
              style={{ width: 48, height: 48, fontSize: 20, fontWeight: 600 }}
            >
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{company.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {company.industry && (
                <span className="text-xs text-cadre-secondary">{company.industry}</span>
              )}
              {company.industry && company.stage && (
                <span className="text-cadre-muted">·</span>
              )}
              {company.stage && (
                <span className="text-xs text-cadre-secondary">{company.stage}</span>
              )}
            </div>
            {company.website && (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-green hover:brightness-110 mt-1 inline-block"
              >
                {domain}
              </a>
            )}
          </div>
        </div>

        {/* Investors */}
        {company.investors.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs text-cadre-secondary font-medium mb-2">Backed by</h3>
            <div className="flex flex-wrap gap-1.5">
              {company.investors.map((inv) => (
                <Link
                  key={inv}
                  href={`/investors/${toSlug(inv)}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-normal border border-brand-green text-white whitespace-nowrap cursor-pointer hover:bg-brand-green-dim transition-colors duration-150"
                >
                  {inv}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Open Roles */}
      <div className="border-t border-cadre-border pt-6 pb-8">
        <h2 className="text-sm font-semibold text-white mb-4">
          Open Roles{" "}
          <span className="text-cadre-muted font-normal">({jobs.length})</span>
        </h2>

        {jobs.length === 0 ? (
          <p className="text-xs text-cadre-secondary">No open roles right now.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {jobs.map((job) => (
              <a
                key={job.id}
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 p-3 bg-bg-surface border border-cadre-border rounded-lg hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:border-brand-green transition-all duration-200"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-white truncate">{job.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {job.location && (
                      <span className="text-xs text-cadre-muted">{job.location}</span>
                    )}
                    {job.function && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-cadre-border text-cadre-secondary whitespace-nowrap">
                        {job.function}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-cadre-muted whitespace-nowrap">
                  {job.postedDate ? new Date(job.postedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Back link */}
      <div className="pb-8">
        <Link href="/" className="text-xs text-brand-green hover:brightness-110">
          &larr; Back to all jobs
        </Link>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-cadre-border">
        <span className="text-xs text-cadre-secondary">CADRE &middot; 2026</span>
      </footer>
    </div>
  );
}
