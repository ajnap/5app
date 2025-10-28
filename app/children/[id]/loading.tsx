import SkeletonChildProfile from '@/components/SkeletonChildProfile'

export default function ChildProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation Skeleton */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center backdrop-blur-sm bg-white/30 rounded-2xl px-6 py-3 shadow-sm">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
            <div className="h-12 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 max-w-full bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>

          {/* Form/Content Skeleton */}
          <div className="card">
            <SkeletonChildProfile />
          </div>

          {/* Help Text Skeleton */}
          <div className="mt-8 text-center">
            <div className="h-4 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
        </div>
      </main>
    </div>
  )
}
