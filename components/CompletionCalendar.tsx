'use client'

import { useState } from 'react'

interface CompletionDate {
  date: string
  count: number
}

interface CompletionCalendarProps {
  completions: CompletionDate[]
}

export default function CompletionCalendar({ completions }: CompletionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Create a map of dates to completion counts
  const completionMap = new Map<string, number>()
  completions.forEach(comp => {
    completionMap.set(comp.date, comp.count)
  })

  // Get the first day of the month and number of days
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Month navigation
  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  // Check if a date has completions
  const hasCompletion = (day: number): number => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return completionMap.get(dateStr) || 0
  }

  // Get intensity class based on completion count
  const getIntensityClass = (count: number): string => {
    if (count === 0) return 'bg-gray-100'
    if (count === 1) return 'bg-green-200'
    if (count === 2) return 'bg-green-400'
    return 'bg-green-600'
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const today = new Date()
  const isToday = (day: number): boolean => {
    return today.getDate() === day &&
           today.getMonth() === month &&
           today.getFullYear() === year
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before the month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const completionCount = hasCompletion(day)
          const intensityClass = getIntensityClass(completionCount)
          const isTodayDate = isToday(day)

          return (
            <div
              key={day}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-default ${intensityClass} ${
                isTodayDate ? 'ring-2 ring-primary-500 ring-offset-2 scale-in' : ''
              } ${completionCount > 0 ? 'text-white hover:scale-110 hover:shadow-lg' : 'text-gray-700 hover:bg-gray-200'} ${
                completionCount > 0 ? 'animate-bounce-gentle' : ''
              }`}
              title={completionCount > 0 ? `${completionCount} ${completionCount === 1 ? 'activity' : 'activities'} completed` : 'No activities'}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">Activity Level:</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-gray-100"></div>
              <div className="w-4 h-4 rounded bg-green-200"></div>
              <div className="w-4 h-4 rounded bg-green-400"></div>
              <div className="w-4 h-4 rounded bg-green-600"></div>
            </div>
            <span className="text-gray-500">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
