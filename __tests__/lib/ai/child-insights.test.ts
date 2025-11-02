/**
 * Unit tests for AI Child Insights (Static Stubs)
 */

import { generateChildInsightStatic } from '@/lib/ai/child-insights'

describe('AI Child Insights', () => {
  const mockChild = {
    name: 'Emma',
    age: 5,
    interests: ['drawing', 'stories', 'dinosaurs'],
    personality_traits: ['creative', 'curious', 'energetic'],
    current_challenges: ['sharing', 'bedtime routines'],
    strengths: ['imagination', 'empathy'],
    hobbies: ['painting', 'pretend play']
  }

  const mockCompletions = [
    { category: 'Creativity', reflection_note: 'She loved it!', completion_date: '2025-01-15' },
    { category: 'Creativity', reflection_note: '', completion_date: '2025-01-14' },
    { category: 'Conversation', reflection_note: 'Great talk', completion_date: '2025-01-13' },
    { category: 'Play', reflection_note: '', completion_date: '2025-01-12' },
    { category: 'Movement', reflection_note: '', completion_date: '2025-01-11' }
  ]

  describe('generateChildInsightStatic', () => {
    it('should return personality insight with all required fields', async () => {
      const result = await generateChildInsightStatic(mockChild, mockCompletions)

      expect(result.data.summary).toBeDefined()
      expect(result.data.strengths).toBeInstanceOf(Array)
      expect(result.data.challenges).toBeInstanceOf(Array)
      expect(result.data.recommendedActivities).toBeInstanceOf(Array)
      expect(result.data.learningStyle).toMatch(/visual|auditory|kinesthetic|mixed/)
      expect(result.data.loveLanguage).toMatch(/words|time|gifts|service|touch/)
      expect(result.data.confidence).toBeGreaterThanOrEqual(0)
      expect(result.data.confidence).toBeLessThanOrEqual(1)
    })

    it('should include child name in summary', async () => {
      const result = await generateChildInsightStatic(mockChild, mockCompletions)

      expect(result.data.summary).toContain('Emma')
    })

    it('should derive strengths from personality traits', async () => {
      // Use child without pre-defined strengths to test derivation
      const childWithoutStrengths = { ...mockChild, strengths: undefined }
      const result = await generateChildInsightStatic(childWithoutStrengths, mockCompletions)

      // Should include at least one personality trait in strengths (limited to 5 total)
      expect(result.data.strengths).toContain('creative')
      expect(result.data.strengths.length).toBeGreaterThan(0)
      expect(result.data.strengths.length).toBeLessThanOrEqual(5)
    })

    it('should recommend activities based on top categories', async () => {
      const result = await generateChildInsightStatic(mockChild, mockCompletions)

      expect(result.data.recommendedActivities.length).toBeGreaterThan(0)
      expect(result.data.recommendedActivities.length).toBeLessThanOrEqual(4)
    })

    it('should infer kinesthetic learning style from Creativity category', async () => {
      const creativityCompletions = Array(5).fill({
        category: 'Creativity',
        completion_date: '2025-01-15'
      })

      const result = await generateChildInsightStatic(mockChild, creativityCompletions)

      expect(result.data.learningStyle).toBe('kinesthetic')
    })

    it('should infer auditory learning style from Conversation category', async () => {
      const conversationCompletions = Array(5).fill({
        category: 'Conversation',
        completion_date: '2025-01-15'
      })

      const result = await generateChildInsightStatic(mockChild, conversationCompletions)

      expect(result.data.learningStyle).toBe('auditory')
    })

    it('should calculate confidence based on completion history', async () => {
      const tenCompletions = Array(10).fill({
        category: 'Play',
        completion_date: '2025-01-15'
      })

      const result = await generateChildInsightStatic(mockChild, tenCompletions)

      expect(result.data.confidence).toBe(1) // 10/10 = 1
    })

    it('should handle child with no completions', async () => {
      const result = await generateChildInsightStatic(mockChild, [])

      expect(result.data.summary).toBeDefined()
      expect(result.data.confidence).toBe(0)
      expect(result.data.recommendedActivities.length).toBeGreaterThan(0)
    })

    it('should use current challenges if provided', async () => {
      const result = await generateChildInsightStatic(mockChild, mockCompletions)

      expect(result.data.challenges).toEqual(mockChild.current_challenges)
    })

    it('should provide age-appropriate recommendations', async () => {
      const youngChild = { ...mockChild, age: 3 }
      const result = await generateChildInsightStatic(youngChild, [])

      const hasSensoryPlay = result.data.recommendedActivities.some(
        a => a.toLowerCase().includes('sensory')
      )
      expect(hasSensoryPlay).toBe(true)
    })

    it('should default to "time" love language for children', async () => {
      const childWithoutTraits = {
        ...mockChild,
        personality_traits: []
      }

      const result = await generateChildInsightStatic(childWithoutTraits, [])

      expect(result.data.loveLanguage).toBe('time')
    })

    it('should mark as not AI-generated (static stub)', async () => {
      const result = await generateChildInsightStatic(mockChild, mockCompletions)

      expect(result.isAIGenerated).toBe(false)
      expect(result.estimatedCost).toBe(0)
    })
  })
})
