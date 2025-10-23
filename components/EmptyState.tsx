'use client'

import Link from 'next/link'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  variant?: 'default' | 'compact'
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = 'default'
}: EmptyStateProps) {
  const isCompact = variant === 'compact'

  const content = (
    <div className={`text-center ${isCompact ? 'py-8' : 'py-16'} fade-in`}>
      {/* Icon */}
      <div className={`${isCompact ? 'text-5xl' : 'text-7xl'} mb-4 animate-bounce-gentle`}>
        {icon}
      </div>

      {/* Title */}
      <h3 className={`font-bold text-gray-900 mb-2 ${isCompact ? 'text-xl' : 'text-2xl'}`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-gray-600 mb-6 max-w-md mx-auto ${isCompact ? 'text-sm' : 'text-base'}`}>
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  )

  // For compact variant, return content directly
  if (isCompact) {
    return content
  }

  // For default variant, wrap in card
  return (
    <div className="card bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
      {content}
    </div>
  )
}
