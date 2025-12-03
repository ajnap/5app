import {
  calculateInsights,
  daysSinceLastCompletion,
  isUnderrepresented,
  isOverrepresented
} from '../insights-calculator'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock Sentry
jest.mock('../sentry', () => ({
  captureError: jest.fn()
}))

describe('insights-calculator', () => {
  describe('calculateInsights', () => {
    let mockSupabase: jest.Mocked<SupabaseClient>

    beforeEach(() => {
      mockSupabase = {
        rpc: jest.fn(),
        from: jest.fn(),
      } as any
    })

    it('should calculate insights with complete data', async () => {
      // Mock RPC calls for time stats
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: { total_minutes: 45 }, error: null, count: null, status: 200, statusText: 'OK' }) // weekly
        .mockResolvedValueOnce({ data: { total_minutes: 180 }, error: null, count: null, status: 200, statusText: 'OK' }) // monthly
        .mockResolvedValueOnce({ data: 5, error: null, count: null, status: 200, statusText: 'OK' }) // streak

      // Mock completions query
      const mockCompletions = [
        {
          id: '1',
          completion_date: '2025-11-14',
          category: { category: 'connection' },
          reflection_note: 'Great!',
          duration_seconds: 300
        },
        {
          id: '2',
          completion_date: '2025-11-13',
          category: { category: 'connection' },
          reflection_note: null,
          duration_seconds: 420
        },
        {
          id: '3',
          completion_date: '2025-11-12',
          category: { category: 'creative_expression' },
          reflection_note: 'Fun!',
          duration_seconds: 600
        },
        {
          id: '4',
          completion_date: '2025-11-10',
          category: { category: 'learning' },
          reflection_note: null,
          duration_seconds: 180
        },
        {
          id: '5',
          completion_date: '2025-11-09',
          category: { category: 'connection' },
          reflection_note: null,
          duration_seconds: 240
        }
      ]

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCompletions,
              error: null
            })
          })
        })
      })

      const insights = await calculateInsights('child-123', 'user-456', mockSupabase)

      expect(insights.weeklyMinutes).toBe(45)
      expect(insights.monthlyMinutes).toBe(180)
      expect(insights.totalCompletions).toBe(5)
      expect(insights.currentStreak).toBe(5)
      expect(insights.favoriteCategories).toHaveLength(3)
      expect(insights.favoriteCategories[0]).toEqual({ category: 'connection', count: 3 })
      expect(insights.favoriteCategories[1]).toEqual({ category: 'creative_expression', count: 1 })
      expect(insights.favoriteCategories[2]).toEqual({ category: 'learning', count: 1 })
      expect(insights.lastCompletionDate).toBe('2025-11-14')
    })

    it('should handle empty completion history', async () => {
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: { total_minutes: 0 }, error: null, count: null, status: 200, statusText: 'OK' })
        .mockResolvedValueOnce({ data: { total_minutes: 0 }, error: null, count: null, status: 200, statusText: 'OK' })
        .mockResolvedValueOnce({ data: 0, error: null, count: null, status: 200, statusText: 'OK' })

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      })

      const insights = await calculateInsights('child-123', 'user-456', mockSupabase)

      expect(insights.weeklyMinutes).toBe(0)
      expect(insights.monthlyMinutes).toBe(0)
      expect(insights.totalCompletions).toBe(0)
      expect(insights.currentStreak).toBe(0)
      expect(insights.favoriteCategories).toEqual([])
      expect(insights.categoryDistribution).toEqual([])
      expect(insights.lastCompletionDate).toBeUndefined()
    })

    it('should return fallback insights on error', async () => {
      mockSupabase.rpc = jest.fn().mockRejectedValue(new Error('Database error'))

      const insights = await calculateInsights('child-123', 'user-456', mockSupabase)

      expect(insights).toEqual({
        weeklyMinutes: 0,
        monthlyMinutes: 0,
        totalCompletions: 0,
        currentStreak: 0,
        favoriteCategories: [],
        categoryDistribution: [],
        lastCompletionDate: undefined
      })
    })

    it('should calculate category distribution percentages correctly', async () => {
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: { total_minutes: 30 }, error: null, count: null, status: 200, statusText: 'OK' })
        .mockResolvedValueOnce({ data: { total_minutes: 120 }, error: null, count: null, status: 200, statusText: 'OK' })
        .mockResolvedValueOnce({ data: 3, error: null, count: null, status: 200, statusText: 'OK' })

      const mockCompletions = [
        { id: '1', completion_date: '2025-11-14', category: { category: 'connection' } },
        { id: '2', completion_date: '2025-11-13', category: { category: 'connection' } },
        { id: '3', completion_date: '2025-11-12', category: { category: 'connection' } },
        { id: '4', completion_date: '2025-11-11', category: { category: 'connection' } },
        { id: '5', completion_date: '2025-11-10', category: { category: 'learning' } }
      ]

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCompletions,
              error: null
            })
          })
        })
      })

      const insights = await calculateInsights('child-123', 'user-456', mockSupabase)

      expect(insights.categoryDistribution).toHaveLength(2)
      expect(insights.categoryDistribution[0]).toEqual({
        category: 'connection',
        percentage: 80
      })
      expect(insights.categoryDistribution[1]).toEqual({
        category: 'learning',
        percentage: 20
      })
    })
  })

  describe('daysSinceLastCompletion', () => {
    it('should calculate days since last completion', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(today.getDate() - 3)

      const dateString = threeDaysAgo.toISOString().split('T')[0]
      const days = daysSinceLastCompletion(dateString)

      expect(days).toBeGreaterThanOrEqual(2)
      expect(days).toBeLessThanOrEqual(3)
    })

    it('should return Infinity if no completion date provided', () => {
      expect(daysSinceLastCompletion(undefined)).toBe(Infinity)
      expect(daysSinceLastCompletion('')).toBe(Infinity)
    })

    it('should return 0 for today', () => {
      const today = new Date().toISOString().split('T')[0]
      const days = daysSinceLastCompletion(today)

      expect(days).toBeLessThanOrEqual(1) // Could be 0 or 1 depending on time of day
    })
  })

  describe('isUnderrepresented', () => {
    const distribution = [
      { category: 'connection', percentage: 60 },
      { category: 'learning', percentage: 30 },
      { category: 'creative_expression', percentage: 5 },
      { category: 'behavior', percentage: 5 }
    ]

    it('should identify underrepresented categories', () => {
      expect(isUnderrepresented('creative_expression', distribution, 20)).toBe(true)
      expect(isUnderrepresented('behavior', distribution, 20)).toBe(true)
    })

    it('should not flag well-represented categories', () => {
      expect(isUnderrepresented('connection', distribution, 20)).toBe(false)
      expect(isUnderrepresented('learning', distribution, 20)).toBe(false)
    })

    it('should return false if user has fewer than 10 completions', () => {
      expect(isUnderrepresented('creative_expression', distribution, 5)).toBe(false)
      expect(isUnderrepresented('creative_expression', distribution, 9)).toBe(false)
    })

    it('should return true for categories not in distribution', () => {
      expect(isUnderrepresented('new_category', distribution, 20)).toBe(true)
    })
  })

  describe('isOverrepresented', () => {
    const distribution = [
      { category: 'connection', percentage: 60 },
      { category: 'learning', percentage: 30 },
      { category: 'creative_expression', percentage: 5 },
      { category: 'behavior', percentage: 5 }
    ]

    it('should identify overrepresented categories (>40%)', () => {
      expect(isOverrepresented('connection', distribution)).toBe(true)
    })

    it('should not flag balanced categories', () => {
      expect(isOverrepresented('learning', distribution)).toBe(false)
      expect(isOverrepresented('creative_expression', distribution)).toBe(false)
      expect(isOverrepresented('behavior', distribution)).toBe(false)
    })

    it('should return false for categories not in distribution', () => {
      expect(isOverrepresented('new_category', distribution)).toBe(false)
    })

    it('should flag categories exactly at 41%', () => {
      const edgeDistribution = [{ category: 'test', percentage: 41 }]
      expect(isOverrepresented('test', edgeDistribution)).toBe(true)
    })

    it('should not flag categories at exactly 40%', () => {
      const edgeDistribution = [{ category: 'test', percentage: 40 }]
      expect(isOverrepresented('test', edgeDistribution)).toBe(false)
    })
  })
})
