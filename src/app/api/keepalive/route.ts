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
    const authPromise = fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: anonKey },
    })
      .then((r) => {
        results.auth = { status: r.status, ok: r.status === 200 };
      })
      .catch(() => {
        results.auth = { status: 0, ok: false };
      });

    const healthPromise = fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: anonKey },
    })
      .then((r) => {
        results.authHealth = { status: r.status, ok: r.status === 200 };
      })
      .catch(() => {
        results.authHealth = { status: 0, ok: false };
      });

    const storagePromise = fetch(`${supabaseUrl}/storage/v1/bucket`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    })
      .then((r) => {
        results.storage = { status: r.status, ok: r.status === 200 };
      })
      .catch(() => {
        results.storage = { status: 0, ok: false };
      });

    await Promise.allSettled([authPromise, healthPromise, storagePromise]);
  } catch {
    results.error = { status: 500, ok: false };
  }

  const durationMs = Date.now() - startTime;
  const isHealthy = Boolean(results.auth?.ok || results.storage?.ok);

  return NextResponse.json(
    {
      status: 'ok',
      service: 'GitContextGen Supabase Heartbeat',
      timestamp: new Date().toISOString(),
      durationMs,
      supabase: {
        url: supabaseUrl,
        results,
        message: isHealthy
          ? 'Supabase multi-service keep-alive ping successful. Inactivity timer active.'
          : 'Keep-alive executed.',
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json',
      },
    }
  );
}
