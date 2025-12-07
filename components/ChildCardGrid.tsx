'use client'

import Link from 'next/link'
import ErrorBoundary from './ErrorBoundary'
import type { Child, RecommendationResult, ScoredPrompt } from '@/lib/recommendations/types'

interface ChildCardGridProps {
  children: Child[]
  recommendationsMap: Record<string, RecommendationResult>
  todayActivityCountMap: Record<string, number>
  weeklyActivityCountMap: Record<string, number>
  monthlyActivityCountMap: Record<string, number>
  currentStreak: number
  onStartActivity: (promptId: string, childId: string) => void
  isRefreshing?: boolean
}

// Colorful card backgrounds for each child
const cardColors = [
  { bg: 'bg-lavender-500', light: 'bg-lavender-400', progress: 'bg-lavender-300' },
  { bg: 'bg-teal-500', light: 'bg-teal-400', progress: 'bg-teal-300' },
  { bg: 'bg-peach-500', light: 'bg-peach-400', progress: 'bg-peach-300' },
  { bg: 'bg-sage-500', light: 'bg-sage-400', progress: 'bg-sage-300' },
  { bg: 'bg-rose-500', light: 'bg-rose-400', progress: 'bg-rose-300' },
]

export default function ChildCardGrid({
  children,
  recommendationsMap,
  todayActivityCountMap,
  weeklyActivityCountMap,
  monthlyActivityCountMap,
  currentStreak,
  onStartActivity,
  isRefreshing = false
}: ChildCardGridProps) {
  // Empty state - no children
  if (children.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-cream-200 shadow-sm">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-6xl">👨‍👩‍👧‍👦</div>
          <h3 className="font-display text-2xl font-bold text-slate-900">Add Your First Child</h3>
          <p className="text-slate-600">
            Get started by adding your child's profile to receive personalized activities.
          </p>
          <Link href="/children/new">
            <button className="btn-primary">
              Add Child Profile
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative">
      {/* Loading Overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-lavender-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-slate-700 font-medium">Updating...</span>
          </div>
        </div>
      )}

      {/* Colorful Child Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child, index) => {
          const colors = cardColors[index % cardColors.length]
          const recommendations = recommendationsMap[child.id]?.recommendations || []
          const weeklyCount = weeklyActivityCountMap[child.id] || 0
          const weeklyGoal = 7 // Weekly goal of 7 activities
          const progressPercent = Math.min((weeklyCount / weeklyGoal) * 100, 100)

          return (
            <ErrorBoundary
              key={child.id}
              fallback={
                <div className="bg-slate-100 rounded-2xl p-6 text-center">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-sm text-slate-600 mt-2">Unable to load</p>
                </div>
              }
            >
              <div className={`${colors.bg} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-xl font-bold">{child.name}</h3>
                    <p className="text-white/80 text-sm">{child.age} years old</p>
                  </div>
                  <Link
                    href={`/children/${child.id}`}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="4" r="2" />
                      <circle cx="10" cy="10" r="2" />
                      <circle cx="10" cy="16" r="2" />
                    </svg>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-sm">
                    <span className="font-bold">{weeklyCount}</span>
                    <span className="text-white/80"> / {weeklyGoal} this week</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className={`h-2 rounded-full ${colors.light}`}>
                    <div
                      className={`h-full rounded-full bg-white transition-all duration-500`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/70 mt-1">{Math.round(progressPercent)}% of weekly goal</p>
                </div>
              </div>
            </ErrorBoundary>
          )
        })}
      </div>

      {/* Today's Activities Section */}
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-900 mb-4">Today's Activities</h2>

        {children.map((child, childIndex) => {
          const recommendations = recommendationsMap[child.id]?.recommendations || []
          const todayCount = todayActivityCountMap[child.id] || 0

          if (recommendations.length === 0) return null

          return (
            <div key={child.id} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">👶</span>
                <h3 className="font-semibold text-slate-700">{child.name}</h3>
                {todayCount > 0 && (
                  <span className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full">
                    {todayCount} done today
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {recommendations.slice(0, 3).map((rec: ScoredPrompt, index: number) => (
                  <div
                    key={rec.prompt.id}
                    className="bg-white rounded-xl p-4 border border-cream-200 hover:border-lavender-300 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center flex-shrink-0">
                        {rec.prompt.category === 'Creative' && '🎨'}
                        {rec.prompt.category === 'Active' && '🏃'}
                        {rec.prompt.category === 'Learning' && '📚'}
                        {rec.prompt.category === 'Emotional' && '💝'}
                        {rec.prompt.category === 'Social' && '🤝'}
                        {!['Creative', 'Active', 'Learning', 'Emotional', 'Social'].includes(rec.prompt.category) && '✨'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{rec.prompt.title}</p>
                        <p className="text-sm text-slate-500 truncate">{rec.prompt.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartActivity(rec.prompt.id, child.id)}
                      className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-lavender-300 hover:bg-lavender-500 hover:border-lavender-500 hover:text-white text-lavender-500 flex items-center justify-center transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* If no recommendations for any child */}
        {children.every(child => (recommendationsMap[child.id]?.recommendations || []).length === 0) && (
          <div className="bg-white rounded-xl p-8 text-center border border-cream-200">
            <div className="text-4xl mb-3">🌟</div>
            <p className="text-slate-600">All caught up! Check back tomorrow for new activities.</p>
          </div>
        )}
      </div>
    </div>
  )
}
