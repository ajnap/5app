'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import type {
  FamilyGoal,
  GoalCategory,
  GoalType,
  FamilyMemberType,
  GoalTemplate,
  GOAL_CATEGORIES,
  GOAL_TYPES,
  GOAL_TEMPLATES,
} from '@/lib/goals/types'

interface Child {
  id: string
  name: string
  age: number
}

interface AddGoalWizardProps {
  isOpen: boolean
  onClose: () => void
  onGoalCreated: (goal: FamilyGoal) => void
  userId: string
  defaultMemberType: FamilyMemberType
  defaultChildId?: string
  children: Child[]
}

// Category metadata
const CATEGORIES: { value: GoalCategory; label: string; icon: string; color: string }[] = [
  { value: 'school', label: 'School', icon: '📚', color: '#3B82F6' },
  { value: 'chores', label: 'Chores', icon: '🧹', color: '#10B981' },
  { value: 'spiritual', label: 'Spiritual', icon: '🙏', color: '#8B5CF6' },
  { value: 'health', label: 'Health', icon: '💪', color: '#EF4444' },
  { value: 'money', label: 'Money', icon: '💰', color: '#F59E0B' },
  { value: 'fun', label: 'Fun', icon: '🎉', color: '#EC4899' },
  { value: 'relationship', label: 'Relationship', icon: '❤️', color: '#F43F5E' },
  { value: 'learning', label: 'Learning', icon: '🧠', color: '#6366F1' },
  { value: 'habit', label: 'Habit', icon: '🔄', color: '#14B8A6' },
  { value: 'other', label: 'Other', icon: '🎯', color: '#6B7280' },
]

// Goal types
const TYPES: { value: GoalType; label: string; description: string; icon: string }[] = [
  { value: 'habit', label: 'Habit Goal', description: 'Do something regularly (X times per week)', icon: '🔄' },
  { value: 'one_time', label: 'One-Time Goal', description: 'Complete a specific task by a date', icon: '🎯' },
  { value: 'learning', label: 'Learning Goal', description: 'Practice a skill or learn something new', icon: '📖' },
  { value: 'streak', label: 'Streak Goal', description: 'Do something every day in a row', icon: '🔥' },
]

// Pre-built templates
const TEMPLATES: GoalTemplate[] = [
  { id: 'homework-daily', title: 'Complete Homework', category: 'school', goal_type: 'habit', icon: '📝', color: '#3B82F6', description: 'Finish homework every school day', suggested_target: 5, suggested_frequency: 'week', for_member_types: ['child'] },
  { id: 'reading-time', title: 'Daily Reading', category: 'school', goal_type: 'streak', icon: '📚', color: '#6366F1', description: 'Read for at least 20 minutes every day', suggested_target: 1, suggested_frequency: 'day', for_member_types: ['child', 'self'] },
  { id: 'make-bed', title: 'Make Bed', category: 'chores', goal_type: 'streak', icon: '🛏️', color: '#10B981', description: 'Make bed every morning', suggested_target: 1, suggested_frequency: 'day', for_member_types: ['child'] },
  { id: 'clean-room', title: 'Clean Room', category: 'chores', goal_type: 'habit', icon: '🧹', color: '#10B981', description: 'Keep room clean and organized', suggested_target: 2, suggested_frequency: 'week', for_member_types: ['child'] },
  { id: 'daily-prayer', title: 'Daily Prayer', category: 'spiritual', goal_type: 'streak', icon: '🙏', color: '#8B5CF6', description: 'Pray every day', suggested_target: 1, suggested_frequency: 'day', for_member_types: ['self', 'spouse', 'child', 'family'] },
  { id: 'scripture-study', title: 'Scripture Study', category: 'spiritual', goal_type: 'habit', icon: '📖', color: '#8B5CF6', description: 'Read scriptures together', suggested_target: 5, suggested_frequency: 'week', for_member_types: ['self', 'spouse', 'family'] },
  { id: 'exercise', title: 'Exercise', category: 'health', goal_type: 'habit', icon: '🏃', color: '#EF4444', description: 'Get physical activity', suggested_target: 3, suggested_frequency: 'week', for_member_types: ['self', 'spouse', 'child'] },
  { id: 'drink-water', title: 'Drink Water', category: 'health', goal_type: 'habit', icon: '💧', color: '#0EA5E9', description: 'Stay hydrated throughout the day', suggested_target: 8, suggested_frequency: 'day', for_member_types: ['self', 'spouse', 'child'] },
  { id: 'family-game-night', title: 'Family Game Night', category: 'fun', goal_type: 'habit', icon: '🎲', color: '#EC4899', description: 'Have a fun family game night', suggested_target: 1, suggested_frequency: 'week', for_member_types: ['family'] },
  { id: 'date-night', title: 'Date Night', category: 'relationship', goal_type: 'habit', icon: '💑', color: '#F43F5E', description: 'Quality time with spouse', suggested_target: 2, suggested_frequency: 'month', for_member_types: ['self', 'spouse'] },
  { id: 'one-on-one', title: 'One-on-One Time', category: 'relationship', goal_type: 'habit', icon: '👨‍👧', color: '#F43F5E', description: 'Individual time with each child', suggested_target: 1, suggested_frequency: 'week', for_member_types: ['self', 'spouse'] },
  { id: 'practice-instrument', title: 'Practice Instrument', category: 'learning', goal_type: 'habit', icon: '🎹', color: '#6366F1', description: 'Practice musical instrument', suggested_target: 5, suggested_frequency: 'week', for_member_types: ['child'] },
  { id: 'save-money', title: 'Save Money', category: 'money', goal_type: 'habit', icon: '🐷', color: '#F59E0B', description: 'Put money in savings', suggested_target: 1, suggested_frequency: 'week', for_member_types: ['self', 'spouse', 'child'] },
]

type WizardStep = 'choose' | 'template' | 'custom' | 'details'

export default function AddGoalWizard({
  isOpen,
  onClose,
  onGoalCreated,
  userId,
  defaultMemberType,
  defaultChildId,
  children,
}: AddGoalWizardProps) {
  const [step, setStep] = useState<WizardStep>('choose')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<GoalCategory>('other')
  const [goalType, setGoalType] = useState<GoalType>('habit')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('#8B7CF6')
  const [targetCount, setTargetCount] = useState(1)
  const [targetFrequency, setTargetFrequency] = useState('week')
  const [targetDate, setTargetDate] = useState('')
  const [whyItMatters, setWhyItMatters] = useState('')
  const [reward, setReward] = useState('')
  const [notes, setNotes] = useState('')
  const [memberType, setMemberType] = useState<FamilyMemberType>(defaultMemberType)
  const [childId, setChildId] = useState<string | undefined>(defaultChildId)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Filter templates based on member type
  const filteredTemplates = TEMPLATES.filter(template =>
    template.for_member_types.includes(memberType)
  )

  // Select a template
  const selectTemplate = (template: GoalTemplate) => {
    setTitle(template.title)
    setDescription(template.description)
    setCategory(template.category)
    setGoalType(template.goal_type)
    setIcon(template.icon)
    setColor(template.color)
    setTargetCount(template.suggested_target)
    setTargetFrequency(template.suggested_frequency)
    setStep('details')
  }

  // Reset form
  const resetForm = () => {
    setStep('choose')
    setTitle('')
    setDescription('')
    setCategory('other')
    setGoalType('habit')
    setIcon('🎯')
    setColor('#8B7CF6')
    setTargetCount(1)
    setTargetFrequency('week')
    setTargetDate('')
    setWhyItMatters('')
    setReward('')
    setNotes('')
    setMemberType(defaultMemberType)
    setChildId(defaultChildId)
  }

  // Handle close
  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Submit goal
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a goal title')
      return
    }

    setIsSubmitting(true)

    try {
      const goalData = {
        user_id: userId,
        member_type: memberType,
        child_id: memberType === 'child' ? childId : null,
        title: title.trim(),
        description: description.trim() || null,
        category,
        goal_type: goalType,
        icon,
        color,
        target_count: targetCount,
        target_frequency: targetFrequency,
        target_date: targetDate || null,
        why_it_matters: whyItMatters.trim() || null,
        reward: reward.trim() || null,
        notes: notes.trim() || null,
        status: 'active',
        current_count: 0,
        current_streak: 0,
        best_streak: 0,
      }

      const { data, error } = await supabase
        .from('family_goals')
        .insert(goalData)
        .select()
        .single()

      if (error) throw error

      onGoalCreated(data)
      handleClose()
    } catch (error: any) {
      console.error('Error creating goal:', error)
      toast.error('Failed to create goal', {
        description: error.message || 'Please try again',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {step === 'choose' && 'Create New Goal'}
            {step === 'template' && 'Choose a Template'}
            {step === 'custom' && 'Custom Goal'}
            {step === 'details' && 'Goal Details'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 1: Choose path */}
          {step === 'choose' && (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm">How would you like to create your goal?</p>

              <button
                onClick={() => setStep('template')}
                className="w-full p-4 rounded-xl border-2 border-lavender-200 bg-lavender-50 hover:bg-lavender-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="font-semibold text-slate-800">Use a Template</h3>
                    <p className="text-sm text-slate-500">Quick start with pre-made goals</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('custom')}
                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-lavender-300 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h3 className="font-semibold text-slate-800">Create Custom Goal</h3>
                    <p className="text-sm text-slate-500">Build your own from scratch</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2a: Template selection */}
          {step === 'template' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('choose')}
                className="flex items-center gap-1 text-sm text-lavender-600 hover:text-lavender-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div className="grid gap-3">
                {filteredTemplates.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No templates available for this family member. Try creating a custom goal!</p>
                ) : (
                  filteredTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className="p-3 rounded-xl border border-slate-200 hover:border-lavender-300 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${template.color}20` }}
                        >
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">{template.title}</h4>
                          <p className="text-xs text-slate-500">{template.description}</p>
                        </div>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${template.color}15`, color: template.color }}
                        >
                          {template.category}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2b: Custom goal setup */}
          {step === 'custom' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('choose')}
                className="flex items-center gap-1 text-sm text-lavender-600 hover:text-lavender-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              {/* Goal Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Read for 20 minutes"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setCategory(cat.value)
                        setIcon(cat.icon)
                        setColor(cat.color)
                      }}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        category === cat.value
                          ? 'border-lavender-500 bg-lavender-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Goal Type</label>
                <div className="space-y-2">
                  {TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setGoalType(type.value)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        goalType === type.value
                          ? 'border-lavender-500 bg-lavender-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{type.icon}</span>
                        <div>
                          <span className="font-medium text-slate-800">{type.label}</span>
                          <p className="text-xs text-slate-500">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('details')}
                disabled={!title.trim()}
                className="w-full py-3 bg-lavender-500 text-white rounded-xl font-semibold hover:bg-lavender-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('custom')}
                className="flex items-center gap-1 text-sm text-lavender-600 hover:text-lavender-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              {/* Preview */}
              <div
                className="p-4 rounded-xl border-2"
                style={{ borderColor: color, backgroundColor: `${color}10` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{CATEGORIES.find(c => c.value === category)?.label}</p>
                  </div>
                </div>
              </div>

              {/* Target Settings */}
              {(goalType === 'habit' || goalType === 'streak') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Count</label>
                    <input
                      type="number"
                      min="1"
                      value={targetCount}
                      onChange={e => setTargetCount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                    <select
                      value={targetFrequency}
                      onChange={e => setTargetFrequency(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
                    >
                      <option value="day">Per Day</option>
                      <option value="week">Per Week</option>
                      <option value="month">Per Month</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Due Date for one-time goals */}
              {goalType === 'one_time' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add more details about this goal..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500 resize-none"
                />
              </div>

              {/* Why it matters */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Why does this matter? (optional)</label>
                <textarea
                  value={whyItMatters}
                  onChange={e => setWhyItMatters(e.target.value)}
                  placeholder="What's the motivation behind this goal?"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500 resize-none"
                />
              </div>

              {/* Reward */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reward (optional)</label>
                <input
                  type="text"
                  value={reward}
                  onChange={e => setReward(e.target.value)}
                  placeholder="e.g., Ice cream trip, extra screen time"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
                />
              </div>

              {/* For child goals, select which child */}
              {memberType === 'child' && children.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">For which child?</label>
                  <select
                    value={childId || ''}
                    onChange={e => setChildId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
                  >
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.name} ({child.age} years old)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'details' && (
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim()}
              className="w-full py-3 bg-gradient-to-r from-lavender-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
