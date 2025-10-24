/**
 * Integration Tests for Checkout API
 * Tests Stripe checkout session creation with authentication
 */

import { POST } from '@/app/api/checkout/route'
import { createMockRequest, mockSession, mockProfile, mockCheckoutSession } from '../helpers/testUtils'

// Mock external dependencies
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name: string) => ({ value: `mock-${name}` })),
  })),
}))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    customers: {
      list: jest.fn(),
      create: jest.fn(),
    },
  },
  getOrCreateStripeCustomer: jest.fn(),
  SUBSCRIPTION_TIERS: {
    monthly: { priceId: 'price_monthly_test' },
    yearly: { priceId: 'price_yearly_test' },
  },
}))

// Import mocked modules
const { createServerClient } = require('@supabase/ssr')
const { stripe, getOrCreateStripeCustomer } = require('@/lib/stripe')

describe('POST /api/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default: authenticated session
    createServerClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })

    // Default: customer exists
    getOrCreateStripeCustomer.mockResolvedValue('cus_test123')

    // Default: successful checkout session creation
    stripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession)
  })

  describe('Success Cases', () => {
    it('should create checkout session for monthly subscription', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: { tier: 'monthly' },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('url')
      expect(data.url).toBe(mockCheckoutSession.url)
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_test123',
          line_items: [
            {
              price: 'price_monthly_test',
              quantity: 1,
            },
          ],
          mode: 'subscription',
        })
      )
    })

    it('should create checkout session for yearly subscription', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: { tier: 'yearly' },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            {
              price: 'price_yearly_test',
              quantity: 1,
            },
          ],
        })
      )
    })

    it('should include correct metadata in checkout session', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: { tier: 'monthly' },
      })

      await POST(req as any)

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            user_id: mockSession.user.id,
            tier: 'monthly',
          },
        })
      )
    })

    it('should update profile with Stripe customer ID', async () => {
      const mockUpdate = jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      }))

      createServerClient.mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn(() => ({
          update: mockUpdate,
        })),
      })

      const req = createMockRequest({
        method: 'POST',
        body: { tier: 'monthly' },
      })

      await POST(req as any)

      expect(mockUpdate).toHaveBeenCalledWith({ stripe_customer_id: 'cus_test123' })
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
        body: { tier: 'monthly' },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
    })
  })

  describe('Validation Errors', () => {
    it('should return 400 for invalid tier', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: { tier: 'invalid-tier' },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('errors')
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
    })

    it('should return 400 for missing tier', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: {},
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('errors')
    })

    it('should return 400 for invalid request body', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: { tier: 123 }, // Should be string
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('errors')
    })
  })

  describe('Stripe Errors', () => {
    it('should handle Stripe API errors gracefully', async () => {
      stripe.checkout.sessions.create.mockRejectedValue(
        new Error('Stripe API error')
      )

      const req = createMockRequest({
        method: 'POST',
        body: { tier: 'monthly' },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should handle customer creation failures', async () => {
      getOrCreateStripeCustomer.mockRejectedValue(new Error('Customer creation failed'))

      const req = createMockRequest({
        method: 'POST',
        body: { tier: 'monthly' },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('Success and Cancel URLs', () => {
    it('should include correct success URL', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: { tier: 'monthly' },
      })

      await POST(req as any)

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: expect.stringContaining('/account?success=true'),
        })
      )
    })

    it('should include correct cancel URL', async () => {
      const req = createMockRequest({
        method: 'POST',
        body: { tier: 'monthly' },
      })

      await POST(req as any)

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cancel_url: expect.stringContaining('/account?canceled=true'),
        })
      )
    })
  })
})
