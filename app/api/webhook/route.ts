import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Initialize Supabase with service role key for admin operations
// This bypasses RLS policies - use with caution
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Update user's subscription status
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_tier: session.metadata?.tier || 'monthly',
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
          })
          .eq('id', session.metadata?.user_id)

        console.log('Subscription activated:', session.metadata?.user_id)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Update subscription status
        const status = subscription.status === 'active' ? 'active' : 'inactive'

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: status,
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log('Subscription updated:', subscription.id, status)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Mark subscription as cancelled
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            subscription_tier: 'free',
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log('Subscription cancelled:', subscription.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        // Mark subscription as inactive
        if (invoice.subscription) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'inactive',
            })
            .eq('stripe_subscription_id', invoice.subscription as string)
        }

        console.log('Payment failed:', invoice.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
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
