export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BATCH_SIZE = 50;
const MAX_RUNTIME_MS = 55000; // 55 seconds to stay under Vercel's 60s limit

export async function GET() {
  const startTime = Date.now();
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const perplexityKey = process.env.PERPLEXITY_API_KEY;

  if (!perplexityKey) {
    return Response.json({ error: 'PERPLEXITY_API_KEY not set' });
  }

  // 1. Fetch all Functions
  const functionsRes = await fetch(
    `https://api.airtable.com/v0/${baseId}/tbl94EXkSIEmhqyYy?fields[]=Function`,
    { headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' }
  );
  const functionsData = await functionsRes.json();

  const functionRecords = functionsData.records || [];
  const functionNames = functionRecords
    .map((r: any) => r.fields.Function)
    .filter(Boolean)
    .join(', ');

  let totalProcessed = 0;
  let totalUpdated = 0;
  const allResults: any[] = [];

  // Loop until timeout or no more jobs
  while (Date.now() - startTime < MAX_RUNTIME_MS) {
    // 2. Fetch jobs without Function (batch of 50)
    const jobsRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/Job%20Listings?maxRecords=${BATCH_SIZE}&fields[]=Title&filterByFormula=NOT({Function})`,
      { headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' }
    );
    const jobsData = await jobsRes.json();

    const jobsToProcess = (jobsData.records || []).filter((r: any) => !r.fields.Function);

    if (jobsToProcess.length === 0) {
      break; // No more jobs to process
    }

    // 3. Process each job with AI
    for (const job of jobsToProcess) {
      // Check timeout before each job
      if (Date.now() - startTime >= MAX_RUNTIME_MS) {
        break;
      }

      const title = job.fields.Title || '';

      const prompt = `Given this job title: "${title}"
Classify it into exactly ONE of these categories: ${functionNames}
If it doesn't clearly fit any category, respond with "Other".
Respond with ONLY the category name, nothing else. Match the spelling exactly.`;

      try {
        const aiRes = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        const rawText = await aiRes.text();
        let aiData;
        try {
          aiData = JSON.parse(rawText);
        } catch {
          allResults.push({ id: job.id, title, classified: 'Parse error', rawResponse: rawText, status: 'error' });
          continue;
        }

        if (!aiRes.ok) {
          allResults.push({ id: job.id, title, classified: 'API error', rawResponse: rawText, status: 'error' });
          continue;
        }

        const classified = aiData.choices?.[0]?.message?.content?.trim() || 'Other';

        // Find matching function
        const matchedFunction = functionRecords.find(
          (f: any) => f.fields.Function?.toLowerCase() === classified.toLowerCase()
        );

        if (matchedFunction) {
          // Update Airtable
          await fetch(`https://api.airtable.com/v0/${baseId}/Job%20Listings/${job.id}`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: { Function: [matchedFunction.id] },
            }),
          });
          allResults.push({ id: job.id, title, classified, matched: matchedFunction.fields.Function, status: 'updated' });
          totalUpdated++;
        } else {
          allResults.push({ id: job.id, title, classified, status: 'no match' });
        }
      } catch (err: any) {
        allResults.push({ id: job.id, title, error: err.message, status: 'error' });
      }

      totalProcessed++;
    }
  }

  const runtime = Date.now() - startTime;
  return Response.json({ 
    processed: totalProcessed, 
    updated: totalUpdated, 
    runtime: `${runtime}ms`,
    results: allResults 
  });
}
