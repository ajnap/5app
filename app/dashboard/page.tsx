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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-700">The Next 5 Minutes</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <Link
              href={ROUTES.ACCOUNT}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Account
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Subscription Status Banner */}
          {!isPremium && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-yellow-800 font-medium">You're on the free plan</p>
                  <p className="text-yellow-700 text-sm">Upgrade to unlock all features</p>
                </div>
                <Link
                  href={ROUTES.ACCOUNT}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
                >
                  Upgrade
                </Link>
              </div>
            </div>
          )}

          {/* Today's Date */}
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Prompt Card */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {todaysPrompt.title}
            </h2>

            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                {todaysPrompt.description}
              </p>

              <div className="bg-primary-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-primary-900 mb-3">
                  Today's Activity
                </h3>
                <p className="text-primary-800">
                  {todaysPrompt.activity}
                </p>
              </div>

              {isPremium ? (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-800 flex items-center">
                    <span className="text-2xl mr-2">✓</span>
                    <span>Premium Member - Full access to all prompts</span>
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">
                    Enjoying the prompts? Upgrade to premium for advanced tracking,
                    personalized recommendations, and more!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <button className="bg-primary-100 text-primary-700 px-6 py-4 rounded-lg hover:bg-primary-200 transition font-medium">
              Mark as Complete
            </button>
            <button className="bg-gray-100 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-200 transition font-medium">
              View Past Prompts
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
