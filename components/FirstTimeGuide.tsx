'use client'

import { useState, useEffect } from 'react'

interface FirstTimeGuideProps {
  totalCompletions: number
  hasChildren: boolean
}

const STORAGE_KEY = 'dashboard_guide_dismissed'

export default function FirstTimeGuide({ totalCompletions, hasChildren }: FirstTimeGuideProps) {
  const [isDismissed, setIsDismissed] = useState(true) // Start hidden to prevent flash
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check localStorage after mount
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed && totalCompletions < 3) {
      setIsDismissed(false)
      // Delay visibility for smooth entrance
      setTimeout(() => setIsVisible(true), 100)
    }
  }, [totalCompletions])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      setIsDismissed(true)
      localStorage.setItem(STORAGE_KEY, 'true')
    }, 300)
  }

  // Don't show if dismissed or user has completed several activities
  if (isDismissed || totalCompletions >= 3) {
    return null
  }

  const steps = hasChildren
    ? [
        { number: '1', text: 'Pick a child below', icon: '👇' },
        { number: '2', text: 'Start a 5-min activity', icon: '▶️' },
        { number: '3', text: 'Reflect & celebrate!', icon: '🎉' }
      ]
    : [
        { number: '1', text: 'Add your first child', icon: '👶' },
        { number: '2', text: 'Get personalized activities', icon: '✨' },
        { number: '3', text: 'Build connection habits', icon: '💝' }
      ]

  return (
    <div
      className={`
        mb-6 transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <div className="relative bg-gradient-to-r from-sage-50 via-cream-50 to-lavender-50 rounded-2xl border border-sage-200 p-4 shadow-sm">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Dismiss guide"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">👋</span>
          <p className="font-semibold text-slate-800 text-sm">
            {hasChildren ? 'Ready to connect?' : 'Welcome! Let\'s get started'}
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-cream-200">
                <span className="text-xs font-bold text-lavender-600 bg-lavender-100 w-5 h-5 rounded-full flex items-center justify-center">
                  {step.number}
                </span>
                <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
                  {step.text}
                </span>
                <span className="text-sm">{step.icon}</span>
              </div>
              {index < steps.length - 1 && (
                <span className="text-slate-300 hidden sm:block">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
