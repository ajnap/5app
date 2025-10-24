/**
 * Test Utilities for Integration Tests
 * Provides helpers for mocking auth, Stripe, and Supabase
 */

import { createMocks } from 'node-mocks-http'
import type { NextRequest } from 'next/server'

/**
 * Creates a mock Next.js request with proper headers and body
 */
export function createMockRequest(options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: any
  cookies?: Record<string, string>
}) {
  const { method = 'GET', url = '/', headers = {}, body, cookies = {} } = options

  const req = {
    method,
    url,
    headers: new Headers(headers),
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    cookies: {
      get: (name: string) => ({ value: cookies[name] }),
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
    },
  } as unknown as NextRequest

  return req
}

/**
 * Mock Supabase session for authenticated requests
 */
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() + 3600000,
  expires_in: 3600,
  token_type: 'bearer',
}

/**
 * Mock Supabase profile data
 */
export const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  subscription_status: 'inactive',
  subscription_tier: 'free',
  stripe_customer_id: 'cus_test123',
  stripe_subscription_id: null,
  faith_mode: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/**
 * Mock Supabase child profile
 */
export const mockChild = {
  id: 'test-child-id',
  user_id: 'test-user-id',
  name: 'Test Child',
  birth_date: '2015-01-01',
  interests: ['sports', 'art'],
  personality_traits: ['creative', 'active'],
  current_challenges: ['bedtime'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/**
 * Mock Stripe customer
 */
export const mockStripeCustomer = {
  id: 'cus_test123',
  object: 'customer' as const,
  email: 'test@example.com',
  created: Math.floor(Date.now() / 1000),
  livemode: false,
}

/**
 * Mock Stripe checkout session
 */
export const mockCheckoutSession = {
  id: 'cs_test_123',
  object: 'checkout.session' as const,
  url: 'https://checkout.stripe.com/pay/cs_test_123',
  customer: 'cus_test123',
  mode: 'subscription' as const,
  status: 'open' as const,
  metadata: {
    user_id: 'test-user-id',
    tier: 'monthly',
  },
}

/**
 * Mock Stripe webhook event
 */
export function createMockStripeEvent(
  type: string,
  data: any
): any {
  return {
    id: 'evt_test_123',
    object: 'event',
    type,
    data: {
      object: data,
    },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
  }
}

/**
 * Generate valid Stripe webhook signature
 */
export function generateStripeSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000)
  // This is a simplified mock - real Stripe uses HMAC SHA256
  return `t=${timestamp},v1=mock_signature_${payload.length}`
}

/**
 * Mock environment variables
 */
export function mockEnvVars(vars: Record<string, string>) {
  const original = { ...process.env }

  Object.assign(process.env, vars)

  return () => {
    process.env = original
  }
}

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
