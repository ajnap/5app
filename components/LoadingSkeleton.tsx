// Reusable loading skeleton components for consistent loading states
// Uses the app's cream/lavender/peach color theme

import { NavigationSkeleton } from './Navigation'

// Base skeleton pulse animation with theme colors
function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-cream-200 rounded animate-pulse ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm">
      <SkeletonPulse className="h-6 w-3/4 mb-4" />
      <SkeletonPulse className="h-4 w-full mb-2" />
      <SkeletonPulse className="h-4 w-5/6" />
    </div>
  )
}

export function PromptCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-lavender-100 rounded-full animate-pulse" />
        <div className="flex-1">
          <SkeletonPulse className="h-5 w-2/3 mb-2" />
          <SkeletonPulse className="h-3 w-1/3" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-5/6" />
      </div>
      <div className="h-10 bg-lavender-100 rounded-xl animate-pulse" />
    </div>
  )
}

export function StatCardSkeleton({ color = 'lavender' }: { color?: 'lavender' | 'peach' | 'green' }) {
  const colorClasses = {
    lavender: 'bg-lavender-50 border-lavender-100',
    peach: 'bg-peach-50 border-peach-100',
    green: 'bg-green-50 border-green-100',
  }

  const iconBg = {
    lavender: 'bg-lavender-100',
    peach: 'bg-peach-100',
    green: 'bg-green-100',
  }

  return (
    <div className={`rounded-2xl border p-5 ${colorClasses[color]}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${iconBg[color]} rounded-xl animate-pulse`} />
        <div className="flex-1">
          <SkeletonPulse className="h-7 w-16 mb-2" />
          <SkeletonPulse className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

export function ChildCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-cream-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 bg-lavender-100 rounded-full animate-pulse" />
        <div className="flex-1">
          <SkeletonPulse className="h-5 w-24 mb-2" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-cream-50 rounded-xl p-3">
          <SkeletonPulse className="h-6 w-8 mb-1" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
        <div className="bg-cream-50 rounded-xl p-3">
          <SkeletonPulse className="h-6 w-8 mb-1" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-3 w-8" />
        </div>
        <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-lavender-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Button */}
      <div className="h-10 bg-lavender-100 rounded-xl animate-pulse" />
    </div>
  )
}

export function GoalCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-cream-200 p-4 shadow-sm border-l-4 border-l-lavender-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-lavender-100 rounded-xl animate-pulse" />
        <div className="flex-1">
          <SkeletonPulse className="h-5 w-3/4 mb-2" />
          <SkeletonPulse className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between mb-1">
          <SkeletonPulse className="h-3 w-16" />
          <SkeletonPulse className="h-3 w-8" />
        </div>
        <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-lavender-200 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="mt-3 h-9 bg-lavender-100 rounded-lg animate-pulse" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-cream-100">
      <NavigationSkeleton />

      <main className="container-narrow py-8">
        {/* Greeting */}
        <div className="mb-6">
          <SkeletonPulse className="h-8 w-64 mb-2" />
          <SkeletonPulse className="h-4 w-48" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCardSkeleton color="peach" />
          <StatCardSkeleton color="green" />
          <StatCardSkeleton color="lavender" />
        </div>

        {/* Child Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <ChildCardSkeleton />
          <ChildCardSkeleton />
          <ChildCardSkeleton />
        </div>

        {/* Prompt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PromptCardSkeleton />
          <PromptCardSkeleton />
          <PromptCardSkeleton />
        </div>
      </main>
    </div>
  )
}

export function GoalsSkeleton() {
  return (
    <div className="min-h-screen bg-cream-100">
      <NavigationSkeleton />

      <main className="container-narrow py-8">
        {/* Header */}
        <div className="mb-6">
          <SkeletonPulse className="h-8 w-40 mb-2" />
          <SkeletonPulse className="h-4 w-64" />
        </div>

        {/* Family member tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${
                i === 1 ? 'bg-lavender-200' : 'bg-white border border-cream-200'
              }`}
            >
              <div className="w-5 h-5 bg-cream-300 rounded-full animate-pulse" />
              <SkeletonPulse className="h-4 w-12" />
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-cream-200">
            <SkeletonPulse className="h-7 w-8 mb-1" />
            <SkeletonPulse className="h-3 w-16" />
          </div>
          <div className="bg-white rounded-xl p-4 border border-cream-200">
            <SkeletonPulse className="h-7 w-8 mb-1" />
            <SkeletonPulse className="h-3 w-16" />
          </div>
          <div className="bg-white rounded-xl p-4 border border-cream-200">
            <SkeletonPulse className="h-7 w-8 mb-1" />
            <SkeletonPulse className="h-3 w-16" />
          </div>
        </div>

        {/* Add Goal Button skeleton */}
        <div className="h-14 bg-lavender-200 rounded-xl animate-pulse mb-6" />

        {/* Goal Cards */}
        <div className="space-y-4">
          <GoalCardSkeleton />
          <GoalCardSkeleton />
          <GoalCardSkeleton />
        </div>
      </main>
    </div>
  )
}

export function ChildrenPageSkeleton() {
  return (
    <div className="min-h-screen bg-cream-100">
      <NavigationSkeleton />

      <main className="container-narrow py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <SkeletonPulse className="h-8 w-40 mb-2" />
            <SkeletonPulse className="h-4 w-56" />
          </div>
          <div className="h-10 w-32 bg-lavender-200 rounded-xl animate-pulse" />
        </div>

        {/* Child Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ChildCardSkeleton />
          <ChildCardSkeleton />

          {/* Add child card */}
          <div className="border-2 border-dashed border-cream-300 rounded-2xl p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-cream-200 rounded-full animate-pulse mb-3" />
            <SkeletonPulse className="h-5 w-24" />
          </div>
        </div>
      </main>
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

export function PageSkeleton({ title = true }: { title?: boolean }) {
  return (
    <div className="min-h-screen bg-cream-100">
      <NavigationSkeleton />

      <main className="container-narrow py-8">
        {title && (
          <div className="mb-6">
            <SkeletonPulse className="h-8 w-48 mb-2" />
            <SkeletonPulse className="h-4 w-64" />
          </div>
        )}

        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </main>
    </div>
  )
}
