-- ═══════════════════════════════════════════════════════════════════════
-- Cadre — Add is_remote column to jobs table
-- Enables structured remote detection at sync time (Lever, Ashby, Greenhouse)
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_remote boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_jobs_is_remote ON jobs(is_remote) WHERE is_remote = true;
