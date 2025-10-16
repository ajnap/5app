import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import { SUBSCRIPTION_STATUS, ROUTES } from '@/lib/constants'

// This function fetches today's prompt from the database
async function getTodaysPrompt(supabase: any) {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_prompts')
    .select('*')
    .eq('date', today)
    .single()

  // If no prompt exists for today, return a default prompt
  if (error || !data) {
    return {
      id: null, // No ID for default prompt
      title: "Welcome to The Next 5 Minutes!",
      description: "Your daily prompt will appear here. Check back tomorrow for your first connection activity!",
      activity: "Set up your account and explore the app.",
      date: today
    }
  }

  return data
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

  const todaysPrompt = await getTodaysPrompt(supabase)
  const isPremium = profile?.subscription_status === SUBSCRIPTION_STATUS.ACTIVE

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 fade-in">
        <div className="flex justify-between items-center backdrop-blur-sm bg-white/30 rounded-2xl px-6 py-3 shadow-sm">
          <h1 className="text-2xl font-bold gradient-text">The Next 5 Minutes</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium hidden md:block">{session.user.email}</span>
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

          {/* Prompt Card */}
          <div className="card fade-in bg-gradient-to-br from-white to-primary-50/30 border-2 border-primary-100 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-200/20 to-purple-200/20 rounded-full blur-3xl -z-10"></div>

            {/* Card Header */}
            <div className="mb-6">
              <div className="inline-block bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                Today's Connection Moment
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {todaysPrompt.title}
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                {todaysPrompt.description}
              </p>
            </div>

            {/* Activity Section */}
            <div className="bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl p-8 mb-6 border-2 border-primary-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-9xl opacity-10">💝</div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4 flex items-center gap-2">
                <span className="text-3xl">✨</span>
                Today's Activity
              </h3>
              <p className="text-lg text-primary-900 font-medium leading-relaxed">
                {todaysPrompt.activity}
              </p>
            </div>

            {/* Status Badge */}
            {isPremium ? (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-5 border-2 border-green-200">
                <p className="text-green-900 flex items-center gap-3 font-semibold">
                  <span className="text-3xl">✓</span>
                  <span>Premium Member - Full access to all prompts</span>
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-50 to-slate-100 rounded-xl p-5 border-2 border-gray-200">
                <p className="text-gray-700 font-medium">
                  💡 Enjoying the prompts? Upgrade to premium for advanced tracking,
                  personalized recommendations, and more!
                </p>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center fade-in">
            <Link
              href="/prompts"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-2xl">📚</span>
              View All Prompts
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
