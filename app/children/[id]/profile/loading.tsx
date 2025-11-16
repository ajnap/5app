export default function ChildProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation Skeleton */}
      <nav className="container mx-auto px-6 py-6 fade-in">
        <div className="flex justify-between items-center backdrop-blur-md bg-white/40 rounded-2xl px-6 py-3 shadow-lg border border-white/50">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-10 fade-in">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-12 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-48 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>

          <div className="space-y-8">
            {/* Connection Insights Skeleton */}
            <InsightsSkeleton />

            {/* Personalized Tips Skeleton */}
            <TipsSkeleton />

            {/* Featured Prompt Skeleton */}
            <FeaturedPromptSkeleton />

            {/* More Ideas Skeleton */}
            <MoreIdeasSkeleton />

            {/* Activity History Skeleton */}
            <HistorySkeleton />
          </div>
        </div>
      </main>
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-primary-200 shadow-lg p-6 space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="h-10 w-16 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Category Distribution */}
      <div className="space-y-3 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-full bg-gray-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function TipsSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-primary-200 shadow-lg p-6 space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeaturedPromptSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-300 shadow-xl p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="h-12 w-40 bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-16 w-full bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}

function MoreIdeasSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-primary-200 shadow-lg p-6 space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 p-5"
          >
            <div className="h-12 w-32 bg-gray-200 rounded-full animate-pulse mb-3" />
            <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-2" />
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-primary-200 shadow-lg p-6 space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="relative pl-8 pb-4 border-l-2 border-gray-200">
            <div className="absolute left-0 top-1 -translate-x-1/2 w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
