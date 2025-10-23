export default function SkeletonPromptCard() {
  return (
    <div className="card bg-white animate-pulse">
      {/* Category badge skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>

      {/* Title skeleton */}
      <div className="h-8 bg-gray-200 rounded-lg mb-3 w-3/4"></div>

      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>

      {/* Activity skeleton */}
      <div className="bg-gray-100 rounded-xl p-4 mb-4">
        <div className="h-5 bg-gray-200 rounded mb-2 w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>

      {/* Button skeleton */}
      <div className="h-14 bg-gray-200 rounded-xl w-full"></div>
    </div>
  )
}
