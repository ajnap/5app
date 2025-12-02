'use client'

import { useState } from 'react'
import { HeartIcon, SparklesIcon, ChatBubbleLeftRightIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/solid'

interface SpouseProfile {
  id: string
  love_language: string | null
  communication_style: string | null
}

interface ConversationPrompt {
  id: string
  category: string
  question: string
  follow_up_questions: string[]
}

interface ConnectionActivity {
  id: string
  title: string
  activity_type: string
  date: string
  mood_rating: number | null
}

interface ActivityByChild {
  name: string
  count: number
}

interface SpouseClientProps {
  userId: string
  spouseProfile: SpouseProfile | null
  todayPrompt: ConversationPrompt | null
  recentActivities: ConnectionActivity[]
  avgConnection: number | null
  activityByChild: ActivityByChild[]
}

const LOVE_LANGUAGES = {
  words_of_affirmation: {
    emoji: '💬',
    name: 'Words of Affirmation',
    color: 'from-blue-500 to-cyan-500',
    actions: ['Send an appreciative text', 'Leave a note', 'Give a heartfelt compliment'],
  },
  acts_of_service: {
    emoji: '🤝',
    name: 'Acts of Service',
    color: 'from-green-500 to-emerald-500',
    actions: ['Do their chore', 'Make their favorite meal', 'Handle something they dread'],
  },
  receiving_gifts: {
    emoji: '🎁',
    name: 'Receiving Gifts',
    color: 'from-purple-500 to-pink-500',
    actions: ['Surprise with their favorite treat', 'Pick up flowers', 'Get something meaningful'],
  },
  quality_time: {
    emoji: '⏰',
    name: 'Quality Time',
    color: 'from-orange-500 to-red-500',
    actions: ['Plan a date night', 'Have a device-free conversation', 'Do an activity together'],
  },
  physical_touch: {
    emoji: '🤗',
    name: 'Physical Touch',
    color: 'from-pink-500 to-rose-500',
    actions: ['Give a long hug', 'Hold hands', 'Back massage'],
  },
}

export default function SpouseClient({
  userId,
  spouseProfile,
  todayPrompt,
  recentActivities,
  avgConnection,
  activityByChild,
}: SpouseClientProps) {
  const [showLoveLanguages, setShowLoveLanguages] = useState(false)
  const [showDateIdeas, setShowDateIdeas] = useState(false)

  const loveLanguage = spouseProfile?.love_language || 'quality_time'
  const loveLanguageInfo = LOVE_LANGUAGES[loveLanguage as keyof typeof LOVE_LANGUAGES]

  return (
    <div className="min-h-screen">
      {/* Header with Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center backdrop-blur-md bg-white/60 rounded-2xl px-6 py-3 shadow-lg border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Spouse Connection
            </h1>
          </div>
          <a
            href="/dashboard"
            className="text-gray-700 hover:text-pink-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/60"
          >
            ← Dashboard
          </a>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Connection Score */}
        {avgConnection && (
          <div className="mb-6 bg-white rounded-2xl border-2 border-pink-200 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Connection This Week</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <HeartIcon
                        key={star}
                        className={`w-6 h-6 ${
                          star <= avgConnection ? 'text-pink-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{avgConnection}/5</span>
                </div>
              </div>
              <button
                onClick={() => {
                  /* TODO: Open check-in modal */
                }}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Quick Check-In
              </button>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Today's Conversation Prompt */}
          {todayPrompt && (
            <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-white rounded-2xl border-2 border-pink-300 shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-pink-600" />
                <h2 className="text-xl font-bold text-gray-900">Today's Question</h2>
              </div>
              <p className="text-lg text-gray-800 mb-4 font-medium">{todayPrompt.question}</p>
              {todayPrompt.follow_up_questions && todayPrompt.follow_up_questions.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-pink-200">
                  <p className="text-sm font-semibold text-pink-700 mb-2">Follow-up prompts:</p>
                  <ul className="space-y-1">
                    {todayPrompt.follow_up_questions.map((question, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => {
                  /* TODO: Mark as used & show new prompt */
                }}
                className="mt-4 w-full px-4 py-2 bg-white border-2 border-pink-300 text-pink-700 rounded-xl font-semibold hover:bg-pink-50 transition-all"
              >
                Get Another Question
              </button>
            </div>
          )}

          {/* Love Language Quick Actions */}
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-2xl border-2 border-purple-300 shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{loveLanguageInfo.emoji}</span>
                <h2 className="text-xl font-bold text-gray-900">{loveLanguageInfo.name}</h2>
              </div>
              <button
                onClick={() => setShowLoveLanguages(!showLoveLanguages)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Change
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Quick ways to show love today:</p>
            <div className="space-y-2">
              {loveLanguageInfo.actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    /* TODO: Log action */
                  }}
                  className="w-full text-left px-4 py-3 bg-white border border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group"
                >
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-900">
                    {action}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Date Night Ideas */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white rounded-2xl border-2 border-blue-300 shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Date Night Ideas</h2>
          </div>
          {!showDateIdeas ? (
            <button
              onClick={() => setShowDateIdeas(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <SparklesIcon className="w-6 h-6" />
              Get AI-Powered Date Ideas
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2">🍽️ Cozy Home Date</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Cook a new recipe together, set the table with candles, and enjoy a device-free dinner while the kids are asleep.
                </p>
                <p className="text-xs text-blue-600">💰 Budget: $20-30 • ⏰ Time: 2 hours</p>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2">🚶 Sunset Walk</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Take a walk around your neighborhood or a local park at sunset. Use today's conversation question to connect.
                </p>
                <p className="text-xs text-blue-600">💰 Budget: Free • ⏰ Time: 30-45 min</p>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2">☕ Morning Coffee Date</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Wake up 30 minutes earlier than the kids. Make coffee and sit together to plan your week and dream about the future.
                </p>
                <p className="text-xs text-blue-600">💰 Budget: Free • ⏰ Time: 30 min</p>
              </div>
            </div>
          )}
        </div>

        {/* Shared Parenting Insights */}
        {activityByChild.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-white rounded-2xl border-2 border-green-300 shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">This Week's Parenting</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Activity distribution across your children:
            </p>
            <div className="space-y-3">
              {activityByChild.map((child, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">{child.name}</span>
                    <span className="text-2xl font-bold text-green-600">{child.count}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    activities this week
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Great teamwork! Keep connecting with each child regularly.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
