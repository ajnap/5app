export default function SkeletonChildProfile() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="card">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-3"></div>
            <div className="h-5 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="text-5xl w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="text-5xl w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth stats skeleton */}
      <div className="card">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded-full w-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory journal skeleton */}
      <div className="card">
        <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-l-4 border-gray-200 pl-4 py-2" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="space-y-2 mb-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-8 h-8 bg-gray-200 rounded-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
