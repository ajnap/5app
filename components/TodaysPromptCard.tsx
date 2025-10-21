'use client'

interface Prompt {
  id: string
  title: string
  description: string
  activity: string
  category: string
  age_categories: string[]
  tags: string[]
}

interface TodaysPromptCardProps {
  prompt: Prompt | null
  childName: string
  childAge: number
  completedToday: boolean
  onMarkComplete: () => void
}

export default function TodaysPromptCard({
  prompt,
  childName,
  childAge,
  completedToday,
  onMarkComplete,
}: TodaysPromptCardProps) {
  if (!prompt) {
    return (
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 fade-in">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No prompt available
          </h3>
          <p className="text-gray-600">
            Select a child to see today's connection moment
          </p>
        </div>
      </div>
    )
  }

  // Category colors
  const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
    spiritual: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
    emotional: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
    physical: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
    academic: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
    social: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
    fun: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
    adventure: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' },
  }

  const categoryStyle = categoryColors[prompt.category.toLowerCase()] || categoryColors.fun

  // Estimated time - simple heuristic based on description length
  const estimatedMinutes = prompt.activity.length > 200 ? '10-15 min' : '5-10 min'

  if (completedToday) {
    return (
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 fade-in">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            You did it!
          </h3>
          <p className="text-green-700 text-lg mb-1">
            You connected with {childName} today
          </p>
          <p className="text-green-600 text-sm">
            Tomorrow brings a new opportunity to create meaningful moments
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-gradient-to-br from-white to-blue-50 border-4 border-primary-200 hover:border-primary-300 transition-all duration-300 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-2">
            Today's Connection Moment
          </h2>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {prompt.title}
          </h3>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} border-2`}>
          {prompt.category}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border-2 border-gray-300">
          ⏱️ {estimatedMinutes}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border-2 border-blue-300">
          Age {childAge} • {childName}
        </span>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          {prompt.description}
        </p>
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Activity:</h4>
          <p className="text-gray-700 leading-relaxed">
            {prompt.activity}
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onMarkComplete}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
      >
        Mark as Complete
      </button>

      {/* Encouragement */}
      <p className="text-center text-sm text-gray-600 mt-4">
        This moment will create a lasting memory for {childName} ❤️
      </p>
    </div>
  )
}
