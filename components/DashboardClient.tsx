'use client'

import { useState } from 'react'
import ChildSelector from './ChildSelector'

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
}

export default function DashboardClient({ children, prompts }: DashboardClientProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    children.length === 1 ? children[0].id : null
  )

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

  return (
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

      {/* Prompt Card */}
      <div className="card fade-in bg-gradient-to-br from-white to-primary-50/30 border-2 border-primary-100 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-200/20 to-purple-200/20 rounded-full blur-3xl -z-10"></div>

        {/* Card Header */}
        <div className="mb-6">
          <div className="inline-block bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
            {selectedChild ? `Perfect for ${selectedChild.name}` : "Today's Connection Moment"}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {todaysPrompt.title}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            {todaysPrompt.description}
          </p>
        </div>

        {/* Category Badge */}
        {todaysPrompt.category && (
          <div className="mb-4">
            <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
              {todaysPrompt.category}
            </span>
          </div>
        )}

        {/* Activity Section */}
        <div className="bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl p-8 mb-6 border-2 border-primary-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl opacity-10">💝</div>
          <h3 className="text-2xl font-bold text-primary-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">✨</span>
            Today's Activity
          </h3>
          <p className="text-lg text-primary-900 font-medium leading-relaxed">
            {todaysPrompt.activity}
          </p>
        </div>

        {/* Tags */}
        {todaysPrompt.tags && todaysPrompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {todaysPrompt.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

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
  )
}
