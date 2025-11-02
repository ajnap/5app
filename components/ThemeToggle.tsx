'use client'

/**
 * Dark Mode Toggle Button
 * Smooth animated toggle with system preference detection
 */

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
        aria-label="Loading theme toggle"
      />
    )
  }

  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`${isDark ? 'Light' : 'Dark'} mode`}
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Dark mode background - stars */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
            <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse" />
            <div className="absolute top-3 left-4 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-100" />
            <div className="absolute top-2 left-8 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-200" />
          </div>
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Light mode background - sky */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-cyan-200" />
        </div>
      </div>

      {/* Toggle Circle */}
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-gray-100 shadow-md transform transition-all duration-300 ease-in-out ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isDark ? (
            // Moon icon
            <svg
              className="w-4 h-4 text-indigo-600 animate-fade-in"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            // Sun icon
            <svg
              className="w-4 h-4 text-yellow-500 animate-fade-in"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}
