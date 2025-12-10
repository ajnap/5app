import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
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
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-cream-100/80 backdrop-blur-lg border-b border-cream-200">
        <div className="container-wide py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl transition-transform group-hover:scale-110">❤️</span>
              <span className="font-display text-lg font-semibold text-lavender-600 hidden sm:block">
                The Next 5 Minutes
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="nav-link">
                <span className="text-lg">🏠</span>
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <Link href="/goals" className="nav-link bg-lavender-100 text-lavender-700">
                <span className="text-lg">🎯</span>
                <span className="hidden md:inline">Goals</span>
              </Link>
              <Link href="/children" className="nav-link">
                <span className="text-lg">👶</span>
                <span className="hidden md:inline">Children</span>
              </Link>
              <Link href={ROUTES.ACCOUNT} className="nav-link">
                <span className="text-lg">⚙️</span>
                <span className="hidden md:inline">Account</span>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

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
