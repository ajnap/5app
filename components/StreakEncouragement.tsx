'use client'

interface StreakEncouragementProps {
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  completedToday: boolean
  streakBroken?: boolean
}

export default function StreakEncouragement({
  currentStreak,
  longestStreak,
  totalCompletions,
  completedToday,
  streakBroken = false,
}: StreakEncouragementProps) {
  // Milestone messages
  const getMilestoneMessage = (streak: number): string | null => {
    if (streak >= 90) return "Three months of showing up for your child! 🌟"
    if (streak >= 60) return "Your consistency is inspiring! 💫"
    if (streak >= 30) return "One month of building something beautiful! 🎨"
    if (streak >= 14) return "Two weeks of intentional moments! 🌱"
    if (streak >= 7) return "A full week of connection! 🎉"
    return null
  }

  const milestoneMessage = getMilestoneMessage(currentStreak)
  const isNewRecord = currentStreak > 0 && currentStreak === longestStreak && currentStreak > 1

  // Broken streak message
  if (streakBroken && totalCompletions > 0) {
    return (
      <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 fade-in">
        <div className="text-center py-6">
          <div className="text-5xl mb-4">💛</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            That's okay—what matters is showing up
          </h3>
          <p className="text-gray-700 mb-4">
            Your <span className="font-bold text-primary-700">{totalCompletions}</span> total activities show your heart for connection.
          </p>
          <p className="text-gray-600 text-sm">
            Every day is a new beginning. You've got this! 🌅
          </p>
        </div>
      </div>
    )
  }

  // No streak yet
  if (currentStreak === 0 && totalCompletions === 0) {
    return (
      <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 fade-in">
        <div className="text-center py-6">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Your journey begins today!
          </h3>
          <p className="text-gray-700">
            Complete your first activity to start building meaningful moments
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Current Streak Card */}
      <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 fade-in">
        <div className="flex items-center gap-4">
          <div className="text-6xl">🔥</div>
          <div className="flex-1">
            <p className="text-4xl font-bold text-orange-900">{currentStreak}</p>
            <p className="text-orange-700 font-medium text-lg">Day Streak</p>
            {completedToday && currentStreak > 0 && (
              <p className="text-sm text-orange-600 mt-1">Keep it going!</p>
            )}
            {!completedToday && currentStreak > 0 && (
              <p className="text-sm text-orange-600 mt-1">Complete today's activity to continue</p>
            )}
          </div>
        </div>
      </div>

      {/* Milestone Message */}
      {milestoneMessage && (
        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 fade-in">
          <div className="text-center py-4">
            <p className="text-lg font-semibold text-purple-900">{milestoneMessage}</p>
          </div>
        </div>
      )}

      {/* New Record */}
      {isNewRecord && (
        <div className="card bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 fade-in">
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-lg font-semibold text-yellow-900">
              New personal record!
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50">
          <p className="text-sm text-green-700 font-medium mb-1">Total Activities</p>
          <p className="text-3xl font-bold text-green-900">{totalCompletions}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
          <p className="text-sm text-blue-700 font-medium mb-1">Longest Streak</p>
          <p className="text-3xl font-bold text-blue-900">{longestStreak}</p>
        </div>
      </div>

      {/* Encouragement */}
      <div className="card bg-gradient-to-br from-pink-50 to-rose-50">
        <p className="text-center text-gray-700 text-sm">
          You're building a habit of intentional connection. Every moment counts! ❤️
        </p>
      </div>
    </div>
  )
}
