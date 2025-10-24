'use client'

import { useEffect, useState } from 'react'
import RecommendedPromptCard from './RecommendedPromptCard'
import type { ScoredPrompt } from '@/lib/recommendations/types'

interface RecommendationSectionProps {
  childId: string
  childName: string
  recommendations: ScoredPrompt[]
  loading?: boolean
  onStartActivity: (promptId: string, childId: string) => void
  onDismiss?: (promptId: string) => void
}

export default function RecommendationSection({
  childId,
  childName,
  recommendations,
  loading = false,
  onStartActivity,
  onDismiss
}: RecommendationSectionProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (loading) {
    return <SkeletonRecommendationSection childName={childName} />
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center border-2 border-gray-200">
        <p className="text-xl">✨</p>
        <p className="text-gray-600 font-medium mt-2">No new recommendations right now</p>
        <p className="text-sm text-gray-500 mt-1">Browse our full library below</p>
      </div>
    )
  }

  return (
    <section
      className={`mb-8 ${mounted ? 'slide-in' : 'opacity-0'}`}
      aria-labelledby={`recommendations-${childId}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h2
            id={`recommendations-${childId}`}
            className="text-2xl font-bold text-gray-900"
          >
            Recommended for {childName}
          </h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-primary-200 to-transparent"></div>
      </div>

      <p className="text-gray-600 mb-6">
        These activities are personalized based on {childName}'s interests and your family's connection patterns
      </p>

      {/* Recommendations Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="list"
        aria-label={`Recommended activities for ${childName}`}
      >
        {recommendations.map((scoredPrompt, index) => (
          <div
            key={scoredPrompt.prompt.id}
            role="listitem"
            style={{
              animation: mounted ? `slideInUp 0.4s ease-out ${index * 0.1}s both` : 'none'
            }}
          >
            <RecommendedPromptCard
              scoredPrompt={scoredPrompt}
              childName={childName}
              onStartActivity={(promptId) => onStartActivity(promptId, childId)}
              onDismiss={onDismiss}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-in {
          animation: slideInUp 0.6s ease-out;
        }
      `}</style>
    </section>
  )
}

function SkeletonRecommendationSection({ childName }: { childName: string }) {
  return (
    <section className="mb-8" aria-label="Loading recommendations">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎯</span>
        <h2 className="text-2xl font-bold text-gray-900">
          Recommended for {childName}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-primary-200 to-transparent"></div>
      </div>

      <div className="h-6 bg-gray-200 rounded w-3/4 mb-6 animate-pulse"></div>

      {/* Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md border-2 border-gray-100 overflow-hidden"
          >
            <div className="bg-gray-100 h-14 animate-pulse"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded mt-4 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
