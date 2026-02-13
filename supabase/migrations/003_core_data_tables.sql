-- MIGRATION 003: Core data tables

-- Industries
CREATE TABLE industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  airtable_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Investors
CREATE TABLE investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  type TEXT, -- 'vc', 'pe', 'angel', 'cvc', 'accelerator'
  location TEXT,
  website TEXT,
  description TEXT,
  airtable_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website TEXT,
  logo_url TEXT,
  about TEXT,
  hq_location TEXT,
  stage TEXT, -- Seed, Series A, Series B, Series C, Growth, Public, Acquired
  size TEXT,
  total_raised BIGINT,
  ats_platform TEXT, -- Greenhouse, Lever, Ashby, Workday, Custom
  ats_slug TEXT,
  careers_url TEXT,
  jobs_api_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  status TEXT DEFAULT 'active', -- active, inactive, stealth
  last_sync TIMESTAMPTZ,
  airtable_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  remote_status TEXT, -- 'remote', 'hybrid', 'onsite'
  function TEXT, -- Engineering, Sales, etc.
  department TEXT,
  ats_job_id TEXT,
  ats_url TEXT,
  job_url TEXT UNIQUE,
  apply_url TEXT,
  description TEXT,
  keywords TEXT[],
  ats_platform TEXT,
  date_posted TIMESTAMPTZ,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  date_closed TIMESTAMPTZ,
  status TEXT DEFAULT 'active', -- active, closed
  raw_json JSONB,
  airtable_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fundraises
CREATE TABLE fundraises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  round_type TEXT,
  amount BIGINT,
  valuation BIGINT,
  date_announced DATE,
  source_name TEXT, -- 'sec_edgar', 'crunchbase', 'techcrunch', 'cryptorank'
  source_url TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction: company_industries
CREATE TABLE company_industries (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES industries(id) ON DELETE CASCADE,
  PRIMARY KEY (company_id, industry_id)
);

-- Junction: company_investors
CREATE TABLE company_investors (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  relationship TEXT, -- e.g. 'portfolio', 'board', 'advisor'
  PRIMARY KEY (company_id, investor_id)
);

-- Junction: fundraise_investors
CREATE TABLE fundraise_investors (
  fundraise_id UUID REFERENCES fundraises(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant', -- 'lead', 'participant'
  PRIMARY KEY (fundraise_id, investor_id)
);

-- Indexes
CREATE INDEX idx_companies_stage ON companies(stage);
CREATE INDEX idx_companies_ats ON companies(ats_platform);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_airtable ON companies(airtable_id);
CREATE INDEX idx_investors_airtable ON investors(airtable_id);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_function ON jobs(function);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_posted ON jobs(date_posted DESC);
CREATE INDEX idx_jobs_url ON jobs(job_url);
CREATE INDEX idx_jobs_airtable ON jobs(airtable_id);
CREATE INDEX idx_fundraises_company ON fundraises(company_id);
CREATE INDEX idx_fundraises_date ON fundraises(date_announced DESC);
CREATE INDEX idx_fundraises_source ON fundraises(source_name);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_investors_updated BEFORE UPDATE ON investors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS with public read
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraises ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON companies FOR SELECT USING (true);
CREATE POLICY "Public read" ON jobs FOR SELECT USING (true);
CREATE POLICY "Public read" ON investors FOR SELECT USING (true);
CREATE POLICY "Public read" ON fundraises FOR SELECT USING (true);
CREATE POLICY "Public read" ON industries FOR SELECT USING (true);

-- Computed views
CREATE VIEW company_stats AS
SELECT
  c.id AS company_id,
  COUNT(j.id) FILTER (WHERE j.status = 'active') AS active_roles,
  COUNT(j.id) FILTER (WHERE j.status = 'active' AND j.first_seen_at > now() - interval '7 days') AS new_this_week,
  COUNT(j.id) FILTER (WHERE j.status = 'active' AND j.first_seen_at > now() - interval '30 days') AS new_this_month
FROM companies c
LEFT JOIN jobs j ON j.company_id = c.id
GROUP BY c.id;

CREATE VIEW investor_stats AS
SELECT
  i.id AS investor_id,
  COUNT(DISTINCT ci.company_id) AS portfolio_companies,
  COUNT(j.id) FILTER (WHERE j.status = 'active') AS total_portfolio_roles,
  COUNT(j.id) FILTER (WHERE j.status = 'active' AND j.first_seen_at > now() - interval '7 days') AS new_this_week
FROM investors i
LEFT JOIN company_investors ci ON ci.investor_id = i.id
LEFT JOIN jobs j ON j.company_id = ci.company_id
GROUP BY i.id;
