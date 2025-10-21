'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      alert(`Failed to complete onboarding: ${error.message}. Please try again.`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8 fade-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white' : 'bg-gray-200 text-gray-500'} font-bold`}>
              1
            </div>
            <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-gradient-to-r from-primary-600 to-primary-700' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white' : 'bg-gray-200 text-gray-500'} font-bold`}>
              2
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm">
            Step {currentStep} of 2
          </p>
        </div>

        {/* Step 1: Faith Mode */}
        {currentStep === 1 && (
          <div className="card fade-in">
            <h1 className="text-3xl font-bold gradient-text mb-4">
              Welcome to The Next 5 Minutes!
            </h1>
            <p className="text-gray-700 mb-6 text-lg">
              We're here to help you create meaningful moments with your children through intentional connection.
            </p>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Would you like faith-based reflection prompts?
              </h2>
              <p className="text-gray-700 mb-4">
                We can include optional spiritual reflection questions after activities to help you connect your family moments to deeper meaning and faith.
              </p>

              <div className="space-y-3">
                <label className="flex items-start p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-primary-400 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="faithMode"
                    checked={faithMode === true}
                    onChange={() => setFaithMode(true)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Yes, include faith-based prompts</div>
                    <div className="text-sm text-gray-600">Add gentle spiritual reflection questions to deepen meaning</div>
                  </div>
                </label>

                <label className="flex items-start p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-primary-400 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="faithMode"
                    checked={faithMode === false}
                    onChange={() => setFaithMode(false)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">No, keep it secular</div>
                    <div className="text-sm text-gray-600">Focus on connection without spiritual elements</div>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleStep1Continue}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Continue
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can change this preference anytime in your account settings
            </p>
          </div>
        )}

        {/* Step 2: Add First Child */}
        {currentStep === 2 && (
          <div className="card fade-in">
            <button
              onClick={() => setCurrentStep(1)}
              className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold gradient-text mb-4">
              Tell us about your first child
            </h1>
            <p className="text-gray-700 mb-6 text-lg">
              We'll use this to personalize age-appropriate activities and track your connection journey together.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.name ? 'border-red-400' : 'border-gray-200'
                  } focus:border-primary-500 focus:outline-none transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="childBirthDate" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.birthDate ? 'border-red-400' : 'border-gray-200'
                  } focus:border-primary-500 focus:outline-none transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.birthDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.birthDate}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  We'll use this to suggest age-appropriate activities
                </p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Setting up...' : 'Complete Setup'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can add more children later from your dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
