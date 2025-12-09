'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DeleteChildDialogProps {
  isOpen: boolean
  onClose: () => void
  childId: string
  childName: string
}

export default function DeleteChildDialog({
  isOpen,
  onClose,
  childId,
  childName
}: DeleteChildDialogProps) {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    // Reset confirm text when dialog opens/closes
    setConfirmText('')
  }, [isOpen])

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== childName.toLowerCase()) {
      toast.error('Please type the child\'s name exactly to confirm')
      return
    }

    setIsDeleting(true)

    try {
      // Hard delete - remove the child profile entirely
      // Note: This will cascade delete related records due to ON DELETE CASCADE
      const { error } = await supabase
        .from('child_profiles')
        .delete()
        .eq('id', childId)

      if (error) throw error

      toast.success(`${childName}'s profile has been removed`)

      // Close dialog first
      onClose()

      // Navigate to dashboard and force a full refresh
      router.push('/dashboard')

      // Small delay then refresh to ensure navigation completes
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Failed to remove profile', {
        description: error.message || 'Please try again'
      })
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
        {/* Warning header */}
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Remove Child Profile
              </h2>
              <p className="text-white/80 text-sm">
                This action cannot be easily undone
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <p className="text-slate-700">
              You're about to remove <span className="font-bold text-slate-900">{childName}'s</span> profile from your account. This will:
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Hide all activity history and memories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Remove them from your dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Stop personalized recommendations</span>
              </li>
            </ul>
          </div>

          {/* Confirmation input */}
          <div className="bg-cream-50 rounded-2xl p-4 border-2 border-cream-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Type "{childName}" to confirm
            </label>
            <input
              ref={inputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={childName}
              className="w-full px-4 py-3 bg-white border-2 border-cream-300 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-colors text-slate-900 font-medium"
              disabled={isDeleting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-cream-100 text-slate-700 rounded-xl font-semibold hover:bg-cream-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || confirmText.toLowerCase() !== childName.toLowerCase()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200/50"
            >
              {isDeleting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Removing...
                </span>
              ) : (
                'Remove Profile'
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
