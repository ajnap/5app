'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isSameMonth, addMonths, subMonths, isToday, parseISO } from 'date-fns'

interface Child {
  id: string
  name: string
  birth_date: string
}

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: string
  end: string
  htmlLink?: string
  status?: string
}

interface ScheduleClientProps {
  userId: string
  children: Child[]
}

const EVENT_TYPES = [
  { id: 'family', label: 'Family Activity', icon: '👨‍👩‍👧‍👦', color: 'bg-lavender-100 text-lavender-700 border-lavender-200' },
  { id: 'one-on-one', label: 'One-on-One Time', icon: '💜', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'school', label: 'School Event', icon: '🎓', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'sports', label: 'Sports/Activity', icon: '⚽', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'medical', label: 'Medical', icon: '🏥', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'date-night', label: 'Date Night', icon: '💑', color: 'bg-rose-100 text-rose-700 border-rose-200' },
]

const QUICK_ACTIONS = [
  { label: 'Schedule 1-on-1', icon: '💜', description: 'Quality time with one child' },
  { label: 'Plan Date Night', icon: '🌙', description: 'Reconnect with your spouse' },
  { label: 'Family Activity', icon: '🎉', description: 'Fun for everyone' },
  { label: 'Add Appointment', icon: '📋', description: 'Doctor, dentist, etc.' },
]

export default function ScheduleClient({ userId, children }: ScheduleClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'week' | 'month'>('week')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Form state for new event
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'family',
    childId: '',
    date: '',
    time: '10:00',
    duration: 60,
    recurring: 'none' as 'none' | 'weekly' | 'monthly',
  })

  useEffect(() => {
    checkCalendarStatus()
    fetchEvents()
  }, [])

  const checkCalendarStatus = async () => {
    try {
      const response = await fetch('/api/calendar/status')
      const data = await response.json()
      setIsCalendarConnected(data.connected)
    } catch (error) {
      console.error('Error checking calendar status:', error)
    }
  }

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/calendar/upcoming-events?maxResults=50')
      const data = await response.json()
      if (data.events) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      const scheduledTime = new Date(`${newEvent.date}T${newEvent.time}:00`)
      const child = children.find(c => c.id === newEvent.childId)

      const response = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: child?.name,
          activityTitle: newEvent.title,
          activityDescription: newEvent.description,
          scheduledTime: scheduledTime.toISOString(),
          estimatedMinutes: newEvent.duration,
          recurrence: newEvent.recurring !== 'none' ? {
            frequency: newEvent.recurring.toUpperCase(),
            count: 12,
          } : undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to create event')

      toast.success('Event created!')
      setShowAddModal(false)
      setNewEvent({
        title: '',
        description: '',
        eventType: 'family',
        childId: '',
        date: '',
        time: '10:00',
        duration: 60,
        recurring: 'none',
      })
      fetchEvents()
    } catch (error) {
      toast.error('Failed to create event')
    }
  }

  const openAddModal = (date?: Date) => {
    if (date) {
      setNewEvent(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))
    }
    setShowAddModal(true)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    } else {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      const startWeek = startOfWeek(start, { weekStartsOn: 0 })
      const endWeek = endOfWeek(end, { weekStartsOn: 0 })

      const days: Date[] = []
      let day = startWeek
      while (day <= endWeek) {
        days.push(day)
        day = addDays(day, 1)
      }
      return days
    }
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start)
      return isSameDay(eventDate, date)
    })
  }

  const upcomingEvents = events
    .filter(e => new Date(e.start) >= new Date())
    .slice(0, 5)

  const calendarDays = generateCalendarDays()

  return (
    <main className="container-narrow py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-display-sm text-slate-900 mb-1">Family Schedule</h1>
            <p className="text-slate-600">Plan activities, coordinate events, and make time for connection</p>
          </div>
          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl font-semibold shadow-lg shadow-lavender-200/50 hover:shadow-xl hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </button>
        </div>

        {/* Calendar Connection Banner */}
        {!isCalendarConnected && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-2xl">📅</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Connect Google Calendar</h3>
                <p className="text-sm text-slate-600">Sync your family schedule and create events automatically</p>
              </div>
              <a
                href="/account"
                className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Connect
              </a>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {QUICK_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                setNewEvent(prev => ({
                  ...prev,
                  title: action.label === 'Schedule 1-on-1' ? `1-on-1 with ${children[0]?.name || 'child'}` : '',
                  eventType: action.label === 'Plan Date Night' ? 'date-night' :
                             action.label === 'Schedule 1-on-1' ? 'one-on-one' :
                             action.label === 'Family Activity' ? 'family' : 'medical'
                }))
                openAddModal()
              }}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-cream-200 hover:border-lavender-300 hover:shadow-md transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
              <span className="text-sm font-medium text-slate-700">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="px-6 py-4 border-b border-cream-100 bg-gradient-to-r from-cream-50 to-lavender-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="font-display text-xl font-semibold text-slate-900">
                    {format(currentDate, view === 'week' ? 'MMMM yyyy' : 'MMMM yyyy')}
                  </h2>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentDate(view === 'week' ? addDays(currentDate, -7) : subMonths(currentDate, 1))}
                      className="p-2 hover:bg-cream-200 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-1 text-sm font-medium text-lavender-600 hover:bg-lavender-50 rounded-lg transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setCurrentDate(view === 'week' ? addDays(currentDate, 7) : addMonths(currentDate, 1))}
                      className="p-2 hover:bg-cream-200 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex bg-cream-100 rounded-lg p-1">
                  <button
                    onClick={() => setView('week')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      view === 'week' ? 'bg-white text-lavender-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setView('month')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      view === 'month' ? 'bg-white text-lavender-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className={`grid grid-cols-7 gap-1 ${view === 'month' ? 'auto-rows-fr' : ''}`}>
                {calendarDays.map((day, idx) => {
                  const dayEvents = getEventsForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const today = isToday(day)

                  return (
                    <button
                      key={idx}
                      onClick={() => openAddModal(day)}
                      className={`relative p-2 rounded-xl text-left transition-all hover:bg-lavender-50 min-h-[80px] ${
                        !isCurrentMonth && view === 'month' ? 'opacity-40' : ''
                      } ${today ? 'ring-2 ring-lavender-400 bg-lavender-50' : ''}`}
                    >
                      <span className={`text-sm font-medium ${
                        today ? 'text-lavender-700' : 'text-slate-700'
                      }`}>
                        {format(day, 'd')}
                      </span>

                      {/* Event dots */}
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 3).map((event, eventIdx) => (
                          <div
                            key={eventIdx}
                            className="text-xs truncate px-1.5 py-0.5 rounded bg-lavender-100 text-lavender-700"
                          >
                            {event.summary}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-xs text-slate-500">+{dayEvents.length - 3} more</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-cream-100 bg-gradient-to-r from-cream-50 to-peach-50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <span>📆</span> Upcoming
                </h3>
              </div>
              <div className="p-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-cream-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-cream-100 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event, idx) => (
                      <a
                        key={idx}
                        href={event.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-cream-50 rounded-xl hover:bg-lavender-50 transition-colors group"
                      >
                        <p className="font-medium text-slate-800 group-hover:text-lavender-700 text-sm truncate">
                          {event.summary}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {format(parseISO(event.start), 'EEE, MMM d • h:mm a')}
                        </p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <span className="text-3xl mb-2 block">🗓️</span>
                    <p className="text-sm text-slate-500">No upcoming events</p>
                    <button
                      onClick={() => openAddModal()}
                      className="mt-2 text-sm text-lavender-600 font-medium hover:underline"
                    >
                      Add your first event
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Family Members */}
            <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-cream-100 bg-gradient-to-r from-lavender-50 to-purple-50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <span>👨‍👩‍👧‍👦</span> Family
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {children.map((child, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNewEvent(prev => ({
                        ...prev,
                        childId: child.id,
                        title: `1-on-1 with ${child.name}`,
                        eventType: 'one-on-one'
                      }))
                      openAddModal()
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-lavender-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-lavender-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {child.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{child.name}</p>
                      <p className="text-xs text-slate-500">Schedule 1-on-1</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                ))}
                {children.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500">Add children to schedule 1-on-1s</p>
                    <a href="/children" className="text-sm text-lavender-600 font-medium hover:underline">
                      Add Children
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-peach-50 to-peach-100 rounded-2xl border border-peach-200 p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Scheduling Tip</h4>
                  <p className="text-sm text-slate-600">
                    Block out regular 1-on-1 time with each child weekly. Even 15 minutes of focused attention makes a big difference!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-cream-100 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-slate-900">Add Event</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Event Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {EVENT_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setNewEvent(prev => ({ ...prev, eventType: type.id }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        newEvent.eventType === type.id
                          ? 'border-lavender-400 bg-lavender-50'
                          : 'border-cream-200 hover:border-cream-300'
                      }`}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className="text-xs font-medium text-slate-600">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Park day with Emma"
                  className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent"
                />
              </div>

              {/* Child Selector */}
              {(newEvent.eventType === 'one-on-one' || newEvent.eventType === 'family') && children.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">With</label>
                  <select
                    value={newEvent.childId}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, childId: e.target.value }))}
                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent"
                  >
                    <option value="">Select child (optional)</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                <select
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              {/* Recurring */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Repeat</label>
                <select
                  value={newEvent.recurring}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, recurring: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent"
                >
                  <option value="none">Does not repeat</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes (optional)</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Any additional details..."
                  rows={2}
                  className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-cream-50 px-6 py-4 border-t border-cream-100 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-cream-300 text-slate-700 rounded-xl font-medium hover:bg-cream-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={!isCalendarConnected}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalendarConnected ? 'Create Event' : 'Connect Calendar First'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
