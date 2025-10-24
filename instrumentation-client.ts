/**
 * Client-side Instrumentation File
 * This file initializes client-side monitoring and analytics
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'browser') {
    await import('./sentry.client.config')
  }
}
