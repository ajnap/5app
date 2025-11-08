import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { SUBSCRIPTION_STATUS, SUBSCRIPTION_TIER, STRIPE_EVENTS } from '@/lib/constants'

// Use dynamic import for Supabase to avoid build-time initialization
export async function POST(request: Request) {
  // Dynamically import and initialize Supabase admin client at runtime
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case STRIPE_EVENTS.CHECKOUT_COMPLETED: {
        const session = event.data.object as Stripe.Checkout.Session

        // Update user's subscription status
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
            subscription_tier: session.metadata?.tier || SUBSCRIPTION_TIER.MONTHLY,
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
          })
          .eq('id', session.metadata?.user_id)

        if (process.env.NODE_ENV === 'development') {
          console.log('Subscription activated:', session.metadata?.user_id)
        }
        break
      }

      case STRIPE_EVENTS.SUBSCRIPTION_UPDATED: {
        const subscription = event.data.object as Stripe.Subscription

        // Update subscription status
        const status = subscription.status === 'active'
          ? SUBSCRIPTION_STATUS.ACTIVE
          : SUBSCRIPTION_STATUS.INACTIVE

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: status,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (process.env.NODE_ENV === 'development') {
          console.log('Subscription updated:', subscription.id, status)
        }
        break
      }

      case STRIPE_EVENTS.SUBSCRIPTION_DELETED: {
        const subscription = event.data.object as Stripe.Subscription

        // Mark subscription as cancelled
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: SUBSCRIPTION_STATUS.CANCELLED,
            subscription_tier: SUBSCRIPTION_TIER.FREE,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (process.env.NODE_ENV === 'development') {
          console.log('Subscription cancelled:', subscription.id)
        }
        break
      }

      case STRIPE_EVENTS.PAYMENT_FAILED: {
        const invoice = event.data.object as Stripe.Invoice

        // Mark subscription as inactive
        if (invoice.subscription) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: SUBSCRIPTION_STATUS.INACTIVE,
            })
            .eq('stripe_subscription_id', invoice.subscription as string)
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('Payment failed:', invoice.id)
        }
        break
      }

      default:
        if (process.env.NODE_ENV === 'development') {
          console.log(`Unhandled event type: ${event.type}`)
        }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
