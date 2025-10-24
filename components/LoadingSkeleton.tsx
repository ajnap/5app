// Reusable loading skeleton components for consistent loading states

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 shimmer"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2 shimmer"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 shimmer"></div>
    </div>
  )
}

export function PromptCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full shimmer"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-2 shimmer"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 shimmer"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full shimmer"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 shimmer"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded shimmer"></div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg shimmer"></div>
        <div className="flex-1">
          <div className="h-8 bg-gray-200 rounded w-24 mb-2 shimmer"></div>
          <div className="h-4 bg-gray-200 rounded w-32 shimmer"></div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Today's Prompt */}
      <PromptCardSkeleton />

      {/* More prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
