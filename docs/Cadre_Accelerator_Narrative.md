# Cadre — Accelerator Application Narrative

**Use this as the foundation for a16z Speedrun (SR007) and Vercel AI Accelerator applications. Adapt tone/length per application requirements.**

---

## The Problem

Every quarter, 70% of VC fund managers call LP reporting their top operational challenge. Their teams spend weeks manually assembling reports — spreadsheets with 40+ tabs, chasing portfolio companies for data, compiling metrics that are outdated by the time they're delivered. And after all that work, the reports still miss the most forward-looking operational signal available: hiring activity.

Meanwhile, 59% of LPs say they want better analytics from their GPs. They're pushing for transparency, leading indicators, and real-time dashboards. But every portfolio monitoring tool on the market — Visible, Juniper Square, Chronograph — tracks the same thing: financials. Revenue, burn, runway, IRR, TVPI. When headcount appears at all, it's a single self-reported number collected quarterly via email.

Nobody provides real-time hiring activity intelligence — who's hiring, how fast, in what functions, and what it signals about execution velocity — because nobody has the data infrastructure to do it.

Until now.

---

## What Cadre Is

Cadre is the hiring activity intelligence layer for the venture ecosystem.

We've built a knowledge graph connecting jobs → companies → investors → industries across 1,300+ VC-backed companies and 7,800+ open roles. Our automated pipeline syncs directly with ATS platforms (Greenhouse, Lever, Ashby, expanding to Workday, BambooHR, SmartRecruiters, and any public careers page), detects new fundraise events in real-time, and classifies every role by function across 16 departments and 25+ industry categories.

This data asset powers three products:

**Cadre (consumer)** — a job discovery platform where anyone can browse curated roles at VC-backed companies, organized by who funds them. Job seekers discover opportunities through investor backing, not keyword search. Recruiters follow target companies and get alerts the moment new roles post. $79/month after a 14-day free trial.

**Cadre for Funds** — a hiring activity intelligence dashboard for VC portfolio monitoring. A fund ops person selects their portfolio companies and immediately sees: posting velocity, function mix, hiring surges and stalls, and quarter-over-quarter trends. Exportable for LP reports. No data collection burden on portfolio companies — we track it automatically from public postings. $1-3K/month per fund.

**Cadre API** (future) — the knowledge graph as infrastructure for AI recruiting agents, HR tech platforms, and investment tools. Consumption-based pricing. This is the Crustdata model applied to VC-ecosystem hiring data.

---

## Why This Matters

Job postings are the most forward-looking public signal of a company's strategic direction. A company posting 15 engineering roles is building. A company posting 10 sales roles is scaling. A company that stops posting is stalling — or about to announce layoffs. This signal is available to anyone who checks a careers page, but nobody has structured it, organized it by investor backing, or made it queryable at portfolio scale.

The alternative data industry already proved that institutional investors will pay for workforce intelligence. Revelio Labs charges hedge funds $25K-100K+/year for headcount and attrition data on public companies. But that data has never reached the VC ecosystem in a useful format. VCs monitor portfolio companies via quarterly self-reported spreadsheets. The data is stale before it arrives.

Cadre provides the workforce signal that VC portfolio monitoring tools can't — automatically, in real-time, without burdening portfolio companies with more data requests.

---

## Why The Knowledge Graph Is The Moat

Other job boards list jobs. Cadre connects jobs to companies to investors to industries in a single queryable graph — cross-portfolio.

This means we can answer questions nobody else can:

- "What is Sequoia's portfolio hiring for this week?"
- "Which Series B AI companies are ramping engineering fastest?"
- "How does my portfolio's hiring velocity compare to my co-investor's portfolio?"
- "Which of my portfolio companies have stalled hiring for 60+ days?"

Getro (850+ VC clients) gives each firm their own siloed job board. LinkedIn has all the underlying data but doesn't organize it by investor backing. Wellfound and Otta don't have the investor layer. We're the only platform with cross-portfolio aggregation.

---

## Traction

- 7,800+ jobs tracked across 1,300+ companies
- 330+ investors mapped in the knowledge graph
- Automated ATS connectors live for Greenhouse, Lever, Ashby
- Fundraise detection pipeline ingesting from TechCrunch, CryptoRank, press wires, VC Twitter
- 25+ industry categories, 16 function classifications
- AI operations agent (OpenClaw) handling database enrichment, ATS expansion, and content generation 24/7

---

## The Team

Solo founder. I built the entire platform — knowledge graph architecture, ATS connectors, data pipeline, frontend — and I'm operating it with an AI agent stack that gives me the output of a small team:

- **OpenClaw** (AI operations agent) runs 24/7 on a Mac Mini M4 — database enrichment, ATS syncing, fundraise detection, content drafting, data quality monitoring
- **Claude Code** handles frontend development, GEO/SEO infrastructure, UI iteration
- **Perplexity + Claude** for market research, competitive intelligence, strategic planning

This is what building with AI looks like in 2026. One founder, multiple AI agents, shipping at the pace of a 5-person team.

---

## Business Model

**Product 1 — Consumer (launching Q1 2026):**
- Free browse experience (all jobs, companies, investors)
- $79/month subscription for Follow + alerts + export
- 14-day free trial, payment info upfront
- Target: 100+ paying users by end of 2026

**Product 2 — Funds (launching Q2-Q3 2026):**
- Self-serve at $1K/month per fund
- Enterprise at $2-3K+/month
- Target: 10-20 fund customers by end of 2026

**Product 3 — API (2027):**
- Consumption-based pricing
- Target customers: AI recruiting agents, HR tech platforms, VC tools

**Path to $100K MRR:**
- Consumer PLG: ~$8-10K MRR (100-125 subscribers at $79)
- Fund subscriptions: ~$20-40K MRR (20-40 funds at $1-2K)
- API: ~$30-50K MRR (consumption-based, high margin)
- Timeline: 18-24 months

---

## Market Size

**Consumer (recruiter subscriptions):** ~50,000 tech recruiters at agencies + 100,000+ in-house. At $79/month, 5% penetration of addressable segment = $20-40K MRR.

**VC Funds (portfolio intelligence):** ~1,500-2,500 VC firms with platform/ops teams globally. At $1-3K/month, 10% penetration = $150-750K MRR. $7.5-15M TAM for fund-specific product.

**API (hiring data infrastructure):** Crustdata (YC F24) grew from $770K to $4M+ revenue in 7 months selling real-time signals. The market for structured hiring data is large and growing as AI agents proliferate.

---

## What We'd Do With Accelerator Support

**Immediate (Month 1-2):**
- Ship consumer Follow product with billing
- Launch content engine and newsletter
- Begin fund ops customer discovery (5-10 conversations)

**Mid-program (Month 3-4):**
- First paying consumer users
- Prototype fund dashboard (same data, different view)
- Alpha test with 2-3 VC firms

**By demo day:**
- $5K+ MRR from consumer subscriptions
- 2-3 fund pilot customers validating $1K+/month willingness to pay
- API design doc with 1-2 design partners committed
- Clear path to $100K MRR within 12 months post-program

---

## The Ask

We're creating a new category — hiring activity intelligence — at the intersection of workforce data, VC portfolio monitoring, and job discovery. The knowledge graph is built. The data pipeline is running. The market gap is validated by research showing no existing tool provides what we're building. We need capital to go full-time on this and access to the VC ecosystem that is simultaneously our market and our distribution channel.

A VC accelerator isn't just funding for Cadre — it's market access. Every partner, every talent lead, every fund ops person in your network is a potential customer. We're building the tool that makes their portfolio data more transparent, their LP reports more insightful, and their talent operations more efficient.
