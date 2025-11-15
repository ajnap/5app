import { generatePersonalizedTips, getCategoryDisplayName } from '../tips-generator'
import type { Child, ConnectionInsights, Completion } from '../recommendations/types'

describe('tips-generator', () => {
  const mockChild: Child = {
    id: 'child-123',
    user_id: 'user-456',
    name: 'Emma',
    birth_date: '2018-05-15',
    age: 6,
    interests: ['art', 'reading'],
    personality_traits: ['creative', 'curious'],
    current_challenges: [],
    created_at: '2024-01-01T00:00:00Z'
  }

  const mockInsights: ConnectionInsights = {
    weeklyMinutes: 45,
    monthlyMinutes: 180,
    totalCompletions: 20,
    currentStreak: 3,
    favoriteCategories: [
      { category: 'connection', count: 10 },
      { category: 'creative_expression', count: 5 },
      { category: 'learning', count: 5 }
    ],
    categoryDistribution: [
      { category: 'connection', percentage: 50 },
      { category: 'creative_expression', percentage: 25 },
      { category: 'learning', percentage: 25 }
    ],
    lastCompletionDate: new Date().toISOString().split('T')[0]
  }

  const mockCompletions: Completion[] = []

  describe('generatePersonalizedTips', () => {
    it('should generate developmental tip for 6-year-old', () => {
      const tips = generatePersonalizedTips(mockChild, mockInsights, mockCompletions)

      const developmentalTip = tips.find(t => t.type === 'developmental')
      expect(developmentalTip).toBeDefined()
      expect(developmentalTip?.message).toContain('empathy')
      expect(developmentalTip?.message).toContain('Emma')
      expect(developmentalTip?.priority).toBe(90)
      expect(developmentalTip?.icon).toBe('🧠')
    })

    it('should generate category balance tip for overrepresented category', () => {
      const imbalancedInsights: ConnectionInsights = {
        ...mockInsights,
        totalCompletions: 20,
        categoryDistribution: [
          { category: 'connection', percentage: 80 },
          { category: 'learning', percentage: 20 }
        ]
      }

      const tips = generatePersonalizedTips(mockChild, imbalancedInsights, mockCompletions)

      const balanceTip = tips.find(t => t.type === 'category_balance')
      expect(balanceTip).toBeDefined()
      expect(balanceTip?.message).toContain('connection')
      expect(balanceTip?.message).toContain('variety')
      expect(balanceTip?.priority).toBe(80)
    })

    it('should generate streak tip when streak >= 3', () => {
      const tips = generatePersonalizedTips(mockChild, mockInsights, mockCompletions)

      const streakTip = tips.find(t => t.type === 'streak')
      expect(streakTip).toBeDefined()
      expect(streakTip?.message).toContain('3-day streak')
      expect(streakTip?.message).toContain('Emma')
      expect(streakTip?.priority).toBe(70)
      expect(streakTip?.icon).toBe('🔥')
    })

    it('should generate re-engagement tip when inactive for 8+ days', () => {
      const today = new Date()
      const tenDaysAgo = new Date(today)
      tenDaysAgo.setDate(today.getDate() - 10)

      const inactiveInsights: ConnectionInsights = {
        ...mockInsights,
        lastCompletionDate: tenDaysAgo.toISOString().split('T')[0]
      }

      const tips = generatePersonalizedTips(mockChild, inactiveInsights, mockCompletions)

      const reengagementTip = tips.find(t => t.type === 're_engagement')
      expect(reengagementTip).toBeDefined()
      expect(reengagementTip?.message).toContain('days')
      expect(reengagementTip?.message).toContain('Emma')
      expect(reengagementTip?.priority).toBe(100)
      expect(reengagementTip?.icon).toBe('💜')
    })

    it('should generate welcome tip for brand new users', () => {
      const newUserInsights: ConnectionInsights = {
        ...mockInsights,
        totalCompletions: 0,
        currentStreak: 0,
        favoriteCategories: [],
        categoryDistribution: [],
        lastCompletionDate: undefined
      }

      const tips = generatePersonalizedTips(mockChild, newUserInsights, [])

      const welcomeTip = tips.find(t => t.type === 're_engagement')
      expect(welcomeTip).toBeDefined()
      expect(welcomeTip?.message).toContain('Start your connection journey')
      expect(welcomeTip?.message).toContain('Emma')
      expect(welcomeTip?.priority).toBe(100)
    })

    it('should generate engagement tip for high reflection rate', () => {
      const completionsWithReflections: Completion[] = [
        {
          id: '1',
          user_id: 'user-456',
          prompt_id: 'prompt-1',
          child_id: 'child-123',
          completed_at: '2025-11-14T10:00:00Z',
          completion_date: '2025-11-14',
          reflection_note: 'Great activity!',
          duration_seconds: 300,
          created_at: '2025-11-14T10:00:00Z'
        },
        {
          id: '2',
          user_id: 'user-456',
          prompt_id: 'prompt-2',
          child_id: 'child-123',
          completed_at: '2025-11-13T10:00:00Z',
          completion_date: '2025-11-13',
          reflection_note: 'So fun!',
          duration_seconds: 420,
          created_at: '2025-11-13T10:00:00Z'
        },
        {
          id: '3',
          user_id: 'user-456',
          prompt_id: 'prompt-3',
          child_id: 'child-123',
          completed_at: '2025-11-12T10:00:00Z',
          completion_date: '2025-11-12',
          reflection_note: 'Wonderful moment!',
          duration_seconds: 600,
          created_at: '2025-11-12T10:00:00Z'
        }
      ]

      const tips = generatePersonalizedTips(mockChild, mockInsights, completionsWithReflections)

      const engagementTip = tips.find(t => t.type === 'engagement' && t.message.includes('reflecting'))
      expect(engagementTip).toBeDefined()
      expect(engagementTip?.message).toContain('Emma')
      expect(engagementTip?.priority).toBe(60)
    })

    it('should return maximum 5 tips', () => {
      // Create scenario with many potential tips
      const manyTipsInsights: ConnectionInsights = {
        ...mockInsights,
        currentStreak: 7,
        totalCompletions: 30,
        categoryDistribution: [
          { category: 'connection', percentage: 70 },
          { category: 'learning', percentage: 5 },
          { category: 'creative_expression', percentage: 25 }
        ]
      }

      const completionsWithReflections: Completion[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        user_id: 'user-456',
        prompt_id: `prompt-${i}`,
        child_id: 'child-123',
        completed_at: `2025-11-${14 - i}T10:00:00Z`,
        completion_date: `2025-11-${14 - i}`,
        reflection_note: 'Great!',
        duration_seconds: 600,
        created_at: `2025-11-${14 - i}T10:00:00Z`
      }))

      const tips = generatePersonalizedTips(mockChild, manyTipsInsights, completionsWithReflections)

      expect(tips.length).toBeLessThanOrEqual(5)
    })

    it('should sort tips by priority (highest first)', () => {
      const today = new Date()
      const tenDaysAgo = new Date(today)
      tenDaysAgo.setDate(today.getDate() - 10)

      const mixedPriorityInsights: ConnectionInsights = {
        ...mockInsights,
        currentStreak: 5,
        lastCompletionDate: tenDaysAgo.toISOString().split('T')[0]
      }

      const tips = generatePersonalizedTips(mockChild, mixedPriorityInsights, mockCompletions)

      // Should be sorted by priority descending
      for (let i = 0; i < tips.length - 1; i++) {
        expect(tips[i].priority).toBeGreaterThanOrEqual(tips[i + 1].priority)
      }

      // Re-engagement (100) should come before developmental (90)
      if (tips.length >= 2) {
        expect(tips[0].type).toBe('re_engagement')
        expect(tips[0].priority).toBe(100)
      }
    })

    it('should generate exploration tip for new users (<5 completions)', () => {
      const newUserInsights: ConnectionInsights = {
        ...mockInsights,
        totalCompletions: 3,
        categoryDistribution: [
          { category: 'connection', percentage: 100 }
        ]
      }

      const tips = generatePersonalizedTips(mockChild, newUserInsights, mockCompletions)

      const explorationTip = tips.find(t => t.message.includes('getting started'))
      expect(explorationTip).toBeDefined()
      expect(explorationTip?.priority).toBe(75)
    })

    it('should generate tip for long engagement durations', () => {
      const longDurationCompletions: Completion[] = [
        {
          id: '1',
          user_id: 'user-456',
          prompt_id: 'prompt-1',
          child_id: 'child-123',
          completed_at: '2025-11-14T10:00:00Z',
          completion_date: '2025-11-14',
          reflection_note: null,
          duration_seconds: 600, // 10 minutes
          created_at: '2025-11-14T10:00:00Z'
        },
        {
          id: '2',
          user_id: 'user-456',
          prompt_id: 'prompt-2',
          child_id: 'child-123',
          completed_at: '2025-11-13T10:00:00Z',
          completion_date: '2025-11-13',
          reflection_note: null,
          duration_seconds: 720, // 12 minutes
          created_at: '2025-11-13T10:00:00Z'
        },
        {
          id: '3',
          user_id: 'user-456',
          prompt_id: 'prompt-3',
          child_id: 'child-123',
          completed_at: '2025-11-12T10:00:00Z',
          completion_date: '2025-11-12',
          reflection_note: null,
          duration_seconds: 480, // 8 minutes
          created_at: '2025-11-12T10:00:00Z'
        }
      ]

      const tips = generatePersonalizedTips(mockChild, mockInsights, longDurationCompletions)

      const durationTip = tips.find(t => t.message.includes('takes their time'))
      expect(durationTip).toBeDefined()
      expect(durationTip?.message).toContain('avg')
      expect(durationTip?.message).toContain('min')
    })

    it('should handle different age ranges correctly', () => {
      const ages = [1, 3, 6, 10, 13, 16]
      const expectedKeywords = ['sensory', 'emotional regulation', 'empathy', 'independence', 'without pressure', 'authenticity']

      ages.forEach((age, index) => {
        const childAtAge = { ...mockChild, age }
        const tips = generatePersonalizedTips(childAtAge, mockInsights, mockCompletions)

        const developmentalTip = tips.find(t => t.type === 'developmental')
        expect(developmentalTip).toBeDefined()
        expect(developmentalTip?.message.toLowerCase()).toContain(expectedKeywords[index].toLowerCase())
      })
    })
  })

  describe('getCategoryDisplayName', () => {
    it('should return formatted category names', () => {
      expect(getCategoryDisplayName('connection')).toBe('Connection')
      expect(getCategoryDisplayName('creative_expression')).toBe('Creative Expression')
      expect(getCategoryDisplayName('emotional_connection')).toBe('Emotional Connection')
      expect(getCategoryDisplayName('spiritual_growth')).toBe('Spiritual Growth')
    })

    it('should handle unknown categories by replacing underscores', () => {
      expect(getCategoryDisplayName('new_category_name')).toBe('new category name')
    })
  })
})
