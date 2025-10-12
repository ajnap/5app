'use client'

import { useState } from 'react'

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  const handleManageSubscription = async () => {
    setLoading(true)

    try {
      // Call our portal API route
      const response = await fetch('/api/portal', {
        method: 'POST',
      })

      const { url, error } = await response.json()

      if (error) {
        console.error('Portal error:', error)
        alert('Failed to open billing portal. Please try again.')
        return
      }

      // Redirect to Stripe Customer Portal
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleManageSubscription}
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Manage Subscription'}
      </button>
      <p className="text-sm text-gray-600 text-center">
        Update payment method, view invoices, or cancel subscription
      </p>
    </div>
  )
}
