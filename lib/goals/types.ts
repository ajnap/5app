// Types for the Family Goals system

export type GoalCategory =
  | 'school'
  | 'chores'
  | 'spiritual'
  | 'health'
  | 'money'
  | 'fun'
  | 'relationship'
  | 'learning'
  | 'habit'
  | 'other'

export type GoalType = 'habit' | 'one_time' | 'learning' | 'streak'

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived'

export type FamilyMemberType = 'self' | 'spouse' | 'child' | 'family'

export interface FamilyGoal {
  id: string
  user_id: string
  member_type: FamilyMemberType
  child_id: string | null
  title: string
  description: string | null
  category: GoalCategory
  goal_type: GoalType
  icon: string
  color: string
  target_count: number
  target_frequency: string
  target_date: string | null
  current_count: number
  current_streak: number
  best_streak: number
  status: GoalStatus
  why_it_matters: string | null
  reward: string | null
  notes: string | null
  linked_member_ids: string[] | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface GoalTask {
  id: string
  goal_id: string
  user_id: string
  title: string
  description: string | null
  is_recurring: boolean
  recurrence_pattern: string | null
  scheduled_date: string | null
  scheduled_time: string | null
  is_completed: boolean
  completed_at: string | null
  completed_by: string | null
  requires_approval: boolean
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface GoalCompletion {
  id: string
  goal_id: string
  user_id: string
  completion_date: string
  count: number
  notes: string | null
  milestone_reached: string | null
  created_at: string
}

export interface GoalReflection {
  id: string
  user_id: string
  week_start: string
  week_end: string
  what_went_well: string | null
  what_was_hard: string | null
  next_week_focus: string | null
  overall_rating: number | null
  created_at: string
  updated_at: string
}

export interface GoalMilestone {
  id: string
  goal_id: string
  user_id: string
  milestone_type: string
  milestone_value: number | null
  celebrated: boolean
  celebration_type: string | null
  celebration_note: string | null
  photo_url: string | null
  achieved_at: string
  celebrated_at: string | null
}

// Extended types with computed properties
export interface FamilyGoalWithProgress extends FamilyGoal {
  progress_percentage: number
  days_remaining: number | null
  is_on_track: boolean
  today_completed: boolean
  child_name?: string // For child goals
}

// Goal templates for easy creation
export interface GoalTemplate {
  id: string
  title: string
  category: GoalCategory
  goal_type: GoalType
  icon: string
  color: string
  description: string
  suggested_target: number
  suggested_frequency: string
  for_member_types: FamilyMemberType[]
}

// Category metadata
export const GOAL_CATEGORIES: Record<GoalCategory, { label: string; icon: string; color: string }> = {
  school: { label: 'School', icon: '📚', color: '#3B82F6' },
  chores: { label: 'Chores', icon: '🧹', color: '#10B981' },
  spiritual: { label: 'Spiritual', icon: '🙏', color: '#8B5CF6' },
  health: { label: 'Health', icon: '💪', color: '#EF4444' },
  money: { label: 'Money', icon: '💰', color: '#F59E0B' },
  fun: { label: 'Fun', icon: '🎉', color: '#EC4899' },
  relationship: { label: 'Relationship', icon: '❤️', color: '#F43F5E' },
  learning: { label: 'Learning', icon: '🧠', color: '#6366F1' },
  habit: { label: 'Habit', icon: '🔄', color: '#14B8A6' },
  other: { label: 'Other', icon: '🎯', color: '#6B7280' },
}

// Goal type metadata
export const GOAL_TYPES: Record<GoalType, { label: string; description: string; icon: string }> = {
  habit: {
    label: 'Habit Goal',
    description: 'Do something regularly (X times per week)',
    icon: '🔄',
  },
  one_time: {
    label: 'One-Time Goal',
    description: 'Complete a specific task by a date',
    icon: '🎯',
  },
  learning: {
    label: 'Learning Goal',
    description: 'Practice a skill or learn something new',
    icon: '📖',
  },
  streak: {
    label: 'Streak Goal',
    description: 'Do something every day in a row',
    icon: '🔥',
  },
}

// Pre-built goal templates
export const GOAL_TEMPLATES: GoalTemplate[] = [
  // School templates
  {
    id: 'homework-daily',
    title: 'Complete Homework',
    category: 'school',
    goal_type: 'habit',
    icon: '📝',
    color: '#3B82F6',
    description: 'Finish homework every school day',
    suggested_target: 5,
    suggested_frequency: 'week',
    for_member_types: ['child'],
  },
  {
    id: 'reading-time',
    title: 'Daily Reading',
    category: 'school',
    goal_type: 'streak',
    icon: '📚',
    color: '#6366F1',
    description: 'Read for at least 20 minutes every day',
    suggested_target: 1,
    suggested_frequency: 'day',
    for_member_types: ['child', 'self'],
  },
  // Chores templates
  {
    id: 'make-bed',
    title: 'Make Bed',
    category: 'chores',
    goal_type: 'streak',
    icon: '🛏️',
    color: '#10B981',
    description: 'Make bed every morning',
    suggested_target: 1,
    suggested_frequency: 'day',
    for_member_types: ['child'],
  },
  {
    id: 'clean-room',
    title: 'Clean Room',
    category: 'chores',
    goal_type: 'habit',
    icon: '🧹',
    color: '#10B981',
    description: 'Keep room clean and organized',
    suggested_target: 2,
    suggested_frequency: 'week',
    for_member_types: ['child'],
  },
  // Spiritual templates
  {
    id: 'daily-prayer',
    title: 'Daily Prayer',
    category: 'spiritual',
    goal_type: 'streak',
    icon: '🙏',
    color: '#8B5CF6',
    description: 'Pray every day',
    suggested_target: 1,
    suggested_frequency: 'day',
    for_member_types: ['self', 'spouse', 'child', 'family'],
  },
  {
    id: 'scripture-study',
    title: 'Scripture Study',
    category: 'spiritual',
    goal_type: 'habit',
    icon: '📖',
    color: '#8B5CF6',
    description: 'Read scriptures together',
    suggested_target: 5,
    suggested_frequency: 'week',
    for_member_types: ['self', 'spouse', 'family'],
  },
  // Health templates
  {
    id: 'exercise',
    title: 'Exercise',
    category: 'health',
    goal_type: 'habit',
    icon: '🏃',
    color: '#EF4444',
    description: 'Get physical activity',
    suggested_target: 3,
    suggested_frequency: 'week',
    for_member_types: ['self', 'spouse', 'child'],
  },
  {
    id: 'drink-water',
    title: 'Drink Water',
    category: 'health',
    goal_type: 'habit',
    icon: '💧',
    color: '#0EA5E9',
    description: 'Stay hydrated throughout the day',
    suggested_target: 8,
    suggested_frequency: 'day',
    for_member_types: ['self', 'spouse', 'child'],
  },
  // Fun/Relationship templates
  {
    id: 'family-game-night',
    title: 'Family Game Night',
    category: 'fun',
    goal_type: 'habit',
    icon: '🎲',
    color: '#EC4899',
    description: 'Have a fun family game night',
    suggested_target: 1,
    suggested_frequency: 'week',
    for_member_types: ['family'],
  },
  {
    id: 'date-night',
    title: 'Date Night',
    category: 'relationship',
    goal_type: 'habit',
    icon: '💑',
    color: '#F43F5E',
    description: 'Quality time with spouse',
    suggested_target: 2,
    suggested_frequency: 'month',
    for_member_types: ['self', 'spouse'],
  },
  {
    id: 'one-on-one',
    title: 'One-on-One Time',
    category: 'relationship',
    goal_type: 'habit',
    icon: '👨‍👧',
    color: '#F43F5E',
    description: 'Individual time with each child',
    suggested_target: 1,
    suggested_frequency: 'week',
    for_member_types: ['self', 'spouse'],
  },
  // Learning templates
  {
    id: 'practice-instrument',
    title: 'Practice Instrument',
    category: 'learning',
    goal_type: 'habit',
    icon: '🎹',
    color: '#6366F1',
    description: 'Practice musical instrument',
    suggested_target: 5,
    suggested_frequency: 'week',
    for_member_types: ['child'],
  },
  {
    id: 'learn-skill',
    title: 'Learn New Skill',
    category: 'learning',
    goal_type: 'one_time',
    icon: '🧠',
    color: '#6366F1',
    description: 'Master a new skill or hobby',
    suggested_target: 1,
    suggested_frequency: 'month',
    for_member_types: ['self', 'spouse', 'child'],
  },
  // Money templates
  {
    id: 'save-money',
    title: 'Save Money',
    category: 'money',
    goal_type: 'habit',
    icon: '🐷',
    color: '#F59E0B',
    description: 'Put money in savings',
    suggested_target: 1,
    suggested_frequency: 'week',
    for_member_types: ['self', 'spouse', 'child'],
  },
]

// Helper to get today's date string
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// Calculate progress percentage
export function calculateProgress(goal: FamilyGoal): number {
  if (goal.goal_type === 'one_time') {
    return goal.status === 'completed' ? 100 : 0
  }

  if (goal.target_count === 0) return 0
  return Math.min(100, Math.round((goal.current_count / goal.target_count) * 100))
}

// Calculate days remaining for deadline goals
export function calculateDaysRemaining(targetDate: string | null): number | null {
  if (!targetDate) return null

  const target = new Date(targetDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// Check if goal is on track
export function isGoalOnTrack(goal: FamilyGoal): boolean {
  if (goal.status !== 'active') return true

  if (goal.target_date) {
    const daysRemaining = calculateDaysRemaining(goal.target_date)
    if (daysRemaining !== null && daysRemaining < 0) return false
  }

  // For habit goals, check if current count meets expected progress
  const progress = calculateProgress(goal)
  return progress >= 50 // Simple heuristic: at least 50% progress
}
