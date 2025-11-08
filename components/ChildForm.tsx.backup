'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function ChildForm({ existingChild }: { existingChild?: any }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [name, setName] = useState(existingChild?.name || '')
  const [birthDate, setBirthDate] = useState(existingChild?.birth_date || '')
  const [interests, setInterests] = useState<string[]>(existingChild?.interests || [])
  const [personalities, setPersonalities] = useState<string[]>(existingChild?.personality_traits || [])
  const [challenges, setChallenges] = useState<string[]>(existingChild?.current_challenges || [])
  const [notes, setNotes] = useState(existingChild?.notes || '')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item))
    } else {
      setList([...list, item])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      if (existingChild) {
        // Update existing child
        const { error: updateError } = await supabase
          .from('child_profiles')
          .update({
            name,
            birth_date: birthDate,
            interests,
            personality_traits: personalities,
            current_challenges: challenges,
            notes,
          })
          .eq('id', existingChild.id)

        if (updateError) throw updateError
      } else {
        // Create new child
        const { error: insertError } = await supabase
          .from('child_profiles')
          .insert({
            user_id: user.id,
            name,
            birth_date: birthDate,
            interests,
            personality_traits: personalities,
            current_challenges: challenges,
            notes,
          })

        if (insertError) throw insertError
      }

      // Redirect to children page
      router.push('/children')
      router.refresh()
    } catch (err: any) {
      console.error('Error saving child:', err)
      setError(err.message || 'Failed to save child profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name */}
      <div>
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
        <p className="text-xs text-gray-500 mt-1">This helps us provide age-appropriate prompts</p>
      </div>

      {/* Interests */}
      <div>
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

      {/* Current Challenges */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Any current challenges? (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-3">This helps us suggest relevant prompts</p>
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

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Anything else we should know? (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors text-gray-900"
          placeholder="Special needs, favorite activities, anything that helps us understand them better..."
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
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
          {isLoading ? 'Saving...' : existingChild ? 'Update Child' : 'Add Child'}
        </button>
      </div>
    </form>
  )
}
