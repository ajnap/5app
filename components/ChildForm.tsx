'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'

const INTEREST_OPTIONS = [
  'Sports', 'Reading', 'Art & Crafts', 'Music', 'Dance', 'Science',
  'Animals', 'Video Games', 'Outdoors', 'Cooking', 'Building/Lego', 'Technology'
]

const PERSONALITY_OPTIONS = [
  'Shy', 'Outgoing', 'Curious', 'Energetic', 'Calm', 'Sensitive',
  'Independent', 'Affectionate', 'Creative', 'Analytical', 'Playful', 'Serious'
]

const CHALLENGE_OPTIONS = [
  'Tantrums', 'Bedtime Resistance', 'Screen Time', 'Homework', 'Sibling Rivalry',
  'Eating/Picky Eating', 'Listening', 'Sharing', 'Separation Anxiety', 'Talking Back'
]

const COMMUNICATION_STYLES = [
  'Words of Affirmation',
  'Physical Touch',
  'Quality Time',
  'Acts of Service',
  'Receiving Gifts'
]

const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual (pictures, diagrams, videos)' },
  { value: 'auditory', label: 'Auditory (listening, talking)' },
  { value: 'kinesthetic', label: 'Kinesthetic (hands-on, movement)' },
  { value: 'reading', label: 'Reading/Writing (books, writing)' }
]

const TIME_OF_DAY_OPTIONS = [
  { value: 'morning', label: '🌅 Morning (most alert)' },
  { value: 'afternoon', label: '☀️ Afternoon (active)' },
  { value: 'evening', label: '🌆 Evening (winding down)' },
  { value: 'bedtime', label: '🌙 Bedtime (calm, cozy)' }
]

const STRENGTH_SUGGESTIONS = [
  'Kind', 'Helpful', 'Funny', 'Smart', 'Brave', 'Creative',
  'Athletic', 'Musical', 'Artistic', 'Patient', 'Leader', 'Problem Solver'
]

export default function ChildFormEnhanced({ existingChild }: { existingChild?: any }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Basic Info
  const [name, setName] = useState(existingChild?.name || '')
  const [birthDate, setBirthDate] = useState(existingChild?.birth_date || '')

  // Existing fields
  const [interests, setInterests] = useState<string[]>(existingChild?.interests || [])
  const [personalities, setPersonalities] = useState<string[]>(existingChild?.personality_traits || [])
  const [challenges, setChallenges] = useState<string[]>(existingChild?.current_challenges || [])
  const [notes, setNotes] = useState(existingChild?.notes || '')

  // New AI-enhancement fields
  const [communicationStyle, setCommunicationStyle] = useState<string[]>(existingChild?.communication_style || [])
  const [learningStyle, setLearningStyle] = useState(existingChild?.learning_style || '')
  const [bestTimeOfDay, setBestTimeOfDay] = useState(existingChild?.best_time_of_day || '')
  const [strengths, setStrengths] = useState<string[]>(existingChild?.strengths || [])
  const [developmentalGoals, setDevelopmentalGoals] = useState<string[]>(existingChild?.developmental_goals || [])
  const [favoriteActivities, setFavoriteActivities] = useState<string[]>(existingChild?.favorite_activities || [])
  const [connectionInsights, setConnectionInsights] = useState(existingChild?.connection_insights || '')
  const [specialConsiderations, setSpecialConsiderations] = useState(existingChild?.special_considerations || '')

  // Custom inputs for arrays
  const [customStrength, setCustomStrength] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [customActivity, setCustomActivity] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item))
    } else {
      setList([...list, item])
    }
  }

  const addCustomItem = (value: string, list: string[], setList: (list: string[]) => void, setClear: (val: string) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()])
      setClear('')
    }
  }

  const removeItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.filter(i => i !== item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      const profileData = {
        name,
        birth_date: birthDate,
        interests,
        personality_traits: personalities,
        current_challenges: challenges,
        notes,
        // New fields
        communication_style: communicationStyle,
        learning_style: learningStyle,
        best_time_of_day: bestTimeOfDay,
        strengths,
        developmental_goals: developmentalGoals,
        favorite_activities: favoriteActivities,
        connection_insights: connectionInsights,
        special_considerations: specialConsiderations,
      }

      if (existingChild) {
        // Update existing child
        const { error: updateError } = await supabase
          .from('child_profiles')
          .update(profileData)
          .eq('id', existingChild.id)

        if (updateError) throw updateError
        toast.success('Child profile updated!', {
          description: 'Your changes have been saved'
        })
      } else {
        // Create new child
        const { error: insertError } = await supabase
          .from('child_profiles')
          .insert({
            user_id: user.id,
            ...profileData
          })

        if (insertError) throw insertError
        toast.success('Child profile created!', {
          description: `${name} has been added to your family`
        })
      }

      // Redirect to children page
      router.push('/children')
      router.refresh()
    } catch (err: any) {
      console.error('Error saving child:', err)
      toast.error('Failed to save profile', {
        description: err.message || 'Please try again'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ========== BASICS ========== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>

        {/* Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Child's Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors text-gray-900"
            placeholder="e.g., Emma"
          />
        </div>

        {/* Birth Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Birth Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">This helps us provide age-appropriate activities</p>
        </div>
      </div>

      {/* ========== PERSONALITY & INTERESTS ========== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Personality & Interests</h3>

        {/* Interests */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            What are they interested in? (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {INTEREST_OPTIONS.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleSelection(interest, interests, setInterests)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  interests.includes(interest)
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Personality */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            How would you describe their personality? (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PERSONALITY_OPTIONS.map(personality => (
              <button
                key={personality}
                type="button"
                onClick={() => toggleSelection(personality, personalities, setPersonalities)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  personalities.includes(personality)
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {personality}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========== TOGGLE FOR ADVANCED SECTIONS ========== */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-100 to-purple-100 text-primary-700 font-semibold hover:shadow-md transition-all"
        >
          <span>{showAdvanced ? '−' : '+'}</span>
          {showAdvanced ? 'Hide' : 'Add More Details'} for AI Personalization
          <span className="text-sm opacity-75">(Optional but recommended)</span>
        </button>
      </div>

      {/* ========== ADVANCED SECTIONS (COLLAPSIBLE) ========== */}
      {showAdvanced && (
        <div className="space-y-8 animate-in fade-in duration-500">

          {/* How They Connect */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-sm border-2 border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span>💖</span> How They Connect Best
            </h3>
            <p className="text-sm text-gray-600 mb-4">Help us suggest activities that match their style</p>

            {/* Communication Style */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How do they best receive love/connection?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COMMUNICATION_STYLES.map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleSelection(style, communicationStyle, setCommunicationStyle)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      communicationStyle.includes(style)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Style */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How do they learn best?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {LEARNING_STYLES.map(style => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setLearningStyle(style.value)}
                    className={`px-4 py-3 rounded-xl font-medium text-sm text-left transition-all ${
                      learningStyle === style.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Best Time of Day */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                When are they most engaged?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TIME_OF_DAY_OPTIONS.map(time => (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() => setBestTimeOfDay(time.value)}
                    className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                      bestTimeOfDay === time.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Goals */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border-2 border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span>⭐</span> Strengths & Growth Areas
            </h3>
            <p className="text-sm text-gray-600 mb-4">Build on their strengths and support their development</p>

            {/* Strengths */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What are they naturally good at?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {STRENGTH_SUGGESTIONS.map(strength => (
                  <button
                    key={strength}
                    type="button"
                    onClick={() => toggleSelection(strength, strengths, setStrengths)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      strengths.includes(strength)
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    {strength}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customStrength}
                  onChange={(e) => setCustomStrength(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customStrength, strengths, setStrengths, setCustomStrength))}
                  placeholder="Add custom strength..."
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => addCustomItem(customStrength, strengths, setStrengths, setCustomStrength)}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              {strengths.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {strengths.filter(s => !STRENGTH_SUGGESTIONS.includes(s)).map(strength => (
                    <span key={strength} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                      {strength}
                      <button type="button" onClick={() => removeItem(strength, strengths, setStrengths)} className="hover:text-green-900">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Developmental Goals */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What are you working on together? (Growth areas, skills, behaviors)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customGoal, developmentalGoals, setDevelopmentalGoals, setCustomGoal))}
                  placeholder="e.g., 'sharing with siblings', 'bedtime routine', 'emotional regulation'..."
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => addCustomItem(customGoal, developmentalGoals, setDevelopmentalGoals, setCustomGoal)}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              {developmentalGoals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {developmentalGoals.map(goal => (
                    <span key={goal} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                      {goal}
                      <button type="button" onClick={() => removeItem(goal, developmentalGoals, setDevelopmentalGoals)} className="hover:text-green-900">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Favorites & Connection Insights */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-sm border-2 border-amber-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span>🌟</span> Favorite Activities & Connection Insights
            </h3>
            <p className="text-sm text-gray-600 mb-4">What brings you closer together?</p>

            {/* Favorite Activities */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Favorite activities to do together
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customActivity, favoriteActivities, setFavoriteActivities, setCustomActivity))}
                  placeholder="e.g., 'building LEGO together', 'bedtime stories', 'cooking pancakes'..."
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none text-sm text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => addCustomItem(customActivity, favoriteActivities, setFavoriteActivities, setCustomActivity)}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700"
                >
                  Add
                </button>
              </div>
              {favoriteActivities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {favoriteActivities.map(activity => (
                    <span key={activity} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                      {activity}
                      <button type="button" onClick={() => removeItem(activity, favoriteActivities, setFavoriteActivities)} className="hover:text-amber-900">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Connection Insights */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Connection insights (What works well? What makes them light up?)
              </label>
              <textarea
                value={connectionInsights}
                onChange={(e) => setConnectionInsights(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors text-gray-900 bg-white"
                placeholder="e.g., 'Loves one-on-one time without siblings', 'Responds well to humor', 'Needs wind-down time after school'..."
              />
            </div>
          </div>
        </div>
      )}

      {/* ========== CHALLENGES ========== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Current Challenges</h3>
        <p className="text-sm text-gray-600 mb-4">This helps us suggest relevant activities (Optional)</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CHALLENGE_OPTIONS.map(challenge => (
            <button
              key={challenge}
              type="button"
              onClick={() => toggleSelection(challenge, challenges, setChallenges)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                challenges.includes(challenge)
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {challenge}
            </button>
          ))}
        </div>
      </div>

      {/* ========== SPECIAL CONSIDERATIONS ========== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Special Considerations</h3>
        <p className="text-sm text-gray-600 mb-4">Allergies, diagnoses, or other important context (Optional)</p>
        <textarea
          value={specialConsiderations}
          onChange={(e) => setSpecialConsiderations(e.target.value)}
          rows={2}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors text-gray-900"
          placeholder="e.g., 'Peanut allergy', 'ADHD', 'Sensory processing needs', 'Hearing impaired'..."
        />
      </div>

      {/* ========== ADDITIONAL NOTES ========== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Anything else we should know? (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors text-gray-900"
          placeholder="Any other details that help us understand your child better..."
        />
      </div>

      {/* ========== SUBMIT BUTTONS ========== */}
      <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-2xl shadow-xl border-2 border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !name || !birthDate}
          className="flex-1 px-6 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Saving...' : existingChild ? 'Update Profile' : 'Create Profile'}
        </button>
      </div>
    </form>
  )
}
