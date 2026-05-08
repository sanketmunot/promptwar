/**
 * Tests for the /api/itinerary Next.js route.
 * We test the handler directly by constructing minimal NextRequest objects.
 */

const { POST } = require('../../src/app/api/itinerary/route');
const { NextRequest, NextResponse } = require('next/server');

// Helper to build a minimal NextRequest with a JSON body
function makeReq(body = {}) {
  return new NextRequest('http://localhost/api/itinerary', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Stub successful Gemini response ─────────────────────────────────────────
const GEMINI_SUCCESS = {
  candidates: [{ content: { parts: [{ text: '{"destination":"Tokyo"}' }] } }],
};

describe('POST /api/itinerary', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key-123' };
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  // ── Missing API key ────────────────────────────────────────────────────────
  it('returns 500 when GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await POST(makeReq({ contents: [] }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/API key not configured/i);
  });

  // ── Successful proxy ───────────────────────────────────────────────────────
  it('proxies a successful Gemini response with status 200', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => GEMINI_SUCCESS,
    });

    const res = await POST(makeReq({ contents: [] }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(GEMINI_SUCCESS);
  });

  // ── Gemini returns an error ────────────────────────────────────────────────
  it('propagates Gemini error with correct status and message', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: { code: 400, message: 'Invalid request payload' },
      }),
    });

    const res = await POST(makeReq({ contents: [] }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid request payload');
  });

  // ── Gemini returns error with no message ──────────────────────────────────
  it('returns fallback error message when Gemini error has no message', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: {} }),
    });

    const res = await POST(makeReq({ contents: [] }));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toBe('Gemini request failed');
  });

  // ── Network / connection timeout ───────────────────────────────────────────
  it('returns 502 on network failure (ConnectTimeoutError)', async () => {
    global.fetch = jest.fn().mockRejectedValue(
      Object.assign(new Error('Connect Timeout Error'), { code: 'UND_ERR_CONNECT_TIMEOUT' })
    );

    const res = await POST(makeReq({ contents: [] }));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/Network error/i);
  });

  // ── Non-Error thrown during fetch ─────────────────────────────────────────
  it('handles non-Error thrown values during fetch', async () => {
    global.fetch = jest.fn().mockRejectedValue('string error');

    const res = await POST(makeReq({ contents: [] }));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/Network error/i);
  });

  // ── API key is present and used in URL ────────────────────────────────────
  it('includes the API key in the Gemini request URL', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => GEMINI_SUCCESS,
    });
    global.fetch = mockFetch;

    await POST(makeReq({ contents: [] }));

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('key=test-key-123');
  });

  // ── Body is forwarded to Gemini ───────────────────────────────────────────
  it('forwards the request body to Gemini', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => GEMINI_SUCCESS,
    });
    global.fetch = mockFetch;

    const payload = { contents: [{ parts: [{ text: 'hello' }] }] };
    await POST(makeReq(payload));

    const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(sentBody).toEqual(payload);
  });
});
