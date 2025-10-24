'use server'

import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function markPromptComplete(promptId: string, notes?: string) {
  const supabase = await createServerClient()

  // Get the current user
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Not authenticated' }
  }

  // Check if already completed
  const { data: existing } = await supabase
    .from('prompt_completions')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('prompt_id', promptId)
    .single()

  if (existing) {
    return { error: 'Prompt already completed' }
  }

  // Insert completion record
  const { error } = await supabase
    .from('prompt_completions')
    .insert({
      user_id: session.user.id,
      prompt_id: promptId,
      notes: notes || null,
    })

  if (error) {
    console.error('Error marking prompt complete:', error)
    return { error: 'Failed to mark prompt complete' }
  }

  // Revalidate the dashboard page to show updated state
  revalidatePath('/dashboard')

  return { success: true }
}

export async function unmarkPromptComplete(promptId: string) {
  const supabase = await createServerClient()

  // Get the current user
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Not authenticated' }
  }

  // Delete completion record
  const { error } = await supabase
    .from('prompt_completions')
    .delete()
    .eq('user_id', session.user.id)
    .eq('prompt_id', promptId)

  if (error) {
    console.error('Error unmarking prompt:', error)
    return { error: 'Failed to unmark prompt' }
  }

  // Revalidate the dashboard page to show updated state
  revalidatePath('/dashboard')

  return { success: true }
}

export async function getPromptCompletion(promptId: string) {
  const supabase = await createServerClient()

  // Get the current user
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Get completion record
  const { data } = await supabase
    .from('prompt_completions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('prompt_id', promptId)
    .single()

  return data
}

export async function getUserCompletionStats(userId: string) {
  const supabase = await createServerClient()

  // Get total completions
  const { count: totalCompletions } = await supabase
    .from('prompt_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get completions in last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { count: recentCompletions } = await supabase
    .from('prompt_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('completed_at', sevenDaysAgo.toISOString())

  return {
    totalCompletions: totalCompletions || 0,
    recentCompletions: recentCompletions || 0,
  }
}
