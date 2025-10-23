'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiCelebrationProps {
  trigger: boolean
  onComplete?: () => void
}

export default function ConfettiCelebration({ trigger, onComplete }: ConfettiCelebrationProps) {
  const hasTriggered = useRef(false)

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (trigger && !hasTriggered.current && !prefersReducedMotion) {
      hasTriggered.current = true

      // Brand colors
      const colors = ['#6C63FF', '#FFC98A', '#F9EAE1', '#FFD700', '#FF69B4']

      // Create confetti burst
      const duration = 2500
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          clearInterval(interval)
          if (onComplete) onComplete()
          return
        }

        const particleCount = 50 * (timeLeft / duration)

        // Fire from bottom center going up and out
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.4, 0.6), y: 0.9 },
          colors: colors
        })
      }, 250)

      // Cleanup
      return () => clearInterval(interval)
    }

    // Reset trigger flag when trigger becomes false
    if (!trigger) {
      hasTriggered.current = false
    }
  }, [trigger, onComplete])

  // This component doesn't render anything visible
  return null
}
