'use client'

import { useState, useEffect, useRef } from 'react'

interface ActivityTimerProps {
  isActive: boolean
  estimatedMinutes: number
  promptId: string
  onComplete: (durationSeconds: number) => void
}

export default function ActivityTimer({ isActive, estimatedMinutes, promptId, onComplete }: ActivityTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Load saved timer from localStorage on mount
  useEffect(() => {
    const storageKey = `activity_timer_${promptId}`
    const saved = localStorage.getItem(storageKey)

    if (saved && isActive) {
      const { startTime, promptIdSaved } = JSON.parse(saved)
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)

      // Only restore if less than 30 minutes old and matches prompt
      if (elapsed < 1800 && promptIdSaved === promptId) {
        startTimeRef.current = startTime
        setElapsedSeconds(elapsed)
        setIsRunning(true)
      } else {
        // Clear stale data
        localStorage.removeItem(storageKey)
      }
    }
  }, [promptId, isActive])

  // Start timer
  const startTimer = () => {
    const now = Date.now()
    startTimeRef.current = now
    setIsRunning(true)

    // Save to localStorage
    const storageKey = `activity_timer_${promptId}`
    localStorage.setItem(storageKey, JSON.stringify({
      startTime: now,
      promptIdSaved: promptId
    }))
  }

  // Update timer every 10 seconds (battery-friendly)
  useEffect(() => {
    if (isRunning && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTimeRef.current!) / 1000)
        setElapsedSeconds(elapsed)
      }, 10000) // Update every 10 seconds

      // Also update immediately
      const now = Date.now()
      const elapsed = Math.floor((now - startTimeRef.current) / 1000)
      setElapsedSeconds(elapsed)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [isRunning])

  // Handle completion
  const handleComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Get final elapsed time
    const finalElapsed = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : elapsedSeconds

    // Clear localStorage
    const storageKey = `activity_timer_${promptId}`
    localStorage.removeItem(storageKey)

    // Call completion handler
    onComplete(finalElapsed)
  }

  // Format time display
  const formatTime = (seconds: number): { minutes: number; secs: number } => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return { minutes, secs }
  }

  const { minutes, secs } = formatTime(elapsedSeconds)
  const estimatedSeconds = estimatedMinutes * 60
  const progressPercent = Math.min((elapsedSeconds / estimatedSeconds) * 100, 100)
  const isOverEstimate = elapsedSeconds > estimatedSeconds

  if (!isActive) return null

  return (
    <div className="space-y-4">
      {/* Timer Display */}
      <div className="text-center">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-2xl">▶️</span>
            <span>Start Activity</span>
          </button>
        ) : (
          <>
            {/* Time Display */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 mb-4">
              <p className="text-sm text-gray-600 mb-2">Time spent connecting</p>
              <div className="text-5xl font-bold text-gray-900 mb-2" aria-live="polite">
                {minutes}:{secs.toString().padStart(2, '0')}
              </div>
              <p className="text-sm text-gray-500">
                Estimated: {estimatedMinutes} min
              </p>

              {/* Progress Bar */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isOverEstimate
                      ? 'bg-gradient-to-r from-orange-400 to-amber-500'
                      : 'bg-gradient-to-r from-green-400 to-emerald-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Encouraging message if over estimate */}
              {isOverEstimate && (
                <p className="text-sm text-orange-600 mt-2 fade-in">
                  Taking your time is great! 💛
                </p>
              )}
            </div>

            {/* Complete Button */}
            <button
              onClick={handleComplete}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-2xl">✓</span>
              <span>Complete Activity</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
