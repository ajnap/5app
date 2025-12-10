import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import FavoritesClient from '@/components/FavoritesClient'
import { ROUTES } from '@/lib/constants'

export default async function FavoritesPage() {
  const supabase = await createServerClient()

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
    <div className="min-h-screen bg-cream-100">
      <Navigation />

      {/* Main Content */}
      <main className="container-narrow py-8">
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
