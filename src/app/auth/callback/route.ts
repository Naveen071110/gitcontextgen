import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/dashboard';
  // Enforce safe relative path: reject protocol-relative (//), external schemes (:), or backslashes
  const safeNext = (rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes(':') && !rawNext.includes('\\'))
    ? rawNext
    : '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      } else {
        const allowedHost =
          forwardedHost && (forwardedHost === 'gitcontextgen.com' || forwardedHost.endsWith('.gitcontextgen.com'))
            ? forwardedHost
            : new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://gitcontextgen.com').host;
        return NextResponse.redirect(`https://${allowedHost}${safeNext}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could+not+authenticate+with+GitHub`);
}
