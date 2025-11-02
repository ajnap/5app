'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import Image from 'next/image'

interface Child {
  id: string
  name: string
  birth_date: string
}

interface MemoryModalProps {
  isOpen: boolean
  onClose: () => void
  children: Child[]
  userId: string
}

const SUGGESTED_TAGS = [
  'first-time', 'milestone', 'funny', 'sweet', 'achievement',
  'creative', 'silly', 'proud', 'learning', 'adventure'
]

export default function MemoryModal({ isOpen, onClose, children, userId }: MemoryModalProps) {
  const [selectedChildId, setSelectedChildId] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isMilestone, setIsMilestone] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const maxLength = 500
  const charsRemaining = maxLength - content.length

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedChildId(children.length === 1 ? children[0].id : '')
      setContent('')
      setTags([])
      setTagInput('')
      setIsMilestone(false)
      setPhotoFile(null)
      setPhotoPreview(null)
      setUploadProgress(0)
      setError(null)
    }
  }, [isOpen, children])

  // Clean up photo preview URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSubmitting, onClose])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a JPEG, PNG, WebP, or HEIC image'
      })
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('File too large', {
        description: 'Please choose an image smaller than 5MB'
      })
      return
    }

    setPhotoFile(file)

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPhotoPreview(objectUrl)
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
      setPhotoPreview(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1])
    }
  }

  const uploadPhoto = async (): Promise<{ url: string; path: string } | null> => {
    if (!photoFile) return null

    try {
      setUploadProgress(30)

      // Generate unique filename
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      setUploadProgress(60)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('memory-photos')
        .upload(filePath, photoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      setUploadProgress(90)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('memory-photos')
        .getPublicUrl(filePath)

      setUploadProgress(100)

      return { url: publicUrl, path: filePath }
    } catch (error: any) {
      console.error('Photo upload error:', error)
      toast.error('Failed to upload photo', {
        description: error.message || 'Please try again'
      })
      return null
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!selectedChildId) {
      setError('Please select a child')
      return
    }

    if (!content.trim()) {
      setError('Please enter a memory')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Upload photo if selected
      let photoData: { url: string; path: string } | null = null
      if (photoFile) {
        photoData = await uploadPhoto()
        if (!photoData) {
          // Upload failed, stop submission
          setIsSubmitting(false)
          return
        }
      }

      // Insert memory with all fields
      const { error: insertError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          child_id: selectedChildId,
          content: content.trim(),
          tags: tags.length > 0 ? tags : null,
          is_milestone: isMilestone,
          photo_url: photoData?.url || null,
          photo_path: photoData?.path || null,
          entry_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        })

      if (insertError) throw insertError

      // Success - show toast and close
      const childName = children.find(c => c.id === selectedChildId)?.name
      toast.success(isMilestone ? 'Milestone memory saved! ⭐' : 'Memory captured ❤️', {
        description: `Saved memory for ${childName}${photoData ? ' with photo' : ''}`
      })

      // Close modal and reset
      onClose()
    } catch (err: any) {
      console.error('Memory save error:', err)
      toast.error('Failed to save memory', {
        description: err.message || 'Please try again'
      })
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 fade-in"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 pointer-events-auto slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Capture a Memory 📝
            </h2>
            <p className="text-gray-600">
              What made you smile today?
            </p>
          </div>

          {/* Child Selector */}
          <div className="mb-4">
            <label htmlFor="child-select" className="block text-sm font-medium text-gray-900 mb-2">
              Child
            </label>
            <select
              id="child-select"
              value={selectedChildId}
              onChange={(e) => {
                setSelectedChildId(e.target.value)
                if (error) setError(null)
              }}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none transition-colors text-gray-900 font-medium bg-white"
              disabled={isSubmitting}
            >
              <option value="" className="text-gray-500">Select a child...</option>
              {children.map((child) => (
                <option key={child.id} value={child.id} className="text-gray-900">
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          {/* Memory Text Area */}
          <div className="mb-4">
            <label htmlFor="memory-content" className="block text-sm font-medium text-gray-900 mb-2">
              Memory
            </label>
            <textarea
              id="memory-content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value.slice(0, maxLength))
                if (error) setError(null)
              }}
              placeholder="She said the funniest thing at dinner..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none transition-colors resize-none text-gray-900 placeholder-gray-500 bg-white"
              disabled={isSubmitting}
            />
            <p className={`text-xs font-medium text-right mt-1 ${charsRemaining < 50 ? 'text-orange-600' : 'text-gray-600'}`}>
              {charsRemaining} characters left
            </p>
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Add a photo (optional)
            </label>

            {!photoPreview ? (
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  disabled={isSubmitting}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className={`flex items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                    isSubmitting
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                  }`}
                >
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Click to upload photo</p>
                    <p className="text-xs text-gray-500">JPEG, PNG, WebP (max 5MB)</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={photoPreview}
                  alt="Memory photo preview"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={handleRemovePhoto}
                  disabled={isSubmitting}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  type="button"
                  aria-label="Remove photo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tags (optional, max 5)
            </label>

            {/* Tag chips */}
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isSubmitting}
                    className="hover:text-primary-900"
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Tag input */}
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Type a tag and press Enter..."
                disabled={isSubmitting}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none transition-colors text-sm text-gray-900 placeholder-gray-500 bg-white"
              />
            )}

            {/* Suggested tags */}
            <div className="mt-2 flex flex-wrap gap-1">
              {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  disabled={isSubmitting || tags.length >= 5}
                  className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Milestone Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isMilestone}
                onChange={(e) => setIsMilestone(e.target.checked)}
                disabled={isSubmitting}
                className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                ⭐ Mark as milestone moment
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Uploading photo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedChildId || !content.trim()}
              className={`flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                (isSubmitting || !selectedChildId || !content.trim()) ? 'opacity-50 cursor-not-allowed transform-none' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {photoFile ? 'Uploading...' : 'Saving...'}
                </span>
              ) : (
                'Save Memory'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
