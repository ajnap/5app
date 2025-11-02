import { createServerClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import ChildGrowthStats from '@/components/ChildGrowthStats'
import MemoryTimeline from '@/components/MemoryTimeline'
import { ROUTES } from '@/lib/constants'

// Helper function to calculate age
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

// Helper to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default async function ChildProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect(ROUTES.SIGNUP)
  }

  // Fetch the child profile
  const { data: child, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  if (error || !child) {
    notFound()
  }

  const age = calculateAge(child.birth_date)

  // Get child's completions
  const { data: completions } = await supabase
    .from('prompt_completions')
    .select(`
      *,
      daily_prompts (
        title,
        category
      )
    `)
    .eq('child_id', params.id)
    .order('completed_at', { ascending: false })
    .limit(10)

  // Get child streak
  const { data: childStreak } = await supabase
    .rpc('get_child_streak', { p_child_id: params.id })

  const streak = childStreak || 0
  const totalActivities = completions?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 fade-in">
        <div className="flex justify-between items-center backdrop-blur-sm bg-white/30 rounded-2xl px-6 py-3 shadow-sm">
          <Link href={ROUTES.DASHBOARD} className="text-2xl font-bold gradient-text">
            The Next 5 Minutes
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/children"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              ← Back
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 fade-in">
            <div className="text-6xl mb-4">👶</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{child.name}</h1>
            <p className="text-xl text-gray-600">Age {age}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Streak Card */}
            <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🔥</div>
                <div>
                  <p className="text-3xl font-bold text-orange-900">{streak}</p>
                  <p className="text-orange-700 font-medium">Day Streak</p>
                </div>
              </div>
            </div>

            {/* Total Activities */}
            <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="flex items-center gap-4">
                <div className="text-5xl">✅</div>
                <div>
                  <p className="text-3xl font-bold text-green-900">{totalActivities}</p>
                  <p className="text-green-700 font-medium">Activities Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Stats */}
          <div className="mb-8 fade-in">
            <ChildGrowthStats childId={params.id} />
          </div>

          {/* Memory Timeline */}
          <div className="card mb-8 fade-in">
            <MemoryTimeline
              childId={params.id}
              childName={child.name}
              userId={session.user.id}
            />
          </div>

          {/* Recent Activities */}
          <div className="card fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activities 🎯</h2>

            {completions && completions.length > 0 ? (
              <div className="space-y-3">
                {completions.map((completion: any) => (
                  <div
                    key={completion.id}
                    className="flex justify-between items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{completion.daily_prompts?.title}</p>
                      <p className="text-sm text-gray-600 capitalize">{completion.daily_prompts?.category}</p>
                      {completion.reflection_note && (
                        <p className="text-sm text-gray-700 mt-2 italic">"{completion.reflection_note}"</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(completion.completion_date)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">🌟</div>
                <p className="text-lg">No activities completed yet</p>
                <p className="text-sm mt-2">Start your first activity from the dashboard!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
