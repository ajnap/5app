'use client'

import { useState, useEffect } from 'react'
import MemoryModal from './MemoryModal'

interface Child {
  id: string
  name: string
  birth_date: string
}

interface QuickMemoryButtonProps {
  children: Child[]
  userId: string
}

const TOOLTIP_STORAGE_KEY = 'memory_fab_tooltip_shown'

export default function QuickMemoryButton({ children, userId }: QuickMemoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipDismissed, setTooltipDismissed] = useState(true) // Start hidden

  useEffect(() => {
    // Check if first-time tooltip should show
    const tooltipShown = localStorage.getItem(TOOLTIP_STORAGE_KEY)
    if (!tooltipShown) {
      setTooltipDismissed(false)
      // Show tooltip after a brief delay
      const timer = setTimeout(() => setShowTooltip(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClick = () => {
    setIsOpen(true)
    // Dismiss tooltip on first use
    if (showTooltip) {
      setShowTooltip(false)
      setTooltipDismissed(true)
      localStorage.setItem(TOOLTIP_STORAGE_KEY, 'true')
    }
  }

  const dismissTooltip = () => {
    setShowTooltip(false)
    setTooltipDismissed(true)
    localStorage.setItem(TOOLTIP_STORAGE_KEY, 'true')
  }

  if (children.length === 0) {
    return null // Don't show button if no children
  }

  return (
    <>
      {/* FAB with label */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
        {/* First-time tooltip */}
        {showTooltip && !tooltipDismissed && (
          <div className="relative animate-fade-in-up bg-slate-800 text-white text-sm px-4 py-3 rounded-xl shadow-xl max-w-[240px]">
            <button
              onClick={dismissTooltip}
              className="absolute -top-2 -right-2 bg-slate-600 hover:bg-slate-500 rounded-full w-5 h-5 flex items-center justify-center text-xs"
              aria-label="Dismiss tooltip"
            >
              ×
            </button>
            <p className="font-medium mb-1">📷 Add Memory</p>
            <p className="text-slate-300 text-xs leading-relaxed">
              Capture special moments after an activity — photos, notes, or milestones!
            </p>
            {/* Arrow pointing to button */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-800 rotate-45" />
          </div>
        )}

        {/* Labeled FAB button */}
        <button
          onClick={handleClick}
          className="group flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          aria-label="Add a memory"
        >
          <span className="bg-white/20 rounded-full p-1.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </span>
          <span className="font-semibold text-sm whitespace-nowrap">
            Add Memory
          </span>
        </button>
      </div>

      <MemoryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        children={children}
        userId={userId}
      />
    </>
  )
}
