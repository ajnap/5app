import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client (use in client components)
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Server-side Supabase client - DEPRECATED
// Use @/lib/supabase-server instead for Server Components
// Use @/lib/supabase-server-api instead for API Routes
export { createServerClient } from '@/lib/supabase-server'

// Database type definitions
export type Profile = {
  id: string
  email: string
  subscription_status: 'active' | 'inactive' | 'cancelled'
  subscription_tier: 'free' | 'monthly' | 'yearly'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export type DailyPrompt = {
  id: string
  title: string
  description: string
  activity: string
  date: string
  created_at: string
}
