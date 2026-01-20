import { NextResponse } from 'next/server';

// Prevent static generation - run at request time only
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

interface FunctionRecord {
  id: string;
  functionName: string;
  keywords: string[];
}

interface JobRecord {
  id: string;
  title: string;
  currentFunction: string[] | null;
}

async function fetchAllRecords(table: string, fields: string[]): Promise<any[]> {
  const allRecords: any[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams();
    fields.forEach(f => params.append('fields[]', f));
    if (offset) params.append('offset', offset);

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}?${params}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }

    const data = await response.json();
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

async function updateJobFunction(jobId: string, functionId: string): Promise<boolean> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Job Listings')}/${jobId}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        Function: [functionId],
      },
    }),
  });

  return response.ok;
}

function matchTitleToFunction(title: string, functions: FunctionRecord[]): FunctionRecord | null {
  const lowerTitle = title.toLowerCase();
  
  for (const func of functions) {
    for (const keyword of func.keywords) {
      if (lowerTitle.includes(keyword.toLowerCase())) {
        return func;
      }
    }
  }
  
  return null;
}

export async function GET() {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ error: 'Missing Airtable credentials' }, { status: 500 });
    }

    // Fetch all functions with their keywords
    const functionRecords = await fetchAllRecords('tbl94EXkSIEmhqyYy', ['Function', 'Title Keywords']);
    
    const functions: FunctionRecord[] = functionRecords.map(r => ({
      id: r.id,
      functionName: r.fields['Function'] || '',
      keywords: (r.fields['Title Keywords'] || '').split(';').map((k: string) => k.trim()).filter(Boolean),
    }));

    // Fetch all jobs
    const jobRecords = await fetchAllRecords('Job Listings', ['Title', 'Function']);
    
    const jobs: JobRecord[] = jobRecords.map(r => ({
      id: r.id,
      title: r.fields['Title'] || '',
      currentFunction: r.fields['Function'] || null,
    }));

    // Filter jobs that don't have a function assigned
    const jobsWithoutFunction = jobs.filter(j => !j.currentFunction || j.currentFunction.length === 0);

    const results = {
      totalJobs: jobs.length,
      jobsWithoutFunction: jobsWithoutFunction.length,
      matched: 0,
      updated: 0,
      failed: 0,
      details: [] as { jobId: string; title: string; matchedFunction: string; success: boolean }[],
    };

    // Process each job without a function (limit to first 20 for safety)
    const jobsToProcess = jobsWithoutFunction.slice(0, 20);
    
    for (const job of jobsToProcess) {
      const matchedFunc = matchTitleToFunction(job.title, functions);
      
      if (matchedFunc) {
        results.matched++;
        const success = await updateJobFunction(job.id, matchedFunc.id);
        
        if (success) {
          results.updated++;
        } else {
          results.failed++;
        }
        
        results.details.push({
          jobId: job.id,
          title: job.title,
          matchedFunction: matchedFunc.functionName,
          success,
        });
        
        // Rate limiting - wait 200ms between updates
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalJobs: results.totalJobs,
        jobsWithoutFunction: results.jobsWithoutFunction,
        processedInThisBatch: jobsToProcess.length,
        matched: results.matched,
        updated: results.updated,
        failed: results.failed,
      },
      functions: functions.map(f => ({ name: f.functionName, keywordCount: f.keywords.length })),
      details: results.details,
    });
  } catch (error) {
    console.error('Backfill error:', error);
    return NextResponse.json(
      { error: 'Backfill failed', details: String(error) },
      { status: 500 }
    );
  }
}
