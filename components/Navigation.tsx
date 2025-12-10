'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from './SignOutButton'
import { ROUTES } from '@/lib/constants'

interface NavigationProps {
  showAuthButtons?: boolean
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/favorites', label: 'Favorites', icon: '❤️' },
  { href: '/goals', label: 'Goals', icon: '🎯' },
  { href: '/assistant', label: 'Assistant', icon: '✨' },
  { href: '/spouse', label: 'Spouse', icon: '💑' },
  { href: '/children', label: 'Children', icon: '👶' },
  { href: ROUTES.ACCOUNT, label: 'Account', icon: '⚙️' },
]

export default function Navigation({ showAuthButtons = true }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-cream-100/80 backdrop-blur-lg border-b border-cream-200">
      <div className="container-wide py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-xl transition-transform group-hover:scale-110">❤️</span>
            <span className="font-display text-lg font-semibold text-lavender-600 hidden sm:block">
              The Next 5 Minutes
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-lavender-100 text-lavender-700'
                      : 'text-slate-600 hover:bg-cream-200 hover:text-slate-800'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              )
            })}

            {showAuthButtons && <SignOutButton />}
          </div>
        </div>
      </div>
    </nav>
  )
}

// Navigation skeleton for loading states
export function NavigationSkeleton() {
  return (
    <nav className="sticky top-0 z-50 bg-cream-100/80 backdrop-blur-lg border-b border-cream-200">
      <div className="container-wide py-3">
        <div className="flex justify-between items-center">
          {/* Logo skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-lavender-200 rounded-full animate-pulse" />
            <div className="hidden sm:block w-32 h-5 bg-lavender-100 rounded animate-pulse" />
          </div>

          {/* Nav items skeleton */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-2"
              >
                <div className="w-5 h-5 bg-cream-300 rounded animate-pulse" />
                <div className="hidden md:block w-12 h-4 bg-cream-200 rounded animate-pulse" />
              </div>
            ))}
            <div className="w-16 h-8 bg-cream-300 rounded-lg animate-pulse ml-1" />
          </div>
        </div>
      </div>
    </nav>
  )
}
