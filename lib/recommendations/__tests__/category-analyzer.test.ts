/**
 * Unit Tests for Category Analyzer
 * Tests category distribution analysis and balance boost calculations
 */

import {
  analyzeCategoryDistribution,
  getBalanceBoost,
  getCategoryBalanceReason
} from '../category-analyzer'
import type { Completion, Prompt } from '../types'

// Mock data helpers
function createMockCompletion(
  category: string,
  daysAgo: number = 0,
  overrides?: Partial<Completion>
): Completion {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)

  return {
    id: `completion-${Math.random()}`,
    user_id: 'user-123',
    prompt_id: `prompt-${category}`,
    child_id: 'child-123',
    completed_at: date.toISOString(),
    completion_date: date.toISOString().split('T')[0],
    reflection_note: null,
    duration_seconds: null,
    created_at: date.toISOString(),
    prompt: {
      id: `prompt-${category}`,
      title: 'Test',
      description: 'Test',
      activity: 'Test',
      category,
      age_categories: ['all'],
      tags: [],
      estimated_minutes: 5,
      created_at: date.toISOString()
    },
    ...overrides
  }
}

describe('Category Analyzer', () => {
  describe('analyzeCategoryDistribution', () => {
    it('should return empty distribution for no completions', async () => {
      const result = await analyzeCategoryDistribution('child-123', [])

      expect(result.totalCompletions).toBe(0)
      expect(result.stats).toEqual([])
      expect(result.underrepresented).toEqual([])
      expect(result.overrepresented).toEqual([])
      expect(result.neglected).toEqual([])
    })

    it('should calculate basic statistics correctly', async () => {
      const completions = [
        createMockCompletion('connection', 1),
        createMockCompletion('connection', 2),
        createMockCompletion('creativity', 3),
        createMockCompletion('learning', 4)
      ]

      const result = await analyzeCategoryDistribution('child-123', completions)

      expect(result.totalCompletions).toBe(4)
      expect(result.stats.length).toBe(3)

      const connectionStat = result.stats.find(s => s.category === 'connection')
      expect(connectionStat).toBeDefined()
      expect(connectionStat!.count).toBe(2)
      expect(connectionStat!.percentage).toBe(0.5)
    })

    it('should sort stats by count descending', async () => {
      const completions = [
        createMockCompletion('connection', 1),
        createMockCompletion('connection', 2),
        createMockCompletion('connection', 3),
        createMockCompletion('creativity', 4),
        createMockCompletion('creativity', 5),
        createMockCompletion('learning', 6)
      ]

      const result = await analyzeCategoryDistribution('child-123', completions)

      expect(result.stats[0].category).toBe('connection')
      expect(result.stats[0].count).toBe(3)
      expect(result.stats[1].category).toBe('creativity')
      expect(result.stats[1].count).toBe(2)
      expect(result.stats[2].category).toBe('learning')
      expect(result.stats[2].count).toBe(1)
    })

    it('should identify underrepresented categories', async () => {
      // Create 11 completions: 9 connection, 1 creativity (9.1%), 1 learning (9.1%)
      const completions = [
        ...Array(9).fill(null).map((_, i) => createMockCompletion('connection', i)),
        createMockCompletion('creativity', 9),
        createMockCompletion('learning', 10)
      ]

      const result = await analyzeCategoryDistribution('child-123', completions)

      // creativity and learning are 9.1% each (< 10% threshold with 10+ completions)
      expect(result.underrepresented).toContain('creativity')
      expect(result.underrepresented).toContain('learning')
      expect(result.underrepresented).not.toContain('connection')
    })

    it('should only mark underrepresented with 10+ total completions', async () => {
      // Only 5 completions total
      const completions = [
        createMockCompletion('connection', 1),
        createMockCompletion('connection', 2),
        createMockCompletion('connection', 3),
        createMockCompletion('creativity', 4),
        createMockCompletion('learning', 5)
      ]

      const result = await analyzeCategoryDistribution('child-123', completions)

      // Even though creativity and learning are < 20%, they shouldn't be marked
      // underrepresented because total completions < 10
      expect(result.underrepresented).toEqual([])
    })

    it('should identify overrepresented categories', async () => {
      // Create 10 completions: 4 connection (40%), 3 creativity (30%), 3 learning (30%)
      const completions = [
        ...Array(4).fill(null).map((_, i) => createMockCompletion('connection', i)),
        ...Array(3).fill(null).map((_, i) => createMockCompletion('creativity', i + 4)),
        ...Array(3).fill(null).map((_, i) => createMockCompletion('learning', i + 7))
      ]

      const result = await analyzeCategoryDistribution('child-123', completions)

      // connection is 40% (> 30% threshold)
      expect(result.overrepresented).toContain('connection')
      // creativity and learning are exactly 30%, not > 30%
      expect(result.overrepresented).not.toContain('creativity')
      expect(result.overrepresented).not.toContain('learning')
    })

    it('should identify neglected categories (14+ days)', async () => {
      const completions = [
        createMockCompletion('connection', 1), // Recent
        createMockCompletion('creativity', 20), // 20 days ago - neglected!
        createMockCompletion('learning', 5) // Recent
      ]

      const result = await analyzeCategoryDistribution('child-123', completions)

      expect(result.neglected).toContain('creativity')
      expect(result.neglected).not.toContain('connection')
      expect(result.neglected).not.toContain('learning')
    })

    it('should calculate average duration correctly', async () => {
      const completions = [
        createMockCompletion('connection', 1, { duration_seconds: 300 }),
        createMockCompletion('connection', 2, { duration_seconds: 400 }),
        createMockCompletion('connection', 3, { duration_seconds: 500 })
      ]

      const result = await analyzeCategoryDistribution('child-123', completions)

      const connectionStat = result.stats.find(s => s.category === 'connection')
      expect(connectionStat!.avgDuration).toBe(400) // (300 + 400 + 500) / 3
    })

    it('should handle null durations gracefully', async () => {
      const completions = [
        createMockCompletion('connection', 1, { duration_seconds: 300 }),
        createMockCompletion('connection', 2, { duration_seconds: null }),
        createMockCompletion('connection', 3, { duration_seconds: undefined })
      ]

      const result = await analyzeCategoryDistribution('child-123', completions)

      const connectionStat = result.stats.find(s => s.category === 'connection')
      expect(connectionStat!.avgDuration).toBe(300) // Only counts the one with duration
    })

    it('should detect reflection notes presence', async () => {
      const completions = [
        createMockCompletion('connection', 1, { reflection_note: 'Great activity!' }),
        createMockCompletion('creativity', 2, { reflection_note: null }),
        createMockCompletion('learning', 3, { reflection_note: '' })
      ]

      const result = await analyzeCategoryDistribution('child-123', completions)

      const connectionStat = result.stats.find(s => s.category === 'connection')
      const creativityStat = result.stats.find(s => s.category === 'creativity')
      const learningStat = result.stats.find(s => s.category === 'learning')

      expect(connectionStat!.hasReflectionNotes).toBe(true)
      expect(creativityStat!.hasReflectionNotes).toBe(false)
      expect(learningStat!.hasReflectionNotes).toBe(false)
    })

    it('should handle completions without prompt data', async () => {
      const completion: Completion = {
        id: 'completion-1',
        user_id: 'user-123',
        prompt_id: 'prompt-123',
        child_id: 'child-123',
        completed_at: new Date().toISOString(),
        completion_date: new Date().toISOString().split('T')[0],
        reflection_note: null,
        duration_seconds: null,
        created_at: new Date().toISOString()
      }

      const result = await analyzeCategoryDistribution('child-123', [completion])

      expect(result.totalCompletions).toBe(1)
      expect(result.stats.length).toBe(1)
      expect(result.stats[0].category).toBe('uncategorized')
    })

    it('should track last completed date correctly', async () => {
      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

      const completions = [
        createMockCompletion('connection', 10),
        createMockCompletion('connection', 5)
      ]

      const result = await analyzeCategoryDistribution('child-123', completions)

      const connectionStat = result.stats.find(s => s.category === 'connection')
      expect(connectionStat!.lastCompleted).not.toBeNull()

      // Should be the most recent one (5 days ago)
      const daysDiff = Math.floor(
        (Date.now() - connectionStat!.lastCompleted!.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysDiff).toBe(5)
    })
  })

  describe('getBalanceBoost', () => {
    it('should return 1.5x for underrepresented categories', () => {
      const distribution = {
        stats: [],
        totalCompletions: 10,
        underrepresented: ['creativity'],
        overrepresented: [],
        neglected: []
      }

      const boost = getBalanceBoost('creativity', distribution)
      expect(boost).toBe(1.5)
    })

    it('should return 1.3x for neglected categories', () => {
      const distribution = {
        stats: [],
        totalCompletions: 10,
        underrepresented: [],
        overrepresented: [],
        neglected: ['learning']
      }

      const boost = getBalanceBoost('learning', distribution)
      expect(boost).toBe(1.3)
    })

    it('should return 0.7x for overrepresented categories', () => {
      const distribution = {
        stats: [],
        totalCompletions: 10,
        underrepresented: [],
        overrepresented: ['connection'],
        neglected: []
      }

      const boost = getBalanceBoost('connection', distribution)
      expect(boost).toBe(0.7)
    })

    it('should return 1.0x for neutral categories', () => {
      const distribution = {
        stats: [],
        totalCompletions: 10,
        underrepresented: [],
        overrepresented: [],
        neglected: []
      }

      const boost = getBalanceBoost('connection', distribution)
      expect(boost).toBe(1.0)
    })

    it('should prioritize underrepresented over neglected', () => {
      const distribution = {
        stats: [],
        totalCompletions: 10,
        underrepresented: ['creativity'],
        overrepresented: [],
        neglected: ['creativity']
      }

      const boost = getBalanceBoost('creativity', distribution)
      expect(boost).toBe(1.5) // Underrepresented boost, not neglected
    })
  })

  describe('getCategoryBalanceReason', () => {
    it('should return reason for underrepresented categories', () => {
      const distribution = {
        stats: [],
        totalCompletions: 10,
        underrepresented: ['creativity'],
        overrepresented: [],
        neglected: []
      }

      const reason = getCategoryBalanceReason('creativity', distribution)
      expect(reason).toContain('exploring creativity')
      expect(reason).toContain("haven't tried this much yet")
    })

    it('should return reason with days for neglected categories', () => {
      const twentyDaysAgo = new Date()
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20)

      const distribution = {
        stats: [{
          category: 'learning',
          count: 5,
          percentage: 0.2,
          lastCompleted: twentyDaysAgo,
          avgDuration: null,
          hasReflectionNotes: false
        }],
        totalCompletions: 25,
        underrepresented: [],
        overrepresented: [],
        neglected: ['learning']
      }

      const reason = getCategoryBalanceReason('learning', distribution)
      expect(reason).toContain('revisit learning')
      expect(reason).toContain('20 days')
    })

    it('should return null for overrepresented categories', () => {
      const distribution = {
        stats: [],
        totalCompletions: 10,
        underrepresented: [],
        overrepresented: ['connection'],
        neglected: []
      }

      const reason = getCategoryBalanceReason('connection', distribution)
      expect(reason).toBeNull()
    })

    it('should return null for neutral categories', () => {
      const distribution = {
        stats: [],
        totalCompletions: 10,
        underrepresented: [],
        overrepresented: [],
        neglected: []
      }

      const reason = getCategoryBalanceReason('connection', distribution)
      expect(reason).toBeNull()
    })
  })
})
