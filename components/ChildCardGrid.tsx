'use client'

import ChildCard from './ChildCard'
import type { Child, RecommendationResult } from '@/lib/recommendations/types'
import Link from 'next/link'

interface ChildCardGridProps {
  children: Child[]
  recommendationsMap: Record<string, RecommendationResult>
  completedTodayMap: Record<string, boolean>
  onStartActivity: (promptId: string, childId: string) => void
}

export default function ChildCardGrid({
  children,
  recommendationsMap,
  completedTodayMap,
  onStartActivity
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
    <div className="space-y-8">
      {/* Child Cards Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
        data-testid="child-card-grid"
      >
        {children.map((child) => {
          const recommendations = recommendationsMap[child.id]?.recommendations || []
          const completedToday = completedTodayMap[child.id] || false

          return (
            <ChildCard
              key={child.id}
              child={child}
              recommendations={recommendations}
              onStartActivity={onStartActivity}
              completedToday={completedToday}
            />
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
