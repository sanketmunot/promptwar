import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[/api/itinerary] GEMINI_API_KEY is not set');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const body = await req.json();

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        // Extend timeout to 60s — Gemini can be slow for long prompts
        signal: AbortSignal.timeout(60_000),
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/itinerary] Network error reaching Gemini:', message);
    return NextResponse.json(
      { error: `Network error: ${message}` },
      { status: 502 }
    );
  }

  const data = await res.json();
  console.log('[/api/itinerary] Gemini status:', res.status);
  console.log('[/api/itinerary] Gemini response:', JSON.stringify(data, null, 2));

  if (!res.ok) {
    console.error('[/api/itinerary] Gemini API error:', data.error);
    return NextResponse.json(
      { error: data.error?.message || 'Gemini request failed' },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
