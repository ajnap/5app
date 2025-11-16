'use client'

import type { ConnectionInsights } from '@/lib/recommendations/types'

interface ConnectionInsightsProps {
  insights: ConnectionInsights
  childName: string
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  connection: 'Connection',
  behavior: 'Behavior',
  learning: 'Learning',
  mealtime: 'Mealtime',
  bedtime: 'Bedtime',
  creative_expression: 'Creative Expression',
  emotional_connection: 'Emotional Connection',
  spiritual_growth: 'Spiritual Growth',
  service: 'Service',
  gratitude: 'Gratitude'
}

const CATEGORY_COLORS: Record<string, string> = {
  connection: 'bg-pink-500',
  behavior: 'bg-green-500',
  learning: 'bg-blue-500',
  mealtime: 'bg-orange-500',
  bedtime: 'bg-purple-500',
  creative_expression: 'bg-yellow-500',
  emotional_connection: 'bg-red-500',
  spiritual_growth: 'bg-indigo-500',
  service: 'bg-teal-500',
  gratitude: 'bg-amber-500'
}

export default function ConnectionInsights({ insights, childName }: ConnectionInsightsProps) {
  const {
    weeklyMinutes,
    monthlyMinutes,
    totalCompletions,
    currentStreak,
    favoriteCategories,
    categoryDistribution,
    lastCompletionDate
  } = insights

  // Calculate days since last completion
  const daysSinceLastCompletion = lastCompletionDate
    ? Math.floor(
        (new Date().getTime() - new Date(lastCompletionDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null

  return (
    <div className="bg-white rounded-2xl border-2 border-primary-200 shadow-lg p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Insights</h2>
        <p className="text-gray-600">
          Your connection journey with {childName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Weekly Minutes */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="text-3xl font-bold text-blue-900">{weeklyMinutes}</div>
          <div className="text-sm font-medium text-blue-700">Minutes This Week</div>
        </div>

        {/* Monthly Minutes */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="text-3xl font-bold text-purple-900">{monthlyMinutes}</div>
          <div className="text-sm font-medium text-purple-700">Minutes This Month</div>
        </div>

        {/* Total Completions */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="text-3xl font-bold text-green-900">{totalCompletions}</div>
          <div className="text-sm font-medium text-green-700">Activities Completed</div>
        </div>

        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="text-3xl font-bold text-orange-900 flex items-center gap-2">
            {currentStreak > 0 && '🔥'}
            {currentStreak}
          </div>
          <div className="text-sm font-medium text-orange-700">Day Streak</div>
        </div>
      </div>

      {/* Category Distribution */}
      {categoryDistribution.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Category Balance</h3>
          <div className="space-y-3">
            {categoryDistribution.map((cat) => {
              const displayName = CATEGORY_DISPLAY_NAMES[cat.category] || cat.category
              const colorClass = CATEGORY_COLORS[cat.category] || 'bg-gray-500'

              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{displayName}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round(cat.percentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Favorite Categories */}
      {favoriteCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Favorite Activities</h3>
          <div className="flex flex-wrap gap-2">
            {favoriteCategories.slice(0, 5).map((cat, index) => {
              const displayName = CATEGORY_DISPLAY_NAMES[cat.category] || cat.category
              const colorClass = CATEGORY_COLORS[cat.category] || 'bg-gray-500'

              return (
                <div
                  key={cat.category}
                  className={`${colorClass} bg-opacity-20 border-2 border-current px-4 py-2 rounded-full`}
                  style={{ color: colorClass.replace('bg-', '') }}
                >
                  <span className="text-sm font-semibold">
                    {index === 0 && '⭐ '}
                    {displayName} ({cat.count})
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Last Activity */}
      {daysSinceLastCompletion !== null && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {daysSinceLastCompletion === 0 ? (
              <span className="text-green-700 font-medium">✓ Activity completed today!</span>
            ) : daysSinceLastCompletion === 1 ? (
              <span className="text-gray-700">Last activity: Yesterday</span>
            ) : (
              <span className="text-gray-700">
                Last activity: {daysSinceLastCompletion} days ago
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
