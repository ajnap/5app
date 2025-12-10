'use client'

import { useState } from 'react'
import type { FamilyGoal, GoalCompletion, GOAL_CATEGORIES } from '@/lib/goals/types'

interface GoalCardProps {
  goal: FamilyGoal
  todayCompletion?: GoalCompletion
  isKidView: boolean
  onComplete: () => void
  onDelete: () => void
  isLoading: boolean
  style?: React.CSSProperties
}

// Category metadata
const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
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

// Goal type labels
const GOAL_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  habit: { label: 'Habit', icon: '🔄' },
  one_time: { label: 'One-Time', icon: '🎯' },
  learning: { label: 'Learning', icon: '📖' },
  streak: { label: 'Streak', icon: '🔥' },
}

export default function GoalCard({
  goal,
  todayCompletion,
  isKidView,
  onComplete,
  onDelete,
  isLoading,
  style,
}: GoalCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const category = CATEGORY_META[goal.category] || CATEGORY_META.other
  const goalType = GOAL_TYPE_LABELS[goal.goal_type] || GOAL_TYPE_LABELS.habit

  // Calculate progress percentage
  const progressPercent = goal.target_count > 0
    ? Math.min(100, Math.round((goal.current_count / goal.target_count) * 100))
    : 0

  // Check if completed today
  const completedToday = todayCompletion && todayCompletion.count >= (goal.goal_type === 'habit' ? goal.target_count : 1)

  // Calculate days remaining for deadline goals
  const daysRemaining = goal.target_date
    ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Determine status color
  const getStatusColor = () => {
    if (completedToday) return 'bg-green-100 border-green-300'
    if (daysRemaining !== null && daysRemaining < 0) return 'bg-red-50 border-red-200'
    if (daysRemaining !== null && daysRemaining <= 3) return 'bg-amber-50 border-amber-200'
    return 'bg-white border-slate-200'
  }

  // Kid-friendly card
  if (isKidView) {
    return (
      <div
        className={`rounded-2xl p-5 border-2 shadow-lg transition-all hover:shadow-xl fade-in-up ${getStatusColor()}`}
        style={{
          ...style,
          borderLeftWidth: '6px',
          borderLeftColor: goal.color || category.color,
        }}
      >
        {/* Header with big icon */}
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md"
            style={{ backgroundColor: `${goal.color || category.color}20` }}
          >
            {goal.icon || category.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-800 truncate">{goal.title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{category.label}</p>

            {/* Streak display for kids */}
            {goal.current_streak > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-lg">🔥</span>
                <span className="text-orange-600 font-bold">{goal.current_streak} day streak!</span>
              </div>
            )}
          </div>

          {/* Completion status */}
          {completedToday && (
            <div className="text-4xl animate-bounce">⭐</div>
          )}
        </div>

        {/* Big progress bar for kids */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">
              {goal.current_count} / {goal.target_count}
            </span>
            <span className="text-sm font-bold" style={{ color: goal.color || category.color }}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: goal.color || category.color,
              }}
            />
          </div>
        </div>

        {/* Big action button for kids */}
        <button
          onClick={onComplete}
          disabled={isLoading || completedToday}
          className={`mt-4 w-full py-4 rounded-xl font-bold text-lg transition-all ${
            completedToday
              ? 'bg-green-100 text-green-700 cursor-default'
              : isLoading
              ? 'bg-slate-200 text-slate-400 cursor-wait'
              : 'bg-gradient-to-r from-lavender-500 to-purple-600 text-white hover:shadow-lg active:scale-95'
          }`}
        >
          {completedToday ? (
            <span className="flex items-center justify-center gap-2">
              <span>Done!</span>
              <span className="text-2xl">🎉</span>
            </span>
          ) : isLoading ? (
            'Saving...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>I Did It!</span>
              <span className="text-2xl">✨</span>
            </span>
          )}
        </button>
      </div>
    )
  }

  // Adult card (more compact)
  return (
    <div
      className={`rounded-xl p-4 border shadow-sm transition-all hover:shadow-md fade-in-up ${getStatusColor()}`}
      style={{
        ...style,
        borderLeftWidth: '4px',
        borderLeftColor: goal.color || category.color,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: `${goal.color || category.color}15` }}
        >
          {goal.icon || category.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 truncate">{goal.title}</h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${goal.color || category.color}15`,
                color: goal.color || category.color,
              }}
            >
              {goalType.icon} {goalType.label}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
            <span>{category.label}</span>
            {goal.current_streak > 0 && (
              <span className="flex items-center gap-1 text-orange-600 font-medium">
                🔥 {goal.current_streak}
              </span>
            )}
            {daysRemaining !== null && (
              <span className={daysRemaining <= 3 ? 'text-red-600 font-medium' : ''}>
                {daysRemaining > 0 ? `${daysRemaining}d left` : daysRemaining === 0 ? 'Due today' : 'Overdue'}
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
            title={showDetails ? 'Hide details' : 'Show details'}
          >
            <svg
              className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500">
            {goal.current_count} / {goal.target_count} per {goal.target_frequency}
          </span>
          <span className="text-xs font-medium" style={{ color: goal.color || category.color }}>
            {progressPercent}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: goal.color || category.color,
            }}
          />
        </div>
      </div>

      {/* Action buttons row */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onComplete}
          disabled={isLoading}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
            completedToday
              ? 'bg-green-100 text-green-700'
              : isLoading
              ? 'bg-slate-100 text-slate-400'
              : 'bg-lavender-500 text-white hover:bg-lavender-600'
          }`}
        >
          {completedToday ? '✓ Done today' : isLoading ? 'Saving...' : '+ Log completion'}
        </button>

        {todayCompletion && todayCompletion.count > 0 && !completedToday && (
          <span className="text-xs text-slate-400">
            ({todayCompletion.count}x today)
          </span>
        )}
      </div>

      {/* Expandable details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          {goal.description && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Description</p>
              <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
            </div>
          )}

          {goal.why_it_matters && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Why it matters</p>
              <p className="text-sm text-slate-600 mt-1">{goal.why_it_matters}</p>
            </div>
          )}

          {goal.reward && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Reward</p>
              <p className="text-sm text-slate-600 mt-1">🏆 {goal.reward}</p>
            </div>
          )}

          {goal.notes && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Notes</p>
              <p className="text-sm text-slate-600 mt-1">{goal.notes}</p>
            </div>
          )}

          {/* Best streak */}
          {goal.best_streak > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>🏅 Best streak: {goal.best_streak} days</span>
            </div>
          )}

          {/* Delete button */}
          <button
            onClick={onDelete}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Delete goal
          </button>
        </div>
      )}
    </div>
  )
}
