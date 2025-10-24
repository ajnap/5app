// Category distribution analysis for Smart Recommendations
// Identifies underrepresented, overrepresented, and neglected categories

import type { CategoryDistribution, CategoryStats, Completion } from './types'

/**
 * Analyzes completion history to determine category distribution
 * Identifies categories that need boosting (underrepresented/neglected) or reducing (overrepresented)
 */
export async function analyzeCategoryDistribution(
  childId: string,
  completionHistory: Completion[]
): Promise<CategoryDistribution> {
  const totalCompletions = completionHistory.length

  // If no completions, return empty distribution
  if (totalCompletions === 0) {
    return {
      stats: [],
      totalCompletions: 0,
      underrepresented: [],
      overrepresented: [],
      neglected: []
    }
  }

  // Group completions by category
  const categoryMap = new Map<string, {
    count: number
    completions: Completion[]
  }>()

  for (const completion of completionHistory) {
    const category = completion.prompt?.category || 'uncategorized'

    if (!categoryMap.has(category)) {
      categoryMap.set(category, { count: 0, completions: [] })
    }

    const entry = categoryMap.get(category)!
    entry.count++
    entry.completions.push(completion)
  }

  // Calculate stats for each category
  const stats: CategoryStats[] = []
  const now = new Date()

  for (const [category, data] of Array.from(categoryMap.entries())) {
    const percentage = data.count / totalCompletions

    // Find most recent completion
    const sortedCompletions = data.completions.sort((a, b) =>
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    )
    const lastCompleted = sortedCompletions[0]
      ? new Date(sortedCompletions[0].completed_at)
      : null

    // Calculate average duration (only for completions with duration)
    const durationsWithValues = data.completions
      .map(c => c.duration_seconds)
      .filter((d): d is number => d !== null && d !== undefined)

    const avgDuration = durationsWithValues.length > 0
      ? durationsWithValues.reduce((sum, d) => sum + d, 0) / durationsWithValues.length
      : null

    // Check if any completions have reflection notes
    const hasReflectionNotes = data.completions.some(c =>
      c.reflection_note !== null && c.reflection_note !== undefined && c.reflection_note.trim().length > 0
    )

    stats.push({
      category,
      count: data.count,
      percentage,
      lastCompleted,
      avgDuration,
      hasReflectionNotes
    })
  }

  // Sort by count (descending)
  stats.sort((a, b) => b.count - a.count)

  // Identify special categories
  const underrepresented: string[] = []
  const overrepresented: string[] = []
  const neglected: string[] = []

  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  for (const stat of stats) {
    // Underrepresented: < 10% and user has 10+ completions
    if (stat.percentage < 0.10 && totalCompletions >= 10) {
      underrepresented.push(stat.category)
    }

    // Overrepresented: > 30%
    if (stat.percentage > 0.30) {
      overrepresented.push(stat.category)
    }

    // Neglected: not completed in last 14 days
    if (stat.lastCompleted && stat.lastCompleted < fourteenDaysAgo) {
      neglected.push(stat.category)
    }
  }

  return {
    stats,
    totalCompletions,
    underrepresented,
    overrepresented,
    neglected
  }
}

/**
 * Calculates a boost multiplier based on category representation
 * Returns 1.5x for underrepresented, 0.7x for overrepresented, 1.0x neutral
 */
export function getBalanceBoost(
  category: string,
  distribution: CategoryDistribution
): number {
  // Underrepresented categories get a 50% boost
  if (distribution.underrepresented.includes(category)) {
    return 1.5
  }

  // Neglected categories (not done in 14+ days) get a 30% boost
  if (distribution.neglected.includes(category)) {
    return 1.3
  }

  // Overrepresented categories get a 30% penalty
  if (distribution.overrepresented.includes(category)) {
    return 0.7
  }

  // Neutral categories
  return 1.0
}

/**
 * Gets human-readable explanation for category balance reason
 */
export function getCategoryBalanceReason(
  category: string,
  distribution: CategoryDistribution
): string | null {
  if (distribution.underrepresented.includes(category)) {
    return `Great for exploring ${category} - you haven't tried this much yet`
  }

  if (distribution.neglected.includes(category)) {
    const stat = distribution.stats.find(s => s.category === category)
    if (stat?.lastCompleted) {
      const daysAgo = Math.floor(
        (Date.now() - stat.lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
      )
      return `Time to revisit ${category} - it's been ${daysAgo} days`
    }
  }

  if (distribution.overrepresented.includes(category)) {
    return null // Don't show reason for penalized categories
  }

  return null
}
