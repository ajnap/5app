'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'

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
    quickAction: 'Send an appreciative text right now',
    actions: [
      'Send an appreciative text',
      'Leave a love note somewhere they\'ll find it',
      'Give a heartfelt compliment',
      'Tell them something you admire about them',
      'Thank them for something specific they did',
      'Write down 3 things you love about them'
    ],
  },
  acts_of_service: {
    emoji: '🤝',
    name: 'Acts of Service',
    quickAction: 'Do one small task for them today',
    actions: [
      'Do one of their chores without being asked',
      'Make their favorite meal or snack',
      'Handle something they\'ve been putting off',
      'Fill up their car with gas',
      'Take something off their to-do list',
      'Prepare their coffee/tea in the morning'
    ],
  },
  receiving_gifts: {
    emoji: '🎁',
    name: 'Receiving Gifts',
    quickAction: 'Pick up their favorite treat',
    actions: [
      'Surprise with their favorite treat',
      'Pick up flowers on your way home',
      'Get them something small but meaningful',
      'Order their favorite takeout',
      'Buy a book or item they mentioned wanting',
      'Create a small handmade gift'
    ],
  },
  quality_time: {
    emoji: '⏰',
    name: 'Quality Time',
    quickAction: 'Schedule 15 minutes of undivided attention',
    actions: [
      'Have a phone-free conversation',
      'Take a walk together after dinner',
      'Plan a date night this week',
      'Watch their favorite show together',
      'Cook a meal together',
      'Play a game or do a puzzle together'
    ],
  },
  physical_touch: {
    emoji: '🤗',
    name: 'Physical Touch',
    quickAction: 'Give a long, meaningful hug',
    actions: [
      'Give a long, meaningful hug',
      'Hold hands during a walk or movie',
      'Give a shoulder or back massage',
      'Sit close together on the couch',
      'Kiss them goodbye (and mean it!)',
      'Cuddle before getting out of bed'
    ],
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

      // Parse numbered list - match "1.", "2.", "3." patterns and extract content after them
      const ideaMatches = fullText.match(/\d+\.\s*[^]*?(?=\d+\.|$)/g)
      if (ideaMatches) {
        const ideas = ideaMatches
          .map(idea => idea.replace(/^\d+\.\s*/, '').trim())
          .filter(s => s.length > 10) // Filter out short/empty strings
          .slice(0, 3)
        setDateIdeas(ideas)
      } else {
        // Fallback: split by double newlines
        const ideas = fullText.split(/\n\n+/).filter(s => s.trim().length > 10).slice(0, 3)
        setDateIdeas(ideas)
      }
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
    <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">

          {/* Hero Card: Today's Question */}
          {currentPrompt && (
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-8 shadow-xl shadow-rose-200/50">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">💬</span>
                  <span className="text-rose-100 text-sm font-semibold uppercase tracking-wide">
                    Today's Conversation Starter
                  </span>
                </div>

                <p className="text-2xl md:text-3xl font-display font-bold text-white leading-relaxed mb-6">
                  "{currentPrompt.question}"
                </p>

                {currentPrompt.follow_up_questions && currentPrompt.follow_up_questions.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
                    <p className="text-rose-100 text-xs font-semibold mb-2 uppercase tracking-wide">Go deeper:</p>
                    <ul className="space-y-1">
                      {currentPrompt.follow_up_questions.slice(0, 2).map((question, idx) => (
                        <li key={idx} className="text-white/90 text-sm flex items-start gap-2">
                          <span className="text-rose-200">→</span>
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleGetAnotherQuestion}
                  disabled={isLoadingPrompt}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-rose-600 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingPrompt ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Get Another Question</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Two-column cards grid */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Love Language Card */}
            <div className="bg-white rounded-2xl border border-rose-100 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-rose-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{loveLanguageInfo.emoji}</span>
                    <div>
                      <h2 className="font-bold text-slate-900">{loveLanguageInfo.name}</h2>
                      <p className="text-xs text-slate-500">Their love language</p>
                    </div>
                  </div>
                  <select
                    value={selectedLoveLanguage}
                    onChange={(e) => handleSaveLoveLanguage(e.target.value)}
                    className="text-xs px-2 py-1 border border-rose-200 rounded-lg bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                  >
                    {Object.entries(LOVE_LANGUAGES).map(([key, lang]) => (
                      <option key={key} value={key}>
                        {lang.emoji} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6">
                {/* Quick action highlight */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-100 mb-1">
                    Today's Quick Action
                  </p>
                  <p className="font-bold">{loveLanguageInfo.quickAction}</p>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  {loveLanguageInfo.actions.map((action, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={checkedActions.has(idx)}
                        onChange={() => toggleAction(idx)}
                        className="w-5 h-5 text-purple-500 border-slate-300 rounded-lg focus:ring-purple-400"
                      />
                      <span className={`text-sm flex-1 ${checkedActions.has(idx) ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {action}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Night Ideas Card */}
            <div className="bg-white rounded-2xl border border-rose-100 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌙</span>
                  <div>
                    <h2 className="font-bold text-slate-900">Date Night Ideas</h2>
                    <p className="text-xs text-slate-500">AI-powered suggestions</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Time</label>
                    <select
                      value={timeAvailable}
                      onChange={(e) => setTimeAvailable(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option>30 min - 1 hour</option>
                      <option>1-2 hours</option>
                      <option>2-3 hours</option>
                      <option>Half day</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Budget</label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option>Free</option>
                      <option>$10-20</option>
                      <option>$20-50</option>
                      <option>$50+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Energy</label>
                    <select
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGetDateIdeas}
                  disabled={isLoadingDateIdeas}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {isLoadingDateIdeas ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>✨</span>
                      <span>Generate Date Ideas</span>
                    </span>
                  )}
                </button>

                {dateIdeas.length > 0 && (
                  <div className="space-y-2">
                    {dateIdeas.map((idea, idx) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-slate-700">{idea.trim()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Parenting Teamwork Card - Full width */}
          {activityByChild.length > 0 && (
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👨‍👩‍👧‍👦</span>
                  <div>
                    <h2 className="font-bold text-slate-900">This Week's Parenting</h2>
                    <p className="text-xs text-slate-500">How you're connecting with each child</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Activity bars */}
                  <div className="space-y-4">
                    {activityByChild.map((child, idx) => {
                      const maxCount = Math.max(...activityByChild.map(c => c.count), 1)
                      const percentage = (child.count / maxCount) * 100

                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-slate-900">{child.name}</span>
                            <span className="text-xl font-bold text-emerald-600">{child.count}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(percentage, 10)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Insights */}
                  <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                    <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                      <span>💡</span> Teamwork Insight
                    </h3>
                    <p className="text-sm text-slate-700 mb-2">
                      Great job staying connected! Keep the momentum going.
                    </p>
                    {childWithFewest && childWithFewest.count < 3 && (
                      <p className="text-sm text-emerald-700 font-medium">
                        <span className="font-bold">{childWithFewest.name}</span> could use some extra one-on-one time this week.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </main>
  )
}
