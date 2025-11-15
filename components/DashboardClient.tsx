'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import ChildCardGrid from './ChildCardGrid'
import ReflectionModal from './ReflectionModal'
import QuickMemoryButton from './QuickMemoryButton'
import ConfettiCelebration from './ConfettiCelebration'
import MilestoneCelebration, { detectMilestone, type Milestone } from './MilestoneCelebration'
import EmptyState from './EmptyState'
import UpcomingEvents from './UpcomingEvents'
import type { RecommendationResult } from '@/lib/recommendations/types'

interface Child {
  id: string
  name: string
  age: number
  birth_date: string
}

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
  completedTodayMap?: Record<string, boolean>
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
  completedTodayMap = {}
}: DashboardClientProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [reflectionOpen, setReflectionOpen] = useState(false)
  const [completingPromptId, setCompletingPromptId] = useState<string | null>(null)
  const [completingChildId, setCompletingChildId] = useState<string | null>(null)
  const [completingDuration, setCompletingDuration] = useState<number | undefined>(undefined)

  // Celebration states
  const [showConfetti, setShowConfetti] = useState(false)
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [milestoneOpen, setMilestoneOpen] = useState(false)

  // Handle completion from reflection modal
  const handleReflectionComplete = async (notes?: string) => {
    router.refresh() // Refresh to update streak counter and recommendations
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
        actionHref="/children"
      />
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* Child Card Grid - shows all children with personalized prompts */}
        <ChildCardGrid
          children={children}
          recommendationsMap={recommendationsMap}
          completedTodayMap={completedTodayMap}
          onStartActivity={handleStartActivity}
        />

        {/* Upcoming Events Calendar Widget */}
        <UpcomingEvents children={children} />
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
