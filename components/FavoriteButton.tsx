'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'

interface FavoriteButtonProps {
  promptId: string
  initialIsFavorited?: boolean
}

export default function FavoriteButton({ promptId, initialIsFavorited = false }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const toggleFavorite = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from('prompt_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('prompt_id', promptId)

        if (error) throw error
        setIsFavorited(false)
        toast.success('Removed from favorites')
      } else {
        // Add favorite
        const { error } = await supabase
          .from('prompt_favorites')
          .insert({
            user_id: user.id,
            prompt_id: promptId
          })

        if (error) throw error
        setIsFavorited(true)
        toast.success('Added to favorites')
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite', {
        description: 'Please try again'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`p-2 rounded-full transition-all duration-200 ${
        isFavorited
          ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
          : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill={isFavorited ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
