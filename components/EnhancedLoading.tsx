/**
 * Enhanced Loading Components
 * Beautiful, accessible loading states with animations
 */

export function SpinnerLoader({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900" />
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 animate-spin" />
      </div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function DotsLoader({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-primary-600 dark:bg-primary-400 animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.8s'
            }}
          />
        ))}
      </div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function PulseLoader() {
  return (
    <div className="flex items-center justify-center" role="status" aria-live="polite">
      <div className="relative w-16 h-16">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border-4 border-primary-400 dark:border-primary-600 opacity-75 animate-ping"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function ProgressBar({ progress, text }: { progress: number; text?: string }) {
  return (
    <div className="w-full" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2 text-center">
          {text}
        </p>
      )}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
        {progress}%
      </p>
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-live="polite">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded shimmer"
          style={{
            width: i === lines - 1 ? '75%' : '100%',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  )
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 shimmer`}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading avatar...</span>
    </div>
  )
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg shimmer ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading button...</span>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card" aria-busy="true" aria-live="polite">
      <div className="flex items-start gap-4 mb-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1">
          <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded shimmer mb-2" />
          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded shimmer" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2 mt-4">
        <SkeletonButton />
        <SkeletonButton />
      </div>
      <span className="sr-only">Loading card content...</span>
    </div>
  )
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center fade-in"
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-live="assertive"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm mx-4 scale-in">
        <SpinnerLoader size="lg" text={text} />
      </div>
    </div>
  )
}
