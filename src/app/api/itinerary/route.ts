import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

function fetchWeatherFallback(lat: number, lng: number, days: number, apiKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lng}&days=${days}&languageCode=en`;
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('Weather API timeout'));
    });
  });
}

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

  let data = await res.json();
  console.log('[/api/itinerary] Gemini status:', res.status);

  if (!res.ok) {
    console.error('[/api/itinerary] Gemini API error:', data.error);
    return NextResponse.json(
      { error: data.error?.message || 'Gemini request failed' },
      { status: res.status }
    );
  }

  // Inject Weather API Data
  try {
    const weatherKey = process.env.GOOGLE_WEATHER_API_KEY;
    if (weatherKey && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      let text = data.candidates[0].content.parts[0].text;
      const cleanText = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanText);

      if (parsed.location?.lat && parsed.location?.lng) {
        const daysToFetch = Math.min(Math.max(parsed.totalDays || 1, 1), 10);
        try {
          const wData = await fetchWeatherFallback(parsed.location.lat, parsed.location.lng, daysToFetch, weatherKey);
          parsed.weather = wData;
        } catch (wErr) {
          console.error('[/api/itinerary] Weather API error:', wErr);
        }
        data.candidates[0].content.parts[0].text = JSON.stringify(parsed);
      }
    }
  } catch (e) {
    console.error('[/api/itinerary] Failed to inject weather data', e);
  }

  return NextResponse.json(data);
}
