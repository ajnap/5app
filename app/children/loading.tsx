export default function ChildrenLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation Skeleton */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center backdrop-blur-sm bg-white/30 rounded-2xl px-6 py-3 shadow-sm">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse hidden md:block"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
            <div className="h-12 w-80 max-w-full bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 max-w-full bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>

          {/* Children Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-6 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="h-4 w-20 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div>
                    <div className="h-4 w-20 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-10 flex-1 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Child Button Skeleton */}
          <div className="text-center">
            <div className="h-12 w-48 bg-gray-200 rounded-xl mx-auto animate-pulse"></div>
          </div>
        </div>
      </main>
    </div>
  )
}
