'use client'

import React from 'react'

/**
 * Skeleton loading state for ChildCard
 * Shows animated placeholder while data loads
 */
export default function ChildCardSkeleton() {
  return (
    <div className="group relative bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="h-7 w-32 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>

          {/* Category badge skeleton */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-200">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Prompt section skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-40 bg-gray-200 rounded"></div>
          <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-3 pt-2">
          <div className="flex-1 h-12 bg-gray-300 rounded-xl"></div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        </div>

        {/* Stats footer skeleton */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-8 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 w-14 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Hint skeleton */}
        <div className="h-3 w-48 bg-gray-200 rounded mx-auto"></div>
      </div>
    </div>
  )
}
