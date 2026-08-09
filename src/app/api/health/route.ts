import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const supabaseBound = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  );

  const resendBound = Boolean(
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY.length > 5
  );

  const deepseekBound = Boolean(
    process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.length > 5
  );

  return NextResponse.json(
    {
      status: 'ok',
      service: 'GitContextGen Platform',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString(),
      keysBound: {
        supabase: supabaseBound,
        resend: resendBound,
        aiEngine: deepseekBound,
      },
    },
    { status: 200 }
  );
}
