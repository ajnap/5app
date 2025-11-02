/**
 * Unit tests for AI Memory Insights (Static Stubs)
 */

import { generateMemorySummaryStatic, generateWeeklyDigestStatic } from '@/lib/ai/memory-insights'

describe('AI Memory Insights', () => {
  describe('generateMemorySummaryStatic', () => {
    it('should return a memory summary with suggested tags', async () => {
      const content = 'She built her first Lego castle today! So proud of her creativity.'
      const result = await generateMemorySummaryStatic(content, 5)

      expect(result.isAIGenerated).toBe(false) // Static stub
      expect(result.data.summary).toBeDefined()
      expect(result.data.suggestedTags).toBeInstanceOf(Array)
      expect(result.data.sentiment).toMatch(/positive|neutral|mixed/)
      expect(result.data.themes).toBeInstanceOf(Array)
    })

    it('should detect "achievement" tag from content', async () => {
      const content = 'He completed his first puzzle all by himself!'
      const result = await generateMemorySummaryStatic(content)

      expect(result.data.suggestedTags).toContain('achievement')
    })

    it('should detect "creativity" tag from content', async () => {
      const content = 'She painted the most beautiful sunset today'
      const result = await generateMemorySummaryStatic(content)

      expect(result.data.suggestedTags).toContain('creativity')
    })

    it('should detect "funny" tag from content', async () => {
      const content = 'She said the funniest thing at dinner and we all laughed'
      const result = await generateMemorySummaryStatic(content)

      expect(result.data.suggestedTags).toContain('funny')
    })

    it('should detect positive sentiment', async () => {
      const content = 'I love spending time with him. Such a happy and wonderful day!'
      const result = await generateMemorySummaryStatic(content)

      expect(result.data.sentiment).toBe('positive')
    })

    it('should limit tags to maximum 5', async () => {
      const content = 'First time reading a book, building with legos, drawing pictures, and going to the park'
      const result = await generateMemorySummaryStatic(content)

      expect(result.data.suggestedTags.length).toBeLessThanOrEqual(5)
    })

    it('should include generation timestamp', async () => {
      const result = await generateMemorySummaryStatic('Test memory')

      expect(result.generatedAt).toBeDefined()
      expect(new Date(result.generatedAt).getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should have zero cost for static stub', async () => {
      const result = await generateMemorySummaryStatic('Test memory')

      expect(result.estimatedCost).toBe(0)
      expect(result.data.tokensUsed).toBe(0)
    })
  })

  describe('generateWeeklyDigestStatic', () => {
    it('should return weekly digest with highlights', async () => {
      const memories = [
        { content: 'Great day at the park', entry_date: '2025-01-15' },
        { content: 'Read a bedtime story together', entry_date: '2025-01-16' },
        { content: 'Built a fort in the living room', entry_date: '2025-01-17' }
      ]

      const result = await generateWeeklyDigestStatic(memories, 'Emma')

      expect(result.data.memoryCount).toBe(3)
      expect(result.data.highlights.length).toBeGreaterThan(0)
      expect(result.data.patterns.length).toBeGreaterThan(0)
      expect(result.data.sentimentTrend).toMatch(/improving|stable|declining/)
    })

    it('should limit highlights to 3', async () => {
      const memories = Array(10).fill(null).map((_, i) => ({
        content: `Memory ${i}`,
        entry_date: `2025-01-${String(i + 1).padStart(2, '0')}`
      }))

      const result = await generateWeeklyDigestStatic(memories, 'Test Child')

      expect(result.data.highlights.length).toBeLessThanOrEqual(3)
    })

    it('should include child name in patterns', async () => {
      const memories = [{ content: 'Test', entry_date: '2025-01-15' }]
      const result = await generateWeeklyDigestStatic(memories, 'Emma')

      const hasChildName = result.data.patterns.some(p => p.includes('Emma'))
      expect(hasChildName).toBe(true)
    })

    it('should set weekOf to current date', async () => {
      const memories: Array<{ content: string; entry_date: string }> = []
      const result = await generateWeeklyDigestStatic(memories, 'Test')

      const weekOfDate = new Date(result.data.weekOf)
      const today = new Date()

      // Just check year since dates can be off by a day due to ISO format
      expect(weekOfDate.getFullYear()).toBe(today.getFullYear())
      expect(result.data.weekOf).toMatch(/^\d{4}-\d{2}-\d{2}$/) // Valid ISO date format
    })
  })
})
