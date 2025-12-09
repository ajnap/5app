'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ChildCardGrid from './ChildCardGrid'
import ReflectionModal from './ReflectionModal'
import QuickMemoryButton from './QuickMemoryButton'
import ConfettiCelebration from './ConfettiCelebration'
import MilestoneCelebration, { detectMilestone, type Milestone } from './MilestoneCelebration'
import EmptyState from './EmptyState'
import UpcomingEvents from './UpcomingEvents'
import ErrorBoundary from './ErrorBoundary'
import ActionPrompt from './ActionPrompt'
import FirstTimeGuide from './FirstTimeGuide'
import ProgressStats from './ProgressStats'
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
  weeklyMinutes?: number
  monthlyMinutes?: number
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
  monthlyActivityCountMap = {},
  weeklyMinutes = 0,
  monthlyMinutes = 0
}: DashboardClientProps) {
  const router = useRouter()
  const childCardsRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [reflectionOpen, setReflectionOpen] = useState(false)
  const [completingPromptId, setCompletingPromptId] = useState<string | null>(null)
  const [completingPromptTitle, setCompletingPromptTitle] = useState<string>('')
  const [completingChildId, setCompletingChildId] = useState<string | null>(null)
  const [completingDuration, setCompletingDuration] = useState<number | undefined>(undefined)
  const [memoryModalOpen, setMemoryModalOpen] = useState(false)

  // Celebration states
  const [showConfetti, setShowConfetti] = useState(false)
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [milestoneOpen, setMilestoneOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get greeting based on client's local time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Action prompt handlers
  const handleConnectClick = () => {
    childCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleMemoryClick = () => {
    // The QuickMemoryButton will handle opening the modal
    // We'll trigger a click on it programmatically
    const memoryButton = document.querySelector('[aria-label="Add a memory"]') as HTMLButtonElement
    memoryButton?.click()
  }

  const handleProgressClick = () => {
    progressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
    // Find prompt in local prompts array OR from recommendations
    let prompt = prompts.find(p => p.id === promptId)

    // If not found in prompts array, get from recommendations
    if (!prompt) {
      const childRecommendations = recommendationsMap[childId]?.recommendations || []
      const rec = childRecommendations.find(r => r.prompt.id === promptId)
      if (rec) {
        prompt = rec.prompt as Prompt
      }
    }

    if (!prompt) {
      console.error('Prompt not found:', promptId)
      return
    }

    setCompletingPromptId(promptId)
    setCompletingPromptTitle(prompt.title)
    setCompletingChildId(childId)
    // Default to 5 minutes (300 seconds) for tracking
    setCompletingDuration(300)

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
      <div className="space-y-6">
        {/* Warm greeting - uses client's local time */}
        <div className="fade-in-up">
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
            {getGreeting()}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Action Prompt - "What would you like to do?" */}
        <ActionPrompt
          onConnectClick={handleConnectClick}
          onMemoryClick={handleMemoryClick}
          onProgressClick={handleProgressClick}
          hasChildren={children.length > 0}
        />

        {/* First-time onboarding guide */}
        <FirstTimeGuide
          totalCompletions={totalCompletions}
          hasChildren={children.length > 0}
        />

        {/* Child Card Grid - shows all children with personalized prompts */}
        <div ref={childCardsRef}>
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
        </div>

        {/* Collapsible Progress Stats */}
        <div ref={progressRef}>
          <ProgressStats
            currentStreak={currentStreak}
            totalCompletions={totalCompletions}
            weeklyMinutes={weeklyMinutes}
            monthlyMinutes={monthlyMinutes}
          />
        </div>

        {/* Upcoming Events Calendar Widget */}
        <ErrorBoundary
          fallback={
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center border-2 border-gray-200 shadow-md">
              <div className="space-y-3">
                <div className="text-4xl">📅</div>
                <h4 className="font-bold text-gray-900">Calendar Unavailable</h4>
                <p className="text-sm text-gray-600">Unable to load upcoming events right now</p>
              </div>
            </div>
          }
        >
          <UpcomingEvents children={children} />
        </ErrorBoundary>
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
          promptTitle={completingPromptTitle}
          childId={completingChildId}
          faithMode={faithMode}
          durationSeconds={completingDuration}
          estimatedMinutes={5}
          onComplete={handleReflectionComplete}
        />
      )}

      {/* Quick Memory Button */}
      <QuickMemoryButton children={children} userId={userId} />
    </>
  )
}
