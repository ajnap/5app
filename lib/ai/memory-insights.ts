/**
 * AI-Powered Memory Insights (Static Stubs)
 *
 * TODO: Replace with OpenAI API integration
 * Estimated cost per call: $0.001-0.003 (using gpt-4o-mini)
 * Token estimate: 200-400 tokens per summary
 */

import type { MemorySummary, WeeklyMemoryDigest, AIInsightResponse } from './types'

/**
 * Generate a summary and insights for a memory entry
 *
 * @param content - The memory content text
 * @param childAge - Child's age for context
 * @returns Static mock summary (replace with OpenAI call)
 *
 * @example
 * ```typescript
 * const summary = await generateMemorySummaryStatic(
 *   "She built her first Lego castle today!",
 *   5
 * )
 * console.log(summary.suggestedTags) // ["achievement", "creativity", "lego"]
 * ```
 *
 * Future OpenAI integration:
 * ```typescript
 * const completion = await openai.chat.completions.create({
 *   model: 'gpt-4o-mini',
 *   messages: [{
 *     role: 'system',
 *     content: 'You are a parenting coach analyzing family memories...'
 *   }, {
 *     role: 'user',
 *     content: `Analyze this memory: "${content}". Child age: ${childAge}`
 *   }],
 *   max_tokens: 300,
 *   temperature: 0.7
 * })
 * // Parse JSON response into MemorySummary
 * ```
 */
export async function generateMemorySummaryStatic(
  content: string,
  childAge?: number
): Promise<AIInsightResponse<MemorySummary>> {
  // TODO: Replace with OpenAI API call
  // Simulated delay to mimic API call
  await new Promise(resolve => setTimeout(resolve, 100))

  // Static mock response
  const mockSummary: MemorySummary = {
    summary: 'A wonderful moment of creativity and achievement',
    suggestedTags: detectTagsFromContent(content),
    sentiment: detectSentiment(content),
    themes: ['play', 'learning', 'bonding'],
    tokensUsed: 0 // Set to actual when using OpenAI
  }

  return {
    data: mockSummary,
    isAIGenerated: false,
    generatedAt: new Date().toISOString(),
    estimatedCost: 0 // Will be ~$0.002 with OpenAI
  }
}

/**
 * Generate weekly digest of memories
 *
 * @param memories - Array of memory entries from the week
 * @param childName - Child's name for personalization
 * @returns Weekly summary with highlights
 *
 * TODO: Replace with OpenAI summarization
 * Estimated cost: $0.003-0.005 per digest (400-600 tokens)
 */
export async function generateWeeklyDigestStatic(
  memories: Array<{ content: string; entry_date: string }>,
  childName: string
): Promise<AIInsightResponse<WeeklyMemoryDigest>> {
  // TODO: Replace with OpenAI API call
  await new Promise(resolve => setTimeout(resolve, 150))

  const mockDigest: WeeklyMemoryDigest = {
    weekOf: new Date().toISOString().split('T')[0],
    memoryCount: memories.length,
    highlights: memories.slice(0, 3).map(m => m.content.slice(0, 100)),
    patterns: [
      `You spent quality time with ${childName} every day this week`,
      'Lots of creative play activities',
      'Growing independence and confidence'
    ],
    sentimentTrend: 'stable'
  }

  return {
    data: mockDigest,
    isAIGenerated: false,
    generatedAt: new Date().toISOString(),
    estimatedCost: 0 // Will be ~$0.004 with OpenAI
  }
}

// =====================================================
// Helper Functions (Used by stubs, keep for OpenAI too)
// =====================================================

/**
 * Detect tags from content using simple keyword matching
 * TODO: Enhance with OpenAI's better understanding
 */
function detectTagsFromContent(content: string): string[] {
  const lowerContent = content.toLowerCase()
  const tagMap: Record<string, string[]> = {
    'first-time': ['first', 'started', 'began', 'new'],
    'achievement': ['built', 'completed', 'finished', 'succeeded', 'won'],
    'funny': ['laugh', 'funny', 'giggle', 'hilarious', 'silly'],
    'creativity': ['drew', 'painted', 'built', 'created', 'made', 'designed'],
    'reading': ['read', 'book', 'story', 'library'],
    'outdoor': ['park', 'outside', 'garden', 'playground', 'walk'],
    'milestone': ['first', 'learned', 'started', 'began'],
    'bonding': ['together', 'cuddle', 'snuggle', 'talked', 'shared']
  }

  const detectedTags: string[] = []
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      detectedTags.push(tag)
    }
  }

  return detectedTags.slice(0, 5) // Limit to 5 tags
}

/**
 * Detect sentiment from content
 * TODO: Replace with OpenAI sentiment analysis
 */
function detectSentiment(content: string): 'positive' | 'neutral' | 'mixed' {
  const lowerContent = content.toLowerCase()
  const positiveWords = ['love', 'happy', 'amazing', 'wonderful', 'great', 'fun', 'joy']
  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length

  return positiveCount >= 2 ? 'positive' : 'neutral'
}
