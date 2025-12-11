'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

// 15 high-quality demo prompts organized by category
const BROWSE_PROMPTS = [
  // Emotional Connection (3)
  {
    id: 'browse-1',
    title: 'The 3-2-1 Connection',
    description: 'A powerful daily check-in that builds emotional safety.',
    activity: "Sit together and share: 3 things that happened today, 2 things you're grateful for, and 1 thing you're looking forward to tomorrow. Take turns - you share too!",
    category: 'Emotional Connection',
    emoji: '💬',
  },
  {
    id: 'browse-2',
    title: 'Feelings Check-In',
    description: 'Help them name and understand their emotions.',
    activity: "Ask: 'If your feelings right now were a weather forecast, what would it be? Sunny? Stormy? Partly cloudy?' Share yours too. Talk about what might make the forecast change.",
    category: 'Emotional Connection',
    emoji: '🌤️',
  },
  {
    id: 'browse-3',
    title: 'The Appreciation Minute',
    description: 'Tell them exactly why they matter.',
    activity: "Look your child in the eyes and spend 60 seconds telling them specific things you appreciate about WHO they are (not what they do). Be specific. Watch them light up.",
    category: 'Emotional Connection',
    emoji: '✨',
  },

  // Bonding & Traditions (3)
  {
    id: 'browse-4',
    title: 'The Special Handshake',
    description: 'Create a unique bond only you two share.',
    activity: "Work together to create a secret handshake with at least 3 moves. Practice until you both have it down. Use it as your special greeting. This becomes YOUR thing.",
    category: 'Bonding',
    emoji: '🤝',
  },
  {
    id: 'browse-5',
    title: 'Memory Jar Moment',
    description: 'Capture today before it slips away.',
    activity: "Together, write down one happy moment from today on a slip of paper. Fold it up and save it. Read them together at the end of the month or year.",
    category: 'Bonding',
    emoji: '🫙',
  },
  {
    id: 'browse-6',
    title: 'Our Song',
    description: 'Music creates lasting emotional connections.',
    activity: "Pick a song to be 'your song' together. Dance to it, sing it badly, make it yours. Play it during special moments or when one of you needs a boost.",
    category: 'Bonding',
    emoji: '🎵',
  },

  // Self-Worth & Confidence (3)
  {
    id: 'browse-7',
    title: 'Strength Spotter',
    description: 'Help them see their own superpowers.',
    activity: "Tell your child about a strength you've noticed in them recently. Be specific: 'I noticed how patient you were when...' Ask them what strengths they see in themselves.",
    category: 'Self-Worth',
    emoji: '💪',
  },
  {
    id: 'browse-8',
    title: 'Brave Moments',
    description: 'Celebrate courage, big and small.',
    activity: "Share a time you both did something brave. It doesn't have to be big - trying new food, speaking up, or facing a fear all count. Bravery is a muscle we build together.",
    category: 'Self-Worth',
    emoji: '🦁',
  },
  {
    id: 'browse-9',
    title: 'Dream Big Together',
    description: 'Explore their hopes and show you believe in them.',
    activity: "Ask: 'If you could do ANYTHING when you grow up, what would it be?' Listen without judgment. Then ask: 'What's one thing we could do this week to learn more about that?'",
    category: 'Self-Worth',
    emoji: '🚀',
  },

  // Fun & Play (3)
  {
    id: 'browse-10',
    title: 'Silly Voice Story',
    description: 'Laughter is connection currency.',
    activity: "Take turns telling a short story, but you MUST use a silly voice the whole time. Pirate, robot, squeaky mouse - anything goes. The sillier, the better.",
    category: 'Fun & Play',
    emoji: '🤪',
  },
  {
    id: 'browse-11',
    title: 'Would You Rather',
    description: 'Simple game, deep conversations.',
    activity: "Take turns asking 'Would you rather...' questions. Start silly (fly or be invisible?) and go deeper (be really good at one thing or okay at everything?). Listen to their reasoning.",
    category: 'Fun & Play',
    emoji: '🤔',
  },
  {
    id: 'browse-12',
    title: 'Dance Party Break',
    description: 'Movement + music + togetherness = joy.',
    activity: "Put on an upbeat song and have a 3-minute dance party. No rules, no judgment. Just move together. Bonus: let your child pick the song and teach you their moves.",
    category: 'Fun & Play',
    emoji: '💃',
  },

  // Support & Listening (3)
  {
    id: 'browse-13',
    title: 'Worry Time',
    description: 'Help them feel heard and less alone.',
    activity: "Create a safe moment to ask: 'Is there anything bothering you or making you worried?' If they share, just listen first. Don't fix - validate: 'That sounds really hard.'",
    category: 'Support',
    emoji: '🫂',
  },
  {
    id: 'browse-14',
    title: 'Rose, Thorn, Bud',
    description: 'A balanced way to process the day.',
    activity: "Share your Rose (best part of today), Thorn (hardest part), and Bud (something you're looking forward to). This teaches them to hold both good and hard at once.",
    category: 'Support',
    emoji: '🌹',
  },
  {
    id: 'browse-15',
    title: "In Your Corner",
    description: 'Remind them they\'re never alone.',
    activity: "Tell your child: 'No matter what happens, I'm always in your corner.' Then ask: 'Is there anything coming up where you might need me in your corner?' Just knowing you're there matters.",
    category: 'Support',
    emoji: '🥊',
  },
]

const CATEGORIES = [
  { name: 'All', emoji: '✨' },
  { name: 'Emotional Connection', emoji: '💬' },
  { name: 'Bonding', emoji: '🤝' },
  { name: 'Self-Worth', emoji: '💪' },
  { name: 'Fun & Play', emoji: '🎉' },
  { name: 'Support', emoji: '🫂' },
]

function GuestNav() {
  return (
    <nav className="sticky top-0 z-50 bg-cream-100/80 backdrop-blur-lg border-b border-cream-200">
      <div className="container-wide py-3">
        <div className="flex justify-between items-center">
          <Link href="/try/dashboard" className="flex items-center gap-2 group">
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

function PromptCard({ prompt, onTry }: { prompt: typeof BROWSE_PROMPTS[0]; onTry: () => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{prompt.emoji}</span>
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">{prompt.title}</h3>
              <span className="text-xs text-lavender-600 font-medium">{prompt.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-lavender-100 px-2.5 py-1 rounded-full">
            <span className="text-sm">⏱️</span>
            <span className="text-xs font-medium text-lavender-700">5 min</span>
          </div>
        </div>

        <p className="text-slate-600 text-sm mb-4">{prompt.description}</p>

        {expanded && (
          <div className="bg-cream-50 rounded-xl p-4 mb-4 border border-cream-100">
            <p className="text-slate-700 text-sm leading-relaxed">{prompt.activity}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 py-2.5 px-4 border border-cream-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-cream-50 transition-colors"
          >
            {expanded ? 'Hide Details' : 'See Activity'}
          </button>
          <button
            onClick={onTry}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>❤️</span>
            <span>Try This</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [triedCount, setTriedCount] = useState(0)

  const filteredPrompts = selectedCategory === 'All'
    ? BROWSE_PROMPTS
    : BROWSE_PROMPTS.filter(p => p.category === selectedCategory)

  const handleTry = (promptTitle: string) => {
    setTriedCount(prev => prev + 1)
    toast.success(`Great choice! "${promptTitle}" is a wonderful activity.`, {
      description: triedCount >= 1 ? 'Create an account to save your favorites!' : undefined,
    })
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <GuestNav />

      <main className="container-narrow py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/try/dashboard"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-4 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>

          <h1 className="font-display text-display-sm text-slate-900 mb-2">
            Browse Activities
          </h1>
          <p className="text-slate-600">
            Preview 15 of our 70+ expert-designed connection activities. Each takes just 5 minutes!
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.name
                  ? 'bg-lavender-500 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-cream-200 hover:border-lavender-300'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Prompts Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onTry={() => handleTry(prompt.title)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-lavender-500 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="font-display text-2xl font-semibold mb-2">
            Love what you see?
          </h2>
          <p className="text-lavender-100 mb-6">
            Create a free account to unlock all 70+ activities, track your favorites, and build your connection streak!
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-lavender-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Create Free Account
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  )
}
