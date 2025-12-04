'use client'

import { useState } from 'react'
import { HeartIcon } from '@heroicons/react/24/solid'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'
import SpouseCard from './SpouseCard'

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
    actions: ['Send an appreciative text', 'Leave a note', 'Give a heartfelt compliment'],
  },
  acts_of_service: {
    emoji: '🤝',
    name: 'Acts of Service',
    actions: ['Do their chore', 'Make their favorite meal', 'Handle something they dread'],
  },
  receiving_gifts: {
    emoji: '🎁',
    name: 'Receiving Gifts',
    actions: ['Surprise with their favorite treat', 'Pick up flowers', 'Get something meaningful'],
  },
  quality_time: {
    emoji: '⏰',
    name: 'Quality Time',
    actions: ['Plan a date night', 'Have a device-free conversation', 'Do an activity together'],
  },
  physical_touch: {
    emoji: '🤗',
    name: 'Physical Touch',
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
  const [currentPrompt, setCurrentPrompt] = useState(todayPrompt)
  const [selectedLoveLanguage, setSelectedLoveLanguage] = useState(spouseProfile?.love_language || 'quality_time')
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false)
  const [isLoadingDateIdeas, setIsLoadingDateIdeas] = useState(false)
  const [dateIdeas, setDateIdeas] = useState<string[]>([])
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set())

  const [timeAvailable, setTimeAvailable] = useState('2-3 hours')
  const [budgetRange, setBudgetRange] = useState('$20-50')
  const [energyLevel, setEnergyLevel] = useState('Medium')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loveLanguageInfo = LOVE_LANGUAGES[selectedLoveLanguage as keyof typeof LOVE_LANGUAGES]

  const handleGetAnotherQuestion = async () => {
    setIsLoadingPrompt(true)
    try {
      if (currentPrompt) {
        await supabase
          .from('used_conversation_prompts')
          .insert({
            user_id: userId,
            prompt_id: currentPrompt.id,
            helpful_rating: null,
          })
      }

      const { data: prompts } = await supabase
        .from('conversation_prompts')
        .select('*')
        .in('category', ['daily', 'fun', 'deep'])
        .limit(20)

      if (prompts && prompts.length > 0) {
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
        setCurrentPrompt(randomPrompt)
        toast.success('Here\'s a new question!')
      }
    } catch (error) {
      toast.error('Failed to load new question')
    } finally {
      setIsLoadingPrompt(false)
    }
  }

  const handleLogAction = async (action: string) => {
    try {
      await supabase
        .from('connection_activities')
        .insert({
          user_id: userId,
          activity_type: 'love_language_action',
          title: action,
          mood_rating: null,
          duration_minutes: null,
        })

      toast.success(`Great! "${action}" logged ❤️`)
    } catch (error) {
      toast.error('Failed to log action')
    }
  }

  const handleSaveLoveLanguage = async (newLanguage: string) => {
    try {
      await supabase
        .from('spouse_profiles')
        .update({ love_language: newLanguage })
        .eq('user_id', userId)

      setSelectedLoveLanguage(newLanguage)
      toast.success('Love language updated!')
    } catch (error) {
      toast.error('Failed to update love language')
    }
  }

  const handleGetDateIdeas = async () => {
    setIsLoadingDateIdeas(true)
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate 3 creative date night ideas with these constraints: Time available: ${timeAvailable}, Budget: ${budgetRange}, Energy level: ${energyLevel}. For each idea, include the title, brief description, and estimated cost/time. Format as a numbered list.`,
          sessionId: null,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate ideas')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.content) {
              fullText += data.content
            }
          }
        }
      }

      const ideas = fullText.split(/\d+\./).filter(s => s.trim()).slice(0, 3)
      setDateIdeas(ideas)
      toast.success('Date ideas generated!')
    } catch (error) {
      toast.error('Failed to generate date ideas')
    } finally {
      setIsLoadingDateIdeas(false)
    }
  }

  const toggleAction = (idx: number) => {
    const newChecked = new Set(checkedActions)
    if (newChecked.has(idx)) {
      newChecked.delete(idx)
    } else {
      newChecked.add(idx)
      handleLogAction(loveLanguageInfo.actions[idx])
    }
    setCheckedActions(newChecked)
  }

  const childWithFewest = activityByChild.length > 0
    ? activityByChild.reduce((min, child) => child.count < min.count ? child : min)
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Header */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center bg-white/60 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Spouse Connection
              </h1>
              <p className="text-sm text-gray-600">Quick daily prompts to connect with your partner</p>
            </div>
          </div>
          <a
            href="/dashboard"
            className="text-gray-700 hover:text-pink-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/60"
          >
            ← Dashboard
          </a>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Question */}
          {currentPrompt && (
            <SpouseCard
              title="Today's Question"
              subtitle="Start a meaningful conversation"
              className="lg:col-span-2"
            >
              <div className="mb-4">
                <p className="text-2xl font-semibold text-gray-900 leading-relaxed">
                  {currentPrompt.question}
                </p>
              </div>

              {currentPrompt.follow_up_questions && currentPrompt.follow_up_questions.length > 0 && (
                <div className="bg-pink-50 rounded-xl p-4 mb-4 border border-pink-100">
                  <p className="text-sm font-semibold text-pink-900 mb-2">Follow-up prompts:</p>
                  <ul className="space-y-2">
                    {currentPrompt.follow_up_questions.map((question, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-pink-500 mt-0.5">•</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleGetAnotherQuestion}
                disabled={isLoadingPrompt}
                className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingPrompt ? 'Loading...' : 'New Question'}
              </button>
            </SpouseCard>
          )}

          {/* Love Language Actions */}
          <SpouseCard
            title={`${loveLanguageInfo.emoji} ${loveLanguageInfo.name}`}
            subtitle="Daily actions to show love"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Love Language</label>
              <select
                value={selectedLoveLanguage}
                onChange={(e) => handleSaveLoveLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {Object.entries(LOVE_LANGUAGES).map(([key, lang]) => (
                  <option key={key} value={key}>
                    {lang.emoji} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {loveLanguageInfo.actions.map((action, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={checkedActions.has(idx)}
                    onChange={() => toggleAction(idx)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className={`text-sm flex-1 ${checkedActions.has(idx) ? 'line-through text-gray-500' : 'text-gray-700 group-hover:text-purple-900'}`}>
                    {action}
                  </span>
                </label>
              ))}
            </div>
          </SpouseCard>

          {/* Date Night Ideas */}
          <SpouseCard
            title="Date Night Ideas"
            subtitle="Tailored ideas for your time, budget, and energy"
          >
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time Available</label>
                <select
                  value={timeAvailable}
                  onChange={(e) => setTimeAvailable(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>30 min - 1 hour</option>
                  <option>1-2 hours</option>
                  <option>2-3 hours</option>
                  <option>Half day</option>
                  <option>Full day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Budget Range</label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Free</option>
                  <option>$10-20</option>
                  <option>$20-50</option>
                  <option>$50-100</option>
                  <option>$100+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Energy Level</label>
                <select
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Low (relaxing)</option>
                  <option>Medium</option>
                  <option>High (active)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGetDateIdeas}
              disabled={isLoadingDateIdeas}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isLoadingDateIdeas ? 'Generating...' : 'Get AI-Powered Date Ideas'}
            </button>

            {dateIdeas.length > 0 && (
              <div className="space-y-3">
                {dateIdeas.map((idea, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-800">{idea.trim()}</p>
                  </div>
                ))}
              </div>
            )}
          </SpouseCard>

          {/* This Week's Parenting */}
          {activityByChild.length > 0 && (
            <SpouseCard
              title="This Week's Parenting"
              subtitle="Activity distribution across your children"
              className="lg:col-span-2"
            >
              <div className="space-y-4 mb-4">
                {activityByChild.map((child, idx) => {
                  const maxCount = Math.max(...activityByChild.map(c => c.count))
                  const percentage = maxCount > 0 ? (child.count / maxCount) * 100 : 0

                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-900">{child.name}</span>
                        <span className="text-2xl font-bold text-green-600">{child.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 10)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{child.count} activities this week</p>
                    </div>
                  )
                })}
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Great teamwork!</span> Keep connecting with each child regularly.
                </p>
                {childWithFewest && childWithFewest.count < 2 && (
                  <p className="text-sm text-green-700">
                    💡 <span className="font-medium">{childWithFewest.name}</span> could use some extra one-on-one time this week.
                  </p>
                )}
              </div>
            </SpouseCard>
          )}
        </div>
      </main>
    </div>
  )
}
