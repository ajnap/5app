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

export default function ReflectionModal({
  isOpen,
  onClose,
  promptId,
  promptTitle,
  childId,
  faithMode,
  durationSeconds,
  estimatedMinutes,
  onComplete,
}: ReflectionModalProps) {
  const [reflectionNote, setReflectionNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const maxLength = 500
  const charsRemaining = maxLength - reflectionNote.length

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setReflectionNote('')
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

  const handleSubmit = async (includeNote: boolean) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Insert completion record with optional reflection note and duration
      const { error: insertError } = await supabase
        .from('prompt_completions')
        .insert({
          user_id: user.id,
          prompt_id: promptId,
          child_id: childId,
          completed_at: new Date().toISOString(),
          reflection_note: includeNote && reflectionNote.trim() ? reflectionNote.trim() : null,
          duration_seconds: durationSeconds || null,
        })

      if (insertError) {
        throw insertError
      }

      // Call parent completion handler
      await onComplete(includeNote && reflectionNote.trim() ? reflectionNote.trim() : undefined)

      // Show success toast
      toast.success('Activity completed! 🎉', {
        description: 'Great job connecting with your child today'
      })

      // Close modal
      onClose()
    } catch (err: any) {
      console.error('Reflection submission error:', err)
      toast.error('Failed to save', {
        description: err.message || 'Please try again'
      })
      setError(err.message || 'Failed to save reflection. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const faithQuestion = "What did this moment teach you about God's love?"
  const secularQuestion = 'What made this moment special?'
  const question = faithMode ? faithQuestion : secularQuestion

  // Format duration for display
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins} minute${mins !== 1 ? 's' : ''}` : `${secs} seconds`
  }

  const durationText = formatDuration(durationSeconds)
  const isOverEstimate = estimatedMinutes && durationSeconds && durationSeconds > estimatedMinutes * 60

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
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 pointer-events-auto slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Beautiful! 🎉
            </h2>
            <p className="text-gray-600">
              You just completed: <span className="font-semibold">{promptTitle}</span>
            </p>

            {/* Duration Display */}
            {durationText && (
              <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                <p className="text-green-900 font-semibold text-center">
                  ⏱️ You spent {durationText} connecting today!
                </p>
                {isOverEstimate && (
                  <p className="text-green-700 text-sm text-center mt-1">
                    Taking your time shows how much you care 💛
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Reflection Question */}
          <div className="mb-6">
            <label htmlFor="reflection" className="block text-lg font-medium text-gray-800 mb-3">
              {question}
            </label>
            <textarea
              id="reflection"
              value={reflectionNote}
              onChange={(e) => setReflectionNote(e.target.value.slice(0, maxLength))}
              placeholder="Type your thoughts here (optional)..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {faithMode && 'This reflection is just for you'}
                {!faithMode && 'Optional - capture what made this moment special'}
              </p>
              <p className={`text-xs font-medium ${charsRemaining < 50 ? 'text-orange-600' : 'text-gray-500'}`}>
                {charsRemaining} characters left
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Saving...' : reflectionNote.trim() ? 'Save & Complete' : 'Complete'}
            </button>

            {reflectionNote.trim() === '' && (
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                Skip reflection
              </button>
            )}
          </div>

          {/* Close button */}
          {!isSubmitting && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
