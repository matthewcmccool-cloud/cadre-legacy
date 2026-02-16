-- ═══════════════════════════════════════════════════════════════════════
-- Cadre v1 — Schema Migrations
-- From Data Confidence Audit
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Job Snapshots table (daily headcount tracking)
CREATE TABLE IF NOT EXISTS job_snapshots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid REFERENCES companies(id),
  snapshot_date   date NOT NULL,
  open_count      integer NOT NULL,
  func_breakdown  jsonb,        -- {"eng": 14, "gtm": 8, "ops": 3, "exec": 2}
  scrape_status   text,         -- 'success', 'partial', 'failed', 'skipped'
  created_at      timestamptz DEFAULT now(),
  UNIQUE(company_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_company_date
  ON job_snapshots(company_id, snapshot_date DESC);


-- 2. Title classification lookup table
CREATE TABLE IF NOT EXISTS title_classifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword         text NOT NULL UNIQUE,
  function_bucket text NOT NULL,  -- 'eng', 'gtm', 'ops', 'exec'
  seniority       text,           -- 'entry', 'mid', 'senior', 'staff', 'manager', 'director', 'vp', 'c_suite'
  priority        integer DEFAULT 0  -- higher = wins in conflicts
);


-- 3. Add classification columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS function_bucket text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS seniority_level text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS bucket_confidence text DEFAULT 'low';


-- 4. Add scrape tracking columns to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS scrape_source text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS careers_url_status text DEFAULT 'unknown';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_successful_scrape timestamptz;


-- 5. Add deduplication columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS normalized_title text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dedup_group_id uuid;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT true;


-- 6. Pre-computed company_pulse materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS company_pulse AS
SELECT
  c.id AS company_id,
  c.name,
  c.logo_url,
  c.stage,
  c.sector,
  c.hq_location,
  c.careers_url,
  c.description,
  COUNT(j.id) FILTER (WHERE j.is_active AND j.is_primary) AS open_roles,
  -- 7d change
  COUNT(j.id) FILTER (WHERE j.is_active AND j.is_primary)
    - COALESCE((SELECT open_count FROM job_snapshots WHERE company_id = c.id
        AND snapshot_date = CURRENT_DATE - 7 AND scrape_status = 'success'), 0) AS change_7d,
  -- 30d change
  COUNT(j.id) FILTER (WHERE j.is_active AND j.is_primary)
    - COALESCE((SELECT open_count FROM job_snapshots WHERE company_id = c.id
        AND snapshot_date = CURRENT_DATE - 30 AND scrape_status = 'success'), 0) AS change_30d,
  -- Functional breakdown
  jsonb_build_object(
    'eng', COUNT(j.id) FILTER (WHERE j.is_active AND j.is_primary AND j.function_bucket = 'eng'),
    'gtm', COUNT(j.id) FILTER (WHERE j.is_active AND j.is_primary AND j.function_bucket = 'gtm'),
    'ops', COUNT(j.id) FILTER (WHERE j.is_active AND j.is_primary AND j.function_bucket = 'ops'),
    'exec', COUNT(j.id) FILTER (WHERE j.is_active AND j.is_primary AND j.function_bucket = 'exec')
  ) AS func_breakdown,
  c.last_successful_scrape,
  c.scrape_source
FROM companies c
LEFT JOIN jobs j ON j.company_id = c.id
GROUP BY c.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pulse_company ON company_pulse(company_id);


-- 7. Seed title classifications with initial keywords
INSERT INTO title_classifications (keyword, function_bucket, seniority, priority) VALUES
  -- Engineering
  ('engineer', 'eng', NULL, 10),
  ('developer', 'eng', NULL, 10),
  ('architect', 'eng', NULL, 10),
  ('sre', 'eng', NULL, 10),
  ('devops', 'eng', NULL, 10),
  ('qa', 'eng', NULL, 10),
  ('data scientist', 'eng', NULL, 10),
  ('machine learning', 'eng', NULL, 10),
  ('ml engineer', 'eng', NULL, 12),
  ('infrastructure', 'eng', NULL, 8),
  ('platform', 'eng', NULL, 8),
  ('security engineer', 'eng', NULL, 12),
  ('frontend', 'eng', NULL, 10),
  ('backend', 'eng', NULL, 10),
  ('full-stack', 'eng', NULL, 10),
  ('fullstack', 'eng', NULL, 10),
  ('software', 'eng', NULL, 8),
  -- Go-to-Market
  ('sales', 'gtm', NULL, 10),
  ('account executive', 'gtm', NULL, 12),
  ('sdr', 'gtm', 'entry', 12),
  ('bdr', 'gtm', 'entry', 12),
  ('marketing', 'gtm', NULL, 10),
  ('growth', 'gtm', NULL, 8),
  ('customer success', 'gtm', NULL, 10),
  ('solutions', 'gtm', NULL, 8),
  ('partnerships', 'gtm', NULL, 10),
  ('revenue', 'gtm', NULL, 8),
  ('product marketing', 'gtm', NULL, 12),
  ('demand gen', 'gtm', NULL, 12),
  -- Operations
  ('recruiter', 'ops', NULL, 10),
  ('human resources', 'ops', NULL, 10),
  ('people', 'ops', NULL, 8),
  ('finance', 'ops', NULL, 10),
  ('legal', 'ops', NULL, 10),
  ('accounting', 'ops', NULL, 10),
  ('admin', 'ops', NULL, 8),
  ('operations', 'ops', NULL, 8),
  ('office', 'ops', NULL, 8),
  ('compliance', 'ops', NULL, 10),
  ('analyst', 'ops', NULL, 6),
  -- Seniority keywords (these get combined with function matches)
  ('intern', 'eng', 'entry', 4),
  ('junior', 'eng', 'entry', 4),
  ('senior', 'eng', 'senior', 4),
  ('staff', 'eng', 'staff', 4),
  ('principal', 'eng', 'staff', 4),
  ('manager', 'ops', 'manager', 4),
  ('director', 'ops', 'director', 6),
  ('head of', 'ops', 'director', 6),
  ('vp', 'exec', 'vp', 14),
  ('vice president', 'exec', 'vp', 14),
  ('chief', 'exec', 'c_suite', 16),
  ('ceo', 'exec', 'c_suite', 16),
  ('cto', 'exec', 'c_suite', 16),
  ('cfo', 'exec', 'c_suite', 16),
  ('coo', 'exec', 'c_suite', 16),
  ('cro', 'exec', 'c_suite', 16),
  ('cmo', 'exec', 'c_suite', 16)
ON CONFLICT (keyword) DO NOTHING;
