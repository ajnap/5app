import { NextResponse } from 'next/server'
import { createServerClientForAPI } from '@/lib/supabase-server-api'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { ERROR_MESSAGES, ROUTES } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createServerClientForAPI()

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      )
    }

    // Get user's profile with Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NO_STRIPE_CUSTOMER },
        { status: 400 }
      )
    }

    // Create Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.ACCOUNT}`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Portal error:', error)

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: 'Unable to access billing portal. Please try again.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: ERROR_MESSAGES.PORTAL_FAILED },
      { status: 500 }
    )
  }
}
