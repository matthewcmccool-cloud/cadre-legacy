# Cadre — Master Strategy & Vision

**Updated: February 11, 2026**
**Founder: Matt McCool**

---

## One-Line

Cadre is the hiring activity intelligence layer for the venture ecosystem.

## The Category We're Creating

**Hiring Activity Intelligence** — real-time, structured data on who's hiring, how fast, in what functions, and why — organized through a knowledge graph connecting jobs → companies → investors → industries.

This category sits at an unexploited intersection of three mature markets:

1. **Workforce analytics** (Revelio Labs, Lightcast, Coresignal) — sells headcount and attrition data to hedge funds at $25K-100K+/year. Market-wide, not portfolio-specific. Enterprise pricing, investor-facing.
2. **VC portfolio monitoring** (Visible, Juniper Square, Chronograph) — tracks financial KPIs for LP reporting. Headcount appears as a single self-reported number. No hiring activity data.
3. **VC talent platforms** (Getro, SignalFire Beacon) — help VCs distribute portfolio jobs to candidates. No cross-portfolio aggregation, no LP reporting, no intelligence layer.

Nobody has connected these three domains. Cadre does.

---

## What We Have

A knowledge graph tracking:

- **7,800+ jobs** across **1,300+ companies** backed by **330+ investors**
- Automated ATS syncing (Greenhouse, Lever, Ashby — expanding to Workday, BambooHR, SmartRecruiters, and browser-scraped custom pages)
- Fundraise detection pipeline (TechCrunch, CryptoRank, X/Twitter VC announcements, press release wires)
- Industry classification across 25+ categories (AI, biotech, fintech, robotics, space, defense, cleantech, and more)
- Job function classification across 16 departments
- Company-level enrichment (description, logo, stage, location, ATS platform)

This data asset is the foundation for three products at three price points serving three markets.

---

## Three Products, One Data Asset

### Product 1: Cadre (Consumer)
**What:** Job discovery platform organized by investor backing
**Who:** Job seekers (free), recruiters ($79/month), sales/BD teams ($79/month)
**URL:** cadre.careers
**Revenue model:** PLG — 14-day free trial, $79/month subscription, $63/month annual

**Core experience:**
- Browse all jobs, companies, investors, fundraise events for free (no account required)
- "Follow" companies to get alerts when they post new roles or raise funding
- Knowledge graph context in every interaction (every job shows its investor backing, every company shows portfolio-level trends)
- Newsletter drives traffic: "The Cadre Hiring Signal" — weekly data-driven hiring insights

**Paid features ($79/month):**
- Unlimited follows
- Real-time alerts (daily digest + instant for high-priority matches)
- Cross-company comparisons
- CSV export of filtered views
- Fundraise notifications on followed companies
- Full knowledge graph context in alerts

**Free browse experience (no account):**
- Full access to all jobs, companies, investors, fundraise feed
- Search and basic filters
- No follows, no alerts, no export

**Free trial (14 days, payment info upfront):**
- Full paid experience for 14 days
- Converts to $79/month or user drops to browse-only

**Why it matters:** Builds the audience and keeps the data fresh. Every job seeker browsing Cadre makes the platform more valuable to recruiters. Every recruiter using Cadre validates the data for fund clients. Product 1 is the growth engine that feeds Products 2 and 3.

---

### Product 2: Cadre for Funds
**What:** Hiring activity intelligence dashboard for VC portfolio monitoring and LP reporting
**Who:** Fund operations teams, talent partners, GPs at VC firms
**Revenue model:** PLG entry, enterprise upsell — $1K-3K/month per fund

**Core experience:**
- Fund ops person signs up, selects which companies in Cadre's database are in their portfolio
- Immediately sees a live dashboard: hiring activity across their entire portfolio
- No data collection burden on portfolio companies — Cadre tracks it automatically from public job postings

**Dashboard shows:**
- New roles posted this period (week/month/quarter) across all portfolio companies
- Hiring velocity trends (are companies ramping or stalling?)
- Function mix breakdown (engineering vs. sales vs. ops — is the portfolio building or selling?)
- Company-level drill-down: each portfolio company's hiring activity, open roles, department mix
- Stall alerts: companies with zero new postings for 30/60/90 days
- Surge alerts: companies with 3x+ their average posting rate
- Competitor tracking: follow non-portfolio companies (competitors to portfolio cos) and compare hiring velocity

**LP reporting integration:**
- Exportable quarterly summary: "Portfolio hiring activity — Q1 2026"
- Embeddable charts/visualizations for LP decks
- PDF export formatted for standard LP report appendix
- Data framing: "hiring activity intelligence" — explicitly not headcount tracking, not employee census

**Pricing:**
- Self-serve: $1K/month per fund (up to 50 portfolio companies)
- Growth: $2K/month (up to 150 portfolio companies, multi-seat)
- Enterprise: $3K+/month (unlimited, custom integrations, API access, dedicated support)
- Annual contracts with 20% discount

**PLG motion:**
- Fund ops person can sign up and see their portfolio dashboard without a sales call
- 14-day free trial, payment info upfront
- Product is self-serve for small funds (sub-$500M AUM)
- Enterprise sales layer added for larger funds once product-market fit is validated

**Key data disclaimer on every dashboard:**
> "Data sourced from public job postings. Hiring activity signals reflect roles posted and removed from public careers pages and may not reflect internal hiring plans, confidential searches, or actual headcount."

**Why it matters:** This is where the real money is. 1,500-2,500 addressable VC firms with platform teams. At $1K/month and 10% penetration, that's $150-250K MRR. And it's the same data asset as Product 1 — just a different view.

---

### Product 3: Cadre API (Future)
**What:** The knowledge graph as infrastructure — consumption-based access to hiring activity intelligence
**Who:** AI recruiting agents, HR tech platforms, VC platforms, hedge funds, sales intelligence tools
**Revenue model:** Consumption-based (per API call or per company/month)
**Timeline:** Build at $10-15K MRR from Products 1+2, not before

**Endpoints (conceptual):**
- `/companies/{id}/hiring-activity` — current open roles, posting velocity, function mix
- `/investors/{id}/portfolio-hiring` — aggregate hiring across portfolio
- `/industries/{id}/trends` — hiring trends by sector
- `/fundraises/recent` — recently funded companies with hiring data attached
- `/alerts/subscribe` — webhook for new postings matching criteria

**Comp:** Crustdata (YC F24) grew from $770K to $4M+ revenue in 7 months selling real-time signals to AI agents. Garry Tan: "Crustdata will be the gateway to the internet for agentic apps." Cadre's API serves the same market with a differentiated dataset (VC-ecosystem-specific, knowledge graph structured).

**Why it matters:** Highest margin, highest scale, lowest marginal cost. Once the data asset exists and is validated by Products 1 and 2, the API monetizes it to markets you'll never reach directly.

---

## The Data Asset — What We Have vs. What We Don't

### What we have (and can credibly sell):
- **Hiring activity signals:** new roles posted, roles removed/closed, posting velocity over time, department/function mix of open roles, time-that-roles-stay-open, hiring surges and stalls
- **Fundraise events:** round type, amount, investors, date, source
- **Knowledge graph relationships:** which investors back which companies, which companies are in which industries, which jobs map to which functions
- **Cross-portfolio aggregation:** unique ability to show trends across ALL VC portfolios, not just one firm's

### What we do NOT have (and should not claim):
- Actual employee headcount (how many people work there today)
- Attrition/turnover data (who left)
- Employee tenure or seniority distribution
- Compensation/salary data (unless in job postings)
- Candidate pipeline or application volume
- LinkedIn profile-level workforce data

### The honest framing:
Cadre provides **hiring activity intelligence** — the most forward-looking operational signal in the venture ecosystem. Job postings are a leading indicator of headcount growth, strategic priorities, and execution velocity. We track the *intent to hire*, not the *census of employees*. This is complementary to (not competitive with) workforce analytics platforms like Revelio that track actual headcount from LinkedIn and SEC data.

---

## Competitive Landscape

| Competitor | What They Do | Pricing | Hiring Data? | Cross-Portfolio? | LP Reporting? |
|---|---|---|---|---|---|
| **Getro** | VC portfolio job boards | $210+/month | Portfolio jobs (own firm only) | No — siloed per VC | No |
| **Visible** | Portfolio monitoring + LP reports | $449+/month | Single headcount number (self-reported) | N/A | Yes (financials) |
| **Juniper Square** | Fund admin + LP portal | $18K+/year | No | N/A | Yes (financials) |
| **Chronograph** | Portfolio analytics | Six figures/year | No | N/A | Yes (financials) |
| **Revelio Labs** | Workforce analytics | $25K-100K+/year | Full headcount + attrition | N/A (market-wide) | No |
| **Crustdata** | Real-time signals for AI agents | Custom | Job postings + headcount | N/A | No |
| **Wellfound** | Startup job board | Free (employer-pays) | Job listings | No | No |
| **LinkedIn** | Professional network | $800+/month (Recruiter) | Job listings + profiles | No | No |
| **Cadre** | Hiring activity intelligence | $79/mo (consumer), $1-3K/mo (fund) | Posting velocity, function mix, surges/stalls, cross-portfolio | **Yes — only platform** | **Yes — designed for it** |

---

## Go-to-Market Sequence

### Phase 1: Build (February-March 2026) — Cabin Sprint
- OpenClaw enriches database: every company has description, logo, industry, stage
- OpenClaw expands ATS coverage: connectors for top 5-6 platforms
- OpenClaw launches fundraise detection pipeline
- Claude Code ships UI polish + GEO/SEO infrastructure
- Loops.so email infrastructure live
- Site feels alive, curated, fresh — "go public" ready

### Phase 2: Audience (March-May 2026)
- Content engine goes live: LinkedIn posts + newsletter
- Seed "hiring activity intelligence" as a category in all content
- Publish weekly data insights: "Sequoia's portfolio posted 89 roles this week. 60% engineering."
- Build newsletter subscriber base (target: 1,000 subscribers by end of May)
- Drive traffic to cadre.careers (target: 2,000+ weekly visitors by end of May)
- Implement Follow feature with 14-day free trial at $79/month

### Phase 3: Validate (May-July 2026)
- First paying consumer users (target: 50 subscribers = ~$4K MRR)
- Begin conversations with 5-10 fund ops teams about Product 2
- Show them their own portfolio data on Cadre — "here's your portfolio's hiring activity this quarter"
- Validate willingness to pay for fund dashboard
- Apply to accelerators with validated traction

### Phase 4: Scale (July-December 2026)
- Launch Cadre for Funds (self-serve at $1K/month)
- Target: 10-20 fund customers by end of year ($10-20K MRR from funds alone)
- Consumer product continues growing ($5-10K MRR)
- Combined target: $15-30K MRR by end of 2026
- Begin API alpha with 2-3 design partners

### Phase 5: Expand (2027)
- Enterprise fund tier ($3K+/month)
- API product launch (consumption-based)
- Public company tracking for cohort intelligence
- Geographic expansion (London/EU VC ecosystem)
- Target: $100K MRR

---

## Accelerator Positioning

**One-liner for applications:**
"Cadre is the hiring activity intelligence layer for the venture ecosystem — tracking who's hiring, how fast, and why across 1,300+ VC-backed companies through a knowledge graph connecting jobs, companies, investors, and industries."

**Why this is venture-scale:**
1. **Data asset compounds.** Every day the pipeline runs, the graph gets richer. Historical hiring data becomes more valuable over time (trend analysis requires longitudinal data).
2. **Three monetization surfaces** from one asset: consumer PLG, fund subscriptions, API consumption.
3. **Network effects.** More companies tracked → more useful for job seekers → more traffic → more valuable to recruiters → more valuable to funds → justifies tracking more companies.
4. **Category creation.** "Hiring activity intelligence" doesn't exist as a category today. The founder who names and owns the category has disproportionate upside.

**Why now:**
- 70% of GPs cite LP reporting as top operational challenge
- 59% of LPs want better report analytics
- Industry shifting from static quarterly PDFs to live dashboards
- AI recruiting agents emerging (Crustdata's trajectory) need structured hiring data
- Alternative data for institutional investors is a proven, growing market
- No one has connected workforce signals to VC portfolio monitoring

---

## Key Metrics to Track

### Product 1 (Consumer)
- Weekly active users on cadre.careers
- Newsletter subscribers
- Free trial starts
- Free trial → paid conversion rate (target: 30%+ with opt-out trial)
- Monthly paid subscribers
- MRR from consumer subscriptions
- Churn rate (target: <5% monthly)

### Product 2 (Funds)
- Fund ops conversations (pipeline)
- Self-serve signups
- Fund dashboard MAU
- MRR from fund subscriptions
- Net revenue retention (target: >100% — funds expand as portfolios grow)

### Data Health
- Total companies tracked (and % with fresh job data)
- ATS sync success rate
- Average alert latency (time from job posted on ATS → alert delivered)
- Fundraise detection rate (how many real fundraises did we catch vs. miss?)
- Companies with complete enrichment (description + logo + industry + stage)

---

## What Not to Build

- Candidate profiles or resume database (not our game — LinkedIn owns this)
- ATS/CRM for companies (Greenhouse, Lever, Ashby own this)
- Full workforce analytics competing with Revelio/Lightcast (different data, different market)
- White-label job boards competing with Getro (they have 850+ clients and a head start)
- Salary benchmarking tools (don't have the data, others do)

## What to Protect

- The knowledge graph (investor → company → job linkage) — this is the moat
- Data freshness — the moment your data is stale, you're just another job board
- The "hiring activity intelligence" category name — own it in content before anyone else claims it
- Cross-portfolio aggregation — the one thing nobody else can do
