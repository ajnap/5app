'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: string
  end: string
  htmlLink?: string
  status: string
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('/api/calendar/upcoming-events?maxResults=5')
      const data = await response.json()

      if (data.error && data.error.includes('not connected')) {
        setIsConnected(false)
        setEvents([])
      } else {
        setIsConnected(true)
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatEventTime = (startStr: string, endStr: string) => {
    const start = new Date(startStr)
    const end = new Date(endStr)
    const now = new Date()

    // Check if event is today
    const isToday =
      start.getDate() === now.getDate() &&
      start.getMonth() === now.getMonth() &&
      start.getFullYear() === now.getFullYear()

    // Check if event is tomorrow
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const isTomorrow =
      start.getDate() === tomorrow.getDate() &&
      start.getMonth() === tomorrow.getMonth() &&
      start.getFullYear() === tomorrow.getFullYear()

    const timeStr = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    const dateStr = start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

    if (isToday) {
      return { day: 'Today', time: timeStr, fullDate: dateStr }
    } else if (isTomorrow) {
      return { day: 'Tomorrow', time: timeStr, fullDate: dateStr }
    } else {
      return { day: dateStr, time: timeStr, fullDate: dateStr }
    }
  }

  const getEventIcon = (summary: string) => {
    const lower = summary.toLowerCase()
    if (lower.includes('connection') || lower.includes('5-min')) return '❤️'
    if (lower.includes('pickup') || lower.includes('drop')) return '🚗'
    if (lower.includes('soccer') || lower.includes('practice')) return '⚽'
    if (lower.includes('interview') || lower.includes('one-on-one')) return '👨‍👧'
    if (lower.includes('family')) return '🏠'
    if (lower.includes('date')) return '💑'
    return '📅'
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
          <span className="text-gray-600">Loading your schedule...</span>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your Calendar</h3>
          <p className="text-gray-600 mb-4">
            See your upcoming connection moments and family events in one place
          </p>
          <Link
            href="/account"
            className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all"
          >
            Connect Google Calendar
          </Link>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Upcoming Events</h3>
          <p className="text-gray-600">
            Start adding connection moments to your calendar to see them here!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border-2 border-primary-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📅</span>
          Upcoming Schedule
        </h2>
        <button
          onClick={fetchUpcomingEvents}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => {
          const { day, time, fullDate } = formatEventTime(event.start, event.end)
          const icon = getEventIcon(event.summary)

          return (
            <div
              key={event.id}
              className="group bg-white hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 border-2 border-gray-200 hover:border-primary-300 rounded-xl p-4 transition-all duration-200 cursor-pointer"
              onClick={() => {
                if (event.htmlLink) {
                  window.open(event.htmlLink, '_blank')
                }
              }}
            >
              <div className="flex items-start gap-4">
                {/* Icon & Time */}
                <div className="flex-shrink-0 text-center">
                  <div className="text-3xl mb-1">{icon}</div>
                  <div className="text-xs font-bold text-primary-700">{time}</div>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 border border-primary-300">
                      {day}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-1">
                    {event.summary}
                  </h3>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 text-gray-400 group-hover:text-primary-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Click any event to view details in Google Calendar
        </p>
      </div>
    </div>
  )
}
