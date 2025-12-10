'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types for guest data
export interface GuestChild {
  id: string
  name: string
  birth_date: string
  interests: string[]
  challenges: string[]
  age?: number
}

export interface GuestCompletion {
  prompt_id: string
  child_id: string
  completed_at: string
  reflection_note?: string
}

interface GuestData {
  children: GuestChild[]
  completions: GuestCompletion[]
  favorites: string[]
  onboardingCompleted: boolean
}

interface GuestContextType {
  isGuest: boolean
  guestData: GuestData
  addChild: (child: Omit<GuestChild, 'id'>) => GuestChild
  updateChild: (id: string, child: Partial<GuestChild>) => void
  removeChild: (id: string) => void
  addCompletion: (completion: Omit<GuestCompletion, 'completed_at'>) => void
  toggleFavorite: (promptId: string) => void
  clearGuestData: () => void
  getGuestDataForMigration: () => GuestData
  setOnboardingCompleted: (completed: boolean) => void
}

const STORAGE_KEY = 'next5min_guest_data'

const defaultGuestData: GuestData = {
  children: [],
  completions: [],
  favorites: [],
  onboardingCompleted: false,
}

const GuestContext = createContext<GuestContextType | undefined>(undefined)

// Helper to calculate age
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Generate UUID for guest children
function generateId(): string {
  return 'guest_' + Math.random().toString(36).substring(2, 15)
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const [guestData, setGuestData] = useState<GuestData>(defaultGuestData)
  const [isGuest, setIsGuest] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Add age calculations
        parsed.children = parsed.children.map((child: GuestChild) => ({
          ...child,
          age: calculateAge(child.birth_date)
        }))
        setGuestData(parsed)
        setIsGuest(parsed.children.length > 0)
      } catch (e) {
        console.error('Failed to parse guest data:', e)
      }
    }
    setHydrated(true)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guestData))
      setIsGuest(guestData.children.length > 0)
    }
  }, [guestData, hydrated])

  const addChild = (childData: Omit<GuestChild, 'id'>): GuestChild => {
    const newChild: GuestChild = {
      ...childData,
      id: generateId(),
      age: calculateAge(childData.birth_date)
    }
    setGuestData(prev => ({
      ...prev,
      children: [...prev.children, newChild]
    }))
    return newChild
  }

  const updateChild = (id: string, updates: Partial<GuestChild>) => {
    setGuestData(prev => ({
      ...prev,
      children: prev.children.map(child =>
        child.id === id
          ? { ...child, ...updates, age: updates.birth_date ? calculateAge(updates.birth_date) : child.age }
          : child
      )
    }))
  }

  const removeChild = (id: string) => {
    setGuestData(prev => ({
      ...prev,
      children: prev.children.filter(child => child.id !== id),
      completions: prev.completions.filter(c => c.child_id !== id)
    }))
  }

  const addCompletion = (completion: Omit<GuestCompletion, 'completed_at'>) => {
    const newCompletion: GuestCompletion = {
      ...completion,
      completed_at: new Date().toISOString()
    }
    setGuestData(prev => ({
      ...prev,
      completions: [...prev.completions, newCompletion]
    }))
  }

  const toggleFavorite = (promptId: string) => {
    setGuestData(prev => ({
      ...prev,
      favorites: prev.favorites.includes(promptId)
        ? prev.favorites.filter(id => id !== promptId)
        : [...prev.favorites, promptId]
    }))
  }

  const clearGuestData = () => {
    setGuestData(defaultGuestData)
    localStorage.removeItem(STORAGE_KEY)
    setIsGuest(false)
  }

  const getGuestDataForMigration = () => guestData

  const setOnboardingCompleted = (completed: boolean) => {
    setGuestData(prev => ({
      ...prev,
      onboardingCompleted: completed
    }))
  }

  // Don't render children until hydrated to prevent hydration mismatch
  if (!hydrated) {
    return null
  }

  return (
    <GuestContext.Provider value={{
      isGuest,
      guestData,
      addChild,
      updateChild,
      removeChild,
      addCompletion,
      toggleFavorite,
      clearGuestData,
      getGuestDataForMigration,
      setOnboardingCompleted,
    }}>
      {children}
    </GuestContext.Provider>
  )
}

export function useGuest() {
  const context = useContext(GuestContext)
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider')
  }
  return context
}
