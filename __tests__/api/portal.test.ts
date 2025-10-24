/**
 * Integration Tests for Stripe Portal API
 * Tests customer portal access and error handling
 */

import { POST } from '@/app/api/portal/route'
import { createMockRequest, mockSession, mockProfile } from '../helpers/testUtils'

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}))

// Mock headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name: string) => ({ value: `mock-${name}` })),
  })),
}))

// Mock Stripe
jest.mock('@/lib/stripe', () => ({
  stripe: {
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}))

const { createServerClient } = require('@supabase/ssr')
const { stripe } = require('@/lib/stripe')

describe('POST /api/portal', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default: authenticated session
    createServerClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: mockProfile,
                error: null,
              })
            ),
          })),
        })),
      })),
    })

    // Default: successful portal session creation
    stripe.billingPortal.sessions.create.mockResolvedValue({
      id: 'bps_test123',
      url: 'https://billing.stripe.com/session/test123',
    })
  })

  describe('Success Cases', () => {
    it('should create billing portal session for existing customer', async () => {
      const req = createMockRequest({
        method: 'POST',
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('url')
      expect(data.url).toBe('https://billing.stripe.com/session/test123')
    })

    it('should pass correct customer ID to Stripe', async () => {
      const req = createMockRequest({
        method: 'POST',
      })

      await POST(req as any)

      expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: mockProfile.stripe_customer_id,
        return_url: expect.stringContaining('/account'),
      })
    })

    it('should include return URL pointing to account page', async () => {
      const req = createMockRequest({
        method: 'POST',
      })

      await POST(req as any)

      expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          return_url: expect.stringMatching(/\/account$/),
        })
      )
    })
  })

  describe('Authentication Errors', () => {
    it('should return 401 when user is not authenticated', async () => {
      createServerClient.mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      })

      const req = createMockRequest({
        method: 'POST',
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(stripe.billingPortal.sessions.create).not.toHaveBeenCalled()
    })
  })

  describe('Missing Customer ID', () => {
    it('should return 400 when user has no Stripe customer ID', async () => {
      createServerClient.mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: { ...mockProfile, stripe_customer_id: null },
                  error: null,
                })
              ),
            })),
          })),
        })),
      })

      const req = createMockRequest({
        method: 'POST',
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(stripe.billingPortal.sessions.create).not.toHaveBeenCalled()
    })

    it('should return 400 when profile is not found', async () => {
      createServerClient.mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: null,
                  error: null,
                })
              ),
            })),
          })),
        })),
      })

      const req = createMockRequest({
        method: 'POST',
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Stripe Errors', () => {
    it('should handle Stripe API errors gracefully', async () => {
      stripe.billingPortal.sessions.create.mockRejectedValue(
        new Error('Stripe API error')
      )

      const req = createMockRequest({
        method: 'POST',
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should handle invalid customer ID', async () => {
      stripe.billingPortal.sessions.create.mockRejectedValue(
        new Error('No such customer')
      )

      const req = createMockRequest({
        method: 'POST',
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Database Errors', () => {
    it('should handle database query failures', async () => {
      createServerClient.mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.reject(new Error('Database error'))
              ),
            })),
          })),
        })),
      })

      const req = createMockRequest({
        method: 'POST',
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Real-world Scenarios', () => {
    it('should allow premium user to access portal', async () => {
      createServerClient.mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: {
                    ...mockProfile,
                    subscription_status: 'active',
                    subscription_tier: 'yearly',
                  },
                  error: null,
                })
              ),
            })),
          })),
        })),
      })

      const req = createMockRequest({
        method: 'POST',
      })

      const response = await POST(req as any)

      expect(response.status).toBe(200)
      expect(stripe.billingPortal.sessions.create).toHaveBeenCalled()
    })

    it('should allow cancelled user to access portal (to resubscribe)', async () => {
      createServerClient.mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: {
                    ...mockProfile,
                    subscription_status: 'cancelled',
                  },
                  error: null,
                })
              ),
            })),
          })),
        })),
      })

      const req = createMockRequest({
        method: 'POST',
      })

      const response = await POST(req as any)

      expect(response.status).toBe(200)
    })
  })
})
