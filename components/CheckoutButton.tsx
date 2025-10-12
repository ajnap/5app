'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type CheckoutButtonProps = {
  tier: 'monthly' | 'yearly'
}

export default function CheckoutButton({ tier }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)

    try {
      // Call our checkout API route
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      })

      const { url, error } = await response.json()

      if (error) {
        console.error('Checkout error:', error)
        alert('Failed to start checkout. Please try again.')
        return
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Loading...' : 'Upgrade Now'}
    </button>
  )
}
