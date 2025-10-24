import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import OnboardingFlow from '@/components/OnboardingFlow'
import { ROUTES } from '@/lib/constants'

export default async function OnboardingPage() {
  const supabase = await createServerClient()

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect(ROUTES.SIGNUP)
  }

  // Check if onboarding already completed
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', session.user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect(ROUTES.DASHBOARD)
  }

  return (
    <OnboardingFlow
      userId={session.user.id}
      userEmail={session.user.email || ''}
    />
  )
}
