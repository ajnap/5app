'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Child, ScoredPrompt } from '@/lib/recommendations/types'

interface ChildCardProps {
  child: Child
  recommendations: ScoredPrompt[]
  onStartActivity: (promptId: string, childId: string) => void
  completedToday?: boolean
}

const CATEGORY_EMOJIS: Record<string, string> = {
  connection: '💝',
  behavior: '🌱',
  learning: '📚',
  mealtime: '🍽️',
  bedtime: '🌙',
  creative_expression: '🎨',
  emotional_connection: '💗',
  spiritual_growth: '✨',
  service: '🤝',
  gratitude: '🙏'
}

export default function ChildCard({
  child,
  recommendations,
  onStartActivity,
  completedToday = false
}: ChildCardProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  // Get current prompt to display
  const currentPrompt = recommendations[currentIndex]?.prompt
  const hasMultipleRecommendations = recommendations.length > 1

  // Handle card body click - navigate to child detail page
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/children/${child.id}`)
  }

  // Handle refresh button - cycle to next recommendation
  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card navigation

    if (isRefreshing || recommendations.length <= 1) return

    setIsRefreshing(true)

    // Cycle to next recommendation
    const nextIndex = (currentIndex + 1) % recommendations.length

    // Add small delay for animation
    setTimeout(() => {
      setCurrentIndex(nextIndex)
      setIsRefreshing(false)
    }, 300)
  }

  // Handle start activity button
  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card navigation

    if (!currentPrompt || completedToday) return

    setIsStarting(true)
    onStartActivity(currentPrompt.id, child.id)

    // Reset after a delay (activity modal will open)
    setTimeout(() => setIsStarting(false), 1000)
  }

  const categoryEmoji = currentPrompt
    ? CATEGORY_EMOJIS[currentPrompt.category] || '⭐'
    : '⭐'

  const estimatedMinutes = currentPrompt?.estimated_minutes || 5

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-primary-200 hover:border-primary-400 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
      data-testid={`child-card-${child.id}`}
    >
      {/* Completed Today Badge */}
      {completedToday && (
        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
          ✓ Completed Today!
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Header: Child Name and Age */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{child.name}</h3>
            <p className="text-sm text-gray-600 font-medium">{child.age} years old</p>
          </div>

          {/* Category Badge */}
          {currentPrompt && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-primary-100">
              <span className="text-2xl" aria-label={`Category: ${currentPrompt.category}`}>
                {categoryEmoji}
              </span>
              <span className="text-xs font-semibold text-gray-600">
                {estimatedMinutes} min
              </span>
            </div>
          )}
        </div>

        {/* Prompt Section */}
        {currentPrompt ? (
          <div
            className={`space-y-2 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}
            data-testid={`child-card-prompt-${child.id}`}
          >
            <div className="flex items-center gap-2">
              <h4 className="text-xs uppercase tracking-wide font-bold text-primary-600">
                Today's Connection Idea
              </h4>
              {hasMultipleRecommendations && (
                <span className="text-xs text-gray-500">
                  ({currentIndex + 1}/{recommendations.length})
                </span>
              )}
            </div>

            <h5 className="text-lg font-bold text-gray-900 line-clamp-2">
              {currentPrompt.title}
            </h5>

            <p className="text-sm text-gray-600 line-clamp-3">
              {currentPrompt.description}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wide font-bold text-primary-600">
              No Recommendations
            </h4>
            <p className="text-sm text-gray-600">
              Complete more activities to get personalized recommendations
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleStart}
            disabled={!currentPrompt || completedToday || isStarting}
            className="flex-1 bg-gradient-to-r from-primary-600 via-primary-700 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            data-testid={`child-card-start-${child.id}`}
          >
            {isStarting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting...
              </span>
            ) : (
              <span>▶ Start Activity</span>
            )}
          </button>

          {hasMultipleRecommendations && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || completedToday}
              className="px-4 py-3 bg-white text-primary-700 border-2 border-primary-300 rounded-xl font-semibold hover:bg-primary-50 hover:border-primary-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh to see another idea"
              title="See another idea"
              data-testid={`child-card-refresh-${child.id}`}
            >
              {isRefreshing ? (
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Click to view details hint */}
        <p className="text-xs text-gray-500 text-center pt-2">
          Click card to view insights and more ideas →
        </p>
      </div>
    </div>
  )
}
