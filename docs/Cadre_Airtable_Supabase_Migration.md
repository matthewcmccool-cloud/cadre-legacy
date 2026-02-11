# Cadre: Airtable → Supabase Migration Plan

**Status:** Pre-migration prep
**Goal:** Move all core data (companies, jobs, investors, fundraises) from Airtable to Supabase (Postgres), then decommission Airtable entirely.

---

## Step 0: Confirm Current Airtable Schema

**Matt — I need you to verify this before we proceed.** I'm inferring from the briefing and codebase. Open your Airtable base and confirm/correct each table and its fields.

### What I think exists:

**Companies table**
- Name (text)
- Slug (text, URL-safe)
- Logo URL (text/attachment)
- Description (long text)
- Industry (single select or linked record)
- Stage (single select: Seed, Series A, B, C, Late, Public)
- Location (text)
- Website (URL)
- ATS Platform (single select: Greenhouse, Lever, Ashby, Other, None)
- ATS Slug (text — e.g., "anthropic" for greenhouse.io/anthropic)
- Careers Page URL (URL)
- Investors (linked records → Investors table)
- Jobs (linked records → Jobs table, auto-populated)
- Open Role Count (rollup/formula counting active jobs)
- Status (single select: Active, Inactive, Stealth?)
- Created/Modified timestamps

**Jobs table**
- Title (text)
- Company (linked record → Companies)
- Location (text)
- Remote Status (single select: Remote, On-site, Hybrid)
- Function/Department (single select: Engineering, Sales, Product, Design, Marketing, Operations, etc.)
- ATS Job ID (text — external ID from Greenhouse/Lever/Ashby)
- ATS URL (URL — link to apply)
- Posted Date (date)
- First Seen Date (date — when OpenClaw first detected it)
- Last Seen Date (date — last sync that confirmed it's still active)
- Status (single select: Active, Closed, Expired?)
- Description (long text — job description body)

**Investors table**
- Name (text)
- Slug (text)
- Logo URL (text/attachment)
- Type (single select: VC, PE, Angel, CVC, Accelerator?)
- Location (text)
- Website (URL)
- Portfolio Companies (linked records → Companies)
- Company Count (rollup)
- Total Portfolio Roles (rollup)

**Fundraises table**
- Company (linked record → Companies)
- Round Type (single select: Pre-Seed, Seed, Series A, B, C, D+, Growth, Undisclosed)
- Amount (currency/number)
- Lead Investor(s) (linked records → Investors, or text?)
- Co-Investors (linked records → Investors, or text?)
- Date Announced (date)
- Source URL (URL)
- Source Name (text — TechCrunch, CryptoRank, etc.)

**Industries table (if separate)**
- Name (text)
- Slug (text)
- Companies (linked records → Companies)

### What I'm unsure about:
- Is Industries a separate table or a select field on Companies?
- Is there a Company-Investor junction table, or is it a direct linked record field?
- Are there any other tables (tags, categories, enrichment queue, sync logs)?
- What fields does OpenClaw use for pipeline management (sync status, last synced, enrichment flags)?
- Are fundraise investors stored as linked records or free text?

**Action for Matt:** Open Airtable, screenshot or list the actual tables and fields. Correct anything above. This is the foundation — if the schema is wrong, the migration breaks.

---

## Step 1: Supabase Schema Design

Once you confirm the Airtable schema, here's the target Postgres schema. I'm designing this for the product we're building (PLG + future fund dashboard + future API), not just a 1:1 copy of Airtable.

### Core Tables

```sql
-- ============================================
-- COMPANIES
-- ============================================
CREATE TABLE companies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airtable_id   text UNIQUE,                    -- keep for migration mapping, drop later
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  logo_url      text,
  description   text,
  website       text,
  location      text,
  stage         text,                            -- 'seed', 'series_a', 'series_b', etc.
  ats_platform  text,                            -- 'greenhouse', 'lever', 'ashby', 'workday', 'custom', 'none'
  ats_slug      text,                            -- platform-specific identifier
  careers_url   text,
  status        text DEFAULT 'active',           -- 'active', 'inactive', 'stealth'
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_stage ON companies(stage);
CREATE INDEX idx_companies_status ON companies(status);

-- ============================================
-- INVESTORS
-- ============================================
CREATE TABLE investors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airtable_id   text UNIQUE,
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  logo_url      text,
  type          text,                            -- 'vc', 'pe', 'angel', 'cvc', 'accelerator'
  location      text,
  website       text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_investors_slug ON investors(slug);

-- ============================================
-- COMPANY ↔ INVESTOR (junction table)
-- ============================================
-- This replaces Airtable's linked record field.
-- Explicit junction table is better for queries, indexes, and future metadata
-- (e.g., "lead investor for round X" or "board seat" flags).
CREATE TABLE company_investors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  investor_id   uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  relationship  text DEFAULT 'investor',         -- 'investor', 'lead', 'board_seat' (future use)
  created_at    timestamptz DEFAULT now(),
  UNIQUE(company_id, investor_id)
);

CREATE INDEX idx_ci_company ON company_investors(company_id);
CREATE INDEX idx_ci_investor ON company_investors(investor_id);

-- ============================================
-- INDUSTRIES
-- ============================================
-- Separate table rather than a text field on companies.
-- Allows many-to-many (a company can be "AI" AND "Healthcare").
-- Better for filtering, GEO pages, and the knowledge graph.
CREATE TABLE industries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text UNIQUE NOT NULL,
  slug          text UNIQUE NOT NULL
);

CREATE TABLE company_industries (
  company_id    uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  industry_id   uuid NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  PRIMARY KEY (company_id, industry_id)
);

CREATE INDEX idx_cind_company ON company_industries(company_id);
CREATE INDEX idx_cind_industry ON company_industries(industry_id);

-- ============================================
-- JOBS
-- ============================================
CREATE TABLE jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airtable_id     text UNIQUE,
  company_id      uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title           text NOT NULL,
  location        text,
  remote_status   text,                          -- 'remote', 'onsite', 'hybrid'
  function        text,                          -- 'engineering', 'sales', 'product', etc.
  ats_job_id      text,                          -- external ID from ATS platform
  ats_url         text,                          -- direct apply link
  description     text,
  posted_date     date,
  first_seen_at   timestamptz DEFAULT now(),
  last_seen_at    timestamptz DEFAULT now(),
  status          text DEFAULT 'active',         -- 'active', 'closed'
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_function ON jobs(function);
CREATE INDEX idx_jobs_posted ON jobs(posted_date DESC);
CREATE INDEX idx_jobs_ats ON jobs(ats_job_id, company_id);  -- for dedup during sync
CREATE INDEX idx_jobs_company_status ON jobs(company_id, status);  -- for "active roles at company X"

-- ============================================
-- FUNDRAISES
-- ============================================
CREATE TABLE fundraises (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airtable_id     text UNIQUE,
  company_id      uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  round_type      text,                          -- 'pre_seed', 'seed', 'series_a', etc.
  amount          bigint,                        -- in USD, null if undisclosed
  date_announced  date,
  source_url      text,
  source_name     text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_fundraises_company ON fundraises(company_id);
CREATE INDEX idx_fundraises_date ON fundraises(date_announced DESC);

-- Fundraise ↔ Investor junction (lead vs. participant)
CREATE TABLE fundraise_investors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraise_id    uuid NOT NULL REFERENCES fundraises(id) ON DELETE CASCADE,
  investor_id     uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  role            text DEFAULT 'participant',    -- 'lead', 'participant'
  UNIQUE(fundraise_id, investor_id)
);

CREATE INDEX idx_fi_fundraise ON fundraise_investors(fundraise_id);
CREATE INDEX idx_fi_investor ON fundraise_investors(investor_id);
```

### User Data Tables (already in Claude Code Prompt 2, included here for completeness)

```sql
-- ============================================
-- FOLLOWS (user → company)
-- ============================================
CREATE TABLE follows (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               text NOT NULL,           -- Clerk user ID
  company_id            uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source                text DEFAULT 'direct',   -- 'direct', 'portfolio'
  portfolio_investor_id uuid REFERENCES investors(id),
  created_at            timestamptz DEFAULT now(),
  UNIQUE(user_id, company_id)
);

CREATE INDEX idx_follows_user ON follows(user_id);
CREATE INDEX idx_follows_company ON follows(company_id);

-- ============================================
-- ALERT PREFERENCES
-- ============================================
CREATE TABLE alert_preferences (
  user_id             text PRIMARY KEY,
  weekly_digest       boolean DEFAULT true,
  daily_digest        boolean DEFAULT false,
  daily_digest_time   text DEFAULT '09:00',
  realtime_new_roles  boolean DEFAULT true,
  realtime_fundraises boolean DEFAULT true,
  realtime_surges     boolean DEFAULT true,
  realtime_stalls     boolean DEFAULT true,
  newsletter          boolean DEFAULT true,
  updated_at          timestamptz DEFAULT now()
);

-- ============================================
-- FEED EVENTS (denormalized for fast feed queries)
-- ============================================
CREATE TABLE feed_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      text NOT NULL,                 -- 'new_role', 'fundraise', 'surge', 'stall'
  company_id      uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_name    text NOT NULL,                 -- denormalized for speed
  company_logo    text,
  company_stage   text,
  event_data      jsonb NOT NULL,                -- flexible per event type
  event_date      timestamptz NOT NULL,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_feed_company_date ON feed_events(company_id, event_date DESC);
CREATE INDEX idx_feed_date ON feed_events(event_date DESC);
CREATE INDEX idx_feed_type ON feed_events(event_type);

-- ============================================
-- COMPANY DAILY METRICS (sparklines, trends, content engine)
-- ============================================
CREATE TABLE company_daily_metrics (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  date              date NOT NULL,
  active_roles      integer DEFAULT 0,
  new_roles         integer DEFAULT 0,
  closed_roles      integer DEFAULT 0,
  roles_by_function jsonb,                       -- {"engineering": 12, "sales": 5, ...}
  UNIQUE(company_id, date)
);

CREATE INDEX idx_metrics_company_date ON company_daily_metrics(company_id, date DESC);
```

### Computed Views (Postgres views, not tables — always fresh)

```sql
-- Company stats (replaces Airtable rollup fields)
CREATE VIEW company_stats AS
SELECT
  c.id,
  c.name,
  c.slug,
  COUNT(j.id) FILTER (WHERE j.status = 'active') AS active_roles,
  COUNT(j.id) FILTER (WHERE j.status = 'active' AND j.posted_date >= CURRENT_DATE - INTERVAL '7 days') AS new_this_week,
  COUNT(j.id) FILTER (WHERE j.status = 'active' AND j.posted_date >= CURRENT_DATE - INTERVAL '30 days') AS new_this_month
FROM companies c
LEFT JOIN jobs j ON j.company_id = c.id
WHERE c.status = 'active'
GROUP BY c.id, c.name, c.slug;

-- Investor portfolio stats (replaces Airtable rollups)
CREATE VIEW investor_stats AS
SELECT
  i.id,
  i.name,
  i.slug,
  COUNT(DISTINCT ci.company_id) AS portfolio_companies,
  COUNT(j.id) FILTER (WHERE j.status = 'active') AS total_portfolio_roles,
  COUNT(j.id) FILTER (WHERE j.status = 'active' AND j.posted_date >= CURRENT_DATE - INTERVAL '7 days') AS new_this_week
FROM investors i
JOIN company_investors ci ON ci.investor_id = i.id
JOIN companies c ON c.id = ci.company_id AND c.status = 'active'
LEFT JOIN jobs j ON j.company_id = c.id
GROUP BY i.id, i.name, i.slug;
```

### Why This Schema Is Better Than Airtable

1. **Proper junction tables.** Airtable's "linked records" are fine for small data but create performance issues at scale. Postgres junction tables with indexes handle millions of rows.

2. **Many-to-many industries.** A company can be "AI" AND "Healthcare" AND "Enterprise." Airtable's single-select forces you to pick one.

3. **Fundraise-investor relationships with roles.** Now you can distinguish "led by Sequoia" from "with participation from a16z" in queries.

4. **Computed views.** `company_stats` and `investor_stats` replace Airtable's fragile rollup fields. They're always fresh and don't count against API rate limits.

5. **feed_events is denormalized intentionally.** Stores company_name and company_logo directly so the feed API doesn't need to join to companies on every request. Fast reads for the most performance-sensitive page.

6. **company_daily_metrics powers everything.** Sparklines, content engine, surge/stall detection, fund dashboard trends. This table is the foundation for all time-series features.

7. **airtable_id columns.** Kept temporarily on every table for migration mapping. Once migration is verified and Airtable is decommissioned, drop these columns.

---

## Step 2: Supabase Project Setup

Do this now (takes 10 minutes):

1. Go to supabase.com → create new project (or use existing one if you already have a Cadre project)
2. Region: us-east-1 (closest to Vercel's default region and your users)
3. Set a strong database password — save it in 1Password
4. Once the project is provisioned, go to Settings → API and copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY — backend only, never expose client-side)
5. Add all three to your Vercel environment variables AND your .env.local
6. Go to SQL Editor and run the CREATE TABLE statements from Step 1 above
7. Verify tables exist in the Table Editor

### Row Level Security (RLS)

Enable RLS on all tables, but for MVP, set permissive policies that let the service_role key do everything. The frontend uses the service_role key through Next.js API routes (never directly from the client).

```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraises ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_daily_metrics ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS by default, so your API routes work.
-- For the anon key (if you ever use it client-side), add read policies:
CREATE POLICY "Public read access" ON companies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON investors FOR SELECT USING (true);
CREATE POLICY "Public read access" ON jobs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON fundraises FOR SELECT USING (true);
CREATE POLICY "Public read access" ON industries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON company_investors FOR SELECT USING (true);
CREATE POLICY "Public read access" ON company_industries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON fundraise_investors FOR SELECT USING (true);

-- Follows: users can only read/write their own
CREATE POLICY "Users manage own follows" ON follows
  FOR ALL USING (auth.uid()::text = user_id);

-- Alert preferences: users can only read/write their own
CREATE POLICY "Users manage own preferences" ON alert_preferences
  FOR ALL USING (auth.uid()::text = user_id);
```

---

## Step 3: Data Migration Script

This is a one-time migration. OpenClaw can run it, or you can run it manually.

### Approach: Export Airtable → Transform → Import to Supabase

**Option A: Airtable API → Script → Supabase (recommended)**

Write a Node.js or Python script that:
1. Reads all records from each Airtable table via the Airtable API
2. Transforms them into the Supabase schema format
3. Inserts them into Supabase via the Supabase client

This is better than CSV export because it handles linked records (Airtable returns record IDs for linked records, which the script resolves to Supabase UUIDs).

**Option B: CSV export → Clean → Import**

Faster for simple tables but breaks on linked records. Only use for tables without relationships.

### Migration Order (dependencies matter)

```
1. Industries     (no dependencies)
2. Investors      (no dependencies)
3. Companies      (no dependencies for core fields)
4. company_industries  (depends on companies + industries)
5. company_investors   (depends on companies + investors)
6. Jobs           (depends on companies)
7. Fundraises     (depends on companies)
8. fundraise_investors (depends on fundraises + investors)
```

### Script Pseudocode

```javascript
// migration.js — run once

const Airtable = require('airtable');
const { createClient } = require('@supabase/supabase-js');

const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ID mapping: airtable_id → supabase_uuid
const companyMap = {};  // airtable record ID → supabase UUID
const investorMap = {};
const industryMap = {};
const fundraiseMap = {};

// Step 1: Migrate Industries
// If industries are a separate table:
const industries = await fetchAll(airtable('Industries'));
for (const ind of industries) {
  const { data } = await supabase.from('industries').insert({
    name: ind.fields['Name'],
    slug: slugify(ind.fields['Name']),
  }).select().single();
  industryMap[ind.id] = data.id;
}
// If industries are a select field on Companies, extract unique values first:
// const uniqueIndustries = [...new Set(companies.map(c => c.fields['Industry']))];

// Step 2: Migrate Investors
const investors = await fetchAll(airtable('Investors'));
for (const inv of investors) {
  const { data } = await supabase.from('investors').insert({
    airtable_id: inv.id,
    name: inv.fields['Name'],
    slug: inv.fields['Slug'] || slugify(inv.fields['Name']),
    logo_url: inv.fields['Logo']?.[0]?.url || inv.fields['Logo URL'],
    type: inv.fields['Type']?.toLowerCase(),
    location: inv.fields['Location'],
    website: inv.fields['Website'],
  }).select().single();
  investorMap[inv.id] = data.id;
}

// Step 3: Migrate Companies
const companies = await fetchAll(airtable('Companies'));
for (const co of companies) {
  const { data } = await supabase.from('companies').insert({
    airtable_id: co.id,
    name: co.fields['Name'],
    slug: co.fields['Slug'] || slugify(co.fields['Name']),
    logo_url: co.fields['Logo']?.[0]?.url || co.fields['Logo URL'],
    description: co.fields['Description'],
    website: co.fields['Website'],
    location: co.fields['Location'],
    stage: normalizeStage(co.fields['Stage']),
    ats_platform: co.fields['ATS Platform']?.toLowerCase(),
    ats_slug: co.fields['ATS Slug'],
    careers_url: co.fields['Careers URL'],
    status: co.fields['Status']?.toLowerCase() || 'active',
  }).select().single();
  companyMap[co.id] = data.id;
}

// Step 4: Migrate company_industries junction
for (const co of companies) {
  const industry = co.fields['Industry']; // single select or linked records
  if (industry) {
    // If single select:
    const indId = industryMap[industry] || industryMap[slugify(industry)];
    if (indId) {
      await supabase.from('company_industries').insert({
        company_id: companyMap[co.id],
        industry_id: indId,
      });
    }
    // If linked records:
    // for (const indAirtableId of industry) { ... }
  }
}

// Step 5: Migrate company_investors junction
for (const co of companies) {
  const investorIds = co.fields['Investors'] || [];
  for (const invAirtableId of investorIds) {
    if (investorMap[invAirtableId]) {
      await supabase.from('company_investors').insert({
        company_id: companyMap[co.id],
        investor_id: investorMap[invAirtableId],
      });
    }
  }
}

// Step 6: Migrate Jobs
const jobs = await fetchAll(airtable('Jobs'));
for (const job of jobs) {
  const companyAirtableId = job.fields['Company']?.[0]; // linked record
  await supabase.from('jobs').insert({
    airtable_id: job.id,
    company_id: companyMap[companyAirtableId],
    title: job.fields['Title'],
    location: job.fields['Location'],
    remote_status: job.fields['Remote']?.toLowerCase(),
    function: job.fields['Function']?.toLowerCase(),
    ats_job_id: job.fields['ATS Job ID'],
    ats_url: job.fields['ATS URL'],
    description: job.fields['Description'],
    posted_date: job.fields['Posted Date'],
    first_seen_at: job.fields['First Seen'] || job.fields['Created'],
    last_seen_at: job.fields['Last Seen'] || new Date().toISOString(),
    status: job.fields['Status']?.toLowerCase() || 'active',
  });
}

// Step 7: Migrate Fundraises
const fundraises = await fetchAll(airtable('Fundraises'));
for (const fr of fundraises) {
  const companyAirtableId = fr.fields['Company']?.[0];
  const { data } = await supabase.from('fundraises').insert({
    airtable_id: fr.id,
    company_id: companyMap[companyAirtableId],
    round_type: normalizeRound(fr.fields['Round Type']),
    amount: fr.fields['Amount'],
    date_announced: fr.fields['Date Announced'],
    source_url: fr.fields['Source URL'],
    source_name: fr.fields['Source'],
  }).select().single();
  fundraiseMap[fr.id] = data.id;

  // Step 8: Fundraise investors
  const leadInvestors = fr.fields['Lead Investor'] || [];
  for (const invId of leadInvestors) {
    if (investorMap[invId]) {
      await supabase.from('fundraise_investors').insert({
        fundraise_id: data.id,
        investor_id: investorMap[invId],
        role: 'lead',
      });
    }
  }
  const coInvestors = fr.fields['Co-Investors'] || [];
  for (const invId of coInvestors) {
    if (investorMap[invId]) {
      await supabase.from('fundraise_investors').insert({
        fundraise_id: data.id,
        investor_id: investorMap[invId],
        role: 'participant',
      });
    }
  }
}

// Helper: fetch all records from an Airtable table (handles pagination)
async function fetchAll(table) {
  const records = [];
  await table.select().eachPage((page, next) => {
    records.push(...page);
    next();
  });
  return records;
}
```

### Validation Checks After Migration

Run these queries to verify data integrity:

```sql
-- Record counts should match Airtable
SELECT 'companies' as table_name, COUNT(*) FROM companies
UNION ALL SELECT 'investors', COUNT(*) FROM investors
UNION ALL SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL SELECT 'fundraises', COUNT(*) FROM fundraises
UNION ALL SELECT 'company_investors', COUNT(*) FROM company_investors;

-- Every company should have at least one investor (or flag orphans)
SELECT c.name FROM companies c
LEFT JOIN company_investors ci ON ci.company_id = c.id
WHERE ci.id IS NULL;

-- Every job should have a valid company
SELECT j.title FROM jobs j
LEFT JOIN companies c ON j.company_id = c.id
WHERE c.id IS NULL;

-- Spot check: compare a known company's data
SELECT c.name, c.stage,
  (SELECT COUNT(*) FROM jobs WHERE company_id = c.id AND status = 'active') as active_jobs,
  (SELECT COUNT(*) FROM company_investors WHERE company_id = c.id) as investor_count
FROM companies c WHERE c.slug = 'anthropic';
```

---

## Step 4: Frontend Cutover

### Current State
The frontend reads from Airtable API via Next.js API routes or direct client calls.

### Migration Strategy: Parallel Read, Then Switch

**Phase A: Add Supabase client alongside Airtable (no breaking changes)**
- Install @supabase/supabase-js
- Create lib/supabase.ts with server/client variants
- Create new API routes that read from Supabase (e.g., /api/v2/companies)
- Keep old Airtable API routes working

**Phase B: Switch pages one at a time**
- Start with low-risk pages: /fundraises (newest data, easiest to verify)
- Then /discover?view=investors (smaller dataset)
- Then /discover?view=companies (largest dataset, most traffic)
- Then /company/[slug] and /investor/[slug] detail pages
- Then /discover?view=jobs (most records)
- Then /job/[id] detail pages

For each page:
1. Point the page component to the new Supabase API route
2. Verify the page renders correctly with Supabase data
3. Confirm performance is equal or better than Airtable
4. Deploy
5. Monitor for 24 hours
6. Move to next page

**Phase C: Remove Airtable dependencies**
- Delete old API routes that read from Airtable
- Remove airtable npm package
- Remove AIRTABLE_API_KEY from environment variables
- Drop airtable_id columns from Supabase tables (optional, can keep for audit trail)

### The Supabase API Advantage

Your current API routes probably look like:
```javascript
// Old: Airtable
const records = await airtable('Companies').select({
  filterByFormula: `{Industry} = 'AI'`,
  sort: [{ field: 'Open Roles', direction: 'desc' }],
}).all();
```

New Supabase equivalent:
```javascript
// New: Supabase — faster, typed, no rate limits
const { data } = await supabase
  .from('companies')
  .select(`
    *,
    company_industries!inner(industry:industries(name, slug)),
    company_investors(investor:investors(name, slug)),
    active_roles:jobs(count).filter('status', 'eq', 'active')
  `)
  .eq('company_industries.industries.slug', 'ai')
  .eq('status', 'active')
  .order('active_roles', { ascending: false });
```

Key wins:
- No 5 req/second rate limit
- Nested joins in one query (company + investors + industries + role count)
- Full-text search via Postgres
- Real-time subscriptions (future: live feed updates)
- <50ms query times vs. Airtable's 200-500ms

---

## Step 5: OpenClaw Pipeline Cutover

OpenClaw currently writes to Airtable during syncs. It needs to write to Supabase instead.

### What Changes for OpenClaw

**ATS Sync Pipeline:**
- Old: sync jobs → write to Airtable Jobs table
- New: sync jobs → write to Supabase jobs table → also write to feed_events table → also update company_daily_metrics

**Company Enrichment:**
- Old: update company fields in Airtable
- New: update company row in Supabase

**Fundraise Detection:**
- Old: create fundraise record in Airtable, link investors
- New: create fundraise in Supabase, create fundraise_investors rows, create feed_event

**Anomaly Detection:**
- Old: query Airtable for posting history
- New: query company_daily_metrics in Supabase (much faster, proper time-series)

### New OpenClaw Responsibilities (Supabase-specific)

1. **Daily metrics recording.** After each sync, compute and insert/upsert into company_daily_metrics:
```sql
INSERT INTO company_daily_metrics (company_id, date, active_roles, new_roles, closed_roles, roles_by_function)
VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
ON CONFLICT (company_id, date) DO UPDATE SET
  active_roles = EXCLUDED.active_roles,
  new_roles = EXCLUDED.new_roles,
  closed_roles = EXCLUDED.closed_roles,
  roles_by_function = EXCLUDED.roles_by_function;
```

2. **Feed event generation.** When new jobs are detected during sync:
```sql
INSERT INTO feed_events (event_type, company_id, company_name, company_logo, company_stage, event_data, event_date)
VALUES ('new_role', $company_id, $company_name, $logo, $stage,
  '{"job_id": "...", "title": "...", "location": "...", "function": "..."}'::jsonb,
  NOW());
```

3. **Surge/stall detection.** Query company_daily_metrics to flag anomalies:
```sql
-- Stall: no new roles in 60+ days
SELECT company_id FROM company_daily_metrics
WHERE date = CURRENT_DATE AND active_roles > 0
AND company_id NOT IN (
  SELECT DISTINCT company_id FROM company_daily_metrics
  WHERE new_roles > 0 AND date > CURRENT_DATE - INTERVAL '60 days'
);

-- Surge: 3x+ average posting rate this week vs. 90-day average
WITH weekly AS (
  SELECT company_id, SUM(new_roles) as this_week
  FROM company_daily_metrics
  WHERE date > CURRENT_DATE - INTERVAL '7 days'
  GROUP BY company_id
),
baseline AS (
  SELECT company_id, AVG(new_roles) * 7 as avg_weekly
  FROM company_daily_metrics
  WHERE date > CURRENT_DATE - INTERVAL '90 days'
  GROUP BY company_id
  HAVING AVG(new_roles) > 0
)
SELECT w.company_id, w.this_week, b.avg_weekly
FROM weekly w JOIN baseline b ON w.company_id = b.company_id
WHERE w.this_week >= b.avg_weekly * 3;
```

### OpenClaw Migration Prompt

Give this to OpenClaw when you're ready:

```
We're migrating from Airtable to Supabase. Here's what changes:

DATABASE CONNECTION:
- Old: Airtable API (base ID: [YOUR_BASE_ID], API key in env)
- New: Supabase (URL and service_role key in env)
- Use @supabase/supabase-js for all database operations

SCHEMA:
- [paste the CREATE TABLE statements from this doc]

YOUR NEW RESPONSIBILITIES:
1. All ATS sync writes go to Supabase `jobs` table (not Airtable)
2. After every sync, record daily metrics in `company_daily_metrics`
3. After every sync, generate `feed_events` for new jobs and fundraises
4. New companies/investors/fundraises all go to Supabase
5. Anomaly detection queries `company_daily_metrics` instead of ad-hoc Airtable queries

MIGRATION PERIOD:
- During migration, write to BOTH Airtable and Supabase (dual-write)
- Once frontend is fully on Supabase, stop Airtable writes
- Keep Airtable read-only as a backup for 2 weeks, then decommission
```

---

## Step 6: Cutover Timeline

### Pre-Migration (do this week — before cabin sprint)
- [ ] Matt: confirm Airtable schema (Step 0)
- [ ] Matt: create Supabase project, run CREATE TABLE SQL (Step 2)
- [ ] Matt: add Supabase env vars to Vercel and .env.local

### Week 1 of Cabin Sprint
- [ ] Run migration script to copy all data from Airtable to Supabase (Step 3)
- [ ] Run validation queries to confirm data integrity
- [ ] Spot-check 10 companies, 10 investors, 50 jobs against Airtable
- [ ] Tell OpenClaw to start dual-writing (Airtable + Supabase)
- [ ] OpenClaw starts recording company_daily_metrics daily

### Week 2 of Cabin Sprint
- [ ] Switch frontend pages to Supabase one at a time (Step 4, Phase B)
- [ ] Start with /fundraises, then investors, then companies, then jobs
- [ ] Verify each page after switching, deploy, monitor 24h

### Week 3
- [ ] All frontend reads from Supabase
- [ ] Tell OpenClaw to stop writing to Airtable
- [ ] Keep Airtable alive but read-only for 2 weeks as safety net
- [ ] Remove Airtable API routes from codebase

### Week 4 (or whenever comfortable)
- [ ] Decommission Airtable
- [ ] Drop airtable_id columns from Supabase (optional)
- [ ] Cancel Airtable subscription

---

## Step 7: Things That Will Go Wrong

**1. Airtable linked records don't resolve cleanly.**
Some Airtable linked record fields might contain record IDs for records that don't exist (deleted companies, orphaned investors). The migration script needs to handle this gracefully — log the orphan, skip the junction row, continue.

**2. Airtable attachment URLs expire.**
If logos are stored as Airtable attachments, the URLs are temporary (they expire after a few hours). You need to either: (a) download all logo images during migration and re-host them (Supabase Storage or a CDN), or (b) use separate permanent logo URLs if they exist. Check if your logo_url fields are Airtable attachment URLs or permanent external URLs.

**3. Airtable rate limits during export.**
The migration script reads all records via the Airtable API. At 5 requests/second, exporting 34,000 jobs will take a while. Budget 30-60 minutes for the full migration script to run. Use the `eachPage` pagination method — don't try to load all records at once.

**4. Slug collisions.**
If slugs are auto-generated during migration (from company/investor names), you might get collisions. "AI" the company and "AI" the industry both slugify to "ai". Add a dedup suffix if needed.

**5. OpenClaw dual-write period is messy.**
During the 1-2 weeks of dual-writing, data could drift (a record updated in Supabase but not Airtable, or vice versa). Accept this. Supabase is the source of truth from the moment the migration script runs. Airtable is the fallback. Don't try to keep them perfectly in sync.

**6. Supabase connection pooling.**
Vercel serverless functions can exhaust Supabase's default connection pool (max ~60 connections). If you see "too many connections" errors, enable Supabase's built-in connection pooler (Supavisor) in the dashboard under Settings → Database → Connection Pooling. Use the pooler URL in your app, not the direct connection string.

---

## What You Can Do Right Now (Before the Cabin)

1. **Confirm the Airtable schema** — open Airtable, verify every table and field name listed in Step 0. Send me corrections.
2. **Create the Supabase project** — 5 minutes. Copy the credentials.
3. **Run the CREATE TABLE SQL** — copy-paste from Step 1 into the Supabase SQL editor. Takes 2 minutes.
4. **Add env vars to Vercel** — SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
5. **Check your logo situation** — are logo URLs permanent (like a CDN) or Airtable attachment URLs that expire?

That's the prep. The actual migration runs during Week 1 of the cabin sprint.
