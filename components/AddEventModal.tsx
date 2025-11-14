'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { EVENT_TEMPLATES, type EventType, type EventTemplate } from '@/lib/event-types'

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: () => void
  preselectedType?: EventType
  children?: { id: string; name: string }[]
}

export default function AddEventModal({
  isOpen,
  onClose,
  onEventCreated,
  preselectedType,
  children = [],
}: AddEventModalProps) {
  const [selectedType, setSelectedType] = useState<EventType>(preselectedType || 'custom')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedChild, setSelectedChild] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(30)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const template: EventTemplate = EVENT_TEMPLATES[selectedType]

  // Initialize defaults when type changes
  useEffect(() => {
    if (template) {
      setDuration(template.defaultDuration)
      setDescription(template.description)
    }
  }, [selectedType, template])

  // Set defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(17, 0, 0, 0) // Default to 5pm

      setDate(tomorrow.toISOString().split('T')[0])
      setTime('17:00')

      if (preselectedType) {
        setSelectedType(preselectedType)
      }
    }
  }, [isOpen, preselectedType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter an event title')
      return
    }

    setIsSubmitting(true)

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${date}T${time}`)

      // Build event title with child name if applicable
      let finalTitle = title
      if (selectedChild && children.length > 0) {
        const child = children.find(c => c.id === selectedChild)
        if (child) {
          finalTitle = `${title} with ${child.name}`
        }
      }

      // Create calendar event
      const response = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: selectedChild ? children.find(c => c.id === selectedChild)?.name : '',
          activityTitle: finalTitle,
          activityDescription: description,
          scheduledTime: scheduledDateTime.toISOString(),
          estimatedMinutes: duration,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create event')
      }

      const data = await response.json()

      toast.success(`${template.icon} Event created!`, {
        description: `${finalTitle} scheduled for ${scheduledDateTime.toLocaleDateString()}`,
        action: data.event?.htmlLink ? {
          label: 'View',
          onClick: () => window.open(data.event.htmlLink, '_blank')
        } : undefined
      })

      // Reset form
      setTitle('')
      setDescription(template.description)
      setSelectedChild('')
      setDuration(template.defaultDuration)

      // Call callback
      if (onEventCreated) {
        onEventCreated()
      }

      // Close modal
      onClose()
    } catch (error: any) {
      console.error('Create event error:', error)
      toast.error('Failed to create event', {
        description: error.message || 'Please try again'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">{template.icon}</span>
              Add Event to Calendar
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Event Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(EVENT_TEMPLATES).map(([type, tmpl]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type as EventType)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedType === type
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{tmpl.icon}</div>
                  <div className="text-xs font-semibold text-gray-700">{tmpl.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title with Suggestions */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g., ${template.suggestedTitles[0]}`}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              required
            />
            {template.suggestedTitles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {template.suggestedTitles.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setTitle(suggestion)}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Child Selection (if applicable) */}
          {children.length > 0 && selectedType !== 'date-night' && (
            <div>
              <label htmlFor="child" className="block text-sm font-semibold text-gray-700 mb-2">
                With Child (Optional)
              </label>
              <select
                id="child"
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              >
                <option value="">None (or whole family)</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-semibold text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
              Duration: {duration} minutes
            </label>
            <input
              type="range"
              id="duration"
              min="5"
              max="240"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>4 hours</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any notes or details..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : `${template.icon} Create Event`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
