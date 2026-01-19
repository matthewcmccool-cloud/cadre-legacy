export async function GET() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  
  const tables = [
    'Job%20Listings',
    'Companies',
    'Function',
    'Industry',
    'Investors',
  ];
  
  const results: Record<string, any> = {};
  
  for (const table of tables) {
    try {
      const url = `https://api.airtable.com/v0/${baseId}/${table}?maxRecords=1`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        cache: 'no-store',
      });
      
      results[table] = {
        status: response.status,
        ok: response.ok,
        error: response.ok ? null : await response.text(),
      };
    } catch (error) {
      results[table] = {
        status: 'error',
        error: String(error),
      };
    }
  }
  
  return Response.json(results);
}
