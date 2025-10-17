'use client'

import Link from 'next/link'

interface ChildCardProps {
  child: {
    id: string
    name: string
    birth_date: string
    age: number
    interests?: string[]
    personality_traits?: string[]
  }
  index: number
}

export default function ChildCard({ child, index }: ChildCardProps) {
  // Get age category for display
  const getAgeCategory = (age: number) => {
    if (age < 2) return 'Infant'
    if (age < 5) return 'Toddler'
    if (age < 12) return 'Elementary'
    if (age < 18) return 'Teen'
    return 'Young Adult'
  }

  // Get emoji based on age
  const getAgeEmoji = (age: number) => {
    if (age < 2) return '👶'
    if (age < 5) return '🧒'
    if (age < 12) return '🧑'
    if (age < 18) return '👦'
    return '🧑‍🎓'
  }

  return (
    <Link href={`/children/${child.id}`}>
      <div
        className="card hover:scale-105 transition-all duration-300 cursor-pointer slide-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Child Icon */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">{getAgeEmoji(child.age)}</div>
          <h3 className="text-2xl font-bold text-gray-900">{child.name}</h3>
          <p className="text-gray-600">{child.age} years old • {getAgeCategory(child.age)}</p>
        </div>

        {/* Interests */}
        {child.interests && child.interests.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Interests:</p>
            <div className="flex flex-wrap gap-2">
              {child.interests.slice(0, 3).map((interest, i) => (
                <span
                  key={i}
                  className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {interest}
                </span>
              ))}
              {child.interests.length > 3 && (
                <span className="text-xs text-gray-500">+{child.interests.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Personality Traits */}
        {child.personality_traits && child.personality_traits.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Personality:</p>
            <div className="flex flex-wrap gap-2">
              {child.personality_traits.slice(0, 2).map((trait, i) => (
                <span
                  key={i}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Edit CTA */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-primary-600 font-medium text-center">
            Click to edit →
          </p>
        </div>
      </div>
    </Link>
  )
}
