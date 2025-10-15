/**
 * Application Constants
 * Centralized location for all magic strings and configuration values
 */

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
} as const

export const SUBSCRIPTION_TIER = {
  FREE: 'free',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const

export const STRIPE_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  PAYMENT_FAILED: 'invoice.payment_failed',
} as const

export const ROUTES = {
  HOME: '/',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ACCOUNT: '/account',
  API: {
    AUTH_CALLBACK: '/api/auth/callback',
    CHECKOUT: '/api/checkout',
    WEBHOOK: '/api/webhook',
    PORTAL: '/api/portal',
  },
} as const

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_INPUT: 'Invalid request data',
  SUBSCRIPTION_TIER_INVALID: 'Invalid subscription tier',
  CHECKOUT_FAILED: 'Failed to create checkout session',
  PORTAL_FAILED: 'Failed to create portal session',
  WEBHOOK_FAILED: 'Webhook handler failed',
  NO_STRIPE_CUSTOMER: 'No Stripe customer found',
  GENERIC_ERROR: 'An unexpected error occurred. Please contact support.',
} as const

export const SUCCESS_MESSAGES = {
  SUBSCRIPTION_ACTIVATED: 'Subscription activated successfully',
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully',
  SUBSCRIPTION_CANCELLED: 'Subscription cancelled successfully',
} as const

// Type exports for TypeScript
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]
export type SubscriptionTier = typeof SUBSCRIPTION_TIER[keyof typeof SUBSCRIPTION_TIER]
export type StripeEvent = typeof STRIPE_EVENTS[keyof typeof STRIPE_EVENTS]
