'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { ROUTES } from '@/lib/constants'

// Force dynamic rendering - this page needs runtime environment variables
export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Create Supabase client - using NEXT_PUBLIC env vars which are available at build time
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${ROUTES.DASHBOARD}`,
          },
        })

        if (error) throw error

        if (data.user) {
          // Check if email confirmation is required
          if (data.user.identities?.length === 0) {
            setError('This email is already registered. Please sign in instead.')
          } else {
            // New user - redirect to onboarding
            router.push('/onboarding')
          }
        }
      } else {
        // Sign in existing user
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .single()

        if (profile?.onboarding_completed) {
          router.push(ROUTES.DASHBOARD)
        } else {
          router.push('/onboarding')
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9EAE1] via-[#FFEFD5] to-[#E8F4F8] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FFC98A]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#6C63FF]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10 fade-in">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href={ROUTES.HOME} className="inline-block">
            <div className="text-6xl mb-4 animate-bounce-gentle">❤️</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#FFC98A] bg-clip-text text-transparent mb-2">
              The Next 5 Minutes
            </h1>
          </Link>
          <p className="text-gray-600 text-lg">
            {isSignUp ? 'Start your journey of connection' : 'Welcome back, parent'}
          </p>
        </div>

        {/* Auth Form - Glassmorphism */}
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/50 p-8 slide-in">
          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm text-red-700 p-4 rounded-2xl text-sm border border-red-200/50 fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-[#6C63FF]/20 focus:border-[#6C63FF] transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-[#6C63FF]/20 focus:border-[#6C63FF] transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                placeholder="••••••••"
              />
              {isSignUp && (
                <p className="text-xs text-gray-600 mt-2">At least 6 characters for security</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6C63FF] to-[#FFC98A] text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <span>{isSignUp ? 'Create Account ✨' : 'Sign In 🎉'}</span>
              )}
            </button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
              }}
              className="text-[#6C63FF] hover:text-[#FFC98A] text-sm font-semibold transition-colors duration-300 hover:scale-105 transform inline-block"
            >
              {isSignUp
                ? '✓ Already have an account? Sign in'
                : "✨ Don't have an account? Sign up"}
            </button>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              href={ROUTES.HOME}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium inline-flex items-center gap-2 transition-all duration-300 hover:gap-3"
            >
              <span>←</span> Back to home
            </Link>
          </div>
        </div>

        {/* Inspirational quote */}
        <div className="mt-8 text-center fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-gray-600 italic text-sm max-w-sm mx-auto">
            "The days are long, but the years are short. Make every moment count." 💫
          </p>
        </div>
      </div>
    </div>
  )
}
