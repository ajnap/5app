import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import GoalsClient from '@/components/GoalsClient'
import { ROUTES } from '@/lib/constants'
import type { FamilyGoal, GoalCompletion } from '@/lib/goals/types'

// Helper function to calculate age from birth_date
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export default async function GoalsPage() {
  const supabase = await createServerClient()

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect(ROUTES.SIGNUP)
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_tier, faith_mode')
    .eq('id', session.user.id)
    .single()

  // Fetch user's children
  const { data: childrenData } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  // Calculate ages for children
  const children = (childrenData || []).map(child => ({
    ...child,
    age: calculateAge(child.birth_date)
  }))

  // Fetch all goals for the user
  const { data: goalsData } = await supabase
    .from('family_goals')
    .select('*')
    .eq('user_id', session.user.id)
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false })

  const goals: FamilyGoal[] = goalsData || []

  // Fetch today's completions for all goals
  const today = new Date().toISOString().split('T')[0]
  const { data: completionsData } = await supabase
    .from('goal_completions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('completion_date', today)

  const todayCompletions: GoalCompletion[] = completionsData || []

  return (
    <div className="min-h-screen bg-cream-100">
      <Navigation />

      {/* Main Content */}
      <main className="container-narrow py-8">
        <GoalsClient
          goals={goals}
          children={children}
          todayCompletions={todayCompletions}
          userId={session.user.id}
        />
      </main>
    </div>
  )
}
