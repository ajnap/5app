'use client'

import { useState, useCallback } from 'react'
import type { ScoredPrompt } from '@/lib/recommendations/types'

interface UsePromptRefresherReturn {
  currentPrompt: ScoredPrompt | undefined
  currentIndex: number
  refresh: () => void
  isRefreshing: boolean
  hasMore: boolean
}

/**
 * Custom hook for cycling through prompt recommendations
 *
 * Manages state for refreshing/cycling through a list of recommendations
 * with smooth animation delays between transitions.
 *
 * @param recommendations - Array of scored prompt recommendations
 * @returns Object containing current prompt, refresh function, and state
 *
 * @example
 * const { currentPrompt, refresh, isRefreshing, hasMore } = usePromptRefresher(recommendations)
 *
 * return (
 *   <div>
 *     <h3>{currentPrompt?.prompt.title}</h3>
 *     {hasMore && (
 *       <button onClick={refresh} disabled={isRefreshing}>
 *         Refresh
 *       </button>
 *     )}
 *   </div>
 * )
 */
export function usePromptRefresher(
  recommendations: ScoredPrompt[]
): UsePromptRefresherReturn {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get current prompt to display
  const currentPrompt = recommendations[currentIndex]

  // Check if there are more recommendations to cycle through
  const hasMore = recommendations.length > 1

  /**
   * Refresh to next recommendation with animation delay
   * Loops back to start after reaching the end
   */
  const refresh = useCallback(() => {
    if (isRefreshing || recommendations.length <= 1) return

    setIsRefreshing(true)

    // Calculate next index (loop back to 0 after last recommendation)
    const nextIndex = (currentIndex + 1) % recommendations.length

    // Add animation delay before showing next prompt
    setTimeout(() => {
      setCurrentIndex(nextIndex)
      setIsRefreshing(false)
    }, 300)
  }, [currentIndex, recommendations.length, isRefreshing])

  return {
    currentPrompt,
    currentIndex,
    refresh,
    isRefreshing,
    hasMore
  }
}
