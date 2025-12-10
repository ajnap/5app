'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGuest } from '@/lib/guest-mode'

const INTERESTS = [
  { id: 'art', emoji: '🎨', label: 'Arts & Crafts' },
  { id: 'sports', emoji: '⚽', label: 'Sports' },
  { id: 'reading', emoji: '📚', label: 'Reading' },
  { id: 'music', emoji: '🎵', label: 'Music' },
  { id: 'nature', emoji: '🌿', label: 'Nature' },
  { id: 'building', emoji: '🧱', label: 'Building' },
  { id: 'animals', emoji: '🐾', label: 'Animals' },
  { id: 'cooking', emoji: '🍳', label: 'Cooking' },
  { id: 'science', emoji: '🔬', label: 'Science' },
  { id: 'games', emoji: '🎮', label: 'Games' },
]

const CHALLENGES = [
  { id: 'tantrums', emoji: '😤', label: 'Big emotions' },
  { id: 'sleep', emoji: '😴', label: 'Sleep struggles' },
  { id: 'screen-time', emoji: '📱', label: 'Screen time' },
  { id: 'siblings', emoji: '👫', label: 'Sibling conflict' },
  { id: 'focus', emoji: '🎯', label: 'Focus & attention' },
  { id: 'transitions', emoji: '🔄', label: 'Transitions' },
]

// Fun character that guides the user
function GuideCharacter({ mood }: { mood: 'wave' | 'think' | 'celebrate' }) {
  return (
    <div className="relative w-24 h-24 mx-auto mb-6">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        {/* Body */}
        <circle cx="50" cy="50" r="40" fill="#FB923C" />
        <circle cx="50" cy="50" r="40" fill="url(#guideGradient)" />
        {/* Highlight */}
        <ellipse cx="40" cy="38" rx="12" ry="10" fill="#FDBA74" opacity="0.6" />
        {/* Eyes */}
        <ellipse cx="38" cy="46" rx="6" ry="7" fill="white" />
        <ellipse cx="62" cy="46" rx="6" ry="7" fill="white" />
        <circle cx="40" cy="48" r="3.5" fill="#1E293B" />
        <circle cx="64" cy="48" r="3.5" fill="#1E293B" />
        {/* Eye sparkles */}
        <circle cx="42" cy="45" r="1.5" fill="white" />
        <circle cx="66" cy="45" r="1.5" fill="white" />
        {/* Cheeks */}
        <circle cx="28" cy="56" r="5" fill="#FCA5A5" opacity="0.5" />
        <circle cx="72" cy="56" r="5" fill="#FCA5A5" opacity="0.5" />
        {/* Smile based on mood */}
        {mood === 'wave' && (
          <path d="M38 62 Q50 72 62 62" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
        {mood === 'think' && (
          <ellipse cx="50" cy="65" rx="8" ry="5" fill="#1E293B" />
        )}
        {mood === 'celebrate' && (
          <>
            <path d="M35 60 Q50 76 65 60" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Confetti */}
            <circle cx="20" cy="20" r="3" fill="#A78BFA" className="animate-ping" />
            <circle cx="80" cy="25" r="3" fill="#4ADE80" className="animate-ping" style={{ animationDelay: '0.2s' }} />
            <circle cx="25" cy="80" r="3" fill="#F472B6" className="animate-ping" style={{ animationDelay: '0.4s' }} />
          </>
        )}
        {/* Waving hand for wave mood */}
        {mood === 'wave' && (
          <ellipse cx="92" cy="50" rx="8" ry="6" fill="#EA580C" className="animate-bounce" />
        )}
        <defs>
          <linearGradient id="guideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default function TryPage() {
  const router = useRouter()
  const { addChild, setOnboardingCompleted } = useGuest()

  const [step, setStep] = useState(1)
  const [childName, setChildName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])

  const totalSteps = 4

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleChallenge = (id: string) => {
    setSelectedChallenges(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleComplete = () => {
    addChild({
      name: childName,
      birth_date: birthDate,
      interests: selectedInterests,
      challenges: selectedChallenges,
    })
    setOnboardingCompleted(true)
    router.push('/try/dashboard')
  }

  const canProceed = () => {
    switch (step) {
      case 1: return childName.trim().length >= 1
      case 2: return birthDate !== ''
      case 3: return true // Interests are optional
      case 4: return true // Challenges are optional
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-lavender-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-peach-200/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-2">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">Step {step} of {totalSteps}</span>
            <span className="text-sm text-slate-400">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-lavender-400 to-lavender-500 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-cream-200 p-8">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="text-center">
              <GuideCharacter mood="wave" />
              <h1 className="font-display text-2xl font-semibold text-slate-900 mb-2">
                Hi there! Let's meet your child
              </h1>
              <p className="text-slate-600 mb-8">
                What's your child's name?
              </p>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Enter name..."
                autoFocus
                className="w-full text-center text-2xl font-medium border-0 border-b-2 border-cream-200 focus:border-lavender-400 focus:ring-0 pb-2 bg-transparent placeholder:text-slate-300"
              />
            </div>
          )}

          {/* Step 2: Birthday */}
          {step === 2 && (
            <div className="text-center">
              <GuideCharacter mood="think" />
              <h1 className="font-display text-2xl font-semibold text-slate-900 mb-2">
                When was {childName} born?
              </h1>
              <p className="text-slate-600 mb-8">
                This helps us suggest age-appropriate activities
              </p>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full text-center text-lg border-2 border-cream-200 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 rounded-xl py-4 px-4"
              />
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="text-center">
              <GuideCharacter mood="wave" />
              <h1 className="font-display text-2xl font-semibold text-slate-900 mb-2">
                What does {childName} enjoy?
              </h1>
              <p className="text-slate-600 mb-6">
                Select all that apply (optional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selectedInterests.includes(interest.id)
                        ? 'border-lavender-400 bg-lavender-50 shadow-md'
                        : 'border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    <span className="text-xl">{interest.emoji}</span>
                    <span className="text-sm font-medium text-slate-700">{interest.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Challenges */}
          {step === 4 && (
            <div className="text-center">
              <GuideCharacter mood="think" />
              <h1 className="font-display text-2xl font-semibold text-slate-900 mb-2">
                Any areas you'd like help with?
              </h1>
              <p className="text-slate-600 mb-6">
                We'll tailor activities to support these (optional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CHALLENGES.map((challenge) => (
                  <button
                    key={challenge.id}
                    onClick={() => toggleChallenge(challenge.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selectedChallenges.includes(challenge.id)
                        ? 'border-peach-400 bg-peach-50 shadow-md'
                        : 'border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    <span className="text-xl">{challenge.emoji}</span>
                    <span className="text-sm font-medium text-slate-700">{challenge.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 px-4 border-2 border-cream-200 text-slate-600 rounded-xl font-medium hover:bg-cream-50 transition-colors"
              >
                Back
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-lavender-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>See Your Dashboard</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-500 text-sm mt-6">
          No account needed - just try it out!
        </p>
      </div>
    </div>
  )
}
