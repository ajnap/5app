import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import DashboardClient from '@/components/DashboardClient'
import AdminResetButton from '@/components/AdminResetButton'
import { SUBSCRIPTION_STATUS, ROUTES } from '@/lib/constants'
import { generateRecommendations } from '@/lib/recommendations/engine'
import type { RecommendationResult } from '@/lib/recommendations/types'
import { captureError } from '@/lib/sentry'

// Type for RPC time stats response
interface TimeStats {
  total_minutes: number
}

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
  const supabase = await createServerClient()

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect(ROUTES.SIGNUP)
  }

  // Get user's subscription status and faith mode
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_tier, faith_mode')
    .eq('id', session.user.id)
    .single()

  const isPremium = profile?.subscription_status === SUBSCRIPTION_STATUS.ACTIVE
  const faithMode = profile?.faith_mode || false

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

  // Fetch all prompts (newest first for today's prompt to be first)
  const { data: promptsData } = await supabase
    .from('daily_prompts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const prompts = promptsData || []

  // Get today's prompt (first one for now - in future we can filter by date)
  const todaysPromptId = prompts[0]?.id

  // Get today's date in user's local timezone
  const today = new Date()
  const localDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Check if user completed TODAY'S specific prompt
  let completedToday = false
  if (todaysPromptId) {
    const { data: completedTodayData } = await supabase
      .from('prompt_completions')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('prompt_id', todaysPromptId)
      .eq('completion_date', localDateString)
      .maybeSingle()

    completedToday = !!completedTodayData
  }

  // Calculate activity counts and stats per child
  const todayActivityCountMap: Record<string, number> = {}
  const weeklyActivityCountMap: Record<string, number> = {}
  const monthlyActivityCountMap: Record<string, number> = {}

  // Calculate date ranges
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6) // Include today + last 6 days = 7 days total
  const sevenDaysAgoString = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29) // Include today + last 29 days = 30 days total
  const thirtyDaysAgoString = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`

  // Fetch all child stats in parallel
  await Promise.all(
    children.map(async (child) => {
      // Fetch all three counts in parallel per child
      const [
        { count: todayCount },
        { count: weeklyCount },
        { count: monthlyCount }
      ] = await Promise.all([
        // Today's count
        supabase
          .from('prompt_completions')
          .select('id', { count: 'exact', head: false })
          .eq('user_id', session.user.id)
          .eq('child_id', child.id)
          .eq('completion_date', localDateString),

        // Weekly count (last 7 days including today)
        supabase
          .from('prompt_completions')
          .select('id', { count: 'exact', head: false })
          .eq('user_id', session.user.id)
          .eq('child_id', child.id)
          .gte('completion_date', sevenDaysAgoString),

        // Monthly count (last 30 days including today)
        supabase
          .from('prompt_completions')
          .select('id', { count: 'exact', head: false })
          .eq('user_id', session.user.id)
          .eq('child_id', child.id)
          .gte('completion_date', thirtyDaysAgoString)
      ])

      todayActivityCountMap[child.id] = todayCount || 0
      weeklyActivityCountMap[child.id] = weeklyCount || 0
      monthlyActivityCountMap[child.id] = monthlyCount || 0
    })
  )

  // Get current streak
  const { data: streakData } = await supabase
    .rpc('get_current_streak', { p_user_id: session.user.id })

  const currentStreak = streakData || 0

  // Get total completions
  const { data: totalData } = await supabase
    .rpc('get_total_completions', { p_user_id: session.user.id })

  const totalCompletions = totalData || 0

  // Get time statistics (in parallel)
  const [
    { data: timeStatsWeek },
    { data: timeStatsMonth }
  ] = await Promise.all([
    supabase.rpc('get_time_stats', { p_user_id: session.user.id, p_period: 'week' }).single(),
    supabase.rpc('get_time_stats', { p_user_id: session.user.id, p_period: 'month' }).single()
  ])

  const weeklyMinutes = (timeStatsWeek as TimeStats | null)?.total_minutes || 0
  const monthlyMinutes = (timeStatsMonth as TimeStats | null)?.total_minutes || 0

  // Generate recommendations for each child (in parallel)
  const recommendationsMap: Record<string, RecommendationResult> = {}

  await Promise.all(
    children.map(async (child) => {
      try {
        const recommendations = await generateRecommendations(
          {
            userId: session.user.id,
            childId: child.id,
            faithMode,
            limit: 5
          },
          supabase
        )
        recommendationsMap[child.id] = recommendations
      } catch (error) {
        captureError(error, {
          tags: {
            component: 'dashboard',
            operation: 'generate-recommendations'
          },
          extra: {
            childId: child.id,
            childName: child.name,
            userId: session.user.id
          }
        })
        // Fallback: empty recommendations
        recommendationsMap[child.id] = {
          childId: child.id,
          recommendations: [],
          metadata: {
            totalCompletions: 0,
            categoryDistribution: {},
            timestamp: new Date().toISOString(),
            cacheKey: ''
          }
        }
      }
    })
  )

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
              <Link href="/favorites" className="nav-link" title="Favorites">
                <span className="text-lg">❤️</span>
                <span className="hidden md:inline">Favorites</span>
              </Link>
              <Link href="/assistant" className="nav-link">
                <span className="text-lg">✨</span>
                <span className="hidden md:inline">Assistant</span>
              </Link>
              <Link href="/spouse" className="nav-link">
                <span className="text-lg">💑</span>
                <span className="hidden md:inline">Spouse</span>
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
        {/* Subscription Status Banner */}
        {!isPremium && (
          <div className="card-elevated bg-gradient-to-r from-peach-50 via-peach-100 to-peach-50 border-2 border-peach-200 mb-8 fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">✨</span>
                <div>
                  <p className="font-display text-lg font-semibold text-slate-900">Unlock Full Access</p>
                  <p className="text-slate-600 text-sm">Upgrade to premium for unlimited prompts and advanced features</p>
                </div>
              </div>
              <Link href={ROUTES.ACCOUNT} className="btn-primary whitespace-nowrap pulse-glow">
                Upgrade Now
              </Link>
            </div>
          </div>
        )}

        {/* Today's Date Card */}
        <div className="text-center mb-10 fade-in-up">
          <div className="inline-flex flex-col items-center bg-white rounded-3xl px-10 py-6 shadow-soft border border-cream-200">
            <p className="text-lavender-500 text-xs uppercase tracking-widest font-bold mb-1">Today</p>
            <p className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Progress Stats */}
        {(currentStreak > 0 || totalCompletions > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 fade-in-up delay-100">
            {/* Streak Card */}
            <div className="card-elevated group hover:border-peach-200">
              <div className="flex items-center gap-4">
                <div className="text-4xl transition-transform group-hover:scale-110">
                  {currentStreak > 0 ? '🔥' : '🌱'}
                </div>
                <div>
                  {currentStreak > 0 ? (
                    <>
                      <p className="font-display text-3xl font-bold text-slate-900">{currentStreak}</p>
                      <p className="text-slate-500 text-sm font-medium">Day Streak</p>
                    </>
                  ) : (
                    <>
                      <p className="font-display text-lg font-semibold text-slate-900">Start Today!</p>
                      <p className="text-slate-500 text-sm">Complete an activity</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Total Completions Card */}
            <div className="card-elevated group hover:border-sage-200">
              <div className="flex items-center gap-4">
                <div className="text-4xl transition-transform group-hover:scale-110">✅</div>
                <div>
                  <p className="font-display text-3xl font-bold text-slate-900">{totalCompletions}</p>
                  <p className="text-slate-500 text-sm font-medium">Activities Done</p>
                </div>
              </div>
            </div>

            {/* Time Stats Card */}
            {(weeklyMinutes > 0 || monthlyMinutes > 0) && (
              <div className="card-elevated group hover:border-lavender-200">
                <div className="flex items-center gap-4">
                  <div className="text-4xl transition-transform group-hover:scale-110">⏱️</div>
                  <div>
                    <p className="font-display text-3xl font-bold text-slate-900">{weeklyMinutes}</p>
                    <p className="text-slate-500 text-sm font-medium">Min This Week</p>
                    {monthlyMinutes > 0 && (
                      <p className="text-xs text-slate-400">{monthlyMinutes} min this month</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Child Selector and Filtered Prompts */}
        <DashboardClient
          children={children}
          prompts={prompts}
          completedToday={completedToday}
          faithMode={faithMode}
          userId={session.user.id}
          currentStreak={currentStreak}
          totalCompletions={totalCompletions}
          recommendationsMap={recommendationsMap}
          todayActivityCountMap={todayActivityCountMap}
          weeklyActivityCountMap={weeklyActivityCountMap}
          monthlyActivityCountMap={monthlyActivityCountMap}
        />
      </main>

      {/* Admin Reset Button (dev only) */}
      <AdminResetButton userId={session.user.id} />
    </div>
  )
}
