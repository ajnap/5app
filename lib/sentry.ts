/**
 * Sentry Error Handling Utilities
 * Centralized error tracking and reporting
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Captures an exception and sends it to Sentry
 * @param error - The error to capture
 * @param context - Additional context about the error
 */
export function captureError(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, any>
    level?: Sentry.SeverityLevel
  }
) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', error)
    if (context?.extra) {
      console.error('[Context]', context.extra)
    }
  }

  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level || 'error',
  })
}

/**
 * Captures a message and sends it to Sentry
 * @param message - The message to capture
 * @param level - Severity level (default: 'info')
 * @param context - Additional context
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, any>
  }
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}]`, message)
  }

  Sentry.captureMessage(message, {
    level,
    tags: context?.tags,
    extra: context?.extra,
  })
}

/**
 * Sets user context for Sentry
 * @param user - User information
 */
export function setUser(user: {
  id: string
  email?: string
  username?: string
}) {
  Sentry.setUser(user)
}

/**
 * Clears user context (e.g., on logout)
 */
export function clearUser() {
  Sentry.setUser(null)
}

/**
 * Adds breadcrumb for tracking user actions
 * @param message - Description of the action
 * @param category - Category of the breadcrumb
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  category: string = 'user-action',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  })
}

/**
 * Creates a performance span for monitoring
 * @param name - Name of the operation
 * @param op - Operation type (e.g., 'http.request', 'db.query')
 * @returns Span object to be finished when operation completes
 */
export function startSpan(name: string, op: string) {
  return Sentry.startSpan({
    name,
    op,
  }, (span) => {
    return span
  })
}
