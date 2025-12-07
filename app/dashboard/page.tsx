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

// Get greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
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
    .select('subscription_status, subscription_tier, faith_mode, full_name')
    .eq('id', session.user.id)
    .single()

  const isPremium = profile?.subscription_status === SUBSCRIPTION_STATUS.ACTIVE
  const faithMode = profile?.faith_mode || false
  const userName = profile?.full_name || session.user.email?.split('@')[0] || 'Parent'

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

  // Get recent completions for activity feed
  const { data: recentCompletions } = await supabase
    .from('prompt_completions')
    .select(`
      id,
      completion_date,
      completed_at,
      duration_seconds,
      child:child_profiles(name),
      prompt:daily_prompts(title, category)
    `)
    .eq('user_id', session.user.id)
    .order('completed_at', { ascending: false })
    .limit(10)

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
    <div className="min-h-screen bg-cream-50">
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-cream-200 p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 group">
            <span className="text-2xl transition-transform group-hover:scale-110">❤️</span>
            <span className="font-display text-lg font-semibold text-lavender-600">
              Next 5 Min
            </span>
          </Link>

          {/* User Profile */}
          <div className="flex flex-col items-center text-center mb-8 pb-6 border-b border-cream-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 flex items-center justify-center text-white text-3xl font-display font-bold mb-3 shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            {currentStreak > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-peach-600 bg-peach-100 px-2 py-1 rounded-full mb-2">
                🔥 {currentStreak} day streak
              </span>
            )}
            <h3 className="font-display font-semibold text-slate-900">{userName}</h3>
            <p className="text-sm text-slate-500">{session.user.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-lavender-50 text-lavender-700 font-medium">
              <span className="text-lg">🏠</span>
              Dashboard
            </Link>
            <Link href="/children" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-cream-100 transition-colors">
              <span className="text-lg">👶</span>
              Children
            </Link>
            <Link href="/favorites" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-cream-100 transition-colors">
              <span className="text-lg">❤️</span>
              Favorites
            </Link>
            <Link href="/spouse" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-cream-100 transition-colors">
              <span className="text-lg">💑</span>
              Spouse
            </Link>
            <Link href="/assistant" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-cream-100 transition-colors">
              <span className="text-lg">✨</span>
              AI Assistant
            </Link>
            <Link href={ROUTES.ACCOUNT} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-cream-100 transition-colors">
              <span className="text-lg">⚙️</span>
              Settings
            </Link>
          </nav>

          {/* Sign Out */}
          <div className="pt-4 border-t border-cream-200">
            <SignOutButton />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Mobile Header */}
          <header className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-cream-200 px-4 py-3">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl">❤️</span>
                <span className="font-display font-semibold text-lavender-600">Next 5 Min</span>
              </Link>
              <div className="flex items-center gap-2">
                <Link href="/children" className="p-2 text-slate-600 hover:text-lavender-600">
                  <span className="text-lg">👶</span>
                </Link>
                <Link href={ROUTES.ACCOUNT} className="p-2 text-slate-600 hover:text-lavender-600">
                  <span className="text-lg">⚙️</span>
                </Link>
              </div>
            </div>
          </header>

          <div className="flex">
            {/* Center Content */}
            <div className="flex-1 p-6 lg:p-8 max-w-4xl">
              {/* Greeting Header */}
              <div className="mb-8 fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
                      {getGreeting()}, {userName.split(' ')[0]}
                    </h1>
                    <p className="text-slate-500 mt-1">
                      Today is {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <Link href="/children/new" className="btn-primary whitespace-nowrap">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Child
                  </Link>
                </div>
              </div>

              {/* Upgrade Banner (if not premium) */}
              {!isPremium && (
                <div className="mb-8 bg-gradient-to-r from-peach-100 to-peach-50 rounded-2xl p-5 border border-peach-200 fade-in-up">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✨</span>
                      <div>
                        <p className="font-semibold text-slate-900">Unlock Premium Features</p>
                        <p className="text-sm text-slate-600">Get unlimited activities and AI assistant</p>
                      </div>
                    </div>
                    <Link href={ROUTES.ACCOUNT} className="btn-primary text-sm px-4 py-2">
                      Upgrade
                    </Link>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              {(totalCompletions > 0 || weeklyMinutes > 0) && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8 fade-in-up delay-100">
                  <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-2xl">
                        ✅
                      </div>
                      <div>
                        <p className="font-display text-2xl font-bold text-slate-900">{totalCompletions}</p>
                        <p className="text-sm text-slate-500">Activities</p>
                      </div>
                    </div>
                  </div>

                  {weeklyMinutes > 0 && (
                    <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-lavender-100 flex items-center justify-center text-2xl">
                          ⏱️
                        </div>
                        <div>
                          <p className="font-display text-2xl font-bold text-slate-900">{weeklyMinutes}</p>
                          <p className="text-sm text-slate-500">Min this week</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStreak > 0 && (
                    <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-sm col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-peach-100 flex items-center justify-center text-2xl">
                          🔥
                        </div>
                        <div>
                          <p className="font-display text-2xl font-bold text-slate-900">{currentStreak}</p>
                          <p className="text-sm text-slate-500">Day streak</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Child Cards and Activities */}
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
            </div>

            {/* Right Sidebar - Activity Feed */}
            <aside className="hidden xl:block w-80 border-l border-cream-200 bg-white p-6 min-h-screen">
              <div className="sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg font-semibold text-slate-900">Recent Activity</h2>
                  <span className="text-xl">📅</span>
                </div>

                {/* Activity Timeline */}
                {recentCompletions && recentCompletions.length > 0 ? (
                  <div className="space-y-1">
                    {/* Group by date */}
                    {(() => {
                      const grouped: Record<string, typeof recentCompletions> = {}
                      recentCompletions.forEach((completion: any) => {
                        const date = new Date(completion.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                        if (!grouped[date]) grouped[date] = []
                        grouped[date].push(completion)
                      })

                      return Object.entries(grouped).slice(0, 5).map(([date, completions]) => (
                        <div key={date} className="mb-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{date}</p>
                          <div className="space-y-2">
                            {(completions as any[]).map((completion: any) => (
                              <div key={completion.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-cream-50 transition-colors">
                                <div className="w-1 h-full min-h-[40px] rounded-full bg-lavender-400" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-700 truncate">
                                    {completion.prompt?.title || 'Activity'}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {completion.child?.name} • {completion.prompt?.category}
                                  </p>
                                </div>
                                <span className="text-xs text-slate-400">
                                  {new Date(completion.completed_at).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🌱</div>
                    <p className="text-sm text-slate-500">No activities yet</p>
                    <p className="text-xs text-slate-400 mt-1">Complete your first activity to see it here</p>
                  </div>
                )}

                {/* Quick Stats Summary */}
                {monthlyMinutes > 0 && (
                  <div className="mt-6 pt-6 border-t border-cream-200">
                    <div className="bg-gradient-to-br from-lavender-50 to-cream-50 rounded-2xl p-4">
                      <p className="text-sm font-semibold text-slate-700 mb-2">This Month</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-3xl font-bold text-lavender-600">{monthlyMinutes}</span>
                        <span className="text-sm text-slate-500">minutes</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">of quality time together</p>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Admin Reset Button (dev only) */}
      <AdminResetButton userId={session.user.id} />
    </div>
  )
}
