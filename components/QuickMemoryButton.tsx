'use client'

import { useState } from 'react'
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

export default function QuickMemoryButton({ children, userId }: QuickMemoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (children.length === 0) {
    return null // Don't show button if no children
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-5 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200"
        aria-label="Add quick memory"
        title="Add quick memory"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
      </button>

      <MemoryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        children={children}
        userId={userId}
      />
    </>
  )
}
