import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const startTime = Date.now();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuyatstcjgnragcwushu.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eWF0c3RjamducmFnY3d1c2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDkwMzQsImV4cCI6MjEwMDg4NTAzNH0.eU6eqCvo0oB30KHHO1b3q_M71qnFRTy07iIz_xiktC0';

  let authSettingsOk = false;
  let storageBucketsOk = false;
  let message = 'Ping executed.';

  try {
    // 1. Query Auth Settings API (HTTP 200)
    const authRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: anonKey },
    });
    authSettingsOk = authRes.status === 200;

    // 2. Query Storage Buckets API (HTTP 200)
    const storageRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    storageBucketsOk = storageRes.status === 200;

    if (authSettingsOk && storageBucketsOk) {
      message = 'Supabase Auth & Storage API keep-alive ping successful. Inactivity timer reset.';
    } else {
      message = `Keep-alive notice: Auth HTTP ${authRes.status}, Storage HTTP ${storageRes.status}`;
    }
  } catch (err: any) {
    message = `Keep-alive error: ${err?.message || 'Unknown error'}`;
  }

  const durationMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: 'ok',
      service: 'GitContextGen Supabase Heartbeat',
      timestamp: new Date().toISOString(),
      durationMs,
      supabase: {
        url: supabaseUrl,
        active: authSettingsOk && storageBucketsOk,
        authSettingsOk,
        storageBucketsOk,
        message,
      },
    },
    { status: 200 }
  );
}
