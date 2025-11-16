'use client'

import type { Completion } from '@/lib/recommendations/types'
import { formatDistanceToNow } from 'date-fns'

interface ActivityHistoryProps {
  completions: Completion[]
  childName: string
  limit?: number
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

function formatDuration(seconds: number | null): string {
  if (!seconds) return '5 min'

  const minutes = Math.round(seconds / 60)
  if (minutes < 1) return '< 1 min'
  if (minutes === 1) return '1 min'
  return `${minutes} min`
}

export default function ActivityHistory({
  completions,
  childName,
  limit = 10
}: ActivityHistoryProps) {
  const recentCompletions = completions.slice(0, limit)

  if (recentCompletions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity History</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-600">
            No activities completed with {childName} yet.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Start your first activity to build your connection history!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-primary-200 shadow-lg p-6 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Activity History</h2>
        <p className="text-gray-600">
          Recent connections with {childName}
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {recentCompletions.map((completion, index) => {
          const prompt = completion.prompt
          const categoryEmoji = prompt
            ? CATEGORY_EMOJIS[prompt.category] || '⭐'
            : '⭐'
          const hasReflection = !!completion.reflection_note
          const timeAgo = formatDistanceToNow(new Date(completion.completed_at), {
            addSuffix: true
          })

          return (
            <div
              key={completion.id}
              className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
            >
              {/* Timeline Dot */}
              <div className="absolute left-0 top-1 -translate-x-1/2 w-4 h-4 bg-primary-500 rounded-full border-4 border-white shadow-sm" />

              {/* Content */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-primary-300 transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{categoryEmoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {prompt?.title || 'Activity Completed'}
                      </h3>
                      <p className="text-xs text-gray-500">{timeAgo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {formatDuration(completion.duration_seconds)}
                    </span>
                    {hasReflection && (
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                        ✓ Reflected
                      </span>
                    )}
                  </div>
                </div>

                {/* Reflection Note */}
                {completion.reflection_note && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700 italic">
                      "{completion.reflection_note}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Show More Link */}
      {completions.length > limit && (
        <div className="pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Showing {limit} of {completions.length} activities
          </p>
        </div>
      )}
    </div>
  )
}
