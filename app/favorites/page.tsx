import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import FavoritesClient from '@/components/FavoritesClient'
import { ROUTES } from '@/lib/constants'

export default async function FavoritesPage() {
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

  // Fetch user's favorited prompts
  const { data: favoritesData } = await supabase
    .from('prompt_favorites')
    .select(`
      prompt_id,
      created_at,
      daily_prompts (
        id,
        title,
        description,
        activity,
        category,
        age_categories,
        tags
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  // Transform the data
  const favorites = (favoritesData || [])
    .map((fav: any) => ({
      id: fav.daily_prompts?.id,
      title: fav.daily_prompts?.title || '',
      description: fav.daily_prompts?.description || '',
      activity: fav.daily_prompts?.activity || '',
      category: fav.daily_prompts?.category || '',
      age_categories: fav.daily_prompts?.age_categories || [],
      tags: fav.daily_prompts?.tags || [],
      favorited_at: fav.created_at
    }))
    .filter(prompt => prompt.id) // Filter out any null prompts

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 fade-in">
        <div className="flex justify-between items-center backdrop-blur-md bg-white/40 rounded-2xl px-6 py-3 shadow-lg border border-white/50">
          <Link href="/dashboard" className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity">
            The Next 5 Minutes
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium hidden md:block">{session.user.email}</span>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/60"
            >
              Dashboard
            </Link>
            <Link
              href="/prompts"
              className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/60"
            >
              Browse
            </Link>
            <Link
              href="/children"
              className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/60"
            >
              Children
            </Link>
            <Link
              href={ROUTES.ACCOUNT}
              className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/60"
            >
              Account
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 fade-in">
            <div className="flex items-center gap-3 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Activities that work great for your family
            </p>
          </div>

          <FavoritesClient favorites={favorites} />
        </div>
      </main>
    </div>
  )
}
