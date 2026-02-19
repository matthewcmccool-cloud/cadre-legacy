// ═══════════════════════════════════════════════════════════════════════
// Cadre — Remote Job Detection
// Structured field detection for Lever & Ashby, regex fallback for Greenhouse.
// Used by cadre-jobs-sync at ingestion time and cadre-ui for legacy fallback.
// ═══════════════════════════════════════════════════════════════════════

/** Regex pattern matching common remote-work indicators in location strings */
const REMOTE_REGEX = /remote|distributed|anywhere|work from home|wfh/i;

// ── ATS-specific detectors ────────────────────────────────────────────

/** Lever: uses structured `workplaceType` field */
export function detectRemoteLever(posting: { workplaceType?: string }): boolean {
  return posting.workplaceType === "remote";
}

/** Ashby: uses structured `isRemote` boolean */
export function detectRemoteAshby(job: { isRemote?: boolean }): boolean {
  return job.isRemote === true;
}

/** Greenhouse: no structured field — regex on location name */
export function detectRemoteGreenhouse(job: { location?: { name?: string } }): boolean {
  return REMOTE_REGEX.test(job.location?.name || "");
}

// ── Generic fallback ──────────────────────────────────────────────────

/** Fallback: regex on any location string (used by cadre-ui legacy layer) */
export function detectRemoteFromLocation(location: string): boolean {
  return REMOTE_REGEX.test(location);
}
