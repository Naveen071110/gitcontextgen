import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET() {
  const startTime = Date.now();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuyatstcjgnragcwushu.supabase.co';
  const isSupabaseConfigured = Boolean(
    supabaseUrl && !supabaseUrl.includes('placeholder')
  );

  let querySuccess = false;
  let dbMessage = 'Supabase environment variable not configured or placeholder.';

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      // Execute a lightweight HEAD query to refresh Supabase project activity timer
      const { error } = await supabase.from('projects').select('id', { count: 'exact', head: true });
      
      if (!error) {
        querySuccess = true;
        dbMessage = 'Supabase heartbeat query executed successfully. Inactivity timer reset.';
      } else {
        dbMessage = `Supabase ping returned notice: ${error.message}`;
      }
    } catch (err: any) {
      dbMessage = `Keep-alive query failed: ${err?.message || 'Unknown error'}`;
    }
  }

  const durationMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: 'ok',
      service: 'GitContextGen Supabase Heartbeat',
      timestamp: new Date().toISOString(),
      durationMs,
      supabase: {
        configured: isSupabaseConfigured,
        active: querySuccess,
        message: dbMessage,
      },
    },
    { status: 200 }
  );
}
