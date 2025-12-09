'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

interface ReflectionModalProps {
  isOpen: boolean
  onClose: () => void
  promptId: string
  promptTitle: string
  childId: string | null
  faithMode: boolean
  durationSeconds?: number
  estimatedMinutes?: number
  onComplete: (notes?: string) => Promise<void>
}

type FeedbackRating = 'awesome' | 'okay' | 'tricky' | null

export default function ReflectionModal({
  isOpen,
  onClose,
  promptId,
  promptTitle,
  childId,
  faithMode,
  durationSeconds = 300, // Default 5 minutes
  estimatedMinutes,
  onComplete,
}: ReflectionModalProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRating>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFeedback(null)
      setError(null)
    }
  }, [isOpen])

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSubmitting, onClose])

  const handleSubmit = async (feedback: FeedbackRating) => {
    setIsSubmitting(true)
    setError(null)
    setSelectedFeedback(feedback)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Map feedback to a note for tracking
      const feedbackNote = feedback ? `Feedback: ${feedback}` : null

      // Insert completion record with duration (always 5 min = 300 sec)
      const { error: insertError } = await supabase
        .from('prompt_completions')
        .insert({
          user_id: user.id,
          prompt_id: promptId,
          child_id: childId,
          completed_at: new Date().toISOString(),
          reflection_note: feedbackNote,
          duration_seconds: durationSeconds,
        })

      if (insertError) {
        throw insertError
      }

      // Call parent completion handler
      await onComplete(feedbackNote || undefined)

      // Show success toast based on feedback
      const messages = {
        awesome: "That's wonderful! Keep it up! 🎉",
        okay: "Every moment counts! 💪",
        tricky: "Growth happens in challenges! 🌱",
      }

      toast.success(feedback ? messages[feedback] : 'Activity completed! 🎉', {
        description: '+5 minutes added to your progress'
      })

      // Close modal
      setIsSubmitting(false)
      onClose()
    } catch (err: any) {
      console.error('Completion error:', err)
      toast.error('Failed to save', {
        description: err.message || 'Please try again'
      })
      setError(err.message || 'Failed to save. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 fade-in"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 pointer-events-auto slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Nice work!
            </h2>
            <p className="text-gray-600 text-sm">
              {promptTitle}
            </p>
          </div>

          {/* Simple Feedback Question */}
          <div className="mb-6">
            <p className="text-center text-lg font-medium text-gray-800 mb-4">
              How did that feel?
            </p>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSubmit('awesome')}
                disabled={isSubmitting}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  selectedFeedback === 'awesome'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-3xl mb-1">😊</span>
                <span className="font-semibold text-gray-700">Awesome</span>
              </button>

              <button
                onClick={() => handleSubmit('okay')}
                disabled={isSubmitting}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  selectedFeedback === 'okay'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-3xl mb-1">🙂</span>
                <span className="font-semibold text-gray-700">Okay</span>
              </button>

              <button
                onClick={() => handleSubmit('tricky')}
                disabled={isSubmitting}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  selectedFeedback === 'tricky'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-3xl mb-1">😅</span>
                <span className="font-semibold text-gray-700">Tricky</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Skip option */}
          <button
            onClick={() => handleSubmit(null)}
            disabled={isSubmitting}
            className="w-full text-gray-500 hover:text-gray-700 font-medium text-sm py-2"
          >
            {isSubmitting ? 'Saving...' : 'Skip feedback'}
          </button>
        </div>
      </div>
    </>
  )
}
