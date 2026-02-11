import { createContact } from '@/lib/loops';

export async function POST(request: Request) {
  const body = await request.text();
  const { email } = JSON.parse(body);

  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 });
  }

  try {
    const result = await createContact(
      email,
      { source: 'website' },
      ['newsletter'],
    );

    if (!result.ok) {
      return Response.json({ error: 'Subscription failed' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return Response.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
