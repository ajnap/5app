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
    <div className={`text-center ${isCompact ? 'py-8' : 'py-16'} fade-in-up`}>
      {/* Icon */}
      <div className={`${isCompact ? 'text-5xl' : 'text-7xl'} mb-4 animate-bounce-gentle`}>
        {icon}
      </div>

      {/* Title */}
      <h3 className={`font-display font-semibold text-slate-900 mb-2 ${isCompact ? 'text-xl' : 'text-2xl'}`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-slate-600 mb-6 max-w-md mx-auto ${isCompact ? 'text-sm' : 'text-base'}`}>
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && (
        <>
          {actionHref ? (
            <Link href={actionHref} className="btn-primary group">
              {actionLabel}
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          ) : (
            <button onClick={onAction} className="btn-primary group">
              {actionLabel}
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
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
    <div className="card-elevated bg-gradient-to-br from-cream-50 to-white">
      {content}
    </div>
  )
}
