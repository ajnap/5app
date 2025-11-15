// Types for the Smart Recommendations system

export interface RecommendationRequest {
  userId: string
  childId: string
  faithMode: boolean
  limit?: number // Default: 5
}

export interface RecommendationReason {
  type: 'category_balance' | 'engagement' | 'challenge_match' | 'interest_match' | 'popular' | 'starter'
  message: string // Human-readable explanation
  weight: number // Contribution to final score (0-1)
}

export interface ScoredPrompt {
  prompt: Prompt
  score: number
  reasons: RecommendationReason[]
}

export interface RecommendationResult {
  childId: string
  recommendations: ScoredPrompt[]
  metadata: {
    totalCompletions: number
    categoryDistribution: Record<string, number>
    timestamp: string
    cacheKey: string
  }
}

export interface CategoryStats {
  category: string
  count: number
  percentage: number
  lastCompleted: Date | null
  avgDuration: number | null
  hasReflectionNotes: boolean
}

export interface CategoryDistribution {
  stats: CategoryStats[]
  totalCompletions: number
  underrepresented: string[] // < 10% of completions
  overrepresented: string[] // > 30% of completions
  neglected: string[] // Not completed in 14+ days
}

export interface ScoreWeights {
  categoryBalance: number // Default: 0.70
  engagement: number // Default: 0.20
  filters: number // Default: 0.10
}

export interface ScoreComponents {
  categoryScore: number
  engagementScore: number
  filterScore: number
  totalScore: number
  reasons: RecommendationReason[]
}

// Extend existing app types
export interface Prompt {
  id: string
  title: string
  description: string
  activity: string
  category: string
  age_categories: string[]
  tags: string[]
  estimated_minutes: number
  created_at: string
}

export interface Completion {
  id: string
  user_id: string
  prompt_id: string
  child_id: string | null
  completed_at: string
  completion_date: string
  reflection_note: string | null
  duration_seconds: number | null
  created_at: string
  prompt?: Prompt
}

export interface Child {
  id: string
  user_id: string
  name: string
  birth_date: string
  age: number
  interests: string[]
  personality_traits: string[]
  current_challenges: string[]
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  prompt_id: string
  created_at: string
}

// Child-Centric Dashboard Types
export interface ConnectionInsights {
  weeklyMinutes: number
  monthlyMinutes: number
  totalCompletions: number
  currentStreak: number
  favoriteCategories: { category: string; count: number }[]
  categoryDistribution: { category: string; percentage: number }[]
  lastCompletionDate?: string
}

export interface PersonalizedTip {
  id: string
  type: 'developmental' | 'category_balance' | 'engagement' | 'streak' | 're_engagement'
  message: string
  priority: number
  icon: string
}
