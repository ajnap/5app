'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import SignOutButton from './SignOutButton'
import { ROUTES } from '@/lib/constants'

interface NavigationProps {
  showAuthButtons?: boolean
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/favorites', label: 'Favorites', icon: '❤️' },
  { href: '/goals', label: 'Goals', icon: '🎯' },
  { href: '/schedule', label: 'Schedule', icon: '📅' },
  { href: '/spouse', label: 'Spouse', icon: '💑' },
  { href: '/children', label: 'Children', icon: '👶' },
  { href: ROUTES.ACCOUNT, label: 'Account', icon: '⚙️' },
]

export default function Navigation({ showAuthButtons = true }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showAssistantTooltip, setShowAssistantTooltip] = useState(false)

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

            {/* AI Assistant Button */}
            <div className="relative ml-1">
              <button
                onClick={() => router.push('/assistant')}
                onMouseEnter={() => setShowAssistantTooltip(true)}
                onMouseLeave={() => setShowAssistantTooltip(false)}
                className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-lavender-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
                aria-label="AI Assistant"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </button>
              {showAssistantTooltip && (
                <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                  AI Assistant
                  <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-800 rotate-45" />
                </div>
              )}
            </div>

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
