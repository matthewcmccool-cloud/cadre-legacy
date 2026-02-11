# OpenClaw Onboarding & Task Spec — Cadre

**Prepared: February 10, 2026 | Updated: February 11, 2026**
**For: OpenClaw agent on Matt's Mac Mini M4**
**Companion docs:**
- cadre-openclaw-briefing.md (operational playbook — read that first)
- Cadre_Master_Strategy.md (full product vision and positioning)
- Cadre_Content_Strategy.md (content engine and category creation playbook)

---

## Context

Cadre is the **hiring activity intelligence** layer for the venture ecosystem. We track who's hiring, how fast, in what functions, and why — organized through a knowledge graph connecting jobs → companies → investors → industries.

This document tells OpenClaw what to DO. The operational briefing tells it what Cadre IS and how to think. The master strategy explains the three-product vision (consumer, fund, API). Read all before taking any action.

**Your role:** You are the data engine that makes everything possible. The quality, freshness, and completeness of the data you maintain is the foundation for every product, every piece of content, and every customer relationship. Stale data = dead product.

**Repos:**
- UI: github.com/matthewcmccool-cloud/cadre-ui (Next.js 14, Tailwind, Vercel)
- Sync: github.com/matthewcmccool-cloud/cadre-jobs-sync
- Vercel dashboard: vercel.com/matthews-projects-981b50c5

**Database:** Airtable (airtable.com/appnDXaCfmGtgt6gk) — migrating to Supabase later
**Live site:** cadre-ui-psi.vercel.app (will become cadre.careers when DNS is pointed)

---

## Phase 0: Self-Orientation (First 2 Hours)

Before doing anything else:

1. **Audit the Airtable database.** Connect via API. Map every table, every field (name + type), every linked record relationship, and record counts. Identify which fields are well-populated vs. sparse vs. empty. Report findings to Matt via Telegram.

2. **Audit the codebase.** Clone both repos. Understand the file structure, existing API routes, cron jobs, environment variables, and deployment flow (push to main = Vercel auto-deploy).

3. **Connect to Telegram.** Confirm you can send messages to Matt. This is your primary communication channel for approvals, reports, and questions.

4. **Connect X/Twitter.** Confirm access to Cadre's company account. You'll use this for monitoring VC announcements and eventually posting content.

5. **Report back** with:
   - Database schema summary
   - Data quality assessment (gaps, duplicates, stale records)
   - Codebase structure summary
   - Any access issues or missing credentials

---

## Phase 1: Database Cleanup & Enrichment (Days 1-2)

### Priority #1: Fix the Homepage — Fresh Jobs Only

**The problem:** The homepage currently shows old jobs loaded in bulk from historical ATS scrapes. It looks stale. We need the homepage to show only genuinely active, recently posted roles.

**Actions:**
- Re-check every job in the database against its source ATS endpoint
- If the job is no longer live at the ATS, mark it as closed/inactive
- Ensure closed jobs do NOT appear on the homepage
- The homepage default sort should show newest jobs first
- Report: how many jobs were active vs. closed after the audit

### Priority #2: Company Record Enrichment

Every company record should have these fields populated for "go public" readiness:

| Field | Method | Priority |
|---|---|---|
| Name | Already populated | — |
| Website | Already populated (verify) | High |
| Description | Browse company website, extract 1-2 sentence summary | High |
| Logo | Google favicon API: `https://www.google.com/s2/favicons?domain=DOMAIN&sz=128`. No third-party logo APIs. | High |
| Industry | Classify from company description using LLM reasoning. Use existing Industry categories in Airtable. | High |
| Stage | Infer from most recent known funding round from public sources. Categories: Pre-Seed, Seed, Series A, Series B, Series C, Late Stage, Public | Medium |
| Location (HQ) | Scrape from company website or careers page | Medium |
| ATS Platform | Detect from careers page (see ATS Expansion section below) | High |
| ATS Slug | Extract from careers page URL if applicable | High |
| Investors | Should already be linked — verify completeness | Medium |
| Status | Active, Stale, Dead — verify website is live | Low |

### Priority #3: Job Function Classification Backfill

Many jobs are missing the Function classification. Use LLM reasoning on job titles to classify into the existing 16 Functions:

Sales, BD & Partnerships, Marketing, Customer Success, Solutions Engineering, Revenue Operations, Developer Relations, Product Management, Product Design / UX, Engineering, AI & Research, Business Operations, People, Finance & Accounting, Legal, Other

Do NOT use external APIs for this — classify using your own reasoning on the job title. Batch process, report accuracy to Matt for spot-checking.

### Priority #5: Industry Taxonomy Expansion

The current Industry categories in Airtable may be too narrow. Cadre tracks ALL top technology themes across the market, not just pure software. Audit the existing Industry values and ensure the following are represented. If categories are missing, add them:

**Core Software & Internet:**
- Enterprise Software
- Consumer
- Social Media
- Digital Media
- Developer Tools & Infrastructure
- Cybersecurity

**AI & Data:**
- AI & Machine Learning
- AI Infrastructure
- Data & Analytics

**Fintech & Crypto:**
- Fintech
- Crypto & Web3
- DeFi

**Frontier Tech:**
- Robotics & Automation
- Space & Aerospace
- Defense & National Security
- Autonomous Vehicles

**Deep Tech & Science:**
- Biotech & Life Sciences
- Healthcare & Digital Health
- Cleantech & Energy
- Climate & Sustainability
- Advanced Materials

**Industry Verticals:**
- Real Estate Tech (PropTech)
- EdTech
- LegalTech
- InsurTech
- Supply Chain & Logistics
- Gaming & Entertainment
- Commerce & Marketplace
- Finance (non-fintech — wealth management, capital markets tools)

**General:**
- Hardware
- Semiconductor
- Telecommunications
- Other

After updating the taxonomy, re-classify any companies currently tagged with overly broad or missing industry labels. Report to Matt: "Updated X company classifications, added Y new industry categories."

Note: This is a BROAD scope. If a company is venture-backed and operates in technology or tech-adjacent sectors, it belongs on Cadre. The only hard exclusions are: pure real estate funds (not PropTech), hedge funds, holding companies, insurance carriers (not InsurTech), and non-tech consumer brands.

### Priority #4: Deduplication

Check for and merge duplicate records across:
- Companies (same domain, different name variations)
- Investors (same firm, different name formats)
- Jobs (same title + same company + same location = likely duplicate)

Report duplicates found and actions taken.

---

## Phase 2: ATS Expansion — Beyond Greenhouse, Lever, Ashby (Days 2-4)

### Current State

Cadre has working job sync connectors for three ATS platforms:
- **Greenhouse** — public JSON API at `https://boards.greenhouse.io/SLUG/jobs`
- **Lever** — public JSON API at `https://api.lever.co/v0/postings/SLUG`
- **Ashby** — public JSON API at `https://api.ashbyhq.com/posting-api/job-board/SLUG`

Many companies in the database use other ATS platforms and currently have NO synced jobs.

### ATS Detection Sweep

For EVERY company in the database:

1. Visit the company's careers/jobs page (check `/careers`, `/jobs`, `/about/careers`, or search the website)
2. Inspect the page source and URL redirects for ATS platform signatures:

| ATS Platform | Detection Signals |
|---|---|
| Greenhouse | URL contains `greenhouse.io`, `boards.greenhouse.io`, or page source contains `greenhouse` scripts |
| Lever | URL contains `lever.co`, `jobs.lever.co` |
| Ashby | URL contains `ashbyhq.com`, `jobs.ashby.io` |
| Workday | URL contains `myworkday.com`, `wd5.myworkday.com`, or similar |
| BambooHR | URL contains `bamboohr.com` |
| Rippling | URL contains `rippling.com/careers` or Rippling-specific React components |
| SmartRecruiters | URL contains `smartrecruiters.com`, `careers.smartrecruiters.com` |
| Jobvite | URL contains `jobvite.com`, `jobs.jobvite.com` |
| Workable | URL contains `workable.com`, `apply.workable.com` |
| iCIMS | URL contains `icims.com`, `careers-COMPANY.icims.com` |
| JazzHR | URL contains `jazzhr.com`, `COMPANY.applytojob.com` |
| Custom/Other | Careers page exists but no recognized ATS pattern |
| None | No careers page found |

3. Record the ATS platform and slug/identifier in Airtable
4. For Greenhouse/Lever/Ashby — trigger existing sync connectors
5. For all others — log the ATS and company count per platform

### After Detection: Priority Connector Build

After the sweep, report to Matt:
- "X companies use Workday, Y use BambooHR, Z use Rippling..."
- Ranked by company count

Then build new connectors starting with the ATS that unlocks the most companies:

**Tier 1 — ATS platforms with public/structured APIs (build connectors like Greenhouse/Lever/Ashby):**
- BambooHR — public careers JSON at `https://COMPANY.bamboohr.com/careers/list`
- SmartRecruiters — public API endpoints
- Workable — public API available

**Tier 2 — ATS platforms requiring browser scraping (structured but not API-accessible):**
- Workday — has public job search pages but URL structure varies per company. Use browser automation to navigate the job listing page, extract jobs from the rendered DOM.
- Rippling — React-rendered career pages. Browser automation required.
- iCIMS — varied URL patterns, browser scrape needed.

**Tier 3 — Custom career pages (AI-powered extraction):**

For companies with custom-built careers pages (no recognized ATS):
1. Navigate to the careers page with browser automation
2. Take a DOM snapshot
3. Use LLM reasoning to identify job listings in the page structure
4. Extract: job title, location, department (if visible), apply link
5. Store in Airtable with source marked as "web_scrape" (vs. "api_sync" for ATS connectors)
6. Flag these for re-scraping on a weekly schedule since they have no webhook/API for real-time updates

**Tier 4 — No careers page:**

Create/update company record with status "no_careers_page". Set a monthly check to see if they've added one. These companies still appear on Cadre (they're VC-backed, they have investor data) but without job listings — show "Visit website →" instead.

### Freshness Rules for Non-API Sources

Jobs from browser-scraped sources (Tier 2 and 3) don't have real-time sync. Set re-scrape schedules:
- Tier 2 (known ATS, browser scraped): Re-scrape every 48 hours
- Tier 3 (custom pages): Re-scrape weekly
- If a job disappears from the source page on re-scrape, mark as closed

### Success Criteria

After this phase:
- Every company has an identified ATS platform (or "none")
- All Greenhouse/Lever/Ashby companies have live synced jobs
- Top 2-3 additional ATS platforms have working connectors
- Remaining companies have browser-scraped jobs OR are flagged as no careers page
- Matt has a report showing total coverage: "X% of companies now have live job data"

---

## Phase 3: Fundraise Detection Pipeline (Week 2)

### Sources to Monitor

Set up cron jobs to scan these sources on schedule:

| Source | Method | Frequency |
|---|---|---|
| TechCrunch Funding | Browser scrape `techcrunch.com/tag/funding/feed` (RSS) and `techcrunch.com/category/venture` | Every 4 hours |
| CryptoRank | Browser scrape fundraise feed page | Every 4 hours |
| X/Twitter VC Lists | Monitor via Twitter integration — curate a list of VCs/partners who announce deals | Every 2 hours during 8 AM - 8 PM ET |
| Press Release Wires | Monitor RSS feeds from GlobeNewsWire, PR Newswire, BusinessWire filtered for "Series A/B/C", "seed round", "funding", "raised" | Every 4 hours |
| Crunchbase (if accessible) | Browser scrape recent funding rounds page | Every 6 hours |

**SEC EDGAR Form D: SKIPPED FOR NOW.** Matt monitors large fundraises manually. May add later as an early-detection signal.

### The Qualification Gate — CRITICAL

**Not every detected fundraise belongs on Cadre.** Every signal must pass through qualification before anything enters the database. The pipeline is: Detect → Qualify → Enrich → Sync Jobs → Publish.

**Qualification Criteria (ALL must be true):**

1. **Is it a technology company?** Must operate in one of Cadre's tracked industries (see Industry list in Phase 1 addendum). This is BROAD — includes AI, SaaS, crypto, biotech, cleantech/energy, robotics, space, defense tech, fintech, hardware, dev tools, and more. But excludes pure real estate, hedge funds, holding companies, insurance, non-tech consumer brands.
2. **Is it venture-backed?** Must involve at least one identifiable VC, growth equity, or institutional investor. Personal angel rounds with no named firm = flag for review.
3. **Does the company have a website?** No website = cannot enrich, cannot detect ATS, cannot add value. Discard or monitor.
4. **Is it a new company to Cadre, or an existing company with a new round?** Check Airtable by domain before creating.

**How to qualify from each source:**

**From TechCrunch / press articles (highest quality):**
- Article text contains all context: company name, what they do, investors, round size
- Read the article, extract structured data, qualify in one pass
- If TechCrunch covered it as a tech funding story, it almost certainly qualifies
- Confidence: 90%+

**From X/Twitter VC announcements (high quality):**
- VC partner posts about backing a company
- Extract company name, visit company website to confirm tech relevance
- Cross-reference VC partner against Cadre's investor database
- Confidence: 75-90% depending on how explicit the tweet is

**From press release wires (medium quality):**
- Companies self-publish funding announcements
- More noise than TechCrunch — filter keywords carefully
- Read the press release, extract company/round/investors
- Verify company website is real and tech-relevant
- Confidence: 60-85%

**From CryptoRank (high quality within scope):**
- Already filtered to crypto/blockchain — auto-qualifies for industry
- Still needs: website check, investor identification, ATS detection
- Confidence: 85%+

### Confidence Scoring & Approval Threshold

Every detected fundraise gets a confidence score (0-100%):

**Factors that increase confidence:**
- Named in a TechCrunch/major tech publication article (+30%)
- Lead investor is already in Cadre's database (+20%)
- Company website clearly describes a tech product (+15%)
- Multiple corroborating sources (article + tweet + press release) (+15%)
- Round size is in typical VC range for the stated stage (+10%)
- Company already exists in Cadre's database (existing record update) (+10%)

**Factors that decrease confidence:**
- Only source is a single tweet with no article (-20%)
- No identifiable VC investor (-25%)
- Company website is vague or under construction (-15%)
- Round size seems unusual for stated stage (-10%)
- Industry classification is ambiguous (-10%)

**Approval rules:**
- **≥60% confidence:** Auto-process the full pipeline (detect ATS, sync jobs, enrich, publish). Send a summary to Matt via Telegram AFTER processing.
- **<60% confidence:** Send to Matt via Telegram BEFORE processing: "Low confidence ({score}%): {Company} may have raised {amount} from {investors}. Source: {source_url}. Website: {company_url}. [Approve] [Reject] [Monitor]"
- **"Monitor" response:** Add to a watchlist. Re-check in 7 days for additional sources. If confidence improves above 60%, auto-process.

### Full Pipeline Steps (for qualified fundraises)

1. **Detect**: Source monitoring cron picks up signal
2. **Parse**: Extract company name, domain, round type, amount, lead investors, sector, source URL
3. **Qualify**: Apply qualification criteria and confidence scoring
4. **Gate**: If ≥60% → proceed. If <60% → Telegram to Matt for approval.
5. **Dedupe**: Check against existing companies in Airtable by domain. If exists, update with new round data. If new, create record.
6. **Enrich**: Populate description (scrape website), logo (Google favicon), industry (classify from description), stage (from round type), location (from website)
7. **Detect ATS**: Visit careers page, identify ATS platform (using detection logic from Phase 2)
8. **Sync Jobs**: If Greenhouse/Lever/Ashby → trigger existing connector. If other known ATS → browser-scrape. If custom page → AI-powered extraction. If no careers page → flag as "monitoring"
9. **Link Investors**: Connect to existing investor records in Airtable. If investor doesn't exist, create new investor record with name, website (search for it), and link to this company.
10. **Store Fundraise Event**: Create a record in a new Fundraises table with: company, round type, amount, date, lead investors, all investors, source URL, confidence score
11. **Publish**: Company page should be live on cadre.careers via dynamic routes
12. **Content**: If fundraise meets threshold (Series A+ OR amount >$10M OR trending sector), draft a "Fundraise-to-Hiring" LinkedIn post. Send to Matt via Telegram for approval.
13. **Report**: Send Telegram summary to Matt: "Processed: {Company} — {Round} — {Amount} — {Lead Investor} — {X open roles synced} — {source_url}"

### Fundraises Table (New — Create in Airtable)

Create a new table specifically for fundraise events:

| Field | Type | Description |
|---|---|---|
| Company | Linked Record → Companies | The company that raised |
| Round Type | Single Select | Pre-Seed, Seed, Series A, B, C, D+, Growth, Debt, Undisclosed |
| Amount | Currency | Amount raised (USD) |
| Announced Date | Date | When the fundraise was publicly announced |
| Lead Investors | Linked Record → Investors | Lead investor(s) |
| All Investors | Linked Record → Investors | All participating investors |
| Source URL | URL | Link to the article/tweet/press release |
| Source Type | Single Select | TechCrunch, Press Release, X/Twitter, CryptoRank, Crunchbase, Other |
| Confidence Score | Number (%) | Qualification confidence at time of processing |
| Status | Single Select | Verified, Unverified, Monitoring |
| Roles at Detection | Number | How many open roles the company had when fundraise was detected |
| Notes | Long Text | Any context or flags |

This table powers the Fundraises page on cadre.careers and provides the data for fundraise-to-hiring content.

### Companies That Enter Without Jobs — Expected Behavior

The pipeline is NOT "detect fundraise → add jobs." It's "detect fundraise → qualify → enrich → detect ATS → sync jobs IF available → publish company regardless."

A company enters the knowledge graph the moment it's qualified, even with zero jobs. On cadre.careers, these companies show with investor data, description, industry, and a "Visit website →" link. OpenClaw sets a weekly re-check to monitor for a careers page appearing.

This is still valuable data. The Fundraises page shows "Company X just raised $20M Series A led by Sequoia" and links to the company page. If they have 15 open roles, great. If they have 0 roles yet, the page says "Recently raised — roles coming soon." Candidates watching the space find this useful.

### Competitive Context

Key competitors and how Cadre differentiates:

- **Getro** (700+ VCs) — helps VCs display their own portfolio jobs. B2B tool sold TO firms. No cross-portfolio discovery, no fundraise detection.
- **VentureLoop** — syndicated job feed from VC firms. No knowledge graph, no fundraise connection.
- **Dealroom** — only platform with funding data AND jobs in one API. Enterprise-priced, investor-facing, not job-seeker-facing.
- **SignalFire Beacon** — 650M+ employees, talent signals. Aspirational comp for Cadre's API product, but proprietary and closed.
- **Harmonic.ai / Crustdata** — funding + hiring signals for investor/sales use cases. Not candidate-facing.

**Cadre's unique position:** No platform bridges real-time fundraise detection → VC portfolio mapping → job listings in a candidate-facing product.

---

## Phase 4: Content Engine (Week 2-3)

See the operational briefing doc for voice guidelines and the **Cadre_Content_Strategy.md** for the full category creation playbook. Key points:

- **We are building the "hiring activity intelligence" category.** Every piece of content should demonstrate what this data reveals — not just list jobs.
- Nothing publishes without Matt's explicit approval
- All drafts sent via Telegram
- You generate from live platform data, not from training knowledge
- Every post contains at least one original data point derived from Cadre's database
- No tagging anyone on LinkedIn for weeks 1-4

### Content Types You Generate (from live data):

1. **Portfolio Pulse** — "[Investor]'s portfolio posted X new roles this week. Y% engineering, Z% sales." Requires: querying jobs by investor linkage, aggregating by function.
2. **Fundraise-to-Hiring** — "Companies that raised [Round] in [Month] have posted an average of X roles within Y days." Requires: joining fundraise events to job posting dates.
3. **Function Mix Shift** — "Across all 1,300 companies: engineering hiring up X%, sales up Y%, product design up Z%." Requires: comparing current week function distribution to prior periods.
4. **Stall Signals** — "X companies have posted zero new roles in 90 days. Y of them raised rounds in the last 6 months." Requires: identifying companies with no new postings in 60/90 day windows.
5. **Emerging Company** — "These 5 companies went from 0 to 20+ open roles in 30 days." Requires: tracking posting velocity by company over time.
6. **Newsletter: The Cadre Hiring Signal** — 5-section Saturday morning email (The Signal, Portfolio Pulse, Fresh Fundraises, Hot Roles, One Thing). See Content Strategy doc for full spec.

### Data Infrastructure for Content

To support the content engine, you need to maintain computed metrics that update daily:

- **Per company:** total active roles, roles posted this week, roles posted this month, posting velocity (roles/week trailing 30 days), function breakdown of open roles, days since last new posting
- **Per investor:** total active roles across portfolio, portfolio companies count, top hiring companies this week, portfolio function mix
- **Per industry:** total active roles, week-over-week change, top hiring companies
- **Aggregate:** total roles across all companies, total new postings this week, function mix distribution, % remote roles

Store these as computed fields or a separate metrics table in Airtable. These power both the content engine AND the future fund dashboard (Product 2).

---

## "Go Public" Definition

The homepage of cadre.careers should show only active, recently posted jobs — not bulk historical loads. Every company should have a description, logo, industry classification, and stage. Every company with a supported ATS should have live synced jobs. The data should feel fresh, comprehensive, and complete — not scraped-and-dumped. When someone lands on the site, it should feel like a curated, living product with daily-fresh data, not a static database export.

**Additionally:** The computed metrics infrastructure (per-company posting velocity, per-investor portfolio activity, function mix distributions, stall/surge signals) should be in place and updating daily. This data powers the content engine, the newsletter, and eventually the fund dashboard. The content can't start until the metrics exist.

---

## What NOT To Do

- Do NOT publish anything to LinkedIn, X, or the newsletter without Matt's approval
- Do NOT send automated DMs to anyone on any platform
- Do NOT modify the production codebase without telling Matt first
- Do NOT use paid third-party APIs without approval (use browser scraping and LLM reasoning first)
- Do NOT ignore errors silently — report everything via Telegram immediately
- Do NOT create duplicate records — always check for existing records before creating new ones
- Do NOT store API keys, tokens, or secrets in any file that gets committed to GitHub
- Do NOT claim Cadre tracks "headcount" or "employee count" — we track **hiring activity** (roles posted, velocity, function mix, surges/stalls). This distinction matters.

---

## Phase 5: Fund Dashboard Data Preparation (Week 3-4)

**Context:** Cadre for Funds is a future product that shows VC firms their portfolio's hiring activity. The data infrastructure for it is the SAME data you're already maintaining — it just needs to be queryable by "show me everything for these 30 companies."

### What to build now (data layer only, no UI):

1. **Ensure every investor record has a complete, accurate list of portfolio companies.** This is the join that powers "show me my portfolio." Audit every investor → company linkage. Fill gaps by browsing investor websites and matching to companies in the database.

2. **Maintain the computed metrics table** (described in Phase 4). These metrics power both the content engine AND the future fund dashboard:
   - Per company: active roles, new roles this week/month, posting velocity, function breakdown, days since last posting, stall/surge flags
   - Per investor: total portfolio active roles, portfolio posting velocity, top hiring companies, function mix across portfolio

3. **Build historical data.** Start tracking weekly snapshots of key metrics so we can show trends over time (week-over-week, month-over-month, quarter-over-quarter). Store as a simple time-series: company_id + date + active_roles + new_roles_this_week + function_breakdown. This longitudinal data is what makes the fund product valuable — and it can only be built by starting to record it NOW.

4. **Flag investor portfolios that are large enough to demo.** Identify the 20-30 investors in the database with 10+ portfolio companies that have active job data. These are the portfolios Matt can screenshot and use in accelerator applications, fund ops conversations, and LinkedIn content.

### What NOT to build yet:
- No fund-facing UI or dashboard
- No auth/billing for fund product
- No LP report export functionality
- These come after Product 1 (consumer Follow) is live and validated
