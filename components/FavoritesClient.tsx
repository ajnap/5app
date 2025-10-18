'use client'

import FavoriteButton from './FavoriteButton'

interface Prompt {
  id: string
  title: string
  description: string
  activity: string
  category: string
  age_categories: string[]
  tags: string[]
  favorited_at?: string
}

interface FavoritesClientProps {
  favorites: Prompt[]
}

export default function FavoritesClient({ favorites }: FavoritesClientProps) {
  if (favorites.length === 0) {
    return (
      <div className="card text-center py-16 fade-in">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-gray-300 mx-auto mb-4"
          fill="none"
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
        <p className="text-gray-600 mb-6">
          Start adding activities that work great for your family!
        </p>
        <a
          href="/prompts"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-xl">📚</span>
          Browse Activities
        </a>
      </div>
    )
  }

  return (
    <div>
      {/* Stats */}
      <div className="card mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 fade-in">
        <p className="text-red-900 font-semibold">
          You've saved {favorites.length} {favorites.length === 1 ? 'activity' : 'activities'} that work great for your family
        </p>
      </div>

      {/* Favorites Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {favorites.map((prompt, index) => (
          <div
            key={prompt.id}
            className="card hover-lift slide-in relative"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Favorite Button */}
            <div className="absolute top-4 right-4">
              <FavoriteButton promptId={prompt.id} initialIsFavorited={true} />
            </div>

            {/* Category Badge */}
            {prompt.category && (
              <div className="mb-3">
                <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                  {prompt.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3 pr-8">
              {prompt.title}
            </h3>

            {/* Description */}
            <p className="text-gray-700 mb-4 leading-relaxed">
              {prompt.description}
            </p>

            {/* Activity Box */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                The Next 5 Minutes
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {prompt.activity}
              </p>
            </div>

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prompt.tags.slice(0, 4).map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {prompt.tags.length > 4 && (
                  <span className="text-xs text-gray-500 py-1">
                    +{prompt.tags.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
