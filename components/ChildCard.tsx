'use client'

import { useState, useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'
import type { Child, ScoredPrompt } from '@/lib/recommendations/types'
import { usePromptRefresher } from '@/lib/hooks/usePromptRefresher'

interface ChildCardProps {
  child: Child
  recommendations: ScoredPrompt[]
  onStartActivity: (promptId: string, childId: string) => void
  todayActivityCount?: number
  weeklyActivityCount?: number
  monthlyActivityCount?: number
  currentStreak?: number
}

// Prompt Detail Modal Component
function PromptDetailModal({
  prompt,
  childName,
  isOpen,
  onClose,
  onStart
}: {
  prompt: any
  childName: string
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}) {
  if (!isOpen || !prompt) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-lavender-500 to-purple-600 p-6 rounded-t-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-white/80 text-xs font-semibold uppercase tracking-wide">
                  Activity for {childName}
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">{prompt.title}</h2>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium capitalize">
                {prompt.category}
              </span>
              <span className="text-white/80 text-sm">
                {prompt.estimated_minutes || 5} minutes
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About this activity</h3>
              <p className="text-gray-700 leading-relaxed">{prompt.description}</p>
            </div>

            {prompt.activity && (
              <div className="bg-lavender-50 rounded-xl p-4 border-2 border-lavender-200">
                <h3 className="font-bold text-lavender-900 mb-2 flex items-center gap-2">
                  <span>⏱️</span> The Next 5 Minutes
                </h3>
                <p className="text-gray-700 leading-relaxed">{prompt.activity}</p>
              </div>
            )}

            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag: string, i: number) => (
                  <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action */}
          <div className="p-6 pt-0">
            <button
              onClick={onStart}
              className="w-full bg-gradient-to-r from-lavender-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <span>💝</span> Start Activity
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
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

const ChildCard = memo(function ChildCard({
  child,
  recommendations,
  onStartActivity,
  todayActivityCount = 0,
  weeklyActivityCount = 0,
  monthlyActivityCount = 0,
  currentStreak = 0
}: ChildCardProps) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showPromptDetail, setShowPromptDetail] = useState(false)

  // Use custom hook for prompt cycling
  const { currentPrompt: currentScoredPrompt, refresh, isRefreshing, hasMore } = usePromptRefresher(recommendations)

  // Trigger celebration animation when reaching 3+ activities
  useEffect(() => {
    if (todayActivityCount >= 3 && !showCelebration) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [todayActivityCount])

  // Get current prompt to display
  const currentPrompt = currentScoredPrompt?.prompt

  // Handle card body click - navigate to child detail page
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/children/${child.id}/profile`)
  }

  // Handle refresh button - cycle to next recommendation
  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card navigation
    refresh()
  }

  // Handle start activity button
  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card navigation

    if (!currentPrompt) return

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
      className="group relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-primary-200 hover:border-primary-400 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-300 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
      data-testid={`child-card-${child.id}`}
      role="article"
      aria-label={`${child.name}'s activity card`}
    >
      {/* Activity Count Badge */}
      {todayActivityCount > 0 && (
        <div
          className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10 transition-all ${
            todayActivityCount >= 3
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse'
              : todayActivityCount >= 2
              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          }`}
        >
          {todayActivityCount >= 3 ? '🌟 ' : ''}{todayActivityCount} {todayActivityCount === 1 ? 'activity' : 'activities'} today!
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Header: Child Name and Age */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{child.name}</h3>
            <p className="text-xs md:text-sm text-gray-600 font-medium">{child.age} years old</p>
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

        {/* Prompt Section - Clickable for details */}
        {currentPrompt ? (
          <div
            className={`space-y-2 transition-all duration-300 cursor-pointer hover:bg-white/50 rounded-xl p-2 -m-2 ${
              isRefreshing
                ? 'opacity-50 scale-95'
                : 'opacity-100 scale-100'
            }`}
            data-testid={`child-card-prompt-${child.id}`}
            onClick={(e) => {
              e.stopPropagation()
              setShowPromptDetail(true)
            }}
          >
            <div className="flex items-center gap-2">
              <h4 className="text-xs uppercase tracking-wide font-bold text-primary-600">
                Today's Connection Idea
              </h4>
              <span className="text-xs text-gray-400">(tap for details)</span>
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
            disabled={!currentPrompt || isStarting}
            className="flex-1 bg-gradient-to-r from-lavender-500 via-lavender-600 to-purple-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-md hover:shadow-xl focus:ring-2 focus:ring-lavender-400 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            data-testid={`child-card-start-${child.id}`}
            aria-label={currentPrompt ? `Connect with ${child.name}: ${currentPrompt.title}` : 'No activity available'}
          >
            {isStarting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="sr-only">Loading activity</span>
                <span aria-hidden="true">Starting...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span aria-hidden="true">💝</span>
                <span>Connect Now</span>
              </span>
            )}
          </button>

          {hasMore && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-3 bg-white text-primary-700 border-2 border-primary-300 rounded-xl font-semibold hover:bg-primary-50 hover:border-primary-400 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh to see another activity idea"
              aria-live="polite"
              title="See another idea"
              data-testid={`child-card-refresh-${child.id}`}
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="sr-only">Loading next activity</span>
                </>
              ) : (
                <>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="sr-only">Refresh activity</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Quick Stats Footer - Always visible */}
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Weekly Activities */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">This Week</span>
              <span className="text-lg font-bold text-primary-600">{weeklyActivityCount}</span>
              <span className="text-xs text-gray-400">{weeklyActivityCount === 1 ? 'activity' : 'activities'}</span>
            </div>

            {/* Monthly Activities */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">This Month</span>
              <span className="text-lg font-bold text-purple-600">{monthlyActivityCount}</span>
              <span className="text-xs text-gray-400">{monthlyActivityCount === 1 ? 'activity' : 'activities'}</span>
            </div>

            {/* Current Streak */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">Streak</span>
              <span className="text-lg font-bold text-orange-600">{currentStreak}</span>
              <span className="text-xs text-gray-400">{currentStreak === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
        </div>

        {/* Click to view details hint */}
        <p className="text-xs text-gray-500 text-center pt-2">
          Click card to view insights and more ideas →
        </p>
      </div>

      {/* Celebration Animation Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {/* Sparkle particles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: '1.5s'
              }}
            >
              <span className="text-2xl">✨</span>
            </div>
          ))}
          {/* Celebration badge */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-2xl text-xl font-bold">
              🎉 Amazing! 🎉
            </div>
          </div>
        </div>
      )}

      {/* Prompt Detail Modal */}
      <PromptDetailModal
        prompt={currentPrompt}
        childName={child.name}
        isOpen={showPromptDetail}
        onClose={() => setShowPromptDetail(false)}
        onStart={() => {
          setShowPromptDetail(false)
          handleStart({ stopPropagation: () => {} } as React.MouseEvent)
        }}
      />
    </div>
  )
})

export default ChildCard
