/**
 * Type definitions for AI-powered insights
 * These interfaces define the shape of AI-generated content
 */

export interface MemorySummary {
  /** Brief summary of the memory */
  summary: string
  /** Suggested tags based on content */
  suggestedTags: string[]
  /** Detected sentiment (positive, neutral, mixed) */
  sentiment: 'positive' | 'neutral' | 'mixed'
  /** Key themes identified */
  themes: string[]
  /** Estimated tokens used (for future OpenAI cost tracking) */
  tokensUsed?: number
}

export interface ChildPersonalityInsight {
  /** Overall personality summary */
  summary: string
  /** Identified strengths */
  strengths: string[]
  /** Growth areas */
  challenges: string[]
  /** Recommended activities based on personality */
  recommendedActivities: string[]
  /** Learning style assessment */
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  /** Detected love language */
  loveLanguage: 'words' | 'time' | 'gifts' | 'service' | 'touch'
  /** Confidence level (0-1) */
  confidence: number
  /** Estimated tokens used */
  tokensUsed?: number
}

export interface WeeklyMemoryDigest {
  /** Week identifier */
  weekOf: string
  /** Total memories this week */
  memoryCount: number
  /** Highlighted memories */
  highlights: string[]
  /** Patterns observed */
  patterns: string[]
  /** Sentiment trend */
  sentimentTrend: 'improving' | 'stable' | 'declining'
  /** Estimated tokens used */
  tokensUsed?: number
}

export interface AIInsightRequest {
  /** User ID for rate limiting */
  userId: string
  /** Child ID for context */
  childId?: string
  /** Request type for tracking */
  type: 'memory-summary' | 'child-insight' | 'weekly-digest'
}

export interface AIInsightResponse<T> {
  /** Generated insight data */
  data: T
  /** Whether this was AI-generated or static mock */
  isAIGenerated: boolean
  /** Timestamp of generation */
  generatedAt: string
  /** Estimated cost in USD (for OpenAI calls) */
  estimatedCost?: number
}
