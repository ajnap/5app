import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SpouseClient from '@/components/SpouseClient'

export const metadata = {
  title: 'Spouse Connection | The Next 5 Minutes',
  description: 'Strengthen your relationship with guided conversations and shared activities',
}

export default async function SpousePage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/signup')
  }

  // Get or create spouse profile
  let { data: spouseProfile } = await supabase
    .from('spouse_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (!spouseProfile) {
    // Create default profile
    const { data: newProfile } = await supabase
      .from('spouse_profiles')
      .insert({
        user_id: session.user.id,
      })
      .select()
      .single()

    spouseProfile = newProfile
  }

  // Get today's conversation prompt (random from 'daily' or 'fun' categories)
  const { data: dailyPrompts } = await supabase
    .from('conversation_prompts')
    .select('*')
    .in('category', ['daily', 'fun'])
    .limit(20)

  const todayPrompt = dailyPrompts?.[Math.floor(Math.random() * (dailyPrompts?.length || 1))]

  // Get recent connection activities
  const { data: recentActivities } = await supabase
    .from('connection_activities')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })
    .limit(5)

  // Get recent check-ins for trends
  const { data: recentCheckins } = await supabase
    .from('connection_checkins')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(7)

  // Calculate average connection rating from recent check-ins
  const avgConnection =
    recentCheckins && recentCheckins.length > 0
      ? Math.round(
          recentCheckins.reduce((sum, c) => sum + c.connection_rating, 0) / recentCheckins.length
        )
      : null

  // Get shared parenting insights (activity distribution by child)
  const { data: childActivities } = await supabase
    .from('prompt_completions')
    .select('child_id, child:child_profiles(name)')
    .eq('user_id', session.user.id)
    .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days

  // Group by child
  const activityByChild: Record<string, { name: string; count: number }> = {}
  childActivities?.forEach((activity: any) => {
    const childName = activity.child?.name || 'Unknown'
    if (!activityByChild[childName]) {
      activityByChild[childName] = { name: childName, count: 0 }
    }
    activityByChild[childName].count++
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-white">
      <SpouseClient
        userId={session.user.id}
        spouseProfile={spouseProfile}
        todayPrompt={todayPrompt}
        recentActivities={recentActivities || []}
        avgConnection={avgConnection}
        activityByChild={Object.values(activityByChild)}
      />
    </div>
  )
}
