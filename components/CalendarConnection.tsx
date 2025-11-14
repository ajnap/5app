'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

export default function CalendarConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/calendar/status')
      const data = await response.json()
      setIsConnected(data.connected)
    } catch (error) {
      console.error('Error checking calendar status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      // Redirect to Google OAuth flow
      await signIn('google', {
        callbackUrl: '/account',
        redirect: true,
      })
    } catch (error) {
      console.error('Error connecting calendar:', error)
      toast.error('Failed to connect calendar')
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google Calendar? You will need to reconnect to create calendar events.')) {
      return
    }

    setIsDisconnecting(true)

    try {
      const response = await fetch('/api/calendar/disconnect', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      setIsConnected(false)
      toast.success('Calendar disconnected')
    } catch (error) {
      console.error('Error disconnecting calendar:', error)
      toast.error('Failed to disconnect calendar')
    } finally {
      setIsDisconnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
          <span className="text-gray-600">Checking calendar connection...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">📅</div>
            <h3 className="text-xl font-bold text-gray-900">Google Calendar</h3>
          </div>

          {isConnected ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-green-700">Connected</span>
              </div>
              <p className="text-gray-600 mb-4">
                Your Google Calendar is connected. You can now create events directly from connection
                prompts and schedule recurring 1-on-1s.
              </p>
              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect Calendar'}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-600">Not Connected</span>
              </div>
              <p className="text-gray-600 mb-4">
                Connect your Google Calendar to automatically create events for connection activities,
                schedule recurring 1-on-1s, and keep track of your parent-child moments.
              </p>
              <button
                onClick={handleConnect}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all"
              >
                Connect Google Calendar
              </button>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Features:</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Create calendar events from daily prompts</li>
                  <li>Schedule recurring weekly 1-on-1s</li>
                  <li>Automatic reminders for connection moments</li>
                  <li>Two-way sync with your calendar</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
