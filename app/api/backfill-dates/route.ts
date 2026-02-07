import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const JOB_LISTINGS_TABLE_ID = 'tbl4HJr9bYCMOn2Ry';

const RATE_LIMIT_DELAY = 200;
const MAX_RUNTIME_MS = 8000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function airtableFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Airtable ${response.status}: ${text.substring(0, 500)}`);
  }
  return JSON.parse(text);
}

async function fetchJobsBatch(offset?: string) {
  const params = new URLSearchParams();
  // Jobs where First Seen is blank (needs backfill)
  params.append('filterByFormula', "{First Seen} = BLANK()");
  params.append('pageSize', '100');
  params.append('fields[]', 'Raw JSON');
  params.append('fields[]', 'Date Posted');
  params.append('fields[]', 'First Seen');
  if (offset) params.append('offset', offset);

  return airtableFetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${JOB_LISTINGS_TABLE_ID}?${params.toString()}`
  );
}

async function batchUpdateJobs(updates: Array<{ id: string; fields: Record<string, unknown> }>) {
  return airtableFetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${JOB_LISTINGS_TABLE_ID}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ records: updates }),
    }
  );
}

export async function GET() {
  const startTime = Date.now();
  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return NextResponse.json({ success: false, error: 'Missing env vars' }, { status: 500 });
  }

  try {
    let offset: string | undefined;

    do {
      if (Date.now() - startTime > MAX_RUNTIME_MS) break;

      const data = await fetchJobsBatch(offset);
      const records = data.records || [];
      offset = data.offset;

      if (records.length === 0) break;

      const updates: Array<{ id: string; fields: Record<string, unknown> }> = [];

      for (const record of records) {
        processed++;
        const airtableCreated = record.createdTime;
        if (!airtableCreated) { skipped++; continue; }

        const fields: Record<string, unknown> = {};

        // Always set First Seen to Airtable record creation time
        fields['First Seen'] = airtableCreated;

        // Fix Date Posted: use real ATS date when available
        const rawJsonStr = record.fields?.['Raw JSON'];
        if (rawJsonStr) {
          try {
            const rawData = JSON.parse(rawJsonStr);

            // Ashby: publishedAt is the real publish date
            if (rawData.publishedAt) {
              fields['Date Posted'] = rawData.publishedAt;
            }
            // Lever: createdAt is a unix timestamp (milliseconds)
            else if (rawData.createdAt && typeof rawData.createdAt === 'number') {
              fields['Date Posted'] = new Date(rawData.createdAt).toISOString();
            }
            // Greenhouse: clear the misleading updated_at, leave Date Posted blank
            // Display logic in cadre-ui will fall back to First Seen
            else if (rawData.updated_at) {
              const currentDatePosted = record.fields?.['Date Posted'] || '';
              if (currentDatePosted === rawData.updated_at) {
                fields['Date Posted'] = null; // Clear the bad date
              }
            }
          } catch {
            // Raw JSON parse failed, just set First Seen
          }
        }

        updates.push({ id: record.id, fields });
      }

      for (let i = 0; i < updates.length; i += 10) {
        if (Date.now() - startTime > MAX_RUNTIME_MS) break;
        const batch = updates.slice(i, i + 10);
        try {
          await batchUpdateJobs(batch);
          updated += batch.length;
        } catch (err) {
          errors += batch.length;
          console.error('Batch update failed:', err);
        }
        await delay(RATE_LIMIT_DELAY);
      }

      await delay(RATE_LIMIT_DELAY);
    } while (offset && Date.now() - startTime < MAX_RUNTIME_MS);

    const runtime = Date.now() - startTime;
    const hasMore = !!offset;

    return NextResponse.json({
      success: true,
      processed,
      updated,
      skipped,
      errors,
      hasMore,
      runtime: `${runtime}ms`,
      message: hasMore
        ? `Backfilled ${updated} records in ${runtime}ms. More remaining — call again.`
        : `Done! Backfilled ${updated} records in ${runtime}ms.`,
    });
  } catch (error) {
    console.error('Backfill-dates error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processed, updated, skipped, errors,
      runtime: `${Date.now() - startTime}ms`,
    }, { status: 500 });
  }
}
