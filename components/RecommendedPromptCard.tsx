'use client'

import { useState } from 'react'
import type { ScoredPrompt } from '@/lib/recommendations/types'

interface RecommendedPromptCardProps {
  scoredPrompt: ScoredPrompt
  childName: string
  onStartActivity: (promptId: string) => void
  onDismiss?: (promptId: string) => void
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

export default function RecommendedPromptCard({
  scoredPrompt,
  childName,
  onStartActivity,
  onDismiss
}: RecommendedPromptCardProps) {
  const { prompt, reasons } = scoredPrompt
  const [showTooltip, setShowTooltip] = useState(false)

  const categoryEmoji = CATEGORY_EMOJIS[prompt.category] || '⭐'
  const primaryReason = reasons[0]?.message || 'Recommended for you'

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-primary-100 overflow-hidden">
      {/* Header with badge */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-label={`Category: ${prompt.category}`}>
            {categoryEmoji}
          </span>
          <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
            {prompt.category.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
          <span className="text-sm">✨</span>
          <span className="text-xs font-medium text-primary-600">Personalized</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {prompt.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {prompt.description}
        </p>

        {/* Why recommended - with tooltip */}
        <div className="relative mb-4">
          <button
            className="flex items-start gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors w-full text-left"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            aria-label="Why this is recommended"
          >
            <span className="text-lg mt-0.5">💡</span>
            <span className="font-medium flex-1">
              {primaryReason}
            </span>
          </button>

          {/* Tooltip with all reasons */}
          {showTooltip && reasons.length > 1 && (
            <div className="absolute z-10 top-full left-0 mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs fade-in">
              <p className="font-semibold mb-2">Why we recommend this:</p>
              <ul className="space-y-1">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="mt-0.5">•</span>
                    <span>{reason.message}</span>
                  </li>
                ))}
              </ul>
              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          )}
        </div>

        {/* Estimated time */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{prompt.estimated_minutes} min</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onStartActivity(prompt.id)}
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            aria-label={`Start activity: ${prompt.title} for ${childName}`}
          >
            Start Activity
          </button>

          {onDismiss && (
            <button
              onClick={() => onDismiss(prompt.id)}
              className="px-3 py-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Not now"
              title="Not now"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
