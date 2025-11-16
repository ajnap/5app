'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConnectionInsights from './ConnectionInsights'
import PersonalizedTips from './PersonalizedTips'
import ActivityHistory from './ActivityHistory'
import ReflectionModal from './ReflectionModal'
import ConfettiCelebration from './ConfettiCelebration'
import MilestoneCelebration, { detectMilestone, type Milestone } from './MilestoneCelebration'
import { usePromptRefresher } from '@/lib/hooks/usePromptRefresher'
import type {
  Child,
  ConnectionInsights as ConnectionInsightsType,
  PersonalizedTip,
  Completion,
  ScoredPrompt,
  Prompt
} from '@/lib/recommendations/types'

interface ChildDetailClientProps {
  child: Child
  insights: ConnectionInsightsType
  tips: PersonalizedTip[]
  completions: Completion[]
  recommendations: ScoredPrompt[]
  prompts: Prompt[]
  faithMode: boolean
  userId: string
  currentStreak: number
  totalCompletions: number
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

export default function ChildDetailClient({
  child,
  insights,
  tips,
  completions,
  recommendations,
  prompts,
  faithMode,
  userId,
  currentStreak,
  totalCompletions
}: ChildDetailClientProps) {
  const router = useRouter()
  const [reflectionOpen, setReflectionOpen] = useState(false)
  const [completingPromptId, setCompletingPromptId] = useState<string | null>(null)
  const [completingDuration, setCompletingDuration] = useState<number | undefined>(undefined)

  // Celebration states
  const [showConfetti, setShowConfetti] = useState(false)
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [milestoneOpen, setMilestoneOpen] = useState(false)

  // Use prompt refresher hook for featured prompt
  const { currentPrompt: featuredScoredPrompt, refresh, isRefreshing, hasMore } = usePromptRefresher(recommendations)
  const featuredPrompt = featuredScoredPrompt?.prompt

  // Remaining recommendations (excluding the featured one)
  const moreIdeas = recommendations.slice(1, 7) // Show next 6 recommendations

  // Handle starting an activity
  const handleStartActivity = (promptId: string) => {
    setCompletingPromptId(promptId)

    // Trigger confetti
    setShowConfetti(true)

    // Check for milestones
    const isFirstCompletion = totalCompletions === 0
    const detectedMilestone = detectMilestone(currentStreak + 1, isFirstCompletion)

    if (detectedMilestone) {
      setMilestone(detectedMilestone)
      setMilestoneOpen(true)

      // Delay reflection modal
      setTimeout(() => {
        setReflectionOpen(true)
      }, 4500)
    } else {
      setReflectionOpen(true)
    }
  }

  // Handle completion from reflection modal
  const handleReflectionComplete = async (notes?: string) => {
    router.refresh() // Refresh to update insights
  }

  return (
    <>
      <div className="space-y-8">
        {/* Connection Insights */}
        <ConnectionInsights insights={insights} childName={child.name} />

        {/* Personalized Tips */}
        {tips.length > 0 && <PersonalizedTips tips={tips} childName={child.name} />}

        {/* Today's Featured Prompt */}
        {featuredPrompt && (
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-primary-300 shadow-xl p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs uppercase tracking-wide font-bold text-primary-600 mb-1">
                  Featured Activity
                </h2>
                <h3 className="text-3xl font-bold text-gray-900">
                  {featuredPrompt.title}
                </h3>
              </div>
              {hasMore && (
                <button
                  onClick={refresh}
                  disabled={isRefreshing}
                  className="px-5 py-3 bg-white text-primary-700 border-2 border-primary-300 rounded-xl font-semibold hover:bg-primary-50 hover:border-primary-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="See another featured activity"
                >
                  {isRefreshing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Refresh</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div
              className={`transition-all duration-300 ${
                isRefreshing ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-primary-100">
                  <span className="text-3xl">{CATEGORY_EMOJIS[featuredPrompt.category] || '⭐'}</span>
                  <span className="text-sm font-semibold text-gray-600">
                    {featuredPrompt.estimated_minutes || 5} minutes
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {featuredPrompt.description}
              </p>

              {/* Start Button */}
              <button
                onClick={() => handleStartActivity(featuredPrompt.id)}
                className="w-full bg-gradient-to-r from-primary-600 via-primary-700 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                ▶ Start This Activity
              </button>
            </div>
          </div>
        )}

        {/* More Ideas */}
        {moreIdeas.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-primary-200 shadow-lg p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                More Ideas for {child.name}
              </h2>
              <p className="text-gray-600">
                Additional personalized recommendations
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {moreIdeas.map((scoredPrompt, index) => {
                const prompt = scoredPrompt.prompt
                const categoryEmoji = CATEGORY_EMOJIS[prompt.category] || '⭐'

                return (
                  <div
                    key={prompt.id}
                    className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border-2 border-primary-200 hover:border-primary-400 p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-primary-100">
                        <span className="text-2xl">{categoryEmoji}</span>
                        <span className="text-xs font-semibold text-gray-600">
                          {prompt.estimated_minutes || 5} min
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {prompt.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {prompt.description}
                    </p>

                    {/* Action Button */}
                    <button
                      onClick={() => handleStartActivity(prompt.id)}
                      className="w-full bg-gradient-to-r from-primary-600 via-primary-700 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      ▶ Start Activity
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Activity History */}
        <ActivityHistory completions={completions} childName={child.name} />
      </div>

      {/* Confetti Celebration */}
      <ConfettiCelebration
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Milestone Celebration Modal */}
      {milestone && (
        <MilestoneCelebration
          milestone={milestone}
          isOpen={milestoneOpen}
          onClose={() => setMilestoneOpen(false)}
          childName={child.name}
        />
      )}

      {/* Reflection Modal */}
      {completingPromptId && (
        <ReflectionModal
          isOpen={reflectionOpen}
          onClose={() => {
            setReflectionOpen(false)
            setCompletingDuration(undefined)
          }}
          promptId={completingPromptId}
          promptTitle={prompts.find((p) => p.id === completingPromptId)?.title || ''}
          childId={child.id}
          faithMode={faithMode}
          durationSeconds={completingDuration}
          estimatedMinutes={
            prompts.find((p) => p.id === completingPromptId)?.estimated_minutes
          }
          onComplete={handleReflectionComplete}
        />
      )}
    </>
  )
}
