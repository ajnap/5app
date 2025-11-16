import { createServerClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import ChildDetailClient from '@/components/ChildDetailClient'
import { ROUTES } from '@/lib/constants'
import { generateRecommendations } from '@/lib/recommendations/engine'
import { calculateInsights } from '@/lib/insights-calculator'
import { generatePersonalizedTips } from '@/lib/tips-generator'
import { captureError } from '@/lib/sentry'
import type { PersonalizedTip } from '@/lib/recommendations/types'

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

export default async function ChildProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  // Check if user is authenticated
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(ROUTES.SIGNUP)
  }

  // Get user's faith mode
  const { data: profile } = await supabase
    .from('profiles')
    .select('faith_mode')
    .eq('id', session.user.id)
    .single()

  const faithMode = profile?.faith_mode || false

  // Fetch the child profile
  const { data: childData, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id) // Ensure user owns this child
    .single()

  if (error || !childData) {
    notFound()
  }

  // Calculate age
  const child = {
    ...childData,
    age: calculateAge(childData.birth_date)
  }

  // Get current streak
  const { data: streakData } = await supabase.rpc('get_current_streak', {
    p_user_id: session.user.id
  })

  const currentStreak = streakData || 0

  // Get total completions
  const { data: totalData } = await supabase.rpc('get_total_completions', {
    p_user_id: session.user.id
  })

  const totalCompletions = totalData || 0

  // Fetch all prompts for reference
  const { data: promptsData } = await supabase
    .from('daily_prompts')
    .select('*')
    .order('created_at', { ascending: false })

  const prompts = promptsData || []

  // Calculate connection insights
  let insights
  try {
    insights = await calculateInsights(child.id, session.user.id, supabase)
  } catch (error) {
    captureError(error, {
      tags: { component: 'child-profile', operation: 'calculate-insights' },
      extra: { childId: child.id, userId: session.user.id }
    })
    // Fallback to empty insights
    insights = {
      weeklyMinutes: 0,
      monthlyMinutes: 0,
      totalCompletions: 0,
      currentStreak: 0,
      favoriteCategories: [],
      categoryDistribution: [],
      lastCompletionDate: undefined
    }
  }

  // Fetch completions for tips generation and history
  const { data: completionsData } = await supabase
    .from('prompt_completions')
    .select(`
      *,
      prompt:daily_prompts(*)
    `)
    .eq('user_id', session.user.id)
    .eq('child_id', child.id)
    .order('completed_at', { ascending: false })
    .limit(50)

  const completions = (completionsData || []).map((c: any) => ({
    ...c,
    prompt: c.prompt || undefined
  }))

  // Generate personalized tips
  let tips: PersonalizedTip[]
  try {
    tips = generatePersonalizedTips(child, insights, completions)
  } catch (error) {
    captureError(error, {
      tags: { component: 'child-profile', operation: 'generate-tips' },
      extra: { childId: child.id, userId: session.user.id }
    })
    tips = []
  }

  // Generate recommendations
  let recommendations: any[] = []
  try {
    const recommendationResult = await generateRecommendations(
      {
        userId: session.user.id,
        childId: child.id,
        faithMode,
        limit: 5
      },
      supabase
    )
    recommendations = recommendationResult.recommendations
  } catch (error) {
    captureError(error, {
      tags: { component: 'child-profile', operation: 'generate-recommendations' },
      extra: { childId: child.id, userId: session.user.id }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 fade-in">
        <div className="flex justify-between items-center backdrop-blur-md bg-white/40 rounded-2xl px-6 py-3 shadow-lg border border-white/50">
          <Link href={ROUTES.DASHBOARD} className="text-2xl font-bold gradient-text">
            The Next 5 Minutes
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.DASHBOARD}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href={`/children/${child.id}`}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/60"
            >
              Edit Profile
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 fade-in">
            <div className="text-6xl mb-4">
              {child.age < 2 ? '👶' : child.age < 5 ? '🧒' : child.age < 12 ? '🧑' : child.age < 18 ? '👦' : '🧑‍🎓'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {child.name}'s Connection Journey
            </h1>
            <p className="text-xl text-gray-600">
              {child.age} years old • Deep insights and personalized recommendations
            </p>
          </div>

          {/* Client Component with all data */}
          <ChildDetailClient
            child={child}
            insights={insights}
            tips={tips}
            completions={completions}
            recommendations={recommendations}
            prompts={prompts}
            faithMode={faithMode}
            userId={session.user.id}
            currentStreak={currentStreak}
            totalCompletions={totalCompletions}
          />
        </div>
      </main>
    </div>
  )
}
