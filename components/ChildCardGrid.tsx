'use client'

import ChildCard from './ChildCard'
import ErrorBoundary from './ErrorBoundary'
import type { Child, RecommendationResult } from '@/lib/recommendations/types'
import Link from 'next/link'

interface ChildCardGridProps {
  children: Child[]
  recommendationsMap: Record<string, RecommendationResult>
  todayActivityCountMap: Record<string, number>
  weeklyActivityCountMap: Record<string, number>
  monthlyActivityCountMap: Record<string, number>
  childStreakMap: Record<string, number>
  onStartActivity: (promptId: string, childId: string) => void
  isRefreshing?: boolean
}

export default function ChildCardGrid({
  children,
  recommendationsMap,
  todayActivityCountMap,
  weeklyActivityCountMap,
  monthlyActivityCountMap,
  childStreakMap,
  onStartActivity,
  isRefreshing = false
}: ChildCardGridProps) {
  // Empty state - no children
  if (children.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border-2 border-gray-200 shadow-md">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-6xl">👨‍👩‍👧‍👦</div>
          <h3 className="text-2xl font-bold text-gray-900">Add Your First Child</h3>
          <p className="text-gray-600">
            Get started by adding your child's profile to receive age-appropriate connection prompts personalized just for them.
          </p>
          <Link href="/children/new">
            <button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
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
            <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700 font-medium">Updating...</span>
          </div>
        </div>
      )}

      {/* Child Cards Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
        data-testid="child-card-grid"
      >
        {children.map((child) => {
          const recommendations = recommendationsMap[child.id]?.recommendations || []
          const todayActivityCount = todayActivityCountMap[child.id] || 0
          const weeklyActivityCount = weeklyActivityCountMap[child.id] || 0
          const monthlyActivityCount = monthlyActivityCountMap[child.id] || 0
          const childStreak = childStreakMap[child.id] || 0

          return (
            <ErrorBoundary
              key={child.id}
              fallback={
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center border-2 border-gray-200 shadow-lg min-h-[300px] flex items-center justify-center">
                  <div className="space-y-3">
                    <div className="text-4xl">⚠️</div>
                    <h4 className="font-bold text-gray-900">Card Error</h4>
                    <p className="text-sm text-gray-600">Unable to load {child.name}'s card</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Refresh Page
                    </button>
                  </div>
                </div>
              }
            >
              <ChildCard
                child={child}
                recommendations={recommendations}
                onStartActivity={onStartActivity}
                todayActivityCount={todayActivityCount}
                weeklyActivityCount={weeklyActivityCount}
                monthlyActivityCount={monthlyActivityCount}
                currentStreak={childStreak}
              />
            </ErrorBoundary>
          )
        })}

        {/* Add Child Card */}
        <AddChildCard />
      </div>
    </div>
  )
}

/**
 * Add Child Card - appears as last item in grid
 */
function AddChildCard() {
  return (
    <Link href="/children/new">
      <div className="group h-full min-h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary-400 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <svg
              className="w-8 h-8 text-primary-600 group-hover:text-primary-700 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
              Add Child
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Create a new child profile
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
