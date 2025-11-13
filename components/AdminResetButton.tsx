'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AdminResetButtonProps {
  userId: string
}

export default function AdminResetButton({ userId }: AdminResetButtonProps) {
  const [isResetting, setIsResetting] = useState(false)
  const [isLocalhost, setIsLocalhost] = useState(false)
  const router = useRouter()

  // Check if we're on localhost after component mounts (client-side only)
  useEffect(() => {
    setIsLocalhost(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    )
  }, [])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleReset = async () => {
    if (!confirm('Reset today\'s completions? This is for testing only.')) {
      return
    }

    setIsResetting(true)

    try {
      const today = new Date()
      const localDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

      const { error } = await supabase
        .from('prompt_completions')
        .delete()
        .eq('user_id', userId)
        .eq('completion_date', localDateString)

      if (error) throw error

      toast.success('Today\'s completions reset!', {
        description: 'You can now test activity completion again'
      })

      router.refresh()
    } catch (err: any) {
      console.error('Reset error:', err)
      toast.error('Failed to reset', {
        description: err.message || 'Please try again'
      })
    } finally {
      setIsResetting(false)
    }
  }

  // Only show on localhost
  if (!isLocalhost) {
    return null
  }

  return (
    <button
      onClick={handleReset}
      disabled={isResetting}
      className="fixed bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:bg-red-700 transition-colors z-50 opacity-50 hover:opacity-100"
      title="Development only: Reset today's completions"
    >
      {isResetting ? 'Resetting...' : '🔧 Reset Today'}
    </button>
  )
}
