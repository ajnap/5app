import { NavigationSkeleton } from '@/components/Navigation'

export default function ChildProfileLoading() {
  return (
    <div className="min-h-screen bg-cream-100">
      <NavigationSkeleton />

      {/* Main Content */}
      <main className="container-narrow py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-lavender-100 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-10 w-48 bg-cream-200 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-5 w-32 bg-cream-200 rounded mx-auto animate-pulse" />
          </div>

          <div className="space-y-6">
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
    <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-6 space-y-4">
      <div className="h-7 w-40 bg-cream-200 rounded animate-pulse mb-4" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-cream-50 rounded-xl p-4 border border-cream-100">
            <div className="h-8 w-12 bg-lavender-100 rounded animate-pulse mb-2" />
            <div className="h-4 w-20 bg-cream-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Category Distribution */}
      <div className="space-y-3 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 w-24 bg-cream-200 rounded animate-pulse mb-2" />
            <div className="h-2 w-full bg-cream-100 rounded-full overflow-hidden">
              <div className="h-full bg-lavender-200 rounded-full animate-pulse" style={{ width: `${70 - i * 15}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TipsSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-6 space-y-4">
      <div className="h-7 w-40 bg-cream-200 rounded animate-pulse mb-4" />

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-lavender-50 border border-lavender-100 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-lavender-200 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full bg-cream-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-cream-200 rounded animate-pulse" />
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
    <div className="bg-gradient-to-br from-lavender-50 to-cream-50 rounded-2xl border border-lavender-200 shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-4 w-28 bg-lavender-200 rounded animate-pulse mb-2" />
          <div className="h-8 w-56 bg-cream-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-28 bg-lavender-200 rounded-xl animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="h-10 w-32 bg-lavender-100 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-cream-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-cream-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-cream-200 rounded animate-pulse" />
        </div>
        <div className="h-12 w-full bg-lavender-200 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}

function MoreIdeasSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-6 space-y-4">
      <div className="h-7 w-32 bg-cream-200 rounded animate-pulse mb-4" />

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-cream-50 rounded-xl border border-cream-100 p-5"
          >
            <div className="h-10 w-28 bg-lavender-100 rounded-full animate-pulse mb-3" />
            <div className="h-5 w-full bg-cream-200 rounded animate-pulse mb-2" />
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full bg-cream-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-cream-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-full bg-lavender-100 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-6 space-y-4">
      <div className="h-7 w-36 bg-cream-200 rounded animate-pulse mb-4" />

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="relative pl-8 pb-4 border-l-2 border-lavender-100">
            <div className="absolute left-0 top-1 -translate-x-1/2 w-4 h-4 bg-lavender-200 rounded-full animate-pulse" />
            <div className="bg-cream-50 rounded-xl p-4 border border-cream-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 bg-lavender-100 rounded animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-40 bg-cream-200 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-cream-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-14 bg-lavender-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
