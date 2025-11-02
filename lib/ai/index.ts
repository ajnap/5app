/**
 * AI Insights Module
 *
 * This module provides AI-powered insights for memories and child profiles.
 * Currently returns static mock data - designed for future OpenAI integration.
 *
 * Usage:
 * ```typescript
 * import { generateMemorySummaryStatic, generateChildInsightStatic } from '@/lib/ai'
 *
 * const summary = await generateMemorySummaryStatic(memoryContent, childAge)
 * const insight = await generateChildInsightStatic(childData, completions)
 * ```
 */

export {
  generateMemorySummaryStatic,
  generateWeeklyDigestStatic
} from './memory-insights'

export {
  generateChildInsightStatic,
  refreshChildInsight
} from './child-insights'

export type {
  MemorySummary,
  ChildPersonalityInsight,
  WeeklyMemoryDigest,
  AIInsightRequest,
  AIInsightResponse
} from './types'
