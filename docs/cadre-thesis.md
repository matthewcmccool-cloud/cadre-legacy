# Cadre — Company Thesis & Go-to-Market Plan

**February 2026 | Matt McCool, Founder**

---

## What Cadre Is

Cadre is the canonical source of hiring data at VC-backed companies. We track 34,000+ open roles across 1,343 companies backed by 338 investors, synced daily from Greenhouse, Lever, and Ashby. Our knowledge graph connects Jobs → Companies → Investors → Industries, giving us a structural advantage no job board or data vendor has.

We serve three audiences with one dataset:

- **Job seekers** find roles filtered by investor portfolio, funding stage, and function — a workflow no other board supports.
- **VC talent partners** get automated portfolio hiring intelligence that replaces 40+ hours/month of manual career page monitoring.
- **Recruiters** use our data to identify which VC-backed companies are ramping hiring and where the demand is.

Our thesis: **hiring activity is the highest-fidelity leading indicator of a startup's strategic direction.** A company shifting from 70% engineering to 40% engineering / 35% sales has hit product-market fit. A company that posted zero roles in three weeks is freezing. A company that just added its first VP of Sales is about to go to market. VCs have no systematic way to see this across their portfolios. Cadre gives it to them.

---

## Product Strategy

### Layer 1: The Job Board (Live Now)

The free consumer product. ~34K roles, filterable by investor, industry, department, location, work mode. This is our distribution engine — job seekers use it, VCs promote it to their portfolio companies, and the traffic creates a flywheel that makes Cadre the default destination for VC-backed hiring.

**Monetization:** Sponsored listings ($299–$499/mo per company), employer self-serve ("claim your page"), and featured placements. Target: $5K–$10K MRR from the job board alone within 12 months as a financial floor.

### Layer 2: Content-First Distribution (Building Now)

Automated, data-driven content that establishes Cadre as the authoritative voice on VC portfolio hiring:

- **Weekly Hiring Pulse email** — auto-generated from our data pipeline, delivered via Loops.so. Top hiring companies, department trends, remote %, investor portfolio activity. Zero marginal cost per issue.
- **LinkedIn Post Generator** — produces Jordan Carver-style portfolio posts (company + link + role count) for any investor in seconds. The exact workflow a16z's talent team does manually today.
- **Fundraises Feed** — track new funding rounds, auto-create company pages, connect round → company → open roles. CryptoRank-style feed that gives users a daily reason to return. A company raises $30M Series B → Cadre shows their 47 open roles in the same view.

This content layer is the GTM engine. It builds the audience, validates demand, and generates inbound — all before we ask anyone to pay for a dashboard.

### Layer 3: B2B Investor Analytics (Months 3–9)

The premium product. Portfolio-level hiring intelligence dashboard for VC talent partners:

- **Portfolio Overview**: All portfolio companies sorted by hiring velocity. Red/green signals at a glance.
- **Company Deep-Dive**: Department breakdown, trend charts, new/removed roles, alert history.
- **Alerts Engine**: Hiring spike, freeze, new department, executive hire, geographic expansion — 10 trigger types, delivered via email and Slack.
- **Exports**: PDF snapshots (board deck inserts), CSV downloads, LinkedIn post generation.

**Pricing:** $500/mo base (15 companies included) + $20/company beyond. A 50-company portfolio pays $1,200/mo. A 150-company fund pays $3,200/mo. Anchored to "less than one recruiter placement fee" — trivial for any fund with a talent function.

---

## Go-to-Market Sequence

### Phase 1: Content + Audience (Now → Month 3)

Launch the automated hiring report. Get it circulating on LinkedIn and optimized for generative engines (ChatGPT, Perplexity). We're optimizing for GEO, not traditional SEO — our structured data, daily freshness, and unique aggregations are exactly what LLMs cite when someone asks "top AI startups hiring right now."

Reach out to 5 VC talent partners with auto-generated versions of their own LinkedIn posts. Jordan Carver at a16z is the primary design partner target — his workflow is literally what we automate.

**Milestone:** 500+ newsletter subscribers, 3–5 talent partners piloting.

### Phase 2: First Revenue (Month 3–6)

Convert pilots to paid ($250–$500/mo early adopter pricing). Launch employer self-serve on the job board. Start generating dual revenue: job board + B2B pilots.

**Milestone:** $3K–$5K MRR combined. This is the proof point for raising $100K.

### Phase 3: Dashboard + Scale (Month 6–12)

Ship the full investor dashboard. Convert design partners to full price. Scale content distribution. Add Stripe billing with metered pricing.

**Milestone:** $8K–$15K MRR. 15–25 paying accounts.

### Phase 4: Expand (Month 12–18)

Pro tier with alerts, exports, Slack integration. Recruiter-facing features (same data, different packaging). GEO compounding — Cadre becomes the cited source across generative engines.

**Milestone:** $15K–$30K MRR. 30–50 paying accounts.

---

## Revenue Targets (Medium Case)

| Month | MRR | ARR | Paying Accounts | Key Driver |
|-------|-----|-----|-----------------|------------|
| 3 | $1K | $12K | 3–5 pilots (discounted) | Design partner conversions |
| 6 | $5K | $60K | 10–12 accounts | Job board self-serve + B2B pilots |
| 9 | $10K | $120K | 18–22 accounts | Dashboard launch, full-price conversions |
| 12 | $18K | $216K | 28–35 accounts | Content inbound, referral growth |
| 15 | $25K | $300K | 35–45 accounts | Pro tier upsell, recruiter expansion |
| 18 | $30K | $360K | 45–55 accounts | GEO compounding, word of mouth |

**Blended ARPU assumption:** ~$650/mo in months 3–9 (mix of discounted pilots and job board), rising to ~$700–$800/mo as dashboard accounts scale.

**Downside floor:** If the B2B product doesn't land, the job board alone should sustain $5K–$10K MRR by month 12 through sponsored listings and employer self-serve. This covers a solo founder's costs and keeps the company alive while iterating.

---

## Competitive Moat

**What's defensible:**

1. **Time-series hiring snapshots.** Every week we capture the hiring state of 1,343 companies. This data compounds and cannot be backfilled by a competitor starting later. After 12 months, we'll have 52 weeks of history enabling benchmarking ("How does this Series B AI company compare to its cohort?") that no one else can replicate.

2. **Knowledge graph.** Our Jobs → Companies → Investors → Industries graph is pre-built. Querying "show me all engineering roles at Sequoia portfolio companies in AI" is a single API call for us and an unsolved problem for everyone else.

3. **Distribution flywheel.** Job seekers use Cadre → VCs promote Cadre to portfolio companies → more companies list → more job seekers come. This two-sided network effect strengthens with each investor we onboard.

4. **Content as moat.** Automated hiring reports and LinkedIn post generation create habitual engagement. The weekly email becomes the Monday morning ritual for talent partners. Switching costs compound with workflow dependency.

**What's NOT defensible (and we know it):** Raw job data is a commodity. Anyone can scrape career pages. Our value is in the aggregation, the investor-scoped lens, the time-series history, and the content layer — not the underlying listings.

---

## The Ask

**Raising $100K** for 12–18 months of runway. Solo technical founder, full-stack capable, infrastructure already built.

**Use of funds:**
- Vercel Pro + Supabase Pro + Loops.so: ~$100/mo infrastructure
- AI API costs (Perplexity enrichment, content generation): ~$200/mo
- Domain, tooling, incidentals: ~$100/mo
- Remainder: founder salary runway to reach $10K+ MRR and ramen profitability

**What's already built:**
- 34,377 jobs synced daily across 3 ATS platforms
- 1,343 companies, 338 investors, full knowledge graph
- Consumer job board with filtering, pagination, GEO-optimized structured data
- LinkedIn post generator, hiring pulse API, content automation pipeline
- Dark-themed UI with loading states, error boundaries, ISR caching

**What $100K buys:**
- 12–18 months of focused execution on the roadmap above
- Path to $15K–$30K MRR and self-sustaining revenue
- A dataset that gets more valuable every week it runs

---

*Cadre is not trying to be Harmonic or LinkedIn Talent Insights. We're building the definitive source of hiring intelligence for the VC ecosystem — starting with content that costs nothing to produce, scaling into analytics that funds will pay real money for, and compounding a data asset that gets harder to replicate with every passing week.*
