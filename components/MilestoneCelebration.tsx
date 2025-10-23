'use client'

import { useEffect } from 'react'

export type Milestone = 'first' | 7 | 14 | 30 | 60 | 90

interface MilestoneCelebrationProps {
  milestone: Milestone
  isOpen: boolean
  onClose: () => void
  childName?: string
}

const MILESTONE_DATA: Record<Milestone, { emoji: string; title: string; message: string; gradient: string }> = {
  first: {
    emoji: '🌟',
    title: 'Your First Connection!',
    message: 'You just started something beautiful. Every journey begins with a single step.',
    gradient: 'from-yellow-400 via-orange-400 to-pink-400'
  },
  7: {
    emoji: '🎉',
    title: 'One Week Strong!',
    message: "You're building a habit. Seven days of showing up for your child!",
    gradient: 'from-green-400 via-emerald-400 to-teal-400'
  },
  14: {
    emoji: '💪',
    title: 'Two Weeks!',
    message: "You're making this a lifestyle. Your consistency is inspiring!",
    gradient: 'from-blue-400 via-indigo-400 to-purple-400'
  },
  30: {
    emoji: '🎨',
    title: 'One Month!',
    message: "You've built something beautiful. Thirty days of intentional connection!",
    gradient: 'from-purple-400 via-pink-400 to-rose-400'
  },
  60: {
    emoji: '🚀',
    title: 'Two Months!',
    message: "Your dedication is remarkable. Sixty days of choosing connection!",
    gradient: 'from-cyan-400 via-blue-400 to-indigo-400'
  },
  90: {
    emoji: '🌟',
    title: 'Three Months!',
    message: "You're a connection champion! Ninety days of building memories that last forever.",
    gradient: 'from-amber-400 via-orange-400 to-red-400'
  }
}

export default function MilestoneCelebration({ milestone, isOpen, onClose, childName }: MilestoneCelebrationProps) {
  const data = MILESTONE_DATA[milestone]

  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`bg-gradient-to-br ${data.gradient} rounded-3xl shadow-2xl max-w-lg w-full p-12 pointer-events-auto slide-in relative overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative sparkles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 text-4xl opacity-50 animate-bounce-gentle" style={{ animationDelay: '0s' }}>✨</div>
            <div className="absolute top-20 right-20 text-3xl opacity-50 animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>⭐</div>
            <div className="absolute bottom-20 left-20 text-3xl opacity-50 animate-bounce-gentle" style={{ animationDelay: '1s' }}>💫</div>
            <div className="absolute bottom-10 right-10 text-4xl opacity-50 animate-bounce-gentle" style={{ animationDelay: '1.5s' }}>🌟</div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Animated Emoji */}
            <div className="text-8xl mb-6 animate-pulse">
              {data.emoji}
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              {data.title}
            </h2>

            {/* Message */}
            <p className="text-xl text-white/95 mb-6 drop-shadow">
              {data.message}
            </p>

            {/* Child-specific message */}
            {childName && milestone !== 'first' && (
              <p className="text-lg text-white/90 italic drop-shadow">
                {milestone >= 30
                  ? `${childName} is so lucky to have you ❤️`
                  : `Keep building memories with ${childName}!`
                }
              </p>
            )}

            {/* Close hint */}
            <p className="text-sm text-white/70 mt-8">
              Auto-closing in a moment...
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-20"
            aria-label="Close celebration"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

// Utility function to detect milestones
export function detectMilestone(currentStreak: number, isFirstCompletion: boolean): Milestone | null {
  if (isFirstCompletion) return 'first'

  const milestones: Milestone[] = [90, 60, 30, 14, 7]

  for (const milestone of milestones) {
    if (currentStreak === milestone) {
      return milestone
    }
  }

  return null
}
