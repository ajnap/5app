'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'

interface OnboardingFlowProps {
  userId: string
  userEmail: string
}

export default function OnboardingFlow({ userId, userEmail }: OnboardingFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Faith mode
  const [faithMode, setFaithMode] = useState(false)

  // Step 2: First child
  const [childName, setChildName] = useState('')
  const [childBirthDate, setChildBirthDate] = useState('')
  const [errors, setErrors] = useState<{ name?: string; birthDate?: string }>({})

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleStep1Continue = () => {
    setCurrentStep(2)
  }

  const validateChildForm = (): boolean => {
    const newErrors: { name?: string; birthDate?: string } = {}

    if (!childName.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!childBirthDate) {
      newErrors.birthDate = 'Birth date is required'
    } else if (new Date(childBirthDate) > new Date()) {
      newErrors.birthDate = 'Birth date cannot be in the future'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleComplete = async () => {
    if (!validateChildForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Update profile with faith_mode and onboarding_completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          faith_mode: faithMode,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // 2. Create first child profile
      const { error: childError } = await supabase
        .from('child_profiles')
        .insert({
          user_id: userId,
          name: childName.trim(),
          birth_date: childBirthDate,
          interests: [],
          personality_traits: [],
          current_challenges: [],
        })

      if (childError) throw childError

      // 3. Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error('Onboarding error:', error)
      toast.error('Failed to complete onboarding', {
        description: error.message || 'Please try again'
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-lavender-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-peach-200/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Progress Indicator */}
        <div className="mb-10 fade-in-up">
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Step 1 */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-display font-bold text-lg transition-all duration-300 ${
              currentStep >= 1
                ? 'bg-lavender-500 text-white shadow-glow'
                : 'bg-cream-200 text-slate-400'
            }`}>
              1
            </div>

            {/* Connector */}
            <div className="w-20 h-1 rounded-full overflow-hidden bg-cream-200">
              <div className={`h-full bg-lavender-500 transition-all duration-500 ${
                currentStep >= 2 ? 'w-full' : 'w-0'
              }`} />
            </div>

            {/* Step 2 */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-display font-bold text-lg transition-all duration-300 ${
              currentStep >= 2
                ? 'bg-lavender-500 text-white shadow-glow'
                : 'bg-cream-200 text-slate-400'
            }`}>
              2
            </div>
          </div>
          <p className="text-center text-slate-500 text-sm font-medium">
            Step {currentStep} of 2
          </p>
        </div>

        {/* Step 1: Faith Mode */}
        {currentStep === 1 && (
          <div className="card fade-in-up">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4 animate-bounce-gentle">✨</div>
              <h1 className="font-display text-display-sm text-slate-900 mb-3">
                Welcome to The Next 5 Minutes!
              </h1>
              <p className="text-slate-600 text-body-lg">
                We're here to help you create meaningful moments with your children through intentional connection.
              </p>
            </div>

            <div className="card-lavender mb-8">
              <h2 className="font-display text-xl font-semibold text-slate-900 mb-3">
                Would you like faith-based reflection prompts?
              </h2>
              <p className="text-slate-600 mb-6">
                We can include optional spiritual reflection questions after activities to help you connect your family moments to deeper meaning and faith.
              </p>

              <div className="space-y-3">
                <label className={`flex items-start p-4 bg-white rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  faithMode ? 'border-lavender-400 shadow-soft bg-lavender-50' : 'border-cream-300 hover:border-lavender-300'
                }`}>
                  <input
                    type="radio"
                    name="faithMode"
                    checked={faithMode === true}
                    onChange={() => setFaithMode(true)}
                    className="mt-1 mr-4 w-5 h-5 text-lavender-500 focus:ring-lavender-400"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">Yes, include faith-based prompts</div>
                    <div className="text-sm text-slate-500">Add gentle spiritual reflection questions to deepen meaning</div>
                  </div>
                </label>

                <label className={`flex items-start p-4 bg-white rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  !faithMode ? 'border-lavender-400 shadow-soft bg-lavender-50' : 'border-cream-300 hover:border-lavender-300'
                }`}>
                  <input
                    type="radio"
                    name="faithMode"
                    checked={faithMode === false}
                    onChange={() => setFaithMode(false)}
                    className="mt-1 mr-4 w-5 h-5 text-lavender-500 focus:ring-lavender-400"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">No, keep it secular</div>
                    <div className="text-sm text-slate-500">Focus on connection without spiritual elements</div>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleStep1Continue}
              className="btn-primary-lg w-full group"
            >
              Continue
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>

            <p className="text-xs text-slate-400 text-center mt-4">
              You can change this preference anytime in your account settings
            </p>
          </div>
        )}

        {/* Step 2: Add First Child */}
        {currentStep === 2 && (
          <div className="card fade-in-up">
            <button
              onClick={() => setCurrentStep(1)}
              className="text-lavender-600 hover:text-lavender-700 mb-6 flex items-center gap-2 font-medium transition-colors group"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 8H3M7 4l-4 4 4 4" />
              </svg>
              Back
            </button>

            <div className="text-center mb-8">
              <div className="text-5xl mb-4 animate-bounce-gentle">👶</div>
              <h1 className="font-display text-display-sm text-slate-900 mb-3">
                Tell us about your first child
              </h1>
              <p className="text-slate-600 text-body-lg">
                We'll use this to personalize age-appropriate activities and track your connection journey together.
              </p>
            </div>

            <div className="space-y-5 mb-8">
              <div>
                <label htmlFor="childName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Child's Name
                </label>
                <input
                  id="childName"
                  type="text"
                  value={childName}
                  onChange={(e) => {
                    setChildName(e.target.value)
                    if (errors.name) setErrors({ ...errors, name: undefined })
                  }}
                  placeholder="Emma"
                  className={`input-lg ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="childBirthDate" className="block text-sm font-semibold text-slate-700 mb-2">
                  Birth Date
                </label>
                <input
                  id="childBirthDate"
                  type="date"
                  value={childBirthDate}
                  onChange={(e) => {
                    setChildBirthDate(e.target.value)
                    if (errors.birthDate) setErrors({ ...errors, birthDate: undefined })
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className={`input-lg ${errors.birthDate ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.birthDate && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.birthDate}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  We'll use this to suggest age-appropriate activities
                </p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className={`btn-primary-lg w-full group ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Setting up...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Complete Setup
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center mt-4">
              You can add more children later from your dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
