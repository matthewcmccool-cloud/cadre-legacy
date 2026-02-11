import { NextResponse } from 'next/server';
import { searchAll } from '@/lib/airtable';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ companies: [], investors: [], jobs: [] });
  }

  try {
    const results = await searchAll(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
