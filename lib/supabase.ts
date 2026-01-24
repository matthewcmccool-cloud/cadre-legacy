import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client configured with Clerk authentication.
 * Pass the Clerk session token to enable Row Level Security.
 * 
 * @param token - Clerk session token from getToken({ template: 'supabase' })
 * @returns Configured Supabase client
 */
export function createClerkSupabaseClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

/**
 * Creates a standard Supabase client for public operations.
 * Use this for operations that don't require user authentication.
 * 
 * @returns Standard Supabase client
 */
export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
