import { NextResponse } from 'next/server'
import { createServerClientForAPI } from '@/lib/supabase-server-api'
import Stripe from 'stripe'
import { z } from 'zod'
import { stripe, getOrCreateStripeCustomer, SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/stripe'
import { checkoutSchema, formatZodError } from '@/lib/validation'
import { ERROR_MESSAGES, ROUTES } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = checkoutSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        formatZodError(validation.error),
        { status: 400 }
      )
    }

    const { tier } = validation.data

    // Get authenticated user
    const supabase = await createServerClientForAPI()

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.ACCOUNT}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.ACCOUNT}?canceled=true`,
      metadata: {
        user_id: session.user.id,
        tier,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: 'Payment processing error. Please try again.' },
        { status: 400 }
      )
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        formatZodError(error),
        { status: 400 }
      )
    }

    // Generic error response
    return NextResponse.json(
      { error: ERROR_MESSAGES.CHECKOUT_FAILED },
      { status: 500 }
    )
  }
}
