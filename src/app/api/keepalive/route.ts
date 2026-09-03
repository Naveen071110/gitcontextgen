import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json(
      {
        status: 'skipped',
        service: 'GitContextGen Supabase Heartbeat',
        message: 'Supabase environment variables not configured on host.',
      },
      { status: 200 }
    );
  }

  const results: Record<string, { status: number; ok: boolean }> = {};

  try {
    const authPromise = fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: anonKey },
      signal: AbortSignal.timeout(5000),
    })
      .then((r) => {
        results.auth = { status: r.status, ok: r.status === 200 };
      })
      .catch(() => {
        results.auth = { status: 0, ok: false };
      });

    const healthPromise = fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: anonKey },
      signal: AbortSignal.timeout(5000),
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
      signal: AbortSignal.timeout(5000),
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
      status: isHealthy ? 'ok' : 'degraded',
      service: 'GitContextGen Supabase Heartbeat',
      timestamp: new Date().toISOString(),
      durationMs,
      supabase: {
        healthy: isHealthy,
        results,
        message: isHealthy
          ? 'Supabase multi-service keep-alive ping successful. Inactivity timer active.'
          : 'Keep-alive executed with degraded status.',
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
