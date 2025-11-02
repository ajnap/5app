'use client'

import { useState } from 'react'
import Image from 'next/image'
import { deleteMemory, updateMemory } from '@/lib/actions/memories'
import { toast } from 'sonner'

interface MemoryCardProps {
  memory: {
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
  onUpdate?: () => void
  showChildName?: boolean
}

export default function MemoryCard({ memory, onUpdate, showChildName = false }: MemoryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(memory.content)

  const formattedDate = new Date(memory.entry_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this memory?')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteMemory(memory.id)

    if (result.success) {
      toast.success('Memory deleted')
      onUpdate?.()
    } else {
      toast.error(result.error || 'Failed to delete memory')
      setIsDeleting(false)
    }
  }

  const handleSaveEdit = async () => {
    if (editedContent.trim() === memory.content) {
      setIsEditing(false)
      return
    }

    const result = await updateMemory({
      id: memory.id,
      content: editedContent.trim()
    })

    if (result.success) {
      toast.success('Memory updated')
      setIsEditing(false)
      onUpdate?.()
    } else {
      toast.error(result.error || 'Failed to update memory')
    }
  }

  const toggleMilestone = async () => {
    const result = await updateMemory({
      id: memory.id,
      isMilestone: !memory.is_milestone
    })

    if (result.success) {
      toast.success(memory.is_milestone ? 'Unmarked as milestone' : 'Marked as milestone')
      onUpdate?.()
    } else {
      toast.error(result.error || 'Failed to update')
    }
  }

  return (
    <>
      <div
        className={`card transition-all duration-300 hover:shadow-xl ${
          memory.is_milestone ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50' : ''
        } ${isDeleting ? 'opacity-50' : ''}`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-700">{formattedDate}</p>
              {memory.is_milestone && (
                <span className="text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded-full font-semibold">
                  ⭐ Milestone
                </span>
              )}
              {memory.years_ago && memory.years_ago > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  🕰️ {memory.years_ago} {memory.years_ago === 1 ? 'year' : 'years'} ago
                </span>
              )}
            </div>
            {showChildName && memory.child_name && (
              <p className="text-xs text-gray-500">{memory.child_name}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={toggleMilestone}
              className="text-gray-400 hover:text-amber-500 transition-colors"
              title={memory.is_milestone ? 'Unmark milestone' : 'Mark as milestone'}
            >
              {memory.is_milestone ? '⭐' : '☆'}
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit memory"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Delete memory"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Photo */}
        {memory.photo_url && (
          <div
            className="relative w-full h-64 rounded-lg overflow-hidden mb-4 cursor-pointer group"
            onClick={() => setShowFullImage(true)}
          >
            <Image
              src={memory.photo_url}
              alt="Memory photo"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-semibold bg-black bg-opacity-50 px-4 py-2 rounded-full">
                View Full Size
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value.slice(0, 500))}
              className="w-full px-4 py-3 rounded-lg border-2 border-primary-300 focus:border-primary-500 focus:outline-none resize-none"
              rows={4}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditedContent(memory.content)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 leading-relaxed mb-4">{memory.content}</p>
        )}

        {/* Emoji Reactions */}
        {memory.emoji_reactions && memory.emoji_reactions.length > 0 && (
          <div className="flex gap-2 mb-4">
            {memory.emoji_reactions.map((emoji, index) => (
              <span key={index} className="text-2xl">
                {emoji}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {memory.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {showFullImage && memory.photo_url && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 fade-in"
            onClick={() => setShowFullImage(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="relative max-w-5xl max-h-[90vh] pointer-events-auto slide-in"
              onClick={() => setShowFullImage(false)}
            >
              <button
                onClick={() => setShowFullImage(false)}
                className="absolute top-4 right-4 bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
              >
                ✕
              </button>
              <Image
                src={memory.photo_url}
                alt="Memory photo full size"
                width={1200}
                height={900}
                className="rounded-lg"
                style={{ maxHeight: '90vh', width: 'auto', height: 'auto' }}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
