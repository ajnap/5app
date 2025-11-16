'use client'

import type { PersonalizedTip } from '@/lib/recommendations/types'

interface PersonalizedTipsProps {
  tips: PersonalizedTip[]
  childName: string
}

const TIP_TYPE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  developmental: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-900'
  },
  category_balance: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-900'
  },
  engagement: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-300',
    text: 'text-green-900'
  },
  streak: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-900'
  },
  re_engagement: {
    bg: 'bg-gradient-to-br from-pink-50 to-pink-100',
    border: 'border-pink-300',
    text: 'text-pink-900'
  }
}

export default function PersonalizedTips({ tips, childName }: PersonalizedTipsProps) {
  if (tips.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-primary-200 shadow-lg p-6 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personalized Tips</h2>
        <p className="text-gray-600">
          Insights and suggestions for connecting with {childName}
        </p>
      </div>

      {/* Tips List */}
      <div className="space-y-3">
        {tips.map((tip) => {
          const style = TIP_TYPE_STYLES[tip.type] || TIP_TYPE_STYLES.engagement

          return (
            <div
              key={tip.id}
              className={`${style.bg} ${style.border} border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">{tip.icon}</div>

                {/* Content */}
                <div className="flex-1">
                  <p className={`${style.text} font-medium leading-relaxed`}>
                    {tip.message}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Note */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 italic">
          💡 Tips are personalized based on {childName}'s age, interests, and your connection patterns
        </p>
      </div>
    </div>
  )
}
