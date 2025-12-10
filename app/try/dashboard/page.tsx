'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGuest, GuestChild } from '@/lib/guest-mode'
import { toast } from 'sonner'

// Sample prompts for the demo (we'll use a subset)
const DEMO_PROMPTS = [
  {
    id: 'demo-1',
    title: 'The Power of Yet',
    description: 'Reframe failure as part of learning.',
    activity: "When your child says \"I can't do this,\" teach them to add the word \"yet\" to the end. Practice together: \"I can't tie my shoes... yet!\" Discuss one thing they couldn't do before but can do now.",
    category: 'Emotional Intelligence',
    tags: ['growth-mindset', 'encouragement'],
  },
  {
    id: 'demo-2',
    title: 'Curiosity Question',
    description: 'Wonder together.',
    activity: 'Ask your child: "What\'s something you\'ve always wondered about?" Listen to their question, then explore possible answers together. No phones needed - just imagination!',
    category: 'Learning & Curiosity',
    tags: ['conversation', 'bonding'],
  },
  {
    id: 'demo-3',
    title: 'Gratitude Moment',
    description: 'Build thankfulness together.',
    activity: 'Take turns sharing 3 things you\'re each grateful for today. Try to find at least one unexpected thing to be thankful for. End with a hug!',
    category: 'Emotional Intelligence',
    tags: ['gratitude', 'positive'],
  },
  {
    id: 'demo-4',
    title: 'Silly Story Time',
    description: 'Create together, laugh together.',
    activity: 'Take turns adding one sentence to create a silly story. Start with "Once upon a time, there was a purple elephant who..." Let imagination run wild!',
    category: 'Creativity',
    tags: ['storytelling', 'fun'],
  },
  {
    id: 'demo-5',
    title: 'Memory Lane',
    description: 'Share a favorite memory.',
    activity: 'Tell your child about a favorite memory from when they were younger. Ask them about their favorite memory. What made these moments special?',
    category: 'Connection',
    tags: ['memories', 'conversation'],
  },
]

function GuestNav() {
  return (
    <nav className="sticky top-0 z-50 bg-cream-100/80 backdrop-blur-lg border-b border-cream-200">
      <div className="container-wide py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl transition-transform group-hover:scale-110">❤️</span>
            <span className="font-display text-lg font-semibold text-lavender-600 hidden sm:block">
              The Next 5 Minutes
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-slate-500 bg-peach-100 px-3 py-1 rounded-full">
              Try Mode
            </span>
            <Link
              href="/signup"
              className="px-4 py-2 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function ChildCard({ child, prompt, onComplete }: { child: GuestChild; prompt: typeof DEMO_PROMPTS[0]; onComplete: () => void }) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-900">{child.name}</h2>
            <p className="text-slate-500">{child.age} years old</p>
          </div>
          <div className="flex items-center gap-2 bg-lavender-100 px-3 py-1.5 rounded-full">
            <span className="text-lg">⏱️</span>
            <span className="text-sm font-medium text-lavender-700">5 min</span>
          </div>
        </div>

        <div className="text-xs font-semibold text-lavender-600 uppercase tracking-wide mb-2">
          Today's Connection Idea
        </div>
        <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">{prompt.title}</h3>
        <p className="text-slate-600">{prompt.description}</p>
      </div>

      {/* Expandable details */}
      {showDetails && (
        <div className="px-6 pb-4 pt-2 border-t border-cream-100 bg-cream-50">
          <p className="text-slate-700 leading-relaxed">{prompt.activity}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 pt-2 flex gap-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 py-3 px-4 border border-cream-200 text-slate-600 rounded-xl font-medium hover:bg-cream-50 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'See Activity'}
        </button>
        <button
          onClick={onComplete}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span>❤️</span>
          <span>Connect Now</span>
        </button>
      </div>
    </div>
  )
}

export default function TryDashboardPage() {
  const router = useRouter()
  const { guestData, addCompletion } = useGuest()
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)

  // Redirect if no children
  useEffect(() => {
    if (guestData.children.length === 0) {
      router.push('/try')
    }
  }, [guestData.children.length, router])

  // Show signup prompt after first completion
  useEffect(() => {
    if (completedToday.size === 1) {
      setTimeout(() => setShowSignupPrompt(true), 1000)
    }
  }, [completedToday.size])

  const handleComplete = (childId: string, promptId: string) => {
    addCompletion({ prompt_id: promptId, child_id: childId })
    setCompletedToday(prev => new Set([...prev, childId]))
    toast.success('Great job connecting! ❤️')
  }

  // Get greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (guestData.children.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <GuestNav />

      <main className="container-narrow py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-display-sm text-slate-900 mb-2">
            {getGreeting()}! 👋
          </h1>
          <p className="text-slate-600 text-lg">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <button
            onClick={() => router.push('/try')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-cream-200 hover:border-lavender-300 hover:shadow-md transition-all"
          >
            <span className="text-2xl">👶</span>
            <span className="text-sm font-medium text-slate-700">Add Child</span>
          </button>
          <Link
            href="/signup"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-cream-200 hover:border-lavender-300 hover:shadow-md transition-all"
          >
            <span className="text-2xl">💾</span>
            <span className="text-sm font-medium text-slate-700">Save Progress</span>
          </Link>
          <button
            onClick={() => toast.info('Schedule feature available with full account!')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-cream-200 hover:border-lavender-300 hover:shadow-md transition-all"
          >
            <span className="text-2xl">📅</span>
            <span className="text-sm font-medium text-slate-700">Schedule</span>
          </button>
        </div>

        {/* Child cards with prompts */}
        <div className="space-y-6">
          {guestData.children.map((child, index) => {
            const isCompleted = completedToday.has(child.id)
            const prompt = DEMO_PROMPTS[index % DEMO_PROMPTS.length]

            return isCompleted ? (
              <div key={child.id} className="bg-gradient-to-br from-sage-50 to-sage-100 rounded-2xl border border-sage-200 p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-display text-xl font-semibold text-sage-800 mb-2">
                  You connected with {child.name}!
                </h3>
                <p className="text-sage-600 mb-4">
                  Amazing job! Those 5 minutes mean the world.
                </p>
                <button
                  onClick={() => setCompletedToday(prev => {
                    const next = new Set(prev)
                    next.delete(child.id)
                    return next
                  })}
                  className="text-sm text-sage-600 hover:text-sage-700 underline"
                >
                  Try another activity
                </button>
              </div>
            ) : (
              <ChildCard
                key={child.id}
                child={child}
                prompt={prompt}
                onComplete={() => handleComplete(child.id, prompt.id)}
              />
            )
          })}
        </div>

        {/* Demo limitation notice */}
        <div className="mt-10 bg-lavender-50 border border-lavender-200 rounded-2xl p-6 text-center">
          <h3 className="font-semibold text-slate-900 mb-2">Enjoying the demo?</h3>
          <p className="text-slate-600 text-sm mb-4">
            Create a free account to unlock 70+ activities, track your streak, and save your progress forever.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Create Free Account
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Signup prompt modal */}
      {showSignupPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center relative animate-fade-in">
            <button
              onClick={() => setShowSignupPrompt(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-5xl mb-4">🎉</div>
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-2">
              You did it!
            </h2>
            <p className="text-slate-600 mb-6">
              That connection moment matters more than you know. Want to keep tracking your journey?
            </p>

            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full py-3 px-4 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Save My Progress
              </Link>
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="block w-full py-3 px-4 text-slate-600 font-medium hover:text-slate-800 transition-colors"
              >
                Keep exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
