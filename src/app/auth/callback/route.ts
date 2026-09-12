import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createProject } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/dashboard';
  const saveOwner = searchParams.get('save_owner');
  const saveRepo = searchParams.get('save_repo');

  // Enforce safe relative path: reject protocol-relative (//), external schemes (:), or backslashes
  let safeNext = (rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes(':') && !rawNext.includes('\\'))
    ? rawNext
    : '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Auto-save repository for guest on their first sign-up / login
      if (saveOwner && saveRepo) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const repoUrl = `https://github.com/${saveOwner}/${saveRepo}`;
            const slug = `${saveRepo}-${Math.random().toString(36).substring(2, 7)}`.toLowerCase();
            const project = await createProject({
              user_id: user.id,
              repo_name: `${saveOwner}/${saveRepo}`,
              repo_url: repoUrl,
              slug,
              status: 'completed',
            });
            if (project?.id) {
              safeNext = `/dashboard/${project.id}`;
            }
          }
        } catch (saveErr) {
          console.warn('Could not auto-save guest workspace upon OAuth callback:', saveErr);
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      } else {
        const configuredHost = new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://gitcontextgen.com').host;
        const allowedHost =
          forwardedHost && (
            forwardedHost === 'gitcontextgen.com' ||
            forwardedHost.endsWith('.gitcontextgen.com') ||
            forwardedHost.includes('workers.dev') ||
            forwardedHost === configuredHost
          )
            ? forwardedHost
            : configuredHost;
        return NextResponse.redirect(`https://${allowedHost}${safeNext}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could+not+authenticate+with+GitHub`);
}
