import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import DashboardClient from '@/components/DashboardClient'
import { SUBSCRIPTION_STATUS, ROUTES } from '@/lib/constants'

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

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect(ROUTES.SIGNUP)
  }

  // Get user's subscription status
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_tier')
    .eq('id', session.user.id)
    .single()

  const isPremium = profile?.subscription_status === SUBSCRIPTION_STATUS.ACTIVE

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

  // Fetch all prompts (we'll filter on client side)
  const { data: promptsData } = await supabase
    .from('daily_prompts')
    .select('*')
    .order('date', { ascending: true })
    .limit(50)

  const prompts = promptsData || []

  // Check if user completed any prompt today
  const { data: completedTodayData } = await supabase
    .rpc('completed_today', { p_user_id: session.user.id })

  const completedToday = completedTodayData || false

  // Get current streak
  const { data: streakData } = await supabase
    .rpc('get_current_streak', { p_user_id: session.user.id })

  const currentStreak = streakData || 0

  // Get total completions
  const { data: totalData } = await supabase
    .rpc('get_total_completions', { p_user_id: session.user.id })

  const totalCompletions = totalData || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 fade-in">
        <div className="flex justify-between items-center backdrop-blur-sm bg-white/30 rounded-2xl px-6 py-3 shadow-sm">
          <h1 className="text-2xl font-bold gradient-text">The Next 5 Minutes</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium hidden md:block">{session.user.email}</span>
            <Link
              href="/children"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Children
            </Link>
            <Link
              href={ROUTES.ACCOUNT}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Account
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Subscription Status Banner */}
          {!isPremium && (
            <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 mb-8 fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-amber-900 font-bold text-lg mb-1">🌟 Unlock Full Access</p>
                  <p className="text-amber-700">Upgrade to premium for unlimited prompts and advanced features</p>
                </div>
                <Link
                  href={ROUTES.ACCOUNT}
                  className="btn-primary whitespace-nowrap"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          )}

          {/* Today's Date */}
          <div className="text-center mb-6 fade-in">
            <p className="text-gray-600 text-lg font-medium">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Progress Stats */}
          {(currentStreak > 0 || totalCompletions > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 fade-in">
              {/* Streak Card */}
              <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">🔥</div>
                  <div>
                    <p className="text-3xl font-bold text-orange-900">{currentStreak}</p>
                    <p className="text-orange-700 font-medium">Day Streak</p>
                    {currentStreak > 0 && (
                      <p className="text-sm text-orange-600 mt-1">Keep it going!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Completions Card */}
              <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">✅</div>
                  <div>
                    <p className="text-3xl font-bold text-green-900">{totalCompletions}</p>
                    <p className="text-green-700 font-medium">Activities Completed</p>
                    {totalCompletions > 0 && (
                      <p className="text-sm text-green-600 mt-1">You're building a habit!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Child Selector and Filtered Prompts */}
          <DashboardClient
            children={children}
            prompts={prompts}
            completedToday={completedToday}
          />
        </div>
      </main>
    </div>
  )
}
