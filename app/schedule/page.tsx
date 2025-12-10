import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import ScheduleClient from '@/components/ScheduleClient'
import { ROUTES } from '@/lib/constants'

export const metadata = {
  title: 'Schedule | The Next 5 Minutes',
  description: 'Plan and coordinate family activities, events, and quality time',
}

export default async function SchedulePage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(ROUTES.SIGNUP)
  }

  // Get user's children
  const { data: children } = await supabase
    .from('child_profiles')
    .select('id, name, birth_date')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  // Get user's profile for calendar connection status
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="min-h-screen bg-cream-100">
      <Navigation />
      <ScheduleClient
        userId={session.user.id}
        children={children || []}
      />
    </div>
  )
}
