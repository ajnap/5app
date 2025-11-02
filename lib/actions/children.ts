'use server'

/**
 * Server Actions for Enhanced Child Profile Management
 * Handles updates to enriched child profile fields
 */

import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { generateChildInsightStatic } from '@/lib/ai'

// =====================================================
// Types
// =====================================================

export interface UpdateChildProfileInput {
  childId: string
  name?: string
  birthDate?: string
  interests?: string[]
  personalityTraits?: string[]
  currentChallenges?: string[]
  strengths?: string[]
  challenges?: string[]
  favoriteBooks?: string[]
  hobbies?: string[]
  loveLanguage?: 'words' | 'time' | 'gifts' | 'service' | 'touch' | null
}

export interface GenerateInsightInput {
  childId: string
  forceRefresh?: boolean
}

// =====================================================
// Update Child Profile
// =====================================================

/**
 * Update enhanced child profile fields
 *
 * @param input - Profile update data
 * @returns Updated profile or error
 */
export async function updateChildProfile(input: UpdateChildProfileInput) {
  try {
    const supabase = await createServerClient()

    // 1. Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // 2. Build update object (only include provided fields)
    const updateData: any = {}

    if (input.name !== undefined) updateData.name = input.name.trim()
    if (input.birthDate !== undefined) updateData.birth_date = input.birthDate
    if (input.interests !== undefined) updateData.interests = input.interests
    if (input.personalityTraits !== undefined) updateData.personality_traits = input.personalityTraits
    if (input.currentChallenges !== undefined) updateData.current_challenges = input.currentChallenges
    if (input.strengths !== undefined) updateData.strengths = input.strengths
    if (input.challenges !== undefined) updateData.challenges = input.challenges
    if (input.favoriteBooks !== undefined) updateData.favorite_books = input.favoriteBooks
    if (input.hobbies !== undefined) updateData.hobbies = input.hobbies
    if (input.loveLanguage !== undefined) updateData.love_language = input.loveLanguage

    // 3. Perform update with RLS check
    const { data: child, error } = await supabase
      .from('child_profiles')
      .update(updateData)
      .eq('id', input.childId)
      .eq('user_id', session.user.id) // RLS ensures user owns this child
      .select()
      .single()

    if (error) {
      console.error('Child profile update error:', error)
      return { success: false, error: error.message }
    }

    // 4. Revalidate pages
    revalidatePath(`/children/${input.childId}`)
    revalidatePath('/children')
    revalidatePath('/dashboard')

    return { success: true, data: child }
  } catch (error: any) {
    console.error('Update child profile error:', error)
    return { success: false, error: error.message || 'Failed to update profile' }
  }
}

// =====================================================
// Generate AI Personality Insight
// =====================================================

/**
 * Generate AI-powered personality insight for a child
 * Uses static stub (TODO: replace with OpenAI)
 *
 * @param input - Child ID and refresh flag
 * @returns AI-generated insight or cached version
 */
export async function generatePersonalityInsight(input: GenerateInsightInput) {
  try {
    const supabase = await createServerClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // 1. Get child profile
    const { data: child, error: childError } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('id', input.childId)
      .eq('user_id', session.user.id)
      .single()

    if (childError || !child) {
      return { success: false, error: 'Child not found' }
    }

    // 2. Check if we have a recent AI summary (within 7 days)
    if (!input.forceRefresh && child.ai_summary_generated_at) {
      const generatedDate = new Date(child.ai_summary_generated_at)
      const daysSince = (Date.now() - generatedDate.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSince < 7 && child.ai_personality_summary) {
        return {
          success: true,
          data: {
            summary: child.ai_personality_summary,
            isCached: true,
            generatedAt: child.ai_summary_generated_at
          }
        }
      }
    }

    // 3. Get completion history for analysis
    const { data: completions } = await supabase
      .rpc('get_child_completions', { p_child_id: input.childId })

    // 4. Calculate age
    const birthDate = new Date(child.birth_date)
    const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))

    // 5. Generate AI insight (static stub for now)
    const aiResult = await generateChildInsightStatic(
      {
        name: child.name,
        age,
        interests: child.interests || [],
        personality_traits: child.personality_traits || [],
        current_challenges: child.current_challenges || [],
        strengths: child.strengths || [],
        hobbies: child.hobbies || []
      },
      completions || []
    )

    // 6. Save AI summary to database
    const summaryText = JSON.stringify(aiResult.data)

    const { error: updateError } = await supabase
      .from('child_profiles')
      .update({
        ai_personality_summary: summaryText,
        ai_summary_generated_at: new Date().toISOString()
      })
      .eq('id', input.childId)
      .eq('user_id', session.user.id)

    if (updateError) {
      console.error('Failed to save AI summary:', updateError)
    }

    // 7. Revalidate pages
    revalidatePath(`/children/${input.childId}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      data: {
        ...aiResult.data,
        isCached: false,
        generatedAt: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('Generate personality insight error:', error)
    return { success: false, error: error.message || 'Failed to generate insight' }
  }
}

// =====================================================
// Get Memory Statistics
// =====================================================

/**
 * Get aggregate memory statistics for a child
 *
 * @param childId - Child UUID
 * @returns Memory stats or error
 */
export async function getMemoryStats(childId: string) {
  try {
    const supabase = await createServerClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify child ownership
    const { data: child } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('id', childId)
      .eq('user_id', session.user.id)
      .single()

    if (!child) {
      return { success: false, error: 'Child not found or unauthorized' }
    }

    // Get stats from database function
    const { data, error } = await supabase
      .rpc('get_memory_stats', { p_child_id: childId })
      .single()

    if (error) {
      console.error('Get memory stats error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Get memory stats error:', error)
    return { success: false, error: error.message || 'Failed to get stats' }
  }
}
