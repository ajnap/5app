'use client'

import { Component, ReactNode } from 'react'
import { captureError } from '@/lib/sentry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo)

    // Send to Sentry
    captureError(error, {
      tags: { component: 'error-boundary' },
      extra: { errorInfo }
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4">
          <div className="max-w-md w-full text-center scale-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-red-100">
              <div className="text-6xl mb-4 animate-bounce-gentle">😕</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Don't worry - your data is safe. Let's get you back on track!
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-left bg-gray-100 rounded p-4 mb-4 overflow-auto">
                  <p className="text-xs text-gray-700 font-mono">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              <div className="space-y-3">
                <button
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                  className="btn-primary w-full"
                >
                  Try Again
                </button>
                <button
                  onClick={() => (window.location.href = '/dashboard')}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
