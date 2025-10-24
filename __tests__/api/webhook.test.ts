/**
 * Integration Tests for Stripe Webhook API
 * Tests webhook event handling and database updates
 */

import { POST } from '@/app/api/webhook/route'
import { createMockRequest, createMockStripeEvent, generateStripeSignature } from '../helpers/testUtils'
import { SUBSCRIPTION_STATUS, SUBSCRIPTION_TIER, STRIPE_EVENTS } from '@/lib/constants'

// Mock Stripe
jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}))

// Mock headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn((name: string) => {
      if (name === 'stripe-signature') return 'valid_signature'
      return null
    }),
  })),
}))

const { stripe } = require('@/lib/stripe')

// Mock Supabase update function
const mockUpdate = jest.fn(() => ({
  eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
}))

// Mock Supabase module
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: mockUpdate,
    })),
  })),
}))

describe('POST /api/webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdate.mockReturnValue({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })
  })

  describe('Webhook Signature Verification', () => {
    it('should verify valid webhook signature', async () => {
      const event = createMockStripeEvent(STRIPE_EVENTS.CHECKOUT_COMPLETED, {
        customer: 'cus_test123',
        subscription: 'sub_test123',
        metadata: { user_id: 'user123', tier: 'monthly' },
      })

      stripe.webhooks.constructEvent.mockReturnValue(event)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(event),
      })

      const response = await POST(req as any)

      expect(response.status).toBe(200)
      expect(stripe.webhooks.constructEvent).toHaveBeenCalled()
    })

    it('should reject invalid webhook signature', async () => {
      stripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      const req = createMockRequest({
        method: 'POST',
        body: '{}',
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Invalid signature')
    })
  })

  describe('checkout.session.completed Event', () => {
    it('should activate subscription on successful checkout', async () => {
      const event = createMockStripeEvent(STRIPE_EVENTS.CHECKOUT_COMPLETED, {
        customer: 'cus_test123',
        subscription: 'sub_test123',
        metadata: { user_id: 'user123', tier: 'monthly' },
      })

      stripe.webhooks.constructEvent.mockReturnValue(event)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(event),
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true })
      expect(mockUpdate).toHaveBeenCalledWith({
        subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
        subscription_tier: 'monthly',
        stripe_subscription_id: 'sub_test123',
        stripe_customer_id: 'cus_test123',
      })
    })

    it('should default to monthly tier if metadata is missing', async () => {
      const event = createMockStripeEvent(STRIPE_EVENTS.CHECKOUT_COMPLETED, {
        customer: 'cus_test123',
        subscription: 'sub_test123',
        metadata: { user_id: 'user123' }, // No tier specified
      })

      stripe.webhooks.constructEvent.mockReturnValue(event)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(event),
      })

      await POST(req as any)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_tier: SUBSCRIPTION_TIER.MONTHLY,
        })
      )
    })
  })

  describe('customer.subscription.updated Event', () => {
    it('should update subscription status to active', async () => {
      const event = createMockStripeEvent(STRIPE_EVENTS.SUBSCRIPTION_UPDATED, {
        id: 'sub_test123',
        status: 'active',
      })

      stripe.webhooks.constructEvent.mockReturnValue(event)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(event),
      })

      const response = await POST(req as any)

      expect(response.status).toBe(200)
      expect(mockUpdate).toHaveBeenCalledWith({
        subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
      })
    })

    it('should update subscription status to inactive when paused', async () => {
      const event = createMockStripeEvent(STRIPE_EVENTS.SUBSCRIPTION_UPDATED, {
        id: 'sub_test123',
        status: 'past_due',
      })

      stripe.webhooks.constructEvent.mockReturnValue(event)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(event),
      })

      await POST(req as any)

      expect(mockUpdate).toHaveBeenCalledWith({
        subscription_status: SUBSCRIPTION_STATUS.INACTIVE,
      })
    })

    it('should query by stripe_subscription_id', async () => {
      const mockEq = jest.fn(() => Promise.resolve({ data: null, error: null }))
      mockUpdate.mockReturnValue({ eq: mockEq })

      const event = createMockStripeEvent(STRIPE_EVENTS.SUBSCRIPTION_UPDATED, {
        id: 'sub_test123',
        status: 'active',
      })

      stripe.webhooks.constructEvent.mockReturnValue(event)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(event),
      })

      await POST(req as any)

      expect(mockEq).toHaveBeenCalledWith('stripe_subscription_id', 'sub_test123')
    })
  })

  describe('customer.subscription.deleted Event', () => {
    it('should cancel subscription and reset to free tier', async () => {
      const event = createMockStripeEvent(STRIPE_EVENTS.SUBSCRIPTION_DELETED, {
        id: 'sub_test123',
      })

      stripe.webhooks.constructEvent.mockReturnValue(event)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(event),
      })

      const response = await POST(req as any)

      expect(response.status).toBe(200)
      expect(mockUpdate).toHaveBeenCalledWith({
        subscription_status: SUBSCRIPTION_STATUS.CANCELLED,
        subscription_tier: SUBSCRIPTION_TIER.FREE,
      })
    })
  })

  describe('invoice.payment_failed Event', () => {
    it('should mark subscription as inactive on payment failure', async () => {
      const event = createMockStripeEvent(STRIPE_EVENTS.PAYMENT_FAILED, {
        id: 'in_test123',
        subscription: 'sub_test123',
      })

      stripe.webhooks.constructEvent.mockReturnValue(event)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(event),
      })

      const response = await POST(req as any)

      expect(response.status).toBe(200)
      expect(mockUpdate).toHaveBeenCalledWith({
        subscription_status: SUBSCRIPTION_STATUS.INACTIVE,
      })
    })

    it('should handle invoices without subscription', async () => {
      const event = createMockStripeEvent(STRIPE_EVENTS.PAYMENT_FAILED, {
        id: 'in_test123',
        subscription: null,
      })

      stripe.webhooks.constructEvent.mockReturnValue(event)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(event),
      })

      const response = await POST(req as any)

      expect(response.status).toBe(200)
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('Unhandled Events', () => {
    it('should return success for unhandled event types', async () => {
      const event = createMockStripeEvent('customer.created', {
        id: 'cus_test123',
      })

      stripe.webhooks.constructEvent.mockReturnValue(event)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(event),
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true })
    })
  })

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      const mockEq = jest.fn(() => Promise.reject(new Error('Database error')))
      mockUpdate.mockReturnValue({ eq: mockEq })

      const event = createMockStripeEvent(STRIPE_EVENTS.CHECKOUT_COMPLETED, {
        customer: 'cus_test123',
        subscription: 'sub_test123',
        metadata: { user_id: 'user123', tier: 'monthly' },
      })

      stripe.webhooks.constructEvent.mockReturnValue(event)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(event),
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error', 'Webhook handler failed')
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle complete checkout flow', async () => {
      // Simulate full checkout → activation flow
      const checkoutEvent = createMockStripeEvent(STRIPE_EVENTS.CHECKOUT_COMPLETED, {
        customer: 'cus_test123',
        subscription: 'sub_test123',
        metadata: { user_id: 'user123', tier: 'yearly' },
      })

      stripe.webhooks.constructEvent.mockReturnValue(checkoutEvent)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(checkoutEvent),
      })

      const response = await POST(req as any)

      expect(response.status).toBe(200)
      expect(mockUpdate).toHaveBeenCalledWith({
        subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
        subscription_tier: 'yearly',
        stripe_subscription_id: 'sub_test123',
        stripe_customer_id: 'cus_test123',
      })
    })

    it('should handle subscription cancellation flow', async () => {
      // User cancels their subscription
      const cancelEvent = createMockStripeEvent(STRIPE_EVENTS.SUBSCRIPTION_DELETED, {
        id: 'sub_test123',
      })

      stripe.webhooks.constructEvent.mockReturnValue(cancelEvent)

      const req = createMockRequest({
        method: 'POST',
        body: JSON.stringify(cancelEvent),
      })

      const response = await POST(req as any)

      expect(response.status).toBe(200)
      expect(mockUpdate).toHaveBeenCalledWith({
        subscription_status: SUBSCRIPTION_STATUS.CANCELLED,
        subscription_tier: SUBSCRIPTION_TIER.FREE,
      })
    })
  })
})
