'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import ChildSelector from './ChildSelector'
import FavoriteButton from './FavoriteButton'
import TodaysPromptCard from './TodaysPromptCard'
import ReflectionModal from './ReflectionModal'
import QuickMemoryButton from './QuickMemoryButton'

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
}

interface DashboardClientProps {
  children: Child[]
  prompts: Prompt[]
  completedToday?: boolean
  faithMode?: boolean
  userId: string
}

export default function DashboardClient({
  children,
  prompts,
  completedToday: initialCompletedToday = false,
  faithMode = false,
  userId
}: DashboardClientProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    children.length === 1 ? children[0].id : null
  )
  const [completedToday, setCompletedToday] = useState(initialCompletedToday)
  const [reflectionOpen, setReflectionOpen] = useState(false)
  const [completingPromptId, setCompletingPromptId] = useState<string | null>(null)

  // Get age category for selected child
  const getAgeCategory = (age: number): string => {
    if (age < 2) return 'infant'
    if (age < 5) return 'toddler'
    if (age < 12) return 'elementary'
    if (age < 18) return 'teen'
    return 'young_adult'
  }

  // Filter prompts based on selected child
  const getFilteredPrompts = () => {
    if (!selectedChildId) {
      // Show prompts for all age categories
      return prompts
    }

    const selectedChild = children.find(c => c.id === selectedChildId)
    if (!selectedChild) return prompts

    const ageCategory = getAgeCategory(selectedChild.age)

    // Filter prompts that match the child's age category or are marked as 'all'
    return prompts.filter(prompt =>
      prompt.age_categories.includes(ageCategory) ||
      prompt.age_categories.includes('all')
    )
  }

  const filteredPrompts = getFilteredPrompts()
  const todaysPrompt = filteredPrompts[0] || {
    id: null,
    title: "Welcome to The Next 5 Minutes!",
    description: "Your personalized prompt will appear here. Add your children to get age-appropriate activities!",
    activity: "Set up your child profiles to get started with personalized prompts.",
    category: 'connection',
    age_categories: ['all'],
    tags: []
  }

  const selectedChild = children.find(c => c.id === selectedChildId)

  // Handle marking prompt as complete - opens reflection modal
  const handleMarkComplete = () => {
    if (!todaysPrompt.id) return
    setCompletingPromptId(todaysPrompt.id)
    setReflectionOpen(true)
  }

  // Handle completion from reflection modal
  const handleReflectionComplete = async (notes?: string) => {
    setCompletedToday(true)
    router.refresh() // Refresh to update streak counter
  }

  return (
    <>
      <div className="space-y-8">
        {/* Child Selector */}
        <ChildSelector
          children={children}
          selectedChildId={selectedChildId}
          onSelectChild={setSelectedChildId}
        />

        {/* Personalization Badge */}
        {selectedChild && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 fade-in">
            <p className="text-green-900 font-semibold flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span>
                Personalized for {selectedChild.name} • {filteredPrompts.length} age-appropriate {filteredPrompts.length === 1 ? 'prompt' : 'prompts'} available
              </span>
            </p>
          </div>
        )}

        {/* Today's Prompt Card */}
        <TodaysPromptCard
          prompt={todaysPrompt.id ? todaysPrompt : null}
          childName={selectedChild?.name || 'your child'}
          childAge={selectedChild?.age || 0}
          completedToday={completedToday}
          onMarkComplete={handleMarkComplete}
        />

        {/* More Prompts Teaser */}
        {filteredPrompts.length > 1 && (
          <div className="text-center fade-in">
            <p className="text-gray-600 mb-4">
              {filteredPrompts.length - 1} more {selectedChild ? `prompts for ${selectedChild.name}` : 'prompts'} available
            </p>
            <a
              href="/prompts"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-2xl">📚</span>
              Browse All Prompts
            </a>
          </div>
        )}
      </div>

      {/* Reflection Modal */}
      {completingPromptId && (
        <ReflectionModal
          isOpen={reflectionOpen}
          onClose={() => setReflectionOpen(false)}
          promptId={completingPromptId}
          promptTitle={todaysPrompt.title}
          childId={selectedChildId}
          faithMode={faithMode}
          onComplete={handleReflectionComplete}
        />
      )}

      {/* Quick Memory Button */}
      <QuickMemoryButton children={children} userId={userId} />
    </>
  )
}
