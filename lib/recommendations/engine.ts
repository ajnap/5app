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
import { captureError, captureMessage, addBreadcrumb } from '@/lib/sentry'
import * as Sentry from '@sentry/nextjs'

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

  // Add breadcrumb for tracking
  addBreadcrumb('Generating recommendations', 'recommendation', {
    userId,
    childId,
    faithMode,
    limit
  })

  // Log start in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('[Recommendations] Starting generation', { userId, childId, faithMode, limit })
  }

  // Start performance span
  return await Sentry.startSpan({
    name: 'generateRecommendations',
    op: 'function.recommendation',
    attributes: {
      userId,
      childId,
      faithMode: String(faithMode),
      limit
    }
  }, async () => {
    try {
      // 1. Fetch all required data in parallel
      const dataFetchStart = Date.now()
      const [child, completionHistory, allPrompts, favorites] = await Promise.all([
        fetchChild(childId, supabase),
        fetchCompletionHistory(childId, supabase),
        fetchAllPrompts(supabase),
        fetchFavorites(userId, supabase)
      ])
      const dataFetchDuration = Date.now() - dataFetchStart

      if (process.env.NODE_ENV === 'development') {
        console.log('[Recommendations] Data fetched', {
          dataFetchDuration: `${dataFetchDuration}ms`,
          completionsCount: completionHistory.length,
          promptsCount: allPrompts.length,
          favoritesCount: favorites.length
        })
      }


      if (!child) {
        const error = new Error('Child not found')
        captureError(error, {
          tags: { component: 'recommendations', operation: 'generate' },
          extra: { childId, userId }
        })
        throw error
      }

      // 2. Analyze category distribution
      const categoryDistribution = await analyzeCategoryDistribution(
        childId,
        completionHistory
      )

      if (process.env.NODE_ENV === 'development') {
        console.log('[Recommendations] Category distribution analyzed', {
          stats: categoryDistribution.stats.map(s => ({
            category: s.category,
            percentage: `${(s.percentage * 100).toFixed(1)}%`
          })),
          underrepresented: categoryDistribution.underrepresented,
          overrepresented: categoryDistribution.overrepresented
        })
      }

      // 3. Handle special cases

      if (completionHistory.length < 3) {
        // New user: return starter recommendations
        addBreadcrumb('Returning starter recommendations', 'recommendation', {
          completionCount: completionHistory.length
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('[Recommendations] New user - returning starters', {
            completionCount: completionHistory.length
          })
        }

        const starters = getStarterRecommendations(
          child,
          allPrompts,
          faithMode,
          limit,
          categoryDistribution
        )

        const duration = Date.now() - startTime
        logRecommendationMetrics({
          generationTime: duration,
          recommendationCount: starters.recommendations.length,
          totalCompletions: completionHistory.length,
          cacheHit: false,
          strategy: 'starter',
          userId,
          childId
        })

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

      return true
    })

    // Apply faith mode filter separately (with fallback)
    // When faith mode is ON: prioritize LDS-tagged prompts, then general faith prompts
    // When faith mode is OFF: exclude explicitly faith-tagged prompts
    let faithFilteredPrompts = eligiblePrompts.filter(prompt => {
      if (faithMode) {
        // Include LDS, faith-based, or christian tagged prompts
        return prompt.tags?.includes('lds') ||
               prompt.tags?.includes('faith-based') ||
               prompt.tags?.includes('faith') ||
               prompt.tags?.includes('christian')
      } else {
        // Exclude explicitly faith-tagged prompts
        return !prompt.tags?.includes('lds') &&
               !prompt.tags?.includes('faith-based') &&
               !prompt.tags?.includes('faith') &&
               !prompt.tags?.includes('christian')
      }
    })

    // Fallback: if faith filter excluded everything, use all eligible prompts
    if (faithFilteredPrompts.length === 0 && eligiblePrompts.length > 0) {
      faithFilteredPrompts = eligiblePrompts
    }

    // When faith mode is ON, sort LDS-specific prompts to the top
    if (faithMode && faithFilteredPrompts.length > 0) {
      faithFilteredPrompts.sort((a, b) => {
        const aIsLDS = a.tags?.includes('lds') ? 1 : 0
        const bIsLDS = b.tags?.includes('lds') ? 1 : 0
        return bIsLDS - aIsLDS // LDS prompts first
      })
    }

    const finalEligiblePrompts = faithFilteredPrompts

      // Check if we exhausted all prompts
      if (finalEligiblePrompts.length === 0) {
        addBreadcrumb('All prompts exhausted - returning greatest hits', 'recommendation', {
          totalPrompts: allPrompts.length
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('[Recommendations] All prompts exhausted - returning greatest hits')
        }

        const greatestHits = getGreatestHitsRecommendations(
          child,
          completionHistory,
          favorites,
          allPrompts,
          limit,
          categoryDistribution
        )

        const duration = Date.now() - startTime
        logRecommendationMetrics({
          generationTime: duration,
          recommendationCount: greatestHits.recommendations.length,
          totalCompletions: completionHistory.length,
          cacheHit: false,
          strategy: 'greatest_hits',
          userId,
          childId
        })

        return greatestHits
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[Recommendations] Eligible prompts filtered', {
          eligibleCount: finalEligiblePrompts.length,
          totalPrompts: allPrompts.length
        })
      }

    // 5. Score all eligible prompts
    const scoredPrompts = await Promise.all(
      finalEligiblePrompts.map(async (prompt) => {
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
        addBreadcrumb('Forcing diversity - dominant category detected', 'recommendation', {
          dominantCategory: dominantCategory.category,
          percentage: `${(dominantCategory.percentage * 100).toFixed(1)}%`
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('[Recommendations] Forcing diversity', {
            dominantCategory: dominantCategory.category,
            percentage: `${(dominantCategory.percentage * 100).toFixed(1)}%`
          })
        }

        const diversePrompts = scoredPrompts.filter(
          sp => sp.prompt.category !== dominantCategory.category
        )

        if (diversePrompts.length >= 3) {
          const selected = selectDiverseRecommendations(diversePrompts, limit, childId)
          const duration = Date.now() - startTime

          logRecommendationMetrics({
            generationTime: duration,
            recommendationCount: selected.length,
            totalCompletions: completionHistory.length,
            cacheHit: false,
            strategy: 'forced_diversity',
            userId,
            childId
          })

          if (process.env.NODE_ENV === 'development') {
            console.log('[Recommendations] Complete - forced diversity', {
              duration: `${duration}ms`,
              recommendationCount: selected.length,
              categories: selected.map(r => r.prompt.category)
            })
          }

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
      const recommendations = selectDiverseRecommendations(scoredPrompts, limit, childId)

      const duration = Date.now() - startTime

      logRecommendationMetrics({
        generationTime: duration,
        recommendationCount: recommendations.length,
        totalCompletions: completionHistory.length,
        cacheHit: false,
        strategy: 'standard',
        userId,
        childId
      })

      if (process.env.NODE_ENV === 'development') {
        console.log('[Recommendations] Complete - standard', {
          duration: `${duration}ms`,
          recommendationCount: recommendations.length,
          categories: recommendations.map(r => r.prompt.category),
          topScores: recommendations.slice(0, 3).map(r => ({
            title: r.prompt.title,
            score: r.score.toFixed(2),
            reasons: r.reasons.map(reason => reason.type)
          }))
        })
      }

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
      const duration = Date.now() - startTime

      captureError(error, {
        tags: {
          component: 'recommendations',
          operation: 'generate',
          userId,
          childId
        },
        extra: {
          request,
          duration
        }
      })

      if (process.env.NODE_ENV === 'development') {
        console.error('[Recommendations] Error generating recommendations:', error)
      }

      // Fallback: return age-appropriate prompts
      return getFallbackRecommendations(childId, request, supabase)
    }
  })
}

/**
 * Selects diverse recommendations ensuring category and tag variety
 * Max 2 from same category, max 2 with same primary tag
 * Adds daily rotation based on date to prevent same prompts appearing daily
 */
function selectDiverseRecommendations(
  scoredPrompts: ScoredPrompt[],
  limit: number,
  childId?: string
): ScoredPrompt[] {
  const selected: ScoredPrompt[] = []
  const usedCategories = new Map<string, number>()
  const usedPrimaryTags = new Map<string, number>()

  // Create a daily rotation offset based on today's date and child ID
  // This ensures different prompts each day and different prompts for siblings
  const today = new Date()
  const dateNumber = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const childHash = childId ? hashString(childId) : 0
  const rotationOffset = (dateNumber + childHash) % Math.max(scoredPrompts.length, 1)

  // Rotate the scored prompts array for this child/date combination
  const rotatedPrompts = [...scoredPrompts]
  if (rotationOffset > 0 && rotatedPrompts.length > 1) {
    // Shuffle based on rotation offset while respecting relative scores
    const topTier = rotatedPrompts.slice(0, Math.min(10, rotatedPrompts.length))
    const rest = rotatedPrompts.slice(10)

    // Rotate within the top tier to add daily variety
    const rotateAmount = rotationOffset % topTier.length
    const rotatedTop = [...topTier.slice(rotateAmount), ...topTier.slice(0, rotateAmount)]
    rotatedPrompts.splice(0, rotatedPrompts.length, ...rotatedTop, ...rest)
  }

  for (const scored of rotatedPrompts) {
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
  if (selected.length < 3 && rotatedPrompts.length >= 3) {
    for (const scored of rotatedPrompts) {
      if (selected.length >= limit) break
      if (!selected.includes(scored)) {
        selected.push(scored)
      }
    }
  }

  return selected
}

/**
 * Simple hash function for string to number
 * Used to create consistent but different offsets for each child
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
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

  // Filter by faith mode (but don't exclude everything if none match)
  // When faith mode is ON: prioritize LDS-tagged prompts, then general faith prompts
  let faithFiltered = ageAppropriate.filter(p => {
    if (faithMode) {
      return p.tags?.includes('lds') ||
             p.tags?.includes('faith-based') ||
             p.tags?.includes('faith') ||
             p.tags?.includes('christian')
    } else {
      return !p.tags?.includes('lds') &&
             !p.tags?.includes('faith-based') &&
             !p.tags?.includes('faith') &&
             !p.tags?.includes('christian')
    }
  })

  // Fallback: if faith filter resulted in no prompts, use all age-appropriate prompts
  if (faithFiltered.length === 0) {
    faithFiltered = ageAppropriate
  }

  // When faith mode is ON, sort LDS-specific prompts to the top
  if (faithMode && faithFiltered.length > 0) {
    faithFiltered.sort((a, b) => {
      const aIsLDS = a.tags?.includes('lds') ? 1 : 0
      const bIsLDS = b.tags?.includes('lds') ? 1 : 0
      return bIsLDS - aIsLDS // LDS prompts first
    })
  }

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

  // Get categories list
  const categories = Array.from(byCategory.keys())

  // Create a rotation offset based on today's date and child ID
  // This ensures siblings get different prompts
  const today = new Date()
  const dateNumber = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const childHash = hashString(child.id)
  const rotationOffset = (dateNumber + childHash) % Math.max(categories.length, 1)

  // Rotate categories order based on child ID for sibling diversity
  const rotatedCategories = [...categories]
  for (let i = 0; i < rotationOffset; i++) {
    rotatedCategories.push(rotatedCategories.shift()!)
  }

  // Pick one from each category (round-robin with rotation)
  const diverse: Prompt[] = []

  let categoryIndex = 0
  while (diverse.length < limit && byCategory.size > 0) {
    const category = rotatedCategories[categoryIndex % rotatedCategories.length]
    const prompts = byCategory.get(category)

    if (prompts && prompts.length > 0) {
      // Also rotate within the category based on child hash
      const promptIndex = childHash % prompts.length
      diverse.push(prompts.splice(promptIndex, 1)[0])

      if (prompts.length === 0) {
        byCategory.delete(category)
        const catIdx = rotatedCategories.indexOf(category)
        if (catIdx > -1) rotatedCategories.splice(catIdx, 1)
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
  const startTime = Date.now()

  addBreadcrumb('Using fallback recommendations', 'recommendation', {
    childId,
    reason: 'engine_error'
  })

  if (process.env.NODE_ENV === 'development') {
    console.log('[Recommendations] Using fallback recommendations')
  }

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

  const duration = Date.now() - startTime

  logRecommendationMetrics({
    generationTime: duration,
    recommendationCount: recommendations.length,
    totalCompletions: 0,
    cacheHit: false,
    strategy: 'fallback',
    userId: request.userId,
    childId
  })

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

/**
 * Logs recommendation metrics for monitoring and analytics
 */
interface RecommendationMetrics {
  generationTime: number
  recommendationCount: number
  totalCompletions: number
  cacheHit: boolean
  strategy: 'starter' | 'standard' | 'forced_diversity' | 'greatest_hits' | 'fallback'
  userId: string
  childId: string
}

function logRecommendationMetrics(metrics: RecommendationMetrics) {
  const {
    generationTime,
    recommendationCount,
    totalCompletions,
    cacheHit,
    strategy,
    userId,
    childId
  } = metrics

  // Add breadcrumb for tracking
  addBreadcrumb('Recommendations generated', 'recommendation', {
    generationTime: `${generationTime}ms`,
    recommendationCount,
    strategy,
    cacheHit
  })

  // Log performance metrics with Sentry
  captureMessage(`Recommendations generated: ${strategy}`, 'info', {
    tags: {
      component: 'recommendations',
      strategy,
      cacheHit: String(cacheHit)
    },
    extra: {
      generationTime,
      recommendationCount,
      totalCompletions,
      userId,
      childId,
      performanceCategory: generationTime < 500 ? 'fast' : 'slow'
    }
  })

  // Warn if generation time exceeds target
  if (generationTime > 500) {
    captureMessage(`Slow recommendation generation: ${generationTime}ms`, 'warning', {
      tags: {
        component: 'recommendations',
        performance: 'slow'
      },
      extra: {
        generationTime,
        userId,
        childId,
        strategy
      }
    })
  }

  // Development mode: detailed console logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Recommendations] Metrics', {
      generationTime: `${generationTime}ms`,
      recommendationCount,
      totalCompletions,
      cacheHit,
      strategy,
      performanceCategory: generationTime < 500 ? '✅ fast' : '⚠️ slow'
    })
  }
}
