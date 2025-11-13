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
  'Athletic', 'Musical', 'Artistic', 'Patient', 'Leader', 'Problem Solver',
  'Empathetic', 'Determined', 'Organized', 'Curious', 'Resilient', 'Confident'
]

const MOTIVATOR_SUGGESTIONS = [
  'Praise', 'Stickers/Rewards', 'Screen Time', 'Special Outings', 'One-on-One Time',
  'Treats', 'Competition', 'Helping Others', 'Learning New Things', 'Physical Activity'
]

export default function ChildForm({ existingChild }: { existingChild?: any }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Basic Info
  const [name, setName] = useState(existingChild?.name || '')
  const [birthDate, setBirthDate] = useState(existingChild?.birth_date || '')

  // Existing fields (kept for backwards compatibility)
  const [interests, setInterests] = useState<string[]>(existingChild?.interests || [])
  const [personalities, setPersonalities] = useState<string[]>(existingChild?.personality_traits || [])
  const [challenges, setChallenges] = useState<string[]>(existingChild?.current_challenges || [])
  const [notes, setNotes] = useState(existingChild?.notes || '')

  // Connection & Communication
  const [communicationStyle, setCommunicationStyle] = useState<string[]>(existingChild?.communication_style || [])
  const [bestTimeOfDay, setBestTimeOfDay] = useState(existingChild?.best_time_of_day || '')
  const [connectionInsights, setConnectionInsights] = useState(existingChild?.connection_insights || '')

  // Strengths & Growth
  const [strengths, setStrengths] = useState<string[]>(existingChild?.strengths || [])
  const [challengesWeaknesses, setChallengesWeaknesses] = useState<string[]>(existingChild?.challenges_weaknesses || [])
  const [developmentalGoals, setDevelopmentalGoals] = useState<string[]>(existingChild?.developmental_goals || [])
  const [currentFocusAreas, setCurrentFocusAreas] = useState<string[]>(existingChild?.current_focus_areas || [])

  // Learning & Preferences
  const [learningStyle, setLearningStyle] = useState(existingChild?.learning_style || '')
  const [sensoryPreferences, setSensoryPreferences] = useState(existingChild?.sensory_preferences || '')
  const [socialPreferences, setSocialPreferences] = useState(existingChild?.social_preferences || '')
  const [favoriteActivities, setFavoriteActivities] = useState<string[]>(existingChild?.favorite_activities || [])

  // Behavior Patterns
  const [motivators, setMotivators] = useState<string[]>(existingChild?.motivators || [])
  const [triggersStressors, setTriggersStressors] = useState<string[]>(existingChild?.triggers_stressors || [])
  const [emotionalRegulation, setEmotionalRegulation] = useState(existingChild?.emotional_regulation || '')
  const [disciplineApproach, setDisciplineApproach] = useState(existingChild?.discipline_approach || '')
  const [energyPatterns, setEnergyPatterns] = useState(existingChild?.energy_patterns || '')

  // Special Considerations
  const [specialConsiderations, setSpecialConsiderations] = useState(existingChild?.special_considerations || '')

  // Custom inputs for arrays
  const [customStrength, setCustomStrength] = useState('')
  const [customWeakness, setCustomWeakness] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [customFocus, setCustomFocus] = useState('')
  const [customActivity, setCustomActivity] = useState('')
  const [customMotivator, setCustomMotivator] = useState('')
  const [customTrigger, setCustomTrigger] = useState('')

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

    if (!name.trim()) {
      toast.error('Please enter a name')
      return
    }

    if (!birthDate) {
      toast.error('Please select a birth date')
      return
    }

    setIsLoading(true)

    try {
      const profileData = {
        name: name.trim(),
        birth_date: birthDate,

        // Existing fields
        interests,
        personality_traits: personalities,
        current_challenges: challenges,
        notes,

        // Connection & Communication
        communication_style: communicationStyle,
        best_time_of_day: bestTimeOfDay || null,
        connection_insights: connectionInsights || null,

        // Strengths & Growth
        strengths,
        challenges_weaknesses: challengesWeaknesses,
        developmental_goals: developmentalGoals,
        current_focus_areas: currentFocusAreas,

        // Learning & Preferences
        learning_style: learningStyle || null,
        sensory_preferences: sensoryPreferences || null,
        social_preferences: socialPreferences || null,
        favorite_activities: favoriteActivities,

        // Behavior Patterns
        motivators,
        triggers_stressors: triggersStressors,
        emotional_regulation: emotionalRegulation || null,
        discipline_approach: disciplineApproach || null,
        energy_patterns: energyPatterns || null,

        // Special Considerations
        special_considerations: specialConsiderations || null,
      }

      if (existingChild) {
        // Update existing child
        const { error } = await supabase
          .from('child_profiles')
          .update(profileData)
          .eq('id', existingChild.id)

        if (error) throw error
        toast.success('Profile updated successfully!')
      } else {
        // Create new child
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
          .from('child_profiles')
          .insert({ ...profileData, user_id: user.id })

        if (error) throw error
        toast.success('Child profile created!')
      }

      router.push('/children')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving child profile:', error)
      toast.error('Failed to save profile', {
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {/* Basic Information */}
      <div className="card">
        <h2 className="text-2xl font-bold gradient-text mb-6">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-gray-900"
              placeholder="Emma"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Birth Date *
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-gray-900"
              required
            />
          </div>
        </div>
      </div>

      {/* Personality & Interests */}
      <div className="card">
        <h2 className="text-2xl font-bold gradient-text mb-6">Personality & Interests</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Interests
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INTEREST_OPTIONS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleSelection(interest, interests, setInterests)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    interests.includes(interest)
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Personality Traits
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PERSONALITY_OPTIONS.map(trait => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggleSelection(trait, personalities, setPersonalities)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    personalities.includes(trait)
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
              placeholder="Anything else about your child's personality or interests..."
            />
          </div>
        </div>
      </div>

      {/* Advanced Details Toggle */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          {showAdvanced ? '📋 Hide' : '🤖 Add'} Detailed AI Personalization Fields
          <span className="text-sm opacity-90">
            ({showAdvanced ? 'collapse' : 'recommended for best experience'})
          </span>
        </button>
      </div>

      {/* Advanced AI Personalization Fields */}
      {showAdvanced && (
        <div className="space-y-8 animate-in fade-in duration-500">

          {/* Connection & Communication */}
          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              💙 Connection & Communication
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  How They Best Receive Love & Connection
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMMUNICATION_STYLES.map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleSelection(style, communicationStyle, setCommunicationStyle)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                        communicationStyle.includes(style)
                          ? 'border-blue-500 bg-blue-100 text-blue-900 font-semibold'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Best Time of Day for Connection
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TIME_OF_DAY_OPTIONS.map(time => (
                    <button
                      key={time.value}
                      type="button"
                      onClick={() => setBestTimeOfDay(time.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        bestTimeOfDay === time.value
                          ? 'border-blue-500 bg-blue-100 text-blue-900 font-semibold'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {time.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  What Works Well for Connection
                </label>
                <textarea
                  value={connectionInsights}
                  onChange={(e) => setConnectionInsights(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 'Loves bedtime reading together', 'Opens up during car rides', 'Enjoys helping me cook'"
                />
              </div>
            </div>
          </div>

          {/* Strengths & Growth */}
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
              🌱 Strengths & Growth Areas
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Natural Strengths & Talents
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  {STRENGTH_SUGGESTIONS.map(strength => (
                    <button
                      key={strength}
                      type="button"
                      onClick={() => toggleSelection(strength, strengths, setStrengths)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                        strengths.includes(strength)
                          ? 'border-green-500 bg-green-100 text-green-900 font-semibold'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {strength}
                    </button>
                  ))}
                </div>
                {strengths.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border border-green-200">
                    {strengths.map(strength => (
                      <span key={strength} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm font-medium">
                        {strength}
                        <button
                          type="button"
                          onClick={() => removeItem(strength, strengths, setStrengths)}
                          className="text-green-700 hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customStrength}
                    onChange={(e) => setCustomStrength(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customStrength, strengths, setStrengths, setCustomStrength))}
                    placeholder="Add custom strength..."
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(customStrength, strengths, setStrengths, setCustomStrength)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Challenges & Areas for Support
                </label>
                {challengesWeaknesses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border border-amber-200">
                    {challengesWeaknesses.map(weakness => (
                      <span key={weakness} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm font-medium">
                        {weakness}
                        <button
                          type="button"
                          onClick={() => removeItem(weakness, challengesWeaknesses, setChallengesWeaknesses)}
                          className="text-amber-700 hover:text-amber-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customWeakness}
                    onChange={(e) => setCustomWeakness(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customWeakness, challengesWeaknesses, setChallengesWeaknesses, setCustomWeakness))}
                    placeholder="e.g., 'Struggles with transitions', 'Difficulty sharing'"
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(customWeakness, challengesWeaknesses, setChallengesWeaknesses, setCustomWeakness)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Developmental Goals
                </label>
                {developmentalGoals.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border border-green-200">
                    {developmentalGoals.map(goal => (
                      <span key={goal} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm font-medium">
                        {goal}
                        <button
                          type="button"
                          onClick={() => removeItem(goal, developmentalGoals, setDevelopmentalGoals)}
                          className="text-green-700 hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customGoal, developmentalGoals, setDevelopmentalGoals, setCustomGoal))}
                    placeholder="e.g., 'Learn to tie shoes', 'Build confidence in reading'"
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(customGoal, developmentalGoals, setDevelopmentalGoals, setCustomGoal)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Current Focus Areas (What You Want to Work On)
                </label>
                {currentFocusAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border border-green-200">
                    {currentFocusAreas.map(focus => (
                      <span key={focus} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm font-medium">
                        {focus}
                        <button
                          type="button"
                          onClick={() => removeItem(focus, currentFocusAreas, setCurrentFocusAreas)}
                          className="text-green-700 hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customFocus}
                    onChange={(e) => setCustomFocus(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customFocus, currentFocusAreas, setCurrentFocusAreas, setCustomFocus))}
                    placeholder="e.g., 'Reducing screen time battles', 'Improving bedtime routine'"
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(customFocus, currentFocusAreas, setCurrentFocusAreas, setCustomFocus)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Learning & Preferences */}
          <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-2">
              🎨 Learning & Preferences
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Learning Style
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {LEARNING_STYLES.map(style => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setLearningStyle(style.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                        learningStyle === style.value
                          ? 'border-purple-500 bg-purple-100 text-purple-900 font-semibold'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Favorite Activities to Do Together
                </label>
                {favoriteActivities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border border-purple-200">
                    {favoriteActivities.map(activity => (
                      <span key={activity} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-sm font-medium">
                        {activity}
                        <button
                          type="button"
                          onClick={() => removeItem(activity, favoriteActivities, setFavoriteActivities)}
                          className="text-purple-700 hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customActivity, favoriteActivities, setFavoriteActivities, setCustomActivity))}
                    placeholder="e.g., 'Baking cookies', 'Playing catch', 'Building forts'"
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(customActivity, favoriteActivities, setFavoriteActivities, setCustomActivity)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Social Preferences
                </label>
                <textarea
                  value={socialPreferences}
                  onChange={(e) => setSocialPreferences(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 'Prefers one-on-one play', 'Loves group activities', 'Needs quiet time to recharge'"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sensory Preferences
                </label>
                <textarea
                  value={sensoryPreferences}
                  onChange={(e) => setSensoryPreferences(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 'Sensitive to loud noises', 'Loves soft textures', 'Dislikes certain food textures'"
                />
              </div>
            </div>
          </div>

          {/* Behavior Patterns */}
          <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
              ⚡ Behavior & Emotional Patterns
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  What Motivates Them
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  {MOTIVATOR_SUGGESTIONS.map(motivator => (
                    <button
                      key={motivator}
                      type="button"
                      onClick={() => toggleSelection(motivator, motivators, setMotivators)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                        motivators.includes(motivator)
                          ? 'border-amber-500 bg-amber-100 text-amber-900 font-semibold'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {motivator}
                    </button>
                  ))}
                </div>
                {motivators.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border border-amber-200">
                    {motivators.map(motivator => (
                      <span key={motivator} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm font-medium">
                        {motivator}
                        <button
                          type="button"
                          onClick={() => removeItem(motivator, motivators, setMotivators)}
                          className="text-amber-700 hover:text-amber-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customMotivator}
                    onChange={(e) => setCustomMotivator(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customMotivator, motivators, setMotivators, setCustomMotivator))}
                    placeholder="Add custom motivator..."
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(customMotivator, motivators, setMotivators, setCustomMotivator)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Triggers & Stressors (What Upsets Them)
                </label>
                {triggersStressors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border border-red-200">
                    {triggersStressors.map(trigger => (
                      <span key={trigger} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-900 rounded-full text-sm font-medium">
                        {trigger}
                        <button
                          type="button"
                          onClick={() => removeItem(trigger, triggersStressors, setTriggersStressors)}
                          className="text-red-700 hover:text-red-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTrigger}
                    onChange={(e) => setCustomTrigger(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customTrigger, triggersStressors, setTriggersStressors, setCustomTrigger))}
                    placeholder="e.g., 'Being rushed', 'Loud environments', 'Hunger'"
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(customTrigger, triggersStressors, setTriggersStressors, setCustomTrigger)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Emotional Regulation
                </label>
                <textarea
                  value={emotionalRegulation}
                  onChange={(e) => setEmotionalRegulation(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 'Needs time to cool down', 'Calms with deep breaths', 'Tantrums when frustrated'"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Discipline Approach (What Works/Doesn't Work)
                </label>
                <textarea
                  value={disciplineApproach}
                  onChange={(e) => setDisciplineApproach(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 'Responds well to natural consequences', 'Time-outs backfire', 'Positive reinforcement works best'"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Energy Patterns Throughout Day
                </label>
                <textarea
                  value={energyPatterns}
                  onChange={(e) => setEnergyPatterns(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 'High energy in morning, crashes after lunch', 'Needs quiet time after school', 'Gets hyperactive before bed'"
                />
              </div>
            </div>
          </div>

          {/* Special Considerations */}
          <div className="card bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
            <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-2">
              ⚕️ Special Considerations
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Medical, Developmental, or Other Important Context
              </label>
              <textarea
                value={specialConsiderations}
                onChange={(e) => setSpecialConsiderations(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                placeholder="e.g., 'Allergic to peanuts', 'ADHD diagnosis - takes medication in morning', 'Speech delay - working with therapist', 'Anxiety around new situations'"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : existingChild ? 'Update Profile' : 'Create Profile'}
        </button>
      </div>
    </form>
  )
}
