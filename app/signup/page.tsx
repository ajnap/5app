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
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-lavender-200/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-peach-200/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-sage-100/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-10 fade-in-up">
          <Link href={ROUTES.HOME} className="inline-block group">
            <div className="text-6xl mb-4 transition-transform group-hover:scale-110 animate-bounce-gentle">
              ❤️
            </div>
            <h1 className="font-display text-3xl font-semibold gradient-text mb-2">
              The Next 5 Minutes
            </h1>
          </Link>
          <p className="text-slate-600 text-lg">
            {isSignUp ? 'Start your journey of connection' : 'Welcome back, parent'}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="card-glass fade-in-up delay-100">
          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm border border-red-200 animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-lg"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-lg"
                placeholder="••••••••"
              />
              {isSignUp && (
                <p className="text-xs text-slate-500 mt-2">At least 6 characters for security</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-lg w-full group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
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
              className="text-lavender-600 hover:text-lavender-700 text-sm font-semibold transition-colors underline-animated"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href={ROUTES.HOME}
              className="text-slate-500 hover:text-slate-700 text-sm font-medium inline-flex items-center gap-2 transition-all duration-300 group"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 8H3M7 4l-4 4 4 4" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>

        {/* Inspirational quote */}
        <div className="mt-8 text-center fade-in-up delay-300">
          <p className="text-slate-500 italic text-sm max-w-sm mx-auto">
            "The days are long, but the years are short. Make every moment count."
          </p>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex justify-center gap-6 text-slate-400 text-xs fade-in-up delay-400">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure & encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Privacy first</span>
          </div>
        </div>
      </div>
    </div>
  )
}
