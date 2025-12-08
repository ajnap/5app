'use client'

import { useState } from 'react'

interface ActionPromptProps {
  onConnectClick: () => void
  onMemoryClick: () => void
  onProgressClick: () => void
  hasChildren: boolean
}

export default function ActionPrompt({
  onConnectClick,
  onMemoryClick,
  onProgressClick,
  hasChildren
}: ActionPromptProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  const actions = [
    {
      id: 'connect',
      icon: '💝',
      label: 'Connect with a Child',
      description: 'Start a 5-minute activity',
      primary: true,
      onClick: onConnectClick,
      disabled: !hasChildren
    },
    {
      id: 'memory',
      icon: '📷',
      label: 'Add a Memory',
      description: 'Capture a special moment',
      primary: false,
      onClick: onMemoryClick,
      disabled: !hasChildren
    },
    {
      id: 'progress',
      icon: '📊',
      label: 'View Progress',
      description: 'See your journey',
      primary: false,
      onClick: onProgressClick,
      disabled: false
    }
  ]

  return (
    <div className="mb-8 fade-in-up">
      {/* Question prompt */}
      <p className="text-slate-600 text-lg mb-5 font-medium">
        What would you like to do?
      </p>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
            className={`
              relative group text-left p-4 rounded-2xl border-2 transition-all duration-300
              ${action.disabled
                ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                : action.primary
                  ? 'bg-gradient-to-br from-lavender-50 to-peach-50 border-lavender-300 hover:border-lavender-400 hover:shadow-lg hover:-translate-y-1'
                  : 'bg-white border-cream-300 hover:border-lavender-300 hover:shadow-md hover:-translate-y-0.5'
              }
              ${action.primary && !action.disabled ? 'ring-2 ring-lavender-200 ring-offset-2' : ''}
            `}
          >
            {/* Primary badge */}
            {action.primary && !action.disabled && (
              <span className="absolute -top-2 -right-2 bg-lavender-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                Start here
              </span>
            )}

            <div className="flex items-start gap-3">
              <span
                className={`text-2xl transition-transform duration-300 ${
                  hoveredAction === action.id && !action.disabled ? 'scale-110' : ''
                }`}
              >
                {action.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${action.primary ? 'text-lavender-700' : 'text-slate-800'}`}>
                  {action.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {action.description}
                </p>
              </div>
            </div>

            {/* Subtle pulse for primary action */}
            {action.primary && !action.disabled && (
              <div className="absolute inset-0 rounded-2xl bg-lavender-400/10 animate-pulse pointer-events-none" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
