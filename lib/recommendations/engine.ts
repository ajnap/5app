// Smart Recommendations Engine
// Main entry point for generating personalized prompt recommendations

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  RecommendationRequest,
  RecommendationResult,
  ScoredPrompt,
  Prompt,
  Completion,
  Favorite,
  Child,
  RecommendationReason
} from './types'
import { analyzeCategoryDistribution } from './category-analyzer'
import { calculatePromptScore, applyAgeFilter, applyRecencyFilter, calculateRecencyMultiplier } from './score-calculator'

/**
 * Generates personalized recommendations for a child
 * Returns 3-5 prompts scored and ranked by relevance
 */
export async function generateRecommendations(
  request: RecommendationRequest,
  supabase: SupabaseClient
): Promise<RecommendationResult> {
  const startTime = Date.now()
  const { userId, childId, faithMode, limit = 5 } = request

  try {
    // 1. Fetch all required data in parallel
    const [child, completionHistory, allPrompts, favorites] = await Promise.all([
      fetchChild(childId, supabase),
      fetchCompletionHistory(childId, supabase),
      fetchAllPrompts(supabase),
      fetchFavorites(userId, supabase)
    ])

    if (!child) {
      throw new Error('Child not found')
    }

    // 2. Analyze category distribution
    const categoryDistribution = await analyzeCategoryDistribution(
      childId,
      completionHistory
    )

    // 3. Handle special cases
    console.log(`[Recommendations] Child ${child.name} has ${completionHistory.length} completions`)

    if (completionHistory.length < 3) {
      // New user: return starter recommendations
      console.log(`[Recommendations] Using starter recommendations for ${child.name}`)
      const starters = getStarterRecommendations(
        child,
        allPrompts,
        faithMode,
        limit,
        categoryDistribution
      )
      console.log(`[Recommendations] Generated ${starters.recommendations.length} starter recommendations`)
      return starters
    }

    // 4. Filter eligible prompts
    const eligiblePrompts = allPrompts.filter(prompt => {
      // Age filter
      if (!applyAgeFilter(prompt, child.age)) {
        return false
      }

      // Recency filter (exclude if completed within 14 days)
      if (!applyRecencyFilter(prompt, completionHistory, 14)) {
        return false
      }

      // Faith mode filter
      if (faithMode) {
        return prompt.tags?.includes('faith-based') || prompt.tags?.includes('christian')
      } else {
        return !prompt.tags?.includes('faith-based') && !prompt.tags?.includes('christian')
      }

      return true
    })

    // Check if we exhausted all prompts
    if (eligiblePrompts.length === 0) {
      return getGreatestHitsRecommendations(
        child,
        completionHistory,
        favorites,
        allPrompts,
        limit,
        categoryDistribution
      )
    }

    // 5. Score all eligible prompts
    const scoredPrompts = await Promise.all(
      eligiblePrompts.map(async (prompt) => {
        const scoreComponents = await calculatePromptScore(
          prompt,
          child,
          completionHistory,
          favorites,
          categoryDistribution
        )

        // Apply recency multiplier
        const recencyMultiplier = calculateRecencyMultiplier(prompt, completionHistory)
        const finalScore = scoreComponents.totalScore * recencyMultiplier

        return {
          prompt,
          score: finalScore,
          reasons: scoreComponents.reasons
        }
      })
    )

    // 6. Sort by score (descending)
    scoredPrompts.sort((a, b) => b.score - a.score)

    // 7. Check for single category domination (> 50% completions)
    const dominantCategory = categoryDistribution.stats[0]
    if (dominantCategory && dominantCategory.percentage > 0.5) {
      // Force diversity: filter out dominant category
      const diversePrompts = scoredPrompts.filter(
        sp => sp.prompt.category !== dominantCategory.category
      )

      if (diversePrompts.length >= 3) {
        const selected = selectDiverseRecommendations(diversePrompts, limit)
        const duration = Date.now() - startTime

        return {
          childId,
          recommendations: selected,
          metadata: {
            totalCompletions: completionHistory.length,
            categoryDistribution: Object.fromEntries(
              categoryDistribution.stats.map(s => [s.category, s.count])
            ),
            timestamp: new Date().toISOString(),
            cacheKey: `recommendations:${userId}:${childId}:${faithMode}:v1`
          }
        }
      }
    }

    // 8. Select diverse recommendations
    const recommendations = selectDiverseRecommendations(scoredPrompts, limit)

    const duration = Date.now() - startTime
    console.log(`[Recommendations] Generated in ${duration}ms for child ${childId}`)

    return {
      childId,
      recommendations,
      metadata: {
        totalCompletions: completionHistory.length,
        categoryDistribution: Object.fromEntries(
          categoryDistribution.stats.map(s => [s.category, s.count])
        ),
        timestamp: new Date().toISOString(),
        cacheKey: `recommendations:${userId}:${childId}:${faithMode}:v1`
      }
    }
  } catch (error) {
    console.error('[Recommendations] Error generating recommendations:', error)

    // Fallback: return age-appropriate prompts
    return getFallbackRecommendations(childId, request, supabase)
  }
}

/**
 * Selects diverse recommendations ensuring category and tag variety
 * Max 2 from same category, max 2 with same primary tag
 */
function selectDiverseRecommendations(
  scoredPrompts: ScoredPrompt[],
  limit: number
): ScoredPrompt[] {
  const selected: ScoredPrompt[] = []
  const usedCategories = new Map<string, number>()
  const usedPrimaryTags = new Map<string, number>()

  for (const scored of scoredPrompts) {
    if (selected.length >= limit) break

    const category = scored.prompt.category
    const primaryTag = scored.prompt.tags?.[0] || 'none'

    // Check category diversity (max 2 from same category)
    const categoryCount = usedCategories.get(category) || 0
    if (categoryCount >= 2) continue

    // Check tag diversity (max 2 with same primary tag)
    const tagCount = usedPrimaryTags.get(primaryTag) || 0
    if (tagCount >= 2) continue

    // Add to selected
    selected.push(scored)
    usedCategories.set(category, categoryCount + 1)
    usedPrimaryTags.set(primaryTag, tagCount + 1)
  }

  // Fallback: if we don't have at least 3, add more regardless of diversity
  if (selected.length < 3 && scoredPrompts.length >= 3) {
    for (const scored of scoredPrompts) {
      if (selected.length >= limit) break
      if (!selected.includes(scored)) {
        selected.push(scored)
      }
    }
  }

  return selected
}

/**
 * Returns starter recommendations for new users (< 3 completions)
 * Diverse prompts across categories, easy to complete (5 min), age-appropriate
 */
function getStarterRecommendations(
  child: Child,
  allPrompts: Prompt[],
  faithMode: boolean,
  limit: number,
  categoryDistribution: any
): RecommendationResult {
  // Filter age-appropriate prompts
  const ageAppropriate = allPrompts.filter(p => applyAgeFilter(p, child.age))

  // Filter by faith mode
  const faithFiltered = ageAppropriate.filter(p => {
    if (faithMode) {
      return p.tags?.includes('faith-based') || p.tags?.includes('christian')
    } else {
      return !p.tags?.includes('faith-based') && !p.tags?.includes('christian')
    }
  })

  // Prefer 5-minute activities for easy first win
  const quickWins = faithFiltered.filter(p => p.estimated_minutes === 5)

  // Sort by category to ensure diversity
  const byCategory = new Map<string, Prompt[]>()
  for (const prompt of quickWins.length > 0 ? quickWins : faithFiltered) {
    const category = prompt.category
    if (!byCategory.has(category)) {
      byCategory.set(category, [])
    }
    byCategory.get(category)!.push(prompt)
  }

  // Pick one from each category (round-robin)
  const diverse: Prompt[] = []
  const categories = Array.from(byCategory.keys())

  let categoryIndex = 0
  while (diverse.length < limit && byCategory.size > 0) {
    const category = categories[categoryIndex % categories.length]
    const prompts = byCategory.get(category)

    if (prompts && prompts.length > 0) {
      diverse.push(prompts.shift()!)

      if (prompts.length === 0) {
        byCategory.delete(category)
        categories.splice(categoryIndex % categories.length, 1)
      }
    }

    categoryIndex++
  }

  // Convert to scored prompts
  const recommendations: ScoredPrompt[] = diverse.map(prompt => ({
    prompt,
    score: 75, // Neutral-high score for starters
    reasons: [{
      type: 'starter',
      message: 'Perfect for getting started!',
      weight: 1.0
    }]
  }))

  return {
    childId: child.id,
    recommendations,
    metadata: {
      totalCompletions: 0,
      categoryDistribution: {},
      timestamp: new Date().toISOString(),
      cacheKey: `recommendations:${child.user_id}:${child.id}:${faithMode}:v1`
    }
  }
}

/**
 * Returns "Greatest Hits" when all prompts completed recently
 * Favorites and high-engagement prompts
 */
function getGreatestHitsRecommendations(
  child: Child,
  completionHistory: Completion[],
  favorites: Favorite[],
  allPrompts: Prompt[],
  limit: number,
  categoryDistribution: any
): RecommendationResult {
  // Get favorited prompts
  const favoritedPrompts = allPrompts.filter(p =>
    favorites.some(f => f.prompt_id === p.id)
  )

  // Get high-engagement prompts (long duration or reflection notes)
  const highEngagement = completionHistory
    .filter(c =>
      (c.duration_seconds && c.duration_seconds > 300) || // > 5 min
      (c.reflection_note && c.reflection_note.trim().length > 0)
    )
    .map(c => c.prompt_id)

  const highEngagementPrompts = allPrompts.filter(p =>
    highEngagement.includes(p.id)
  )

  // Combine and dedupe
  const combined = [...favoritedPrompts, ...highEngagementPrompts]
  const unique = Array.from(new Map(combined.map(p => [p.id, p])).values())

  // Take top N
  const selected = unique.slice(0, limit)

  const recommendations: ScoredPrompt[] = selected.map(prompt => ({
    prompt,
    score: 80,
    reasons: [{
      type: 'popular',
      message: "You're doing amazing! Here's a favorite to revisit",
      weight: 1.0
    }]
  }))

  return {
    childId: child.id,
    recommendations,
    metadata: {
      totalCompletions: completionHistory.length,
      categoryDistribution: Object.fromEntries(
        categoryDistribution.stats.map((s: any) => [s.category, s.count])
      ),
      timestamp: new Date().toISOString(),
      cacheKey: `recommendations:${child.user_id}:${child.id}:false:v1`
    }
  }
}

/**
 * Fallback recommendations if engine fails
 * Returns age-appropriate prompts without personalization
 */
async function getFallbackRecommendations(
  childId: string,
  request: RecommendationRequest,
  supabase: SupabaseClient
): Promise<RecommendationResult> {
  const { data: child } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('id', childId)
    .single()

  if (!child) {
    throw new Error('Child not found for fallback')
  }

  const ageCategory = getAgeCategory(child.age)

  const { data: prompts } = await supabase
    .from('daily_prompts')
    .select('*')
    .contains('age_categories', [ageCategory])
    .limit(request.limit || 5)

  const recommendations: ScoredPrompt[] = (prompts || []).map(prompt => ({
    prompt: prompt as Prompt,
    score: 50,
    reasons: [{
      type: 'popular',
      message: 'Age-appropriate activity',
      weight: 1.0
    }]
  }))

  return {
    childId,
    recommendations,
    metadata: {
      totalCompletions: 0,
      categoryDistribution: {},
      timestamp: new Date().toISOString(),
      cacheKey: ''
    }
  }
}

/**
 * Helper functions for data fetching
 */

async function fetchChild(childId: string, supabase: SupabaseClient): Promise<Child | null> {
  const { data } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('id', childId)
    .single()

  if (!data) return null

  // Calculate age
  const birthDate = new Date(data.birth_date)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return { ...data, age } as Child
}

async function fetchCompletionHistory(
  childId: string,
  supabase: SupabaseClient
): Promise<Completion[]> {
  const { data } = await supabase
    .from('prompt_completions')
    .select('*, daily_prompts(*)')
    .eq('child_id', childId)
    .order('completed_at', { ascending: false })
    .limit(100) // Last 100 completions should be enough for analysis

  if (!data) return []

  return data.map(item => ({
    ...item,
    prompt: item.daily_prompts as unknown as Prompt
  })) as Completion[]
}

async function fetchAllPrompts(supabase: SupabaseClient): Promise<Prompt[]> {
  const { data } = await supabase
    .from('daily_prompts')
    .select('*')
    .order('created_at', { ascending: false })

  return (data || []) as Prompt[]
}

async function fetchFavorites(userId: string, supabase: SupabaseClient): Promise<Favorite[]> {
  const { data } = await supabase
    .from('prompt_favorites')
    .select('*')
    .eq('user_id', userId)

  return (data || []) as Favorite[]
}

function getAgeCategory(age: number): string {
  if (age < 2) return 'infant'
  if (age < 5) return 'toddler'
  if (age < 12) return 'elementary'
  if (age < 18) return 'teen'
  return 'young_adult'
}
