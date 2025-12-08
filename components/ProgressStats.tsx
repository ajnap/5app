'use client'

import { useState } from 'react'

interface ProgressStatsProps {
  currentStreak: number
  totalCompletions: number
  weeklyMinutes: number
  monthlyMinutes: number
}

export default function ProgressStats({
  currentStreak,
  totalCompletions,
  weeklyMinutes,
  monthlyMinutes
}: ProgressStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Don't show if no progress yet
  if (currentStreak === 0 && totalCompletions === 0) {
    return null
  }

  return (
    <div className="mt-8 fade-in-up delay-200">
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-cream-50 hover:bg-cream-100 rounded-xl border border-cream-200 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📊</span>
          <span className="font-medium text-slate-700 text-sm">Your Progress</span>
          {/* Quick preview when collapsed */}
          {!isExpanded && (
            <div className="hidden sm:flex items-center gap-3 ml-2 text-xs text-slate-500">
              {currentStreak > 0 && (
                <span className="flex items-center gap-1">
                  <span>🔥</span> {currentStreak} day streak
                </span>
              )}
              {totalCompletions > 0 && (
                <span className="flex items-center gap-1">
                  <span>✅</span> {totalCompletions} activities
                </span>
              )}
            </div>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Streak */}
          <div className="bg-white rounded-xl p-4 border border-cream-200 text-center">
            <div className="text-2xl mb-1">
              {currentStreak > 0 ? '🔥' : '🌱'}
            </div>
            <p className="font-bold text-xl text-slate-900">{currentStreak}</p>
            <p className="text-xs text-slate-500">Day Streak</p>
          </div>

          {/* Total Completions */}
          <div className="bg-white rounded-xl p-4 border border-cream-200 text-center">
            <div className="text-2xl mb-1">✅</div>
            <p className="font-bold text-xl text-slate-900">{totalCompletions}</p>
            <p className="text-xs text-slate-500">Activities</p>
          </div>

          {/* Weekly Time */}
          <div className="bg-white rounded-xl p-4 border border-cream-200 text-center">
            <div className="text-2xl mb-1">⏱️</div>
            <p className="font-bold text-xl text-slate-900">{weeklyMinutes}</p>
            <p className="text-xs text-slate-500">Min This Week</p>
          </div>

          {/* Monthly Time */}
          <div className="bg-white rounded-xl p-4 border border-cream-200 text-center">
            <div className="text-2xl mb-1">📅</div>
            <p className="font-bold text-xl text-slate-900">{monthlyMinutes}</p>
            <p className="text-xs text-slate-500">Min This Month</p>
          </div>
        </div>
      </div>
    </div>
  )
}
