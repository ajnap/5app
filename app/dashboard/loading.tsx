import SkeletonPromptCard from '@/components/SkeletonPromptCard'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation Skeleton */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center backdrop-blur-md bg-white/40 rounded-2xl px-6 py-3 shadow-lg border border-white/50">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse hidden md:block"></div>
            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Today's Date Skeleton */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-primary-50 via-purple-50 to-pink-50 px-8 py-4 rounded-2xl border-2 border-primary-100 shadow-md">
              <div className="h-4 w-20 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="h-8 w-64 bg-gray-200 rounded mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* Progress Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Streak Card Skeleton */}
            <div className="card bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-2 border-orange-200 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-8 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Total Completions Skeleton */}
            <div className="card bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-8 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 w-36 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Time Stats Skeleton */}
            <div className="card bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-8 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-3 w-36 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Calendar Skeleton */}
          <div className="card mb-8">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 20}ms` }}></div>
              ))}
            </div>
          </div>

          {/* Child Selector Skeleton */}
          <div className="card mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="flex gap-3 mb-4 overflow-x-auto">
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Today's Prompt Skeleton */}
          <SkeletonPromptCard />

          {/* Browse All Prompts Skeleton */}
          <div className="mt-8">
            <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonPromptCard />
              <SkeletonPromptCard />
              <SkeletonPromptCard />
              <SkeletonPromptCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
