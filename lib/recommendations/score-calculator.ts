// Scoring functions for Smart Recommendations
// Combines category balance, engagement signals, and filters into final score

import type {
  Prompt,
  Child,
  Completion,
  Favorite,
  CategoryDistribution,
  ScoreWeights,
  ScoreComponents,
  RecommendationReason
} from './types'
import { getBalanceBoost, getCategoryBalanceReason } from './category-analyzer'

const DEFAULT_WEIGHTS: ScoreWeights = {
  categoryBalance: 0.70,
  engagement: 0.20,
  filters: 0.10
}

/**
 * Calculates comprehensive score for a prompt
 * Combines category balance, engagement signals, and filter matches
 */
export async function calculatePromptScore(
  prompt: Prompt,
  child: Child,
  completionHistory: Completion[],
  favorites: Favorite[],
  categoryDistribution: CategoryDistribution,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): Promise<ScoreComponents> {
  const reasons: RecommendationReason[] = []

  // 1. Category Balance Score (70%)
  const categoryScore = calculateCategoryScore(
    prompt,
    categoryDistribution,
    reasons
  )

  // 2. Engagement Score (20%)
  const engagementScore = calculateEngagementScore(
    prompt,
    completionHistory,
    favorites,
    reasons
  )

  // 3. Filter Score (10%)
  const filterScore = calculateFilterScore(
    prompt,
    child,
    reasons
  )

  // Calculate weighted total
  const totalScore =
    categoryScore * weights.categoryBalance +
    engagementScore * weights.engagement +
    filterScore * weights.filters

  return {
    categoryScore,
    engagementScore,
    filterScore,
    totalScore,
    reasons
  }
}

/**
 * Calculates category balance score (0-100)
 * Boosts underrepresented categories, penalizes overrepresented
 */
function calculateCategoryScore(
  prompt: Prompt,
  distribution: CategoryDistribution,
  reasons: RecommendationReason[]
): number {
  const baseScore = 50 // Neutral starting point
  const boost = getBalanceBoost(prompt.category, distribution)
  const score = baseScore * boost

  // Add reason if boosted or penalized
  const reason = getCategoryBalanceReason(prompt.category, distribution)
  if (reason) {
    reasons.push({
      type: 'category_balance',
      message: reason,
      weight: boost
    })
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Calculates engagement score based on duration, reflection notes, and favorites
 */
function calculateEngagementScore(
  prompt: Prompt,
  completionHistory: Completion[],
  favorites: Favorite[],
  reasons: RecommendationReason[]
): number {
  // Find completions for this specific prompt
  const promptCompletions = completionHistory.filter(
    c => c.prompt_id === prompt.id
  )

  // If prompt never completed, return neutral score
  if (promptCompletions.length === 0) {
    return 50
  }

  let score = 0
  let componentCount = 0

  // Duration engagement (40% of engagement score)
  const durationScore = calculateDurationEngagement(prompt, promptCompletions)
  if (durationScore > 50) {
    reasons.push({
      type: 'engagement',
      message: 'You spent quality time on this activity before',
      weight: 0.4
    })
  }
  score += durationScore * 0.4
  componentCount++

  // Reflection engagement (40% of engagement score)
  const reflectionScore = calculateReflectionEngagement(promptCompletions)
  if (reflectionScore > 50) {
    reasons.push({
      type: 'engagement',
      message: 'This activity inspired meaningful reflections',
      weight: 0.4
    })
  }
  score += reflectionScore * 0.4
  componentCount++

  // Favorite engagement (20% of engagement score)
  const favoriteScore = calculateFavoriteEngagement(prompt, favorites)
  if (favoriteScore > 50) {
    reasons.push({
      type: 'engagement',
      message: 'You favorited this activity',
      weight: 0.2
    })
  }
  score += favoriteScore * 0.2
  componentCount++

  return score
}

/**
 * Scores based on completion duration vs estimated time
 * Higher score if user took more time (indicates engagement)
 */
function calculateDurationEngagement(
  prompt: Prompt,
  completions: Completion[]
): number {
  const durations = completions
    .map(c => c.duration_seconds)
    .filter((d): d is number => d !== null && d !== undefined)

  if (durations.length === 0) {
    return 50 // Neutral if no duration data
  }

  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length
  const estimatedSeconds = prompt.estimated_minutes * 60

  // Score 100 if duration >= 1.5x estimate (they really engaged!)
  // Score 50 if duration matches estimate (neutral)
  // Score 25 if duration < estimate (rushed through)
  const ratio = avgDuration / estimatedSeconds

  if (ratio >= 1.5) return 100
  if (ratio >= 1.0) return 75
  if (ratio >= 0.75) return 50
  return 25
}

/**
 * Scores based on presence of reflection notes
 * Reflection notes indicate thoughtful engagement
 */
function calculateReflectionEngagement(completions: Completion[]): number {
  const withNotes = completions.filter(
    c => c.reflection_note && c.reflection_note.trim().length > 0
  )

  if (withNotes.length === 0) {
    return 50 // Neutral
  }

  // Higher percentage of completions with notes = higher score
  const notePercentage = withNotes.length / completions.length

  if (notePercentage >= 0.75) return 100 // 75%+ had notes
  if (notePercentage >= 0.5) return 85 // 50%+ had notes
  if (notePercentage >= 0.25) return 70 // 25%+ had notes
  return 60 // Some notes
}

/**
 * Scores based on whether prompt is favorited
 * Favorites indicate strong preference
 */
function calculateFavoriteEngagement(
  prompt: Prompt,
  favorites: Favorite[]
): number {
  const isFavorited = favorites.some(f => f.prompt_id === prompt.id)
  return isFavorited ? 100 : 50
}

/**
 * Calculates filter score based on age, challenges, and interests
 */
function calculateFilterScore(
  prompt: Prompt,
  child: Child,
  reasons: RecommendationReason[]
): number {
  let score = 0

  // Age match (50% of filter score)
  const ageScore = applyAgeFilter(prompt, child.age) ? 100 : 0
  score += ageScore * 0.5

  // Challenge match (30% of filter score)
  const challengeScore = applyChallengeFilter(prompt, child.current_challenges)
  if (challengeScore > 50) {
    const matchedChallenge = child.current_challenges.find(challenge =>
      prompt.tags.some(tag => tag.toLowerCase().includes(challenge.toLowerCase()))
    )
    if (matchedChallenge) {
      reasons.push({
        type: 'challenge_match',
        message: `Helpful for: ${matchedChallenge}`,
        weight: 0.3
      })
    }
  }
  score += challengeScore * 0.3

  // Interest match (20% of filter score)
  const interestScore = applyInterestFilter(prompt, child.interests)
  if (interestScore > 50) {
    const matchedInterest = child.interests.find(interest =>
      prompt.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
    )
    if (matchedInterest) {
      reasons.push({
        type: 'interest_match',
        message: `Perfect for ${child.name}'s interest in ${matchedInterest}`,
        weight: 0.2
      })
    }
  }
  score += interestScore * 0.2

  return score
}

/**
 * Checks if prompt age categories match child's age
 */
export function applyAgeFilter(prompt: Prompt, childAge: number): boolean {
  const ageCategory = getAgeCategory(childAge)

  return (
    prompt.age_categories.includes(ageCategory) ||
    prompt.age_categories.includes('all')
  )
}

/**
 * Checks if prompt was completed recently (within N days)
 * Returns false if completed recently (should filter out)
 */
export function applyRecencyFilter(
  prompt: Prompt,
  completionHistory: Completion[],
  daysSinceCompletion: number = 14
): boolean {
  const promptCompletions = completionHistory.filter(
    c => c.prompt_id === prompt.id
  )

  if (promptCompletions.length === 0) {
    return true // Not completed recently, include it
  }

  // Check most recent completion
  const mostRecent = promptCompletions.sort((a, b) =>
    new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  )[0]

  const daysSince = (Date.now() - new Date(mostRecent.completed_at).getTime()) / (1000 * 60 * 60 * 24)

  return daysSince >= daysSinceCompletion
}

/**
 * Checks if prompt tags match child's challenges
 */
function applyChallengeFilter(
  prompt: Prompt,
  challenges: string[]
): number {
  if (challenges.length === 0) {
    return 50 // Neutral if no challenges specified
  }

  const matchCount = challenges.filter(challenge =>
    prompt.tags.some(tag =>
      tag.toLowerCase().includes(challenge.toLowerCase()) ||
      challenge.toLowerCase().includes(tag.toLowerCase())
    )
  ).length

  if (matchCount === 0) return 50 // No match, neutral
  if (matchCount === 1) return 75 // One match
  return 100 // Multiple matches
}

/**
 * Checks if prompt tags match child's interests
 */
function applyInterestFilter(
  prompt: Prompt,
  interests: string[]
): number {
  if (interests.length === 0) {
    return 50 // Neutral if no interests specified
  }

  const matchCount = interests.filter(interest =>
    prompt.tags.some(tag =>
      tag.toLowerCase().includes(interest.toLowerCase()) ||
      interest.toLowerCase().includes(tag.toLowerCase())
    )
  ).length

  if (matchCount === 0) return 50 // No match, neutral
  if (matchCount === 1) return 75 // One match
  return 100 // Multiple matches
}

/**
 * Converts age to age category
 */
function getAgeCategory(age: number): string {
  if (age < 2) return 'infant'
  if (age < 5) return 'toddler'
  if (age < 12) return 'elementary'
  if (age < 18) return 'teen'
  return 'young_adult'
}

/**
 * Calculates recency multiplier (0.5-1.0)
 * Reduces score for recently completed prompts
 */
export function calculateRecencyMultiplier(
  prompt: Prompt,
  completionHistory: Completion[]
): number {
  const promptCompletions = completionHistory.filter(
    c => c.prompt_id === prompt.id
  )

  if (promptCompletions.length === 0) {
    return 1.0 // No penalty for never-completed prompts
  }

  // Get most recent completion
  const mostRecent = promptCompletions.sort((a, b) =>
    new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  )[0]

  const daysSince = (Date.now() - new Date(mostRecent.completed_at).getTime()) / (1000 * 60 * 60 * 24)

  // max(0.5, 1.0 - (daysSince / 30))
  // 0 days ago: 1.0 - 0 = 1.0 (but filtered by recencyFilter, so this shouldn't happen)
  // 15 days ago: 1.0 - 0.5 = 0.5
  // 30+ days ago: 1.0 - 1.0 = 0 → max(0.5, 0) = 0.5

  return Math.max(0.5, 1.0 - (daysSince / 30))
}
