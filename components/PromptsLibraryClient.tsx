'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import FavoriteButton from './FavoriteButton'
import ReflectionModal from './ReflectionModal'
import ConfettiCelebration from './ConfettiCelebration'
import MilestoneCelebration, { detectMilestone, type Milestone } from './MilestoneCelebration'
import ActivityTimer from './ActivityTimer'

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

interface PromptsLibraryClientProps {
  children: Child[]
  prompts: Prompt[]
  userId: string
  faithMode?: boolean
  currentStreak?: number
  totalCompletions?: number
}

export default function PromptsLibraryClient({
  children,
  prompts,
  userId,
  faithMode = false,
  currentStreak = 0,
  totalCompletions = 0
}: PromptsLibraryClientProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Activity completion states
  const [activePromptId, setActivePromptId] = useState<string | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    children.length === 1 ? children[0].id : null
  )
  const [timerActive, setTimerActive] = useState(false)
  const [completingDuration, setCompletingDuration] = useState<number | undefined>(undefined)

  // Celebration states
  const [showConfetti, setShowConfetti] = useState(false)
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [milestoneOpen, setMilestoneOpen] = useState(false)
  const [reflectionOpen, setReflectionOpen] = useState(false)

  // Get unique categories from prompts
  const categories = useMemo(() => {
    const cats = new Set<string>()
    prompts.forEach(p => {
      if (p.category) cats.add(p.category)
    })
    return Array.from(cats).sort()
  }, [prompts])

  // Get age category helper
  const getAgeCategory = (age: number): string => {
    if (age < 2) return 'infant'
    if (age < 5) return 'toddler'
    if (age < 12) return 'elementary'
    if (age < 18) return 'teen'
    return 'young_adult'
  }

  // Get age label
  const getAgeLabel = (category: string): string => {
    const labels: Record<string, string> = {
      infant: 'Infants (0-1)',
      toddler: 'Toddlers (2-4)',
      elementary: 'Elementary (5-11)',
      teen: 'Teens (12-17)',
      young_adult: 'Young Adults (18+)'
    }
    return labels[category] || category
  }

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      // Category filter
      if (selectedCategory !== 'all' && prompt.category !== selectedCategory) {
        return false
      }

      // Age filter
      if (selectedAgeGroup !== 'all') {
        if (!prompt.age_categories.includes(selectedAgeGroup) && !prompt.age_categories.includes('all')) {
          return false
        }
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = prompt.title.toLowerCase().includes(query)
        const matchesDescription = prompt.description.toLowerCase().includes(query)
        const matchesActivity = prompt.activity.toLowerCase().includes(query)
        const matchesTags = prompt.tags?.some(tag => tag.toLowerCase().includes(query))

        if (!matchesTitle && !matchesDescription && !matchesActivity && !matchesTags) {
          return false
        }
      }

      return true
    })
  }, [prompts, selectedCategory, selectedAgeGroup, searchQuery])

  // Handle starting activity
  const handleStartActivity = (promptId: string) => {
    if (children.length === 0) {
      toast.error('Add a child first', {
        description: 'Please add a child profile to start activities'
      })
      return
    }

    // For multiple children, just open the modal - they'll select in the modal
    setActivePromptId(promptId)
  }

  // Handle timer completion
  const handleTimerComplete = (durationSeconds: number) => {
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
        setCompletingDuration(durationSeconds)
        setReflectionOpen(true)
      }, 4500)
    } else {
      setCompletingDuration(durationSeconds)
      setReflectionOpen(true)
    }
  }

  // Handle reflection completion
  const handleReflectionComplete = async () => {
    setTimerActive(false)
    setActivePromptId(null)
    setCompletingDuration(undefined)
    router.refresh()
  }

  const activePrompt = prompts.find(p => p.id === activePromptId)
  const selectedChild = children.find(c => c.id === selectedChildId)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card fade-in">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors capitalize"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Age Group
            </label>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
            >
              <option value="all">All Ages</option>
              <option value="infant">{getAgeLabel('infant')}</option>
              <option value="toddler">{getAgeLabel('toddler')}</option>
              <option value="elementary">{getAgeLabel('elementary')}</option>
              <option value="teen">{getAgeLabel('teen')}</option>
              <option value="young_adult">{getAgeLabel('young_adult')}</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedCategory !== 'all' || selectedAgeGroup !== 'all' || searchQuery) && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Active filters:</span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-primary-200 transition-colors"
              >
                <span className="capitalize">{selectedCategory}</span>
                <span>×</span>
              </button>
            )}
            {selectedAgeGroup !== 'all' && (
              <button
                onClick={() => setSelectedAgeGroup('all')}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                <span>{getAgeLabel(selectedAgeGroup)}</span>
                <span>×</span>
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                <span>"{searchQuery}"</span>
                <span>×</span>
              </button>
            )}
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSelectedAgeGroup('all')
                setSearchQuery('')
              }}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 font-medium">
          Showing {filteredPrompts.length} {filteredPrompts.length === 1 ? 'activity' : 'activities'}
        </p>
      </div>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-600 text-lg mb-2">No activities found</p>
          <p className="text-gray-500">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredPrompts.map((prompt, index) => (
            <div
              key={prompt.id}
              className="card hover-lift slide-in relative"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Favorite Button */}
              <div className="absolute top-4 right-4">
                <FavoriteButton promptId={prompt.id} />
              </div>

              {/* Category Badge */}
              {prompt.category && (
                <div className="mb-3">
                  <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                    {prompt.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3 pr-8">
                {prompt.title}
              </h3>

              {/* Description */}
              <p className="text-gray-700 mb-4 leading-relaxed">
                {prompt.description}
              </p>

              {/* Activity Box */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  The Next 5 Minutes
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {prompt.activity}
                </p>
              </div>

              {/* Tags */}
              {prompt.tags && prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {prompt.tags.slice(0, 4).map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {prompt.tags.length > 4 && (
                    <span className="text-xs text-gray-500 py-1">
                      +{prompt.tags.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Start Activity Button */}
              <button
                onClick={() => handleStartActivity(prompt.id)}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mt-4"
              >
                Start Activity
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active Prompt Modal */}
      {activePromptId && activePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => {
          if (!timerActive) {
            setActivePromptId(null)
          }
        }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {activePrompt.title}
              </h2>
              <p className="text-gray-600">
                {activePrompt.description}
              </p>
            </div>

            {/* Activity Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Activity:</h3>
              <p className="text-gray-700 leading-relaxed">
                {activePrompt.activity}
              </p>
            </div>

            {/* Child Selector (if multiple children) */}
            {children.length > 1 && !timerActive && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Which child is this for?
                </label>
                <select
                  value={selectedChildId || ''}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Select a child...</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Timer */}
            {timerActive ? (
              <ActivityTimer
                isActive={timerActive}
                estimatedMinutes={activePrompt.estimated_minutes || 10}
                promptId={activePrompt.id}
                onComplete={handleTimerComplete}
              />
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setActivePromptId(null)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setTimerActive(true)}
                  disabled={children.length > 1 && !selectedChildId}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Timer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confetti Celebration */}
      <ConfettiCelebration
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Milestone Celebration */}
      {milestone && (
        <MilestoneCelebration
          milestone={milestone}
          isOpen={milestoneOpen}
          onClose={() => setMilestoneOpen(false)}
          childName={selectedChild?.name}
        />
      )}

      {/* Reflection Modal */}
      {activePromptId && activePrompt && (
        <ReflectionModal
          isOpen={reflectionOpen}
          onClose={() => {
            setReflectionOpen(false)
            setCompletingDuration(undefined)
          }}
          promptId={activePromptId}
          promptTitle={activePrompt.title}
          childId={selectedChildId}
          faithMode={faithMode}
          durationSeconds={completingDuration}
          estimatedMinutes={activePrompt.estimated_minutes}
          onComplete={handleReflectionComplete}
        />
      )}
    </div>
  )
}
