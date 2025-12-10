import { NavigationSkeleton } from '@/components/Navigation'

export default function ScheduleLoading() {
  return (
    <div className="min-h-screen bg-cream-100">
      <NavigationSkeleton />

      <main className="container-narrow py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <div className="h-9 w-48 bg-cream-200 rounded-lg animate-pulse mb-2" />
              <div className="h-5 w-72 bg-cream-200 rounded animate-pulse" />
            </div>
            <div className="h-12 w-32 bg-lavender-200 rounded-xl animate-pulse" />
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-cream-200">
                <div className="w-8 h-8 bg-cream-200 rounded-lg animate-pulse" />
                <div className="h-4 w-20 bg-cream-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar Skeleton */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-cream-100 bg-gradient-to-r from-cream-50 to-lavender-50">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-32 bg-cream-200 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-cream-200 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="p-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div key={i} className="flex justify-center py-2">
                      <div className="h-4 w-8 bg-cream-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <div key={idx} className="p-2 rounded-xl min-h-[80px] bg-cream-50">
                      <div className="h-4 w-6 bg-cream-200 rounded animate-pulse mb-2" />
                      <div className="h-3 w-full bg-lavender-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-cream-100">
                  <div className="h-5 w-24 bg-cream-200 rounded animate-pulse" />
                </div>
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 bg-cream-50 rounded-xl">
                      <div className="h-4 w-3/4 bg-cream-200 rounded animate-pulse mb-2" />
                      <div className="h-3 w-1/2 bg-cream-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Family Members */}
              <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-cream-100">
                  <div className="h-5 w-20 bg-cream-200 rounded animate-pulse" />
                </div>
                <div className="p-4 space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                      <div className="w-10 h-10 bg-lavender-200 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 w-20 bg-cream-200 rounded animate-pulse mb-1" />
                        <div className="h-3 w-24 bg-cream-100 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
