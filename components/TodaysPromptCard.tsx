'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import ActivityTimer from './ActivityTimer'
import { generateConnectionEventUrl } from '@/lib/calendar'

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

interface TodaysPromptCardProps {
  prompt: Prompt | null
  childName: string
  childAge: number
  childId?: string
  completedToday: boolean
  onMarkComplete: (durationSeconds?: number) => void
}

export default function TodaysPromptCard({
  prompt,
  childName,
  childAge,
  childId,
  completedToday,
  onMarkComplete,
}: TodaysPromptCardProps) {
  const [timerActive, setTimerActive] = useState(false)
  const [personalizedActivity, setPersonalizedActivity] = useState<string | null>(null)
  const [isPersonalizing, setIsPersonalizing] = useState(false)

  if (!prompt) {
    return (
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 fade-in">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No prompt available
          </h3>
          <p className="text-gray-600">
            Select a child to see today's connection moment
          </p>
        </div>
      </div>
    )
  }

  // Category colors
  const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
    spiritual: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
    emotional: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
    physical: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
    academic: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
    social: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
    fun: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
    adventure: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' },
  }

  const categoryStyle = categoryColors[prompt.category.toLowerCase()] || categoryColors.fun

  // Get estimated time from prompt or use default
  const estimatedMinutes = prompt.estimated_minutes || 10

  const handleTimerComplete = (durationSeconds: number) => {
    onMarkComplete(durationSeconds)
  }

  const handleAddToCalendar = () => {
    // Default to scheduling for "now" or next convenient time
    const scheduledTime = new Date()

    const calendarUrl = generateConnectionEventUrl({
      childName,
      activityTitle: prompt.title,
      activityDescription: personalizedActivity || prompt.activity,
      scheduledTime,
      estimatedMinutes: estimatedMinutes,
    })

    // Open Google Calendar in new tab
    window.open(calendarUrl, '_blank')

    toast.success('Opening Google Calendar', {
      description: 'Event details have been pre-filled for you'
    })
  }

  const handlePersonalize = async () => {
    if (!childId || !prompt) {
      toast.error('Unable to personalize', {
        description: 'Please select a child first'
      })
      return
    }

    setIsPersonalizing(true)

    try {
      const response = await fetch('/api/personalize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: prompt.id,
          childId: childId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to personalize')
      }

      const data = await response.json()
      setPersonalizedActivity(data.personalized)

      toast.success('✨ Activity personalized with AI!', {
        description: `Tailored specifically for ${childName}`
      })
    } catch (error) {
      console.error('Personalization error:', error)
      toast.error('Failed to personalize', {
        description: 'Please try again'
      })
    } finally {
      setIsPersonalizing(false)
    }
  }

  if (completedToday) {
    return (
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 fade-in">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            You did it!
          </h3>
          <p className="text-green-700 text-lg mb-1">
            You connected with {childName} today
          </p>
          <p className="text-green-600 text-sm">
            Tomorrow brings a new opportunity to create meaningful moments
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-gradient-to-br from-white via-blue-50/50 to-purple-50/30 border-4 border-primary-200 hover:border-primary-300 transition-all duration-300 fade-in shadow-xl hover:shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-2">
            Today's Connection Moment
          </h2>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {prompt.title}
          </h3>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} border-2`}>
          {prompt.category}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border-2 border-gray-300">
          ⏱️ {estimatedMinutes} min
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border-2 border-blue-300">
          Age {childAge} • {childName}
        </span>
      </div>

      {/* Description */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-md border border-gray-100">
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          {prompt.description}
        </p>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Activity:</h4>
            {personalizedActivity && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-300">
                ✨ AI Personalized
              </span>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed">
            {personalizedActivity || prompt.activity}
          </p>
        </div>

        {/* AI Personalization Button */}
        {childId && !personalizedActivity && (
          <div className="border-t border-gray-200 mt-4 pt-4">
            <button
              onClick={handlePersonalize}
              disabled={isPersonalizing}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPersonalizing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Personalizing with AI...
                </>
              ) : (
                <>
                  ✨ Personalize with AI for {childName}
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Uses {childName}'s profile to create a custom activity
            </p>
          </div>
        )}

        {/* Add to Calendar Button */}
        <div className="border-t border-gray-200 mt-4 pt-4">
          <button
            onClick={handleAddToCalendar}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm shadow-sm border-2 border-gray-300 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
          >
            📅 Add to Google Calendar
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Schedule this {estimatedMinutes}-minute connection
          </p>
        </div>
      </div>

      {/* Activity Timer or CTA Button */}
      {!timerActive ? (
        <>
          <button
            onClick={() => setTimerActive(true)}
            className="w-full bg-gradient-to-r from-primary-600 via-primary-700 to-purple-600 text-white px-8 py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:-translate-y-1 pulse-glow"
          >
            Start Activity Timer
          </button>

          {/* Encouragement */}
          <p className="text-center text-sm text-gray-600 mt-4">
            This moment will create a lasting memory for {childName} ❤️
          </p>
        </>
      ) : (
        <ActivityTimer
          isActive={timerActive}
          estimatedMinutes={estimatedMinutes}
          promptId={prompt.id}
          onComplete={handleTimerComplete}
        />
      )}
    </div>
  )
}
