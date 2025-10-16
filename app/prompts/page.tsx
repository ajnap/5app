import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import { ROUTES } from '@/lib/constants'

export default async function PromptsPage() {
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

  // Get all prompts ordered by date
  const { data: prompts } = await supabase
    .from('daily_prompts')
    .select('*')
    .order('date', { ascending: true })

  const today = new Date().toISOString().split('T')[0]

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
              href={ROUTES.DASHBOARD}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Dashboard
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
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">All Connection Prompts</h1>
            <p className="text-xl text-gray-600">Browse through all our daily prompts and connection activities</p>
          </div>

          {/* Prompts Grid */}
          <div className="grid gap-6 md:grid-cols-2 fade-in">
            {prompts?.map((prompt, index) => {
              const promptDate = new Date(prompt.date)
              const isToday = prompt.date === today
              const isPast = prompt.date < today
              const isFuture = prompt.date > today

              return (
                <div
                  key={prompt.id}
                  className={`card ${isToday ? 'border-2 border-primary-400 bg-gradient-to-br from-primary-50 to-purple-50' : ''} slide-in`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Date Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      isToday
                        ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white'
                        : isPast
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isToday ? '📍 Today' : promptDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {isToday && (
                      <span className="text-2xl animate-pulse">✨</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{prompt.title}</h3>

                  {/* Description */}
                  <p className="text-gray-700 mb-4 leading-relaxed">{prompt.description}</p>

                  {/* Activity */}
                  <div className="bg-gradient-to-r from-primary-100 to-purple-100 rounded-xl p-4 border border-primary-200">
                    <h4 className="font-bold text-primary-900 mb-2 flex items-center gap-2">
                      <span>💝</span>
                      Activity
                    </h4>
                    <p className="text-primary-900">{prompt.activity}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Back to Dashboard */}
          <div className="mt-12 text-center fade-in">
            <Link
              href={ROUTES.DASHBOARD}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
