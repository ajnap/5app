'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type {
  FamilyGoal,
  GoalCompletion,
  FamilyMemberType,
  GoalCategory,
  GOAL_CATEGORIES,
  calculateProgress,
} from '@/lib/goals/types'
import GoalCard from './GoalCard'
import AddGoalWizard from './AddGoalWizard'

interface Child {
  id: string
  name: string
  age: number
  birth_date: string
}

interface GoalsClientProps {
  goals: FamilyGoal[]
  children: Child[]
  todayCompletions: GoalCompletion[]
  userId: string
}

type FamilyMember = {
  id: string
  type: FamilyMemberType
  name: string
  icon: string
  age?: number
}

export default function GoalsClient({
  goals: initialGoals,
  children,
  todayCompletions: initialCompletions,
  userId,
}: GoalsClientProps) {
  const router = useRouter()
  const [goals, setGoals] = useState<FamilyGoal[]>(initialGoals)
  const [todayCompletions, setTodayCompletions] = useState<GoalCompletion[]>(initialCompletions)
  const [selectedMember, setSelectedMember] = useState<string>('self')
  const [showAddWizard, setShowAddWizard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Build family members list
  const familyMembers: FamilyMember[] = [
    { id: 'self', type: 'self', name: 'Me', icon: '👤' },
    { id: 'spouse', type: 'spouse', name: 'Spouse', icon: '💑' },
    ...children.map(child => ({
      id: child.id,
      type: 'child' as FamilyMemberType,
      name: child.name,
      icon: child.age < 6 ? '👶' : child.age < 13 ? '🧒' : '👦',
      age: child.age,
    })),
    { id: 'family', type: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' },
  ]

  // Filter goals based on selected member
  const filteredGoals = goals.filter(goal => {
    if (selectedMember === 'self') {
      return goal.member_type === 'self'
    }
    if (selectedMember === 'spouse') {
      return goal.member_type === 'spouse'
    }
    if (selectedMember === 'family') {
      return goal.member_type === 'family'
    }
    // Child goals
    return goal.member_type === 'child' && goal.child_id === selectedMember
  })

  // Get selected member info
  const currentMember = familyMembers.find(m => m.id === selectedMember) || familyMembers[0]
  const isKidView = currentMember.type === 'child' && (currentMember.age || 0) < 10

  // Handle goal completion toggle
  const handleCompleteGoal = async (goalId: string) => {
    setIsLoading(true)
    const today = new Date().toISOString().split('T')[0]

    try {
      // Check if already completed today
      const existingCompletion = todayCompletions.find(c => c.goal_id === goalId)

      if (existingCompletion) {
        // Increment count
        const { error } = await supabase
          .from('goal_completions')
          .update({ count: existingCompletion.count + 1 })
          .eq('id', existingCompletion.id)

        if (error) throw error

        setTodayCompletions(prev =>
          prev.map(c =>
            c.id === existingCompletion.id ? { ...c, count: c.count + 1 } : c
          )
        )
      } else {
        // Create new completion
        const { data, error } = await supabase
          .from('goal_completions')
          .insert({
            goal_id: goalId,
            user_id: userId,
            completion_date: today,
            count: 1,
          })
          .select()
          .single()

        if (error) throw error

        setTodayCompletions(prev => [...prev, data])
      }

      // Update goal's current count locally
      setGoals(prev =>
        prev.map(g =>
          g.id === goalId ? { ...g, current_count: g.current_count + 1 } : g
        )
      )

      toast.success('Goal completed! 🎉', {
        description: isKidView ? 'Great job! ⭐' : 'Keep up the great work!',
      })

      // Refresh data
      router.refresh()
    } catch (error: any) {
      console.error('Error completing goal:', error)
      toast.error('Failed to complete goal', {
        description: error.message || 'Please try again',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle goal deletion
  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const { error } = await supabase
        .from('family_goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error

      setGoals(prev => prev.filter(g => g.id !== goalId))
      toast.success('Goal deleted')
    } catch (error: any) {
      console.error('Error deleting goal:', error)
      toast.error('Failed to delete goal')
    }
  }

  // Handle new goal creation
  const handleGoalCreated = (newGoal: FamilyGoal) => {
    setGoals(prev => [newGoal, ...prev])
    setShowAddWizard(false)
    toast.success('Goal created! 🎯', {
      description: 'Start working towards your goal!',
    })
  }

  // Get today's date for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-in-up">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
          Family Goals
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track progress and celebrate achievements together
        </p>
      </div>

      {/* Family Member Tabs */}
      <div className="fade-in-up delay-100">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {familyMembers.map((member, index) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${
                selectedMember === member.id
                  ? 'bg-lavender-500 text-white shadow-lg scale-105'
                  : 'bg-white text-slate-600 hover:bg-lavender-50 hover:text-lavender-600 border border-slate-200'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-lg">{member.icon}</span>
              <span>{member.name}</span>
              {member.type === 'child' && (
                <span className="text-xs opacity-75">({member.age})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats for Selected Member */}
      <div className="grid grid-cols-3 gap-3 fade-in-up delay-200">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-2xl font-bold text-lavender-600">
            {filteredGoals.filter(g => g.status === 'active').length}
          </div>
          <div className="text-xs text-slate-500 font-medium">Active Goals</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {todayCompletions.filter(c =>
              filteredGoals.some(g => g.id === c.goal_id)
            ).length}
          </div>
          <div className="text-xs text-slate-500 font-medium">Done Today</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-2xl font-bold text-orange-500">
            {Math.max(0, ...filteredGoals.map(g => g.current_streak))}
          </div>
          <div className="text-xs text-slate-500 font-medium">Best Streak</div>
        </div>
      </div>

      {/* Add Goal Button */}
      <button
        onClick={() => setShowAddWizard(true)}
        className="w-full bg-gradient-to-r from-lavender-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-100 fade-in-up delay-300"
      >
        <span className="flex items-center justify-center gap-2">
          <span className="text-xl">+</span>
          <span>Add New Goal for {currentMember.name}</span>
        </span>
      </button>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="bg-gradient-to-br from-lavender-50 to-purple-50 rounded-2xl p-8 text-center border-2 border-dashed border-lavender-200 fade-in-up delay-400">
            <div className="text-5xl mb-4">{isKidView ? '🌟' : '🎯'}</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {isKidView ? 'No goals yet!' : `No goals for ${currentMember.name}`}
            </h3>
            <p className="text-slate-600 mb-4">
              {isKidView
                ? "Let's set some fun goals to work on!"
                : 'Create your first goal to start tracking progress.'}
            </p>
            <button
              onClick={() => setShowAddWizard(true)}
              className="bg-lavender-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-lavender-600 transition-colors"
            >
              {isKidView ? '✨ Create My First Goal!' : 'Create Goal'}
            </button>
          </div>
        ) : (
          <>
            {/* Today's Focus Section */}
            {filteredGoals.some(g => {
              const completion = todayCompletions.find(c => c.goal_id === g.id)
              return !completion || (g.goal_type === 'habit' && completion.count < g.target_count)
            }) && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 fade-in-up delay-400">
                <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                  <span>⭐</span>
                  Today's Focus
                </h3>
                <p className="text-sm text-amber-700">
                  {isKidView
                    ? "Here's what you can do today!"
                    : "Focus on these goals today to stay on track."}
                </p>
              </div>
            )}

            {/* Goal Cards */}
            {filteredGoals.map((goal, index) => {
              const completion = todayCompletions.find(c => c.goal_id === goal.id)
              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  todayCompletion={completion}
                  isKidView={isKidView}
                  onComplete={() => handleCompleteGoal(goal.id)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                  isLoading={isLoading}
                  style={{ animationDelay: `${(index + 5) * 100}ms` }}
                />
              )
            })}
          </>
        )}
      </div>

      {/* Weekly Reflection Prompt (show on Sundays or when few goals completed) */}
      {new Date().getDay() === 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-lavender-50 rounded-2xl p-6 border border-lavender-200 fade-in-up">
          <h3 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
            <span>🪞</span>
            Weekly Reflection
          </h3>
          <p className="text-slate-600 text-sm mb-4">
            Take a moment to reflect on your week as a family.
          </p>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-lavender-100">
              <p className="text-sm font-medium text-slate-700">What went well this week?</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-lavender-100">
              <p className="text-sm font-medium text-slate-700">What was challenging?</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-lavender-100">
              <p className="text-sm font-medium text-slate-700">What will we focus on next week?</p>
            </div>
          </div>
          <button className="mt-4 w-full bg-lavender-500 text-white py-3 rounded-xl font-semibold hover:bg-lavender-600 transition-colors">
            Save Reflection
          </button>
        </div>
      )}

      {/* Add Goal Wizard Modal */}
      {showAddWizard && (
        <AddGoalWizard
          isOpen={showAddWizard}
          onClose={() => setShowAddWizard(false)}
          onGoalCreated={handleGoalCreated}
          userId={userId}
          defaultMemberType={currentMember.type}
          defaultChildId={currentMember.type === 'child' ? currentMember.id : undefined}
          children={children}
        />
      )}
    </div>
  )
}
