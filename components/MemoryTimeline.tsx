'use client'

import { useState, useEffect } from 'react'
import MemoryCard from './MemoryCard'
import { searchMemories, getMemoriesOnThisDay } from '@/lib/actions/memories'
import { toast } from 'sonner'

interface Memory {
  id: string
  content: string
  photo_url?: string | null
  tags?: string[]
  emoji_reactions?: string[]
  is_milestone?: boolean
  entry_date: string
  created_at: string
  child_name?: string
  years_ago?: number
}

interface MemoryTimelineProps {
  childId: string
  childName: string
  initialMemories?: Memory[]
}

export default function MemoryTimeline({ childId, childName, initialMemories = [] }: MemoryTimelineProps) {
  const [memories, setMemories] = useState<Memory[]>(initialMemories)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showOnThisDay, setShowOnThisDay] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // Extract unique tags from memories
  useEffect(() => {
    const tags = new Set<string>()
    memories.forEach(m => {
      m.tags?.forEach(t => tags.add(t))
    })
    setAvailableTags(Array.from(tags).sort())
  }, [memories])

  const handleSearch = async () => {
    setIsLoading(true)
    const result = await searchMemories({
      childId,
      searchTerm: searchTerm.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      limit: 100
    })

    if (result.success && result.data) {
      setMemories(result.data as Memory[])
    } else {
      toast.error(result.error || 'Failed to search memories')
    }
    setIsLoading(false)
  }

  const handleShowOnThisDay = async () => {
    if (showOnThisDay) {
      // Reset to all memories
      handleSearch()
      setShowOnThisDay(false)
      return
    }

    setIsLoading(true)
    const result = await getMemoriesOnThisDay(childId)

    if (result.success && result.data) {
      if (result.data.length === 0) {
        toast.info('No memories from this day in past years')
      } else {
        setMemories(result.data as Memory[])
        setShowOnThisDay(true)
        toast.success(`Found ${result.data.length} memories from this day!`)
      }
    } else {
      toast.error(result.error || 'Failed to load memories')
    }
    setIsLoading(false)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedTags([])
    setShowOnThisDay(false)
    handleSearch()
  }

  // Group memories by month
  const groupedMemories = memories.reduce((acc, memory) => {
    const date = new Date(memory.entry_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    if (!acc[monthKey]) {
      acc[monthKey] = { label: monthLabel, memories: [] }
    }
    acc[monthKey].memories.push(memory)
    return acc
  }, {} as Record<string, { label: string; memories: Memory[] }>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">
          {childName}'s Memories
        </h2>
        <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
          {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
        </span>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search memories..."
            className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? '⏳' : '🔍'} Search
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleShowOnThisDay}
            disabled={isLoading}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              showOnThisDay
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            🕰️ On This Day
          </button>

          {memories.some(m => m.is_milestone) && (
            <button
              onClick={() => setMemories(memories.filter(m => m.is_milestone))}
              className="px-4 py-2 rounded-full font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
            >
              ⭐ Milestones Only
            </button>
          )}

          {(searchTerm || selectedTags.length > 0 || showOnThisDay) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-full font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Filter by tags:</p>
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
              {availableTags.length > 10 && (
                <span className="text-sm text-gray-500 px-3 py-1">
                  +{availableTags.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-4xl">⏳</div>
          <p className="text-gray-600 mt-4">Loading memories...</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No memories yet</h3>
          <p className="text-gray-600">
            {searchTerm || selectedTags.length > 0
              ? 'Try adjusting your search filters'
              : 'Start capturing special moments with your child'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMemories)
            .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
            .map(([monthKey, { label, memories: monthMemories }]) => (
              <div key={monthKey} className="space-y-4">
                {/* Month Header */}
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold text-gray-700">{label}</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary-300 to-transparent" />
                </div>

                {/* Memory Cards */}
                <div className="space-y-4">
                  {monthMemories.map((memory) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      onUpdate={handleSearch}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
