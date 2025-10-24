/**
 * Unit Tests for Recommendation Score Calculator
 * Tests scoring logic for category balance, engagement, and filters
 */

import {
  calculatePromptScore,
  applyAgeFilter,
  applyRecencyFilter,
  calculateRecencyMultiplier
} from '../score-calculator'
import type {
  Prompt,
  Child,
  Completion,
  Favorite,
  CategoryDistribution
} from '../types'

// Mock data helpers
function createMockPrompt(overrides?: Partial<Prompt>): Prompt {
  return {
    id: '123',
    title: 'Test Prompt',
    description: 'Test description',
    activity: 'Test activity',
    category: 'connection',
    age_categories: ['elementary'],
    tags: ['conversation'],
    estimated_minutes: 5,
    created_at: new Date().toISOString(),
    ...overrides
  }
}

function createMockChild(overrides?: Partial<Child>): Child {
  return {
    id: 'child-123',
    user_id: 'user-123',
    name: 'Test Child',
    birth_date: '2014-01-01', // ~11 years old
    age: 11,
    interests: [],
    personality_traits: [],
    current_challenges: [],
    created_at: new Date().toISOString(),
    ...overrides
  }
}

function createMockCompletion(overrides?: Partial<Completion>): Completion {
  return {
    id: 'completion-123',
    user_id: 'user-123',
    prompt_id: '123',
    child_id: 'child-123',
    completed_at: new Date().toISOString(),
    completion_date: new Date().toISOString().split('T')[0],
    reflection_note: null,
    duration_seconds: null,
    created_at: new Date().toISOString(),
    ...overrides
  }
}

function createMockCategoryDistribution(overrides?: Partial<CategoryDistribution>): CategoryDistribution {
  return {
    stats: [],
    totalCompletions: 0,
    underrepresented: [],
    overrepresented: [],
    neglected: [],
    ...overrides
  }
}

describe('Score Calculator', () => {
  describe('applyAgeFilter', () => {
    it('should return true for matching age category', () => {
      const prompt = createMockPrompt({ age_categories: ['elementary'] })
      const result = applyAgeFilter(prompt, 10) // 10 years old = elementary
      expect(result).toBe(true)
    })

    it('should return true for "all" age category', () => {
      const prompt = createMockPrompt({ age_categories: ['all'] })
      const result = applyAgeFilter(prompt, 5)
      expect(result).toBe(true)
    })

    it('should return false for non-matching age category', () => {
      const prompt = createMockPrompt({ age_categories: ['teen'] })
      const result = applyAgeFilter(prompt, 5) // 5 years old = toddler
      expect(result).toBe(false)
    })

    it('should correctly categorize infant (< 2 years)', () => {
      const prompt = createMockPrompt({ age_categories: ['infant'] })
      expect(applyAgeFilter(prompt, 1)).toBe(true)
      expect(applyAgeFilter(prompt, 2)).toBe(false)
    })

    it('should correctly categorize toddler (2-4 years)', () => {
      const prompt = createMockPrompt({ age_categories: ['toddler'] })
      expect(applyAgeFilter(prompt, 2)).toBe(true)
      expect(applyAgeFilter(prompt, 4)).toBe(true)
      expect(applyAgeFilter(prompt, 5)).toBe(false)
    })

    it('should correctly categorize elementary (5-11 years)', () => {
      const prompt = createMockPrompt({ age_categories: ['elementary'] })
      expect(applyAgeFilter(prompt, 5)).toBe(true)
      expect(applyAgeFilter(prompt, 11)).toBe(true)
      expect(applyAgeFilter(prompt, 12)).toBe(false)
    })

    it('should correctly categorize teen (12-17 years)', () => {
      const prompt = createMockPrompt({ age_categories: ['teen'] })
      expect(applyAgeFilter(prompt, 12)).toBe(true)
      expect(applyAgeFilter(prompt, 17)).toBe(true)
      expect(applyAgeFilter(prompt, 18)).toBe(false)
    })
  })

  describe('applyRecencyFilter', () => {
    it('should return true if never completed', () => {
      const prompt = createMockPrompt()
      const completionHistory: Completion[] = []
      const result = applyRecencyFilter(prompt, completionHistory, 14)
      expect(result).toBe(true)
    })

    it('should return false if completed within threshold', () => {
      const prompt = createMockPrompt({ id: 'prompt-123' })
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const completion = createMockCompletion({
        prompt_id: 'prompt-123',
        completed_at: yesterday.toISOString()
      })

      const result = applyRecencyFilter(prompt, [completion], 14)
      expect(result).toBe(false)
    })

    it('should return true if completed outside threshold', () => {
      const prompt = createMockPrompt({ id: 'prompt-123' })
      const twentyDaysAgo = new Date()
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20)

      const completion = createMockCompletion({
        prompt_id: 'prompt-123',
        completed_at: twentyDaysAgo.toISOString()
      })

      const result = applyRecencyFilter(prompt, [completion], 14)
      expect(result).toBe(true)
    })

    it('should use most recent completion when multiple exist', () => {
      const prompt = createMockPrompt({ id: 'prompt-123' })

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

      const completions = [
        createMockCompletion({
          prompt_id: 'prompt-123',
          completed_at: thirtyDaysAgo.toISOString()
        }),
        createMockCompletion({
          prompt_id: 'prompt-123',
          completed_at: fiveDaysAgo.toISOString()
        })
      ]

      const result = applyRecencyFilter(prompt, completions, 14)
      expect(result).toBe(false) // Most recent is 5 days ago, within 14 day threshold
    })
  })

  describe('calculateRecencyMultiplier', () => {
    it('should return 1.0 for never-completed prompts', () => {
      const prompt = createMockPrompt()
      const result = calculateRecencyMultiplier(prompt, [])
      expect(result).toBe(1.0)
    })

    it('should return reduced multiplier for recently completed prompts', () => {
      const prompt = createMockPrompt({ id: 'prompt-123' })
      const fifteenDaysAgo = new Date()
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

      const completion = createMockCompletion({
        prompt_id: 'prompt-123',
        completed_at: fifteenDaysAgo.toISOString()
      })

      const result = calculateRecencyMultiplier(prompt, [completion])
      expect(result).toBeLessThan(1.0)
      expect(result).toBeGreaterThanOrEqual(0.5)
    })

    it('should return minimum 0.5 for very old completions', () => {
      const prompt = createMockPrompt({ id: 'prompt-123' })
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const completion = createMockCompletion({
        prompt_id: 'prompt-123',
        completed_at: sixtyDaysAgo.toISOString()
      })

      const result = calculateRecencyMultiplier(prompt, [completion])
      expect(result).toBe(0.5)
    })
  })

  describe('calculatePromptScore', () => {
    it('should calculate scores for prompts with neutral distribution', async () => {
      const prompt = createMockPrompt()
      const child = createMockChild()
      const distribution = createMockCategoryDistribution()

      const result = await calculatePromptScore(
        prompt,
        child,
        [],
        [],
        distribution
      )

      expect(result.totalScore).toBeGreaterThan(0)
      expect(result.totalScore).toBeLessThanOrEqual(100)
      expect(result.categoryScore).toBeDefined()
      expect(result.engagementScore).toBeDefined()
      expect(result.filterScore).toBeDefined()
    })

    it('should boost underrepresented categories', async () => {
      const prompt = createMockPrompt({ category: 'creativity' })
      const child = createMockChild()
      const distribution = createMockCategoryDistribution({
        underrepresented: ['creativity']
      })

      const result = await calculatePromptScore(
        prompt,
        child,
        [],
        [],
        distribution
      )

      expect(result.categoryScore).toBeGreaterThan(50) // Boosted from base 50
      expect(result.reasons.some(r => r.type === 'category_balance')).toBe(true)
    })

    it('should penalize overrepresented categories', async () => {
      const prompt = createMockPrompt({ category: 'connection' })
      const child = createMockChild()
      const distribution = createMockCategoryDistribution({
        overrepresented: ['connection']
      })

      const result = await calculatePromptScore(
        prompt,
        child,
        [],
        [],
        distribution
      )

      expect(result.categoryScore).toBeLessThan(50) // Penalized from base 50
    })

    it('should score favorited prompts higher', async () => {
      const prompt = createMockPrompt({ id: 'prompt-123' })
      const child = createMockChild()
      const favorites: Favorite[] = [{
        id: 'fav-1',
        user_id: 'user-123',
        prompt_id: 'prompt-123',
        created_at: new Date().toISOString()
      }]
      // Need at least one completion for engagement scoring to kick in
      const completions: Completion[] = [
        createMockCompletion({
          prompt_id: 'prompt-123',
          duration_seconds: 300
        })
      ]
      const distribution = createMockCategoryDistribution()

      const result = await calculatePromptScore(
        prompt,
        child,
        completions,
        favorites,
        distribution
      )

      expect(result.engagementScore).toBeGreaterThan(50)
      expect(result.reasons.some(r => r.type === 'engagement' && r.message.includes('favorited'))).toBe(true)
    })

    it('should match child challenges in tags', async () => {
      const prompt = createMockPrompt({
        tags: ['bedtime', 'routine', 'calm']
      })
      const child = createMockChild({
        current_challenges: ['bedtime', 'transitions']
      })
      const distribution = createMockCategoryDistribution()

      const result = await calculatePromptScore(
        prompt,
        child,
        [],
        [],
        distribution
      )

      expect(result.filterScore).toBeGreaterThan(50)
      expect(result.reasons.some(r => r.type === 'challenge_match')).toBe(true)
    })

    it('should match child interests in tags', async () => {
      const prompt = createMockPrompt({
        tags: ['sports', 'outdoor', 'active']
      })
      const child = createMockChild({
        interests: ['sports', 'soccer']
      })
      const distribution = createMockCategoryDistribution()

      const result = await calculatePromptScore(
        prompt,
        child,
        [],
        [],
        distribution
      )

      expect(result.filterScore).toBeGreaterThan(50)
      expect(result.reasons.some(r => r.type === 'interest_match')).toBe(true)
    })

    it('should score highly engaged activities (long duration)', async () => {
      const prompt = createMockPrompt({ id: 'prompt-123', estimated_minutes: 5 })
      const child = createMockChild()
      const completions: Completion[] = [
        createMockCompletion({
          prompt_id: 'prompt-123',
          duration_seconds: 600 // 10 minutes (2x estimate)
        })
      ]
      const distribution = createMockCategoryDistribution()

      const result = await calculatePromptScore(
        prompt,
        child,
        completions,
        [],
        distribution
      )

      expect(result.engagementScore).toBeGreaterThan(50)
      expect(result.reasons.some(r => r.message.includes('quality time'))).toBe(true)
    })

    it('should score highly engaged activities (reflection notes)', async () => {
      const prompt = createMockPrompt({ id: 'prompt-123' })
      const child = createMockChild()
      const completions: Completion[] = [
        createMockCompletion({
          prompt_id: 'prompt-123',
          reflection_note: 'This was great! We had so much fun together.'
        })
      ]
      const distribution = createMockCategoryDistribution()

      const result = await calculatePromptScore(
        prompt,
        child,
        completions,
        [],
        distribution
      )

      expect(result.engagementScore).toBeGreaterThan(50)
      expect(result.reasons.some(r => r.message.includes('reflections'))).toBe(true)
    })

    it('should apply custom weights correctly', async () => {
      const prompt = createMockPrompt({ category: 'creativity' })
      const child = createMockChild()
      const distribution = createMockCategoryDistribution({
        underrepresented: ['creativity']
      })
      const customWeights = {
        categoryBalance: 0.9,
        engagement: 0.05,
        filters: 0.05
      }

      const result = await calculatePromptScore(
        prompt,
        child,
        [],
        [],
        distribution,
        customWeights
      )

      // With 90% weight on category balance, category score should dominate
      const expectedScore =
        result.categoryScore * 0.9 +
        result.engagementScore * 0.05 +
        result.filterScore * 0.05

      expect(Math.abs(result.totalScore - expectedScore)).toBeLessThan(0.1)
    })

    it('should return scores within valid range (0-100)', async () => {
      const prompt = createMockPrompt()
      const child = createMockChild()
      const distribution = createMockCategoryDistribution()

      const result = await calculatePromptScore(
        prompt,
        child,
        [],
        [],
        distribution
      )

      expect(result.totalScore).toBeGreaterThanOrEqual(0)
      expect(result.totalScore).toBeLessThanOrEqual(100)
      expect(result.categoryScore).toBeGreaterThanOrEqual(0)
      expect(result.categoryScore).toBeLessThanOrEqual(100)
      expect(result.engagementScore).toBeGreaterThanOrEqual(0)
      expect(result.engagementScore).toBeLessThanOrEqual(100)
      expect(result.filterScore).toBeGreaterThanOrEqual(0)
      expect(result.filterScore).toBeLessThanOrEqual(100)
    })
  })
})
