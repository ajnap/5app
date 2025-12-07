'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ChildCardGrid from './ChildCardGrid'
import ReflectionModal from './ReflectionModal'
import QuickMemoryButton from './QuickMemoryButton'
import ConfettiCelebration from './ConfettiCelebration'
import MilestoneCelebration, { detectMilestone, type Milestone } from './MilestoneCelebration'
import EmptyState from './EmptyState'
import type { RecommendationResult, Child } from '@/lib/recommendations/types'

interface Prompt {
  id: string
  title: string
  description: string
  activity: string
  category: string
  age_categories: string[]
  tags: string[]
  estimated_minutes?: number
}

interface DashboardClientProps {
  children: Child[]
  prompts: Prompt[]
  completedToday?: boolean
  faithMode?: boolean
  userId: string
  currentStreak?: number
  totalCompletions?: number
  recommendationsMap?: Record<string, RecommendationResult>
  todayActivityCountMap?: Record<string, number>
  weeklyActivityCountMap?: Record<string, number>
  monthlyActivityCountMap?: Record<string, number>
}

export default function DashboardClient({
  children,
  prompts,
  completedToday: initialCompletedToday = false,
  faithMode = false,
  userId,
  currentStreak = 0,
  totalCompletions = 0,
  recommendationsMap = {},
  todayActivityCountMap = {},
  weeklyActivityCountMap = {},
  monthlyActivityCountMap = {}
}: DashboardClientProps) {
  const router = useRouter()

  const [reflectionOpen, setReflectionOpen] = useState(false)
  const [completingPromptId, setCompletingPromptId] = useState<string | null>(null)
  const [completingChildId, setCompletingChildId] = useState<string | null>(null)
  const [completingDuration, setCompletingDuration] = useState<number | undefined>(undefined)

  // Celebration states
  const [showConfetti, setShowConfetti] = useState(false)
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [milestoneOpen, setMilestoneOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Handle completion from reflection modal
  const handleReflectionComplete = async (notes?: string) => {
    setIsRefreshing(true)

    // Show loading toast
    const loadingToast = toast.loading('Updating your progress...')

    try {
      // Refresh to update streak counter and recommendations
      router.refresh()

      // Give time for the refresh to complete
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Activity completed! Keep up the great work! 🎉', {
        id: loadingToast,
        duration: 3000,
      })
    } catch (error) {
      toast.error('Failed to update progress. Please try again.', {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle starting activity from recommendations
  const handleStartActivity = (promptId: string, childId: string) => {
    const prompt = prompts.find(p => p.id === promptId)
    if (!prompt) return

    setCompletingPromptId(promptId)
    setCompletingChildId(childId) // Store child ID for reflection modal

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

  // Empty state for no children
  if (children.length === 0) {
    return (
      <EmptyState
        icon="👨‍👩‍👧‍👦"
        title="Add Your First Child"
        description="Get started by adding your child's profile to receive age-appropriate connection prompts personalized just for them."
        actionLabel="Add Child Profile"
        actionHref="/children/new"
      />
    )
  }

  return (
    <>
      {/* Child Card Grid - shows all children with personalized prompts */}
      <ChildCardGrid
        children={children}
        recommendationsMap={recommendationsMap}
        todayActivityCountMap={todayActivityCountMap}
        weeklyActivityCountMap={weeklyActivityCountMap}
        monthlyActivityCountMap={monthlyActivityCountMap}
        currentStreak={currentStreak}
        onStartActivity={handleStartActivity}
        isRefreshing={isRefreshing}
      />

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
          childName={completingChildId ? children.find(c => c.id === completingChildId)?.name : undefined}
        />
      )}

      {/* Reflection Modal */}
      {completingPromptId && (
        <ReflectionModal
          isOpen={reflectionOpen}
          onClose={() => {
            setReflectionOpen(false)
            setCompletingChildId(null)
            setCompletingDuration(undefined)
          }}
          promptId={completingPromptId}
          promptTitle={prompts.find(p => p.id === completingPromptId)?.title || ''}
          childId={completingChildId}
          faithMode={faithMode}
          durationSeconds={completingDuration}
          estimatedMinutes={prompts.find(p => p.id === completingPromptId)?.estimated_minutes}
          onComplete={handleReflectionComplete}
        />
      )}

      {/* Quick Memory Button */}
      <QuickMemoryButton children={children} userId={userId} />
    </>
  )
}
