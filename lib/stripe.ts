import Stripe from 'stripe'

// Initialize Stripe with your secret key
// Make sure to add your STRIPE_SECRET_KEY to your .env file
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Helper function to get or create a Stripe customer
export async function getOrCreateStripeCustomer(
  email: string,
  userId: string
): Promise<string> {
  // Check if customer already exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabase_user_id: userId,
    },
  })

  return customer.id
}

// Subscription tier mapping
export const SUBSCRIPTION_TIERS = {
  monthly: {
    name: 'Monthly Premium',
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY!,
  },
  yearly: {
    name: 'Annual Premium',
    priceId: process.env.STRIPE_PRICE_ID_YEARLY!,
  },
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS
