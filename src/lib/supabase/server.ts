import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !key) return false;
  if (
    supabaseUrl.includes('placeholder.supabase.co') ||
    supabaseUrl.trim() === '' ||
    key === 'placeholder_key' ||
    key === 'placeholder' ||
    key.includes('your_supabase')
  ) {
    return false;
  }
  try {
    const parsed = new URL(supabaseUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The setAll method was called from a Server Component.
          }
        },
      },
      global: {
        fetch: (url, options = {}) => {
          if (typeof url === 'string' && url.includes('placeholder.supabase.co')) {
            return Promise.reject(new Error('Supabase not configured (placeholder URL)'));
          }
          return fetch(url, { ...options, cache: 'no-store' });
        },
      },
    }
  );
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';
  return createSupabaseClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (url, options = {}) => {
        if (typeof url === 'string' && url.includes('placeholder.supabase.co')) {
          return Promise.reject(new Error('Supabase not configured (placeholder URL)'));
        }
        return fetch(url, { ...options, cache: 'no-store' });
      },
    },
  });
}
