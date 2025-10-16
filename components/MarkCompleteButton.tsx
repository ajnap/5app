'use client'

import { useState } from 'react'
import { markPromptComplete, unmarkPromptComplete } from '@/app/actions/completions'

interface MarkCompleteButtonProps {
  promptId: string
  isCompleted: boolean
}

export default function MarkCompleteButton({ promptId, isCompleted: initialCompleted }: MarkCompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    console.log('Button clicked! promptId:', promptId)
    setIsLoading(true)

    try {
      if (isCompleted) {
        const result = await unmarkPromptComplete(promptId)
        if (result.success) {
          setIsCompleted(false)
        } else {
          console.error('Unmark error:', result.error)
          alert(result.error || 'Failed to unmark prompt')
        }
      } else {
        const result = await markPromptComplete(promptId)
        if (result.success) {
          setIsCompleted(true)
        } else {
          console.error('Mark complete error:', result.error)
          alert(result.error || 'Failed to mark prompt complete')
        }
      }
    } catch (error) {
      console.error('Button error:', error)
      alert('An unexpected error occurred')
    }

    setIsLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      type="button"
      className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${
        isCompleted
          ? 'bg-gradient-to-r from-green-600 to-emerald-700'
          : 'bg-gradient-to-r from-primary-600 to-primary-700'
      } text-white hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
      style={{ position: 'relative', zIndex: 10 }}
    >
      <div className="flex items-center justify-center gap-3 font-semibold text-lg">
        {isLoading ? (
          <>
            <span className="text-2xl animate-spin">⏳</span>
            {isCompleted ? 'Unmarking...' : 'Marking...'}
          </>
        ) : isCompleted ? (
          <>
            <span className="text-2xl">✓</span>
            Completed!
          </>
        ) : (
          <>
            <span className="text-2xl">✓</span>
            Mark as Complete
          </>
        )}
      </div>
    </button>
  )
}
