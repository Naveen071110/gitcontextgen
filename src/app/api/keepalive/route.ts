import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const startTime = Date.now();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuyatstcjgnragcwushu.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eWF0c3RjamducmFnY3d1c2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDkwMzQsImV4cCI6MjEwMDg4NTAzNH0.eU6eqCvo0oB30KHHO1b3q_M71qnFRTy07iIz_xiktC0';

  const results: Record<string, { status: number; ok: boolean }> = {};

  try {
    // 1. Ping Supabase Auth Settings API
    const authRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: anonKey },
    });
    results.auth = { status: authRes.status, ok: authRes.status === 200 };

    // 2. Ping Supabase Auth Health API
    const authHealthRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: anonKey },
    });
    results.authHealth = { status: authHealthRes.status, ok: authHealthRes.status === 200 };

    // 3. Ping Supabase Storage Buckets API
    const storageRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    results.storage = { status: storageRes.status, ok: storageRes.status === 200 };

    // 4. Ping Supabase PostgREST Database API (forces database gateway activity)
    const restRes = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    results.restDatabase = { status: restRes.status, ok: restRes.status !== 0 };
  } catch (err: any) {
    results.error = { status: 500, ok: false };
  }

  const durationMs = Date.now() - startTime;
  const isHealthy = results.auth?.ok || results.storage?.ok;

  return NextResponse.json(
    {
      status: isHealthy ? 'ok' : 'degraded',
      service: 'GitContextGen Supabase Heartbeat',
      timestamp: new Date().toISOString(),
      durationMs,
      supabase: {
        url: supabaseUrl,
        results,
        message: isHealthy
          ? 'Supabase multi-service keep-alive ping successful. Inactivity timer active.'
          : 'Keep-alive warning: Supabase endpoints returned unexpected status.',
      },
    },
    { status: 200 }
  );
}
