import type { SupabaseClient } from '@supabase/supabase-js'
import type { ConnectionInsights } from './recommendations/types'
import { captureError } from './sentry'

/**
 * Calculate comprehensive connection insights for a specific child
 *
 * @param childId - The child's ID to calculate insights for
 * @param userId - The parent/user ID
 * @param supabase - Supabase client instance
 * @returns ConnectionInsights object with stats and patterns
 */
export async function calculateInsights(
  childId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<ConnectionInsights> {
  try {
    // Fetch data in parallel for performance
    const [weeklyStats, monthlyStats, completions, streakData] = await Promise.all([
      // Weekly time stats
      supabase.rpc('get_time_stats', {
        p_user_id: userId,
        p_period: 'week'
      }),

      // Monthly time stats
      supabase.rpc('get_time_stats', {
        p_user_id: userId,
        p_period: 'month'
      }),

      // All completions for this child
      supabase
        .from('prompt_completions')
        .select(`
          id,
          completion_date,
          category:daily_prompts(category),
          reflection_note,
          duration_seconds
        `)
        .eq('child_id', childId)
        .order('completion_date', { ascending: false }),

      // Current streak
      supabase.rpc('get_current_streak', {
        p_user_id: userId
      })
    ])

    // Extract completion data
    const completionData = completions.data || []
    const totalCompletions = completionData.length

    // Calculate category distribution
    const categoryCount = new Map<string, number>()

    completionData.forEach((completion: any) => {
      const category = completion.category?.category || 'unknown'
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1)
    })

    // Sort categories by count (descending) and take top 3
    const favoriteCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    // Calculate percentage distribution for all categories
    const categoryDistribution = Array.from(categoryCount.entries())
      .map(([category, count]) => ({
        category,
        percentage: totalCompletions > 0 ? (count / totalCompletions) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)

    // Get last completion date
    const lastCompletionDate = completionData[0]?.completion_date || undefined

    // Calculate child-specific minutes from completions
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setDate(monthAgo.getDate() - 30)

    const weekAgoStr = weekAgo.toISOString().split('T')[0]
    const monthAgoStr = monthAgo.toISOString().split('T')[0]

    // Calculate minutes from child's completions (default 5 min each if no duration)
    let childWeeklySeconds = 0
    let childMonthlySeconds = 0

    completionData.forEach((c: any) => {
      const duration = c.duration_seconds || 300 // Default 5 minutes
      if (c.completion_date >= weekAgoStr) {
        childWeeklySeconds += duration
      }
      if (c.completion_date >= monthAgoStr) {
        childMonthlySeconds += duration
      }
    })

    return {
      weeklyMinutes: Math.floor(childWeeklySeconds / 60),
      monthlyMinutes: Math.floor(childMonthlySeconds / 60),
      totalCompletions,
      currentStreak: streakData.data || 0,
      favoriteCategories,
      categoryDistribution,
      lastCompletionDate
    }
  } catch (error) {
    // Log error to Sentry
    captureError(error, {
      tags: {
        component: 'insights-calculator',
        operation: 'calculate-insights'
      },
      extra: {
        childId,
        userId
      }
    })

    // Return empty insights as fallback
    return {
      weeklyMinutes: 0,
      monthlyMinutes: 0,
      totalCompletions: 0,
      currentStreak: 0,
      favoriteCategories: [],
      categoryDistribution: [],
      lastCompletionDate: undefined
    }
  }
}

/**
 * Calculate days since last completion for a child
 *
 * @param lastCompletionDate - Last completion date string (YYYY-MM-DD)
 * @returns Number of days since last completion
 */
export function daysSinceLastCompletion(lastCompletionDate?: string): number {
  if (!lastCompletionDate) return Infinity

  const last = new Date(lastCompletionDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset to start of day for accurate comparison

  const diffTime = today.getTime() - last.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

/**
 * Check if a category is underrepresented in completion history
 *
 * @param category - Category name
 * @param distribution - Category distribution data
 * @param totalCompletions - Total number of completions
 * @returns true if category is < 10% of completions (and user has 10+ completions)
 */
export function isUnderrepresented(
  category: string,
  distribution: { category: string; percentage: number }[],
  totalCompletions: number
): boolean {
  if (totalCompletions < 10) return false

  const categoryData = distribution.find(d => d.category === category)
  return categoryData ? categoryData.percentage < 10 : true
}

/**
 * Check if a category is overrepresented in completion history
 *
 * @param category - Category name
 * @param distribution - Category distribution data
 * @returns true if category is > 40% of completions
 */
export function isOverrepresented(
  category: string,
  distribution: { category: string; percentage: number }[]
): boolean {
  const categoryData = distribution.find(d => d.category === category)
  return categoryData ? categoryData.percentage > 40 : false
}
