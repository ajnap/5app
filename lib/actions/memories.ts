'use server'

/**
 * Server Actions for Memory Management
 * Handles CRUD operations for journal entries with photo uploads
 */

import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { generateMemorySummaryStatic } from '@/lib/ai'

// =====================================================
// Types
// =====================================================

export interface CreateMemoryInput {
  childId: string
  content: string
  emojiReactions?: string[]
  tags?: string[]
  isMilestone?: boolean
  entryDate?: string
  photoFile?: File
}

export interface UpdateMemoryInput {
  id: string
  content?: string
  emojiReactions?: string[]
  tags?: string[]
  isMilestone?: boolean
}

export interface SearchMemoriesInput {
  childId?: string
  searchTerm?: string
  tags?: string[]
  limit?: number
}

// =====================================================
// Create Memory
// =====================================================

/**
 * Create a new memory entry with optional photo upload
 *
 * @param input - Memory data including optional photo
 * @returns Created memory with ID or error
 */
export async function createMemory(input: CreateMemoryInput) {
  try {
    const supabase = await createServerClient()

    // 1. Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // 2. Verify child belongs to user
    const { data: child } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('id', input.childId)
      .eq('user_id', session.user.id)
      .single()

    if (!child) {
      return { success: false, error: 'Child not found or unauthorized' }
    }

    // 3. Auto-generate tags using AI stub (future: use OpenAI)
    let finalTags = input.tags || []
    if (finalTags.length === 0) {
      const aiSummary = await generateMemorySummaryStatic(input.content)
      finalTags = aiSummary.data.suggestedTags
    }

    // 4. Handle photo upload if provided
    let photoUrl: string | null = null
    let photoPath: string | null = null

    if (input.photoFile) {
      const uploadResult = await uploadMemoryPhoto(
        session.user.id,
        input.photoFile
      )

      if (uploadResult.success) {
        photoUrl = uploadResult.publicUrl!
        photoPath = uploadResult.path!
      } else {
        return { success: false, error: uploadResult.error }
      }
    }

    // 5. Insert memory into database
    const { data: memory, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: session.user.id,
        child_id: input.childId,
        content: input.content.trim(),
        emoji_reactions: input.emojiReactions || [],
        tags: finalTags,
        is_milestone: input.isMilestone || false,
        entry_date: input.entryDate || new Date().toISOString().split('T')[0],
        photo_url: photoUrl,
        photo_path: photoPath
      })
      .select()
      .single()

    if (error) {
      console.error('Memory insert error:', error)
      return { success: false, error: error.message }
    }

    // 6. Revalidate relevant pages
    revalidatePath(`/children/${input.childId}`)
    revalidatePath('/dashboard')

    return { success: true, data: memory }
  } catch (error: any) {
    console.error('Create memory error:', error)
    return { success: false, error: error.message || 'Failed to create memory' }
  }
}

// =====================================================
// Update Memory
// =====================================================

/**
 * Update an existing memory entry
 *
 * @param input - Updated memory data
 * @returns Updated memory or error
 */
export async function updateMemory(input: UpdateMemoryInput) {
  try {
    const supabase = await createServerClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // Build update object (only include fields that were provided)
    const updateData: any = {}
    if (input.content !== undefined) updateData.content = input.content.trim()
    if (input.emojiReactions !== undefined) updateData.emoji_reactions = input.emojiReactions
    if (input.tags !== undefined) updateData.tags = input.tags
    if (input.isMilestone !== undefined) updateData.is_milestone = input.isMilestone

    const { data: memory, error } = await supabase
      .from('journal_entries')
      .update(updateData)
      .eq('id', input.id)
      .eq('user_id', session.user.id) // Ensure user owns this memory
      .select()
      .single()

    if (error) {
      console.error('Memory update error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true, data: memory }
  } catch (error: any) {
    console.error('Update memory error:', error)
    return { success: false, error: error.message || 'Failed to update memory' }
  }
}

// =====================================================
// Delete Memory
// =====================================================

/**
 * Delete a memory and its associated photo
 *
 * @param memoryId - Memory UUID
 * @returns Success status or error
 */
export async function deleteMemory(memoryId: string) {
  try {
    const supabase = await createServerClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // 1. Get memory to check ownership and photo path
    const { data: memory } = await supabase
      .from('journal_entries')
      .select('photo_path, child_id')
      .eq('id', memoryId)
      .eq('user_id', session.user.id)
      .single()

    if (!memory) {
      return { success: false, error: 'Memory not found or unauthorized' }
    }

    // 2. Delete photo from storage if exists
    if (memory.photo_path) {
      await supabase.storage
        .from('memory-photos')
        .remove([memory.photo_path])
    }

    // 3. Delete memory from database (CASCADE will handle relations)
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Memory delete error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/children/${memory.child_id}`)
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Delete memory error:', error)
    return { success: false, error: error.message || 'Failed to delete memory' }
  }
}

// =====================================================
// Search Memories
// =====================================================

/**
 * Search memories with filters
 *
 * @param input - Search parameters
 * @returns Matching memories or error
 */
export async function searchMemories(input: SearchMemoriesInput) {
  try {
    const supabase = await createServerClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // Use the database function for advanced search
    const { data, error } = await supabase
      .rpc('search_memories', {
        p_user_id: session.user.id,
        p_child_id: input.childId || null,
        p_search_term: input.searchTerm || null,
        p_tags: input.tags || null,
        p_limit: input.limit || 50
      })

    if (error) {
      console.error('Search memories error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Search memories error:', error)
    return { success: false, error: error.message || 'Failed to search memories' }
  }
}

// =====================================================
// Get "On This Day" Memories
// =====================================================

/**
 * Get memories from past years on this day
 *
 * @param childId - Optional child filter
 * @returns Memories from today's date in previous years
 */
export async function getMemoriesOnThisDay(childId?: string) {
  try {
    const supabase = await createServerClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .rpc('get_memories_on_this_day', {
        p_user_id: session.user.id,
        p_child_id: childId || null
      })

    if (error) {
      console.error('Get memories on this day error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Get memories on this day error:', error)
    return { success: false, error: error.message || 'Failed to get memories' }
  }
}

// =====================================================
// Helper: Upload Photo
// =====================================================

async function uploadMemoryPhoto(userId: string, file: File) {
  try {
    const supabase = await createServerClient()

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File too large (max 5MB)' }
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type (must be JPG, PNG, WEBP, or HEIC)' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('memory-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Photo upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('memory-photos')
      .getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      publicUrl
    }
  } catch (error: any) {
    console.error('Upload photo error:', error)
    return { success: false, error: error.message || 'Failed to upload photo' }
  }
}
