import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchInvestorBySlug, buildCompanyDomainMap, buildCompanyLogoMap } from "@/lib/airtable";
import { Logo } from "@/components/Logo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { investor } = await fetchInvestorBySlug(slug);
  if (!investor) return { title: "Investor Not Found | CADRE" };
  return {
    title: `${investor.name} — Portfolio Jobs | CADRE`,
    description: `Browse open roles across ${investor.name}'s portfolio companies.`,
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

export default async function InvestorPage({ params }: Props) {
  const { slug } = await params;
  const { investor, portfolioCompanies, jobs } = await fetchInvestorBySlug(slug);

  if (!investor) notFound();

  const domain = getDomain(investor.website);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <header className="py-4 border-b border-cadre-border">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </header>

      {/* Investor Info */}
      <div className="py-8">
        <div className="flex items-start gap-4">
          {/* Logo */}
          {domain ? (
            <img
              src={`https://img.logo.dev/${domain}?token=pk_a8CO5glvSNOJpPBxGBm3Iw&size=64&format=png`}
              alt={investor.name}
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
              {investor.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{investor.name}</h1>
            {investor.type && (
              <div className="text-xs text-cadre-secondary mt-1">{investor.type}</div>
            )}
            {investor.website && (
              <a
                href={investor.website.startsWith("http") ? investor.website : `https://${investor.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-green hover:brightness-110 mt-1 inline-block"
              >
                {domain}
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          <div>
            <div className="text-lg font-bold text-white">{portfolioCompanies.length}</div>
            <div className="text-xs text-cadre-secondary">Portfolio Companies</div>
          </div>
          <div>
            <div className="text-lg font-bold text-brand-green">{jobs.length}</div>
            <div className="text-xs text-cadre-secondary">Open Roles</div>
          </div>
        </div>
      </div>

      {/* Portfolio Companies */}
      {portfolioCompanies.length > 0 && (
        <div className="border-t border-cadre-border pt-6 pb-4">
          <h2 className="text-sm font-semibold text-white mb-4">Portfolio Companies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {portfolioCompanies.map((c) => {
              const cDomain = getDomain(c.website);
              return (
                <Link
                  key={c.id}
                  href={`/companies/${c.slug}`}
                  className="flex items-center gap-3 p-3 bg-bg-surface border border-cadre-border rounded-lg hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:border-brand-green transition-all duration-200"
                >
                  {cDomain ? (
                    <img
                      src={`https://img.logo.dev/${cDomain}?token=pk_a8CO5glvSNOJpPBxGBm3Iw&size=64&format=png`}
                      alt={c.name}
                      width={32}
                      height={32}
                      className="shrink-0 rounded-full object-cover"
                      style={{ border: "1px solid var(--border-default)" }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center shrink-0 rounded-full bg-bg-elevated text-cadre-secondary"
                      style={{ width: 32, height: 32, fontSize: 13, fontWeight: 600 }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white truncate">{c.name}</div>
                    <div className="text-xs text-cadre-secondary">
                      {[c.industry, c.stage].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  {c.jobCount > 0 && (
                    <div className="text-xs text-brand-green whitespace-nowrap">
                      {c.jobCount} {c.jobCount === 1 ? "role" : "roles"}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Open Roles Across Portfolio */}
      <div className="border-t border-cadre-border pt-6 pb-8">
        <h2 className="text-sm font-semibold text-white mb-4">
          Open Roles Across Portfolio{" "}
          <span className="text-cadre-muted font-normal">({jobs.length})</span>
        </h2>

        {jobs.length === 0 ? (
          <p className="text-xs text-cadre-secondary">No open roles across the portfolio right now.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {jobs.slice(0, 50).map((job) => (
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
                    <Link
                      href={`/companies/${job.companySlug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-cadre-secondary hover:text-brand-green transition-colors"
                    >
                      {job.company}
                    </Link>
                    {job.location && (
                      <>
                        <span className="text-cadre-muted">·</span>
                        <span className="text-xs text-cadre-muted">{job.location}</span>
                      </>
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
            {jobs.length > 50 && (
              <p className="text-xs text-cadre-secondary text-center py-2">
                Showing 50 of {jobs.length} roles
              </p>
            )}
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
