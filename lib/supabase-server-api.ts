import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for API Routes (with cookie write access)
 * Compatible with Next.js 16 async cookies() API
 */
export async function createServerClientForAPI() {
  const cookieStore = await cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookie setting can fail in middleware
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Cookie removal can fail in middleware
          }
        },
      },
    }
  )
}
