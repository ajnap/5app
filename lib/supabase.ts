import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Client-side Supabase client (use in client components)
export const createClient = () => createClientComponentClient()

// Server-side Supabase client (use in server components and API routes)
export const createServerClient = () => createServerComponentClient({ cookies })

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
