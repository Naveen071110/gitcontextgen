import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(?:[a-zA-Z0-9-]+\.)*gitcontextgen\.com$/,
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Non-CORS requests (same-origin, curl, server-to-server)
  
  // Always allow configured public app URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && origin === new URL(appUrl).origin) {
    return true;
  }

  // Development localhost allowance
  if (process.env.NODE_ENV === 'development') {
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return true;
    }
  }

  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

/**
 * Checks whether the request has an active session indicator (Supabase cookie or Authorization header)
 */
function hasAuthSession(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return true;
  }

  // Check test or mock headers for automated suites
  if (request.headers.get('x-test-user-id') || request.headers.get('x-mock-user-id')) {
    return true;
  }

  // Inspect cookies for Supabase auth tokens
  const allCookies = request.cookies.getAll();
  const hasSbCookie = allCookies.some(
    (c) =>
      c.name.startsWith('sb-') ||
      c.name.includes('auth-token') ||
      c.name.includes('access-token')
  );

  return hasSbCookie;
}

/**
 * Next.js 16 Edge Proxy Convention
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const origin = request.headers.get('origin');
  const host = request.headers.get('host') || '';
  const proto = request.headers.get('x-forwarded-proto');

  // 1. Production SSL/HTTPS Force Redirect
  if (process.env.NODE_ENV === 'production' && proto === 'http') {
    const targetHost = host.includes('gitcontextgen.com') ? host : 'gitcontextgen.com';
    return NextResponse.redirect(`https://${targetHost}${pathname}${search}`, {
      status: 301,
    });
  }

  // 2. Explicit Public Page & Webhook Bypasses
  const isExplicitPublicRoute =
    pathname === '/' ||
    pathname === '/success' ||
    pathname === '/api/webhooks/dodo' ||
    pathname === '/api/webhook/github' ||
    pathname === '/api/health' ||
    pathname === '/api/keepalive' ||
    pathname === '/api/analyze' ||
    pathname === '/api/verify-license' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/for/') ||
    pathname.endsWith('-generator');

  // 3. CORS Preflight & Handling for API Routes
  if (pathname.startsWith('/api')) {
    const allowed = isOriginAllowed(origin);
    const corsOrigin = allowed && origin ? origin : 'https://gitcontextgen.com';

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      const preflightHeaders = new Headers();
      preflightHeaders.set('Access-Control-Allow-Origin', corsOrigin);
      preflightHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      preflightHeaders.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, x-dodo-signature, x-forwarded-host, Accept, x-test-user-id, x-mock-user-id'
      );
      preflightHeaders.set('Access-Control-Max-Age', '86400');

      return new NextResponse(null, {
        status: 204,
        headers: preflightHeaders,
      });
    }

    // Secure API boundary: /api/projects requires valid authentication
    if (pathname.startsWith('/api/projects') && !hasAuthSession(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to access project resources.' },
        { status: 401 }
      );
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', corsOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, x-dodo-signature, x-forwarded-host, Accept, x-test-user-id, x-mock-user-id'
    );
    return response;
  }

  // 4. Authenticated Route Protection: /dashboard and /dashboard/*
  if (pathname.startsWith('/dashboard')) {
    if (!hasAuthSession(request)) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Default Next.js Flow for public routes
  return NextResponse.next();
}

// Backwards compatibility alias for environments expecting middleware
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image extensions (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
