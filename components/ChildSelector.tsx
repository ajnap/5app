'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Child {
  id: string
  name: string
  age: number
  birth_date: string
}

interface ChildSelectorProps {
  children: Child[]
  selectedChildId: string | null
  onSelectChild: (childId: string | null) => void
}

export default function ChildSelector({ children, selectedChildId, onSelectChild }: ChildSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Get emoji based on age
  const getAgeEmoji = (age: number) => {
    if (age < 2) return '👶'
    if (age < 5) return '🧒'
    if (age < 12) return '🧑'
    if (age < 18) return '👦'
    return '🧑‍🎓'
  }

  // Get age category label
  const getAgeLabel = (age: number) => {
    if (age < 2) return 'Infant'
    if (age < 5) return 'Toddler'
    if (age < 12) return 'Elementary'
    if (age < 18) return 'Teen'
    return 'Young Adult'
  }

  // Find selected child
  const selectedChild = children.find(child => child.id === selectedChildId)

  // If no children, show empty state
  if (children.length === 0) {
    return (
      <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 fade-in">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Add your children to get personalized prompts
          </h3>
          <p className="text-gray-600 mb-6">
            We'll show age-appropriate activities for each child
          </p>
          <Link
            href="/children/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-xl">+</span>
            Add Your First Child
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Label */}
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {children.length === 1 ? 'Your Child' : 'Select a Child'}
      </label>

      {/* Dropdown/Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border-2 border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between hover:border-primary-400 focus:border-primary-500 focus:outline-none transition-colors shadow-sm hover:shadow-md"
        >
          {selectedChild ? (
            <div className="flex items-center gap-4">
              <span className="text-4xl">{getAgeEmoji(selectedChild.age)}</span>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-lg">{selectedChild.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedChild.age} years old • {getAgeLabel(selectedChild.age)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-4xl">👨‍👩‍👧‍👦</span>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-lg">All Children</p>
                <p className="text-sm text-gray-600">Showing general prompts</p>
              </div>
            </div>
          )}
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden">
            {/* All Children Option */}
            <button
              type="button"
              onClick={() => {
                onSelectChild(null)
                setIsOpen(false)
              }}
              className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-primary-50 transition-colors border-b border-gray-100 ${
                !selectedChildId ? 'bg-primary-50' : ''
              }`}
            >
              <span className="text-3xl">👨‍👩‍👧‍👦</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900">All Children</p>
                <p className="text-xs text-gray-600">Show general prompts</p>
              </div>
              {!selectedChildId && (
                <svg className="w-5 h-5 text-primary-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Individual Children */}
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => {
                  onSelectChild(child.id)
                  setIsOpen(false)
                }}
                className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  selectedChildId === child.id ? 'bg-primary-50' : ''
                }`}
              >
                <span className="text-3xl">{getAgeEmoji(child.age)}</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{child.name}</p>
                  <p className="text-xs text-gray-600">
                    {child.age} years old • {getAgeLabel(child.age)}
                  </p>
                </div>
                {selectedChildId === child.id && (
                  <svg className="w-5 h-5 text-primary-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}

            {/* Add New Child Option */}
            <Link
              href="/children/new"
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-green-50 transition-colors text-green-700 font-semibold border-t-2 border-green-100"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-3xl">+</span>
              <span>Add Another Child</span>
            </Link>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {selectedChild && (
        <p className="text-sm text-gray-600 mt-3">
          Showing prompts for {getAgeLabel(selectedChild.age).toLowerCase()}s ({selectedChild.age} years old)
        </p>
      )}
    </div>
  )
}
