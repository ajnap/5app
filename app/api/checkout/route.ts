import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe, getOrCreateStripeCustomer, SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { tier } = await request.json()

    // Validate tier
    if (!tier || !SUBSCRIPTION_TIERS[tier as SubscriptionTier]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      session.user.email!,
      session.user.id
    )

    // Update profile with Stripe customer ID if not already set
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', session.user.id)

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: SUBSCRIPTION_TIERS[tier as SubscriptionTier].priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?canceled=true`,
      metadata: {
        user_id: session.user.id,
        tier,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
