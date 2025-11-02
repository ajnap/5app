'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import Image from 'next/image'

interface Memory {
  id: string
  content: string
  photo_url: string | null
  tags: string[] | null
  is_milestone: boolean
  emoji_reactions: string[] | null
  entry_date: string
  created_at: string
}

interface MemoryTimelineProps {
  childId: string
  childName: string
  userId: string
}

export default function MemoryTimeline({ childId, childName, userId }: MemoryTimelineProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showMilestonesOnly, setShowMilestonesOnly] = useState(false)
  const [showOnThisDayOnly, setShowOnThisDayOnly] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load memories
  const loadMemories = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('child_id', childId)
        .order('entry_date', { ascending: false })

      if (showMilestonesOnly) {
        query = query.eq('is_milestone', true)
      }

      const { data, error } = await query

      if (error) throw error

      setMemories(data || [])

      // Extract unique tags
      const tags = new Set<string>()
      data?.forEach(m => {
        m.tags?.forEach((tag: string) => tags.add(tag))
      })
      setAllTags(Array.from(tags).sort())
    } catch (error: any) {
      console.error('Load memories error:', error)
      toast.error('Failed to load memories')
    } finally {
      setIsLoading(false)
    }
  }

  // Load "On This Day" memories
  const loadOnThisDay = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .rpc('get_memories_on_this_day', {
          p_user_id: userId,
          p_child_id: childId
        })

      if (error) throw error

      if (data && data.length > 0) {
        setMemories(data)
        setShowOnThisDayOnly(true)
        toast.success(`Found ${data.length} ${data.length === 1 ? 'memory' : 'memories'} from past years!`, {
          description: `Memories from ${data.map((m: any) => m.years_ago).join(', ')} years ago`
        })
      } else {
        toast.info('No memories found', {
          description: `No memories from ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} in past years`
        })
      }

      // Extract unique tags
      const tags = new Set<string>()
      data?.forEach((m: any) => {
        m.tags?.forEach((tag: string) => tags.add(tag))
      })
      setAllTags(Array.from(tags).sort())
    } catch (error: any) {
      console.error('Load on this day error:', error)
      toast.error('Failed to load memories')
    } finally {
      setIsLoading(false)
    }
  }

  // Load on mount and when filters change
  useEffect(() => {
    if (showOnThisDayOnly) {
      loadOnThisDay()
    } else {
      loadMemories()
    }
  }, [childId, showMilestonesOnly, showOnThisDayOnly])

  // Filter memories by search term and tags
  const filteredMemories = memories.filter(memory => {
    // Search filter
    if (searchTerm && !memory.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Tag filter
    if (selectedTags.length > 0) {
      if (!memory.tags || !selectedTags.some(tag => memory.tags?.includes(tag))) {
        return false
      }
    }

    return true
  })

  // Group memories by month
  const groupedMemories = filteredMemories.reduce((acc, memory) => {
    const date = new Date(memory.entry_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

    if (!acc[monthKey]) {
      acc[monthKey] = { label: monthLabel, memories: [] }
    }
    acc[monthKey].memories.push(memory)

    return acc
  }, {} as Record<string, { label: string; memories: Memory[] }>)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-primary-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-900">
          {childName}'s Memories
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (showOnThisDayOnly) {
                setShowOnThisDayOnly(false)
              } else {
                loadOnThisDay()
              }
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showOnThisDayOnly
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {showOnThisDayOnly ? '← Back to All' : '🕰️ On This Day'}
          </button>
          <div className="text-sm text-gray-600">
            {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search memories..."
            className="w-full px-4 py-3 pl-10 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
          />
          <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Milestone filter */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showMilestonesOnly}
            onChange={(e) => setShowMilestonesOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">⭐ Show milestones only</span>
        </label>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium">Filter by tags:</span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-sm px-3 py-1 rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm px-3 py-1 text-red-600 hover:text-red-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* No results */}
      {filteredMemories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-2">No memories found</p>
          {(searchTerm || selectedTags.length > 0 || showMilestonesOnly) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedTags([])
                setShowMilestonesOnly(false)
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedMemories).map(([monthKey, { label, memories: monthMemories }]) => (
          <div key={monthKey} className="space-y-4">
            {/* Month header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-50 to-purple-50 px-4 py-2 rounded-lg z-10">
              <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
            </div>

            {/* Memories for this month */}
            <div className="space-y-4 pl-4">
              {monthMemories.map(memory => (
                <div
                  key={memory.id}
                  className={`card p-5 ${
                    memory.is_milestone ? 'border-2 border-amber-400 bg-amber-50' : ''
                  }`}
                >
                  {/* Date and milestone badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600 font-medium">
                      {formatDate(memory.entry_date)}
                    </div>
                    {memory.is_milestone && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500 text-white font-semibold">
                        ⭐ Milestone
                      </span>
                    )}
                  </div>

                  {/* Photo */}
                  {memory.photo_url && (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={memory.photo_url}
                        alt="Memory photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <p className="text-gray-800 leading-relaxed mb-3">{memory.content}</p>

                  {/* Tags and emojis */}
                  <div className="flex flex-wrap items-center gap-2">
                    {memory.tags?.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                    {memory.emoji_reactions && memory.emoji_reactions.length > 0 && (
                      <div className="flex gap-1 ml-auto">
                        {memory.emoji_reactions.map((emoji, i) => (
                          <span key={i} className="text-xl">{emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
