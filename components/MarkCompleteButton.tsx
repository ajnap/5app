'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { markPromptComplete, unmarkPromptComplete } from '@/app/actions/completions'

interface MarkCompleteButtonProps {
  promptId: string
  isCompleted: boolean
}

export default function MarkCompleteButton({ promptId, isCompleted: initialCompleted }: MarkCompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)

    try {
      if (isCompleted) {
        const result = await unmarkPromptComplete(promptId)
        if (result.success) {
          setIsCompleted(false)
          toast.success('Activity unmarked')
        } else {
          console.error('Unmark error:', result.error)
          toast.error('Failed to unmark activity', {
            description: result.error || 'Please try again'
          })
        }
      } else {
        const result = await markPromptComplete(promptId)
        if (result.success) {
          setIsCompleted(true)
          toast.success('Activity marked complete!')
        } else {
          console.error('Mark complete error:', result.error)
          toast.error('Failed to mark complete', {
            description: result.error || 'Please try again'
          })
        }
      }
    } catch (error) {
      console.error('Button error:', error)
      toast.error('An unexpected error occurred', {
        description: 'Please try again or contact support'
      })
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
