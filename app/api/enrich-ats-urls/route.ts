import { NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const COMPANIES_TABLE = 'Companies';
const BATCH_SIZE = 15;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function findAtsUrl(companyName: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You find job board API URLs. Return ONLY the URL, nothing else. If Greenhouse: https://boards-api.greenhouse.io/v1/boards/COMPANYSLUG/jobs. If Lever: https://api.lever.co/v0/postings/COMPANYSLUG. If Ashby: https://api.ashbyhq.com/posting-api/job-board/COMPANYSLUG. Return only the URL or "unknown" if not found.'
          },
          {
            role: 'user',
            content: `What is the careers API URL for ${companyName}? Just the URL.`
          }
        ],
        max_tokens: 100,
        temperature: 0.1,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content || content === 'null' || content.toLowerCase().includes('unknown')) return null;
    
    const urlMatch = content.match(/https?:\/\/[^\s'"<>]+/);
    return urlMatch ? urlMatch[0] : null;
  } catch (error) {
    console.error('Error finding ATS URL:', error);
    return null;
  }
}

export async function GET() {
  const startTime = Date.now();
  const results: any[] = [];
  let totalCompanies = 0;
  let withUrl = 0;
  let withoutUrl = 0;
  let updated = 0;
  let errors = 0;

  try {
    // Fetch companies without jobsApiUrl
    const filterFormula = encodeURIComponent("AND({Jobs API URL} = '', {Company} != '')");
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${COMPANIES_TABLE}?filterByFormula=${filterFormula}&maxRecords=${BATCH_SIZE}&fields[]=Company&fields[]=Jobs%20API%20URL`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Failed to fetch from Airtable', details: errorText }, { status: 500 });
    }

    const data = await response.json();
    const companies = data.records || [];
    totalCompanies = companies.length;

    // Process each company
    for (const company of companies) {
      const companyName = company.fields?.Company;
      if (!companyName) {
        errors++;
        continue;
      }

      await delay(500); // Rate limiting

      const atsUrl = await findAtsUrl(companyName);
      
      if (atsUrl) {
        // Update Airtable
        const updateResponse = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${COMPANIES_TABLE}/${company.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: { 'Jobs API URL': atsUrl }
            }),
          }
        );

        if (updateResponse.ok) {
          updated++;
          withUrl++;
          results.push({ company: companyName, url: atsUrl, status: 'updated' });
        } else {
          errors++;
          results.push({ company: companyName, url: atsUrl, status: 'update_failed' });
        }
      } else {
        withoutUrl++;
        results.push({ company: companyName, url: null, status: 'not_found' });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    return NextResponse.json({
      success: true,
      fetched: totalCompanies,
      updated,
      notFound: withoutUrl,
      errors,
      duration: `${duration}s`,
      results
    });

  } catch (error) {
    console.error('Enrichment error:', error);
    return NextResponse.json({ 
      error: 'Enrichment failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
