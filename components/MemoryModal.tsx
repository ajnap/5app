'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Child {
  id: string
  name: string
  birth_date: string
}

interface MemoryModalProps {
  isOpen: boolean
  onClose: () => void
  children: Child[]
  userId: string
}

const EMOJI_OPTIONS = ['❤️', '😊', '🎉', '🤗', '✨']

export default function MemoryModal({ isOpen, onClose, children, userId }: MemoryModalProps) {
  const [selectedChildId, setSelectedChildId] = useState('')
  const [content, setContent] = useState('')
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const maxLength = 500
  const charsRemaining = maxLength - content.length

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedChildId(children.length === 1 ? children[0].id : '')
      setContent('')
      setSelectedEmojis([])
      setError(null)
    }
  }, [isOpen, children])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSubmitting, onClose])

  const toggleEmoji = (emoji: string) => {
    setSelectedEmojis((prev) =>
      prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    )
  }

  const handleSubmit = async () => {
    // Validation
    if (!selectedChildId) {
      setError('Please select a child')
      return
    }

    if (!content.trim()) {
      setError('Please enter a memory')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          child_id: selectedChildId,
          content: content.trim(),
          emoji_reactions: selectedEmojis,
          entry_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        })

      if (insertError) throw insertError

      // Success - show message first, then close
      alert('Memory captured ❤️')

      // Close modal and reset
      onClose()
    } catch (err: any) {
      console.error('Memory save error:', err)
      setError(err.message || 'Failed to save memory. Please try again.')
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
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 pointer-events-auto slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Capture a Memory 📝
            </h2>
            <p className="text-gray-600">
              What made you smile today?
            </p>
          </div>

          {/* Child Selector */}
          <div className="mb-4">
            <label htmlFor="child-select" className="block text-sm font-medium text-gray-700 mb-2">
              Child
            </label>
            <select
              id="child-select"
              value={selectedChildId}
              onChange={(e) => {
                setSelectedChildId(e.target.value)
                if (error) setError(null)
              }}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
              disabled={isSubmitting}
            >
              <option value="">Select a child...</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          {/* Memory Text Area */}
          <div className="mb-4">
            <label htmlFor="memory-content" className="block text-sm font-medium text-gray-700 mb-2">
              Memory
            </label>
            <textarea
              id="memory-content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value.slice(0, maxLength))
                if (error) setError(null)
              }}
              placeholder="She said the funniest thing at dinner..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors resize-none"
              disabled={isSubmitting}
            />
            <p className={`text-xs font-medium text-right mt-1 ${charsRemaining < 50 ? 'text-orange-600' : 'text-gray-500'}`}>
              {charsRemaining} characters left
            </p>
          </div>

          {/* Emoji Reactions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a feeling (optional)
            </label>
            <div className="flex gap-3">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => toggleEmoji(emoji)}
                  className={`text-3xl p-3 rounded-lg border-2 transition-all ${
                    selectedEmojis.includes(emoji)
                      ? 'border-primary-500 bg-primary-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isSubmitting}
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedChildId || !content.trim()}
              className={`flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                (isSubmitting || !selectedChildId || !content.trim()) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Memory'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
