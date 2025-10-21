'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ChildGrowthStatsProps {
  childId: string
}

interface CategoryData {
  category: string
  count: number
}

export default function ChildGrowthStats({ childId }: ChildGrowthStatsProps) {
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchCategoryBreakdown() {
      try {
        const { data, error } = await supabase
          .rpc('get_category_breakdown', { p_child_id: childId })

        if (error) throw error

        setCategoryBreakdown(data || [])
      } catch (error) {
        console.error('Error fetching category breakdown:', error)
        setCategoryBreakdown([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryBreakdown()
  }, [childId, supabase])

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (categoryBreakdown.length === 0) {
    return (
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100">
        <h3 className="text-lg font-bold text-gray-700 mb-2">Growth Balance</h3>
        <p className="text-gray-600 text-sm">
          Complete activities to see growth across different dimensions
        </p>
      </div>
    )
  }

  // Calculate total and percentages
  const total = categoryBreakdown.reduce((sum, cat) => sum + Number(cat.count), 0)

  const categoriesWithPercentages = categoryBreakdown.map((cat) => ({
    ...cat,
    percentage: (Number(cat.count) / total) * 100,
  }))

  // Category colors
  const categoryColors: Record<string, { bg: string; border: string }> = {
    spiritual: { bg: 'bg-purple-500', border: 'border-purple-500' },
    emotional: { bg: 'bg-pink-500', border: 'border-pink-500' },
    physical: { bg: 'bg-green-500', border: 'border-green-500' },
    academic: { bg: 'bg-blue-500', border: 'border-blue-500' },
    social: { bg: 'bg-orange-500', border: 'border-orange-500' },
    fun: { bg: 'bg-yellow-500', border: 'border-yellow-500' },
    adventure: { bg: 'bg-indigo-500', border: 'border-indigo-500' },
  }

  // Find most dominant category
  const dominantCategory = categoriesWithPercentages[0]
  const isImbalanced = dominantCategory && dominantCategory.percentage > 50

  // Find underrepresented categories
  const allCategories = ['Spiritual', 'Emotional', 'Physical', 'Academic', 'Social']
  const existingCategories = categoryBreakdown.map((c) => c.category.toLowerCase())
  const missingCategories = allCategories.filter(
    (cat) => !existingCategories.includes(cat.toLowerCase())
  )

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Growth Balance</h3>

      {/* Category Bars */}
      <div className="space-y-3 mb-4">
        {categoriesWithPercentages.map((cat) => {
          const categoryKey = cat.category.toLowerCase()
          const colors = categoryColors[categoryKey] || categoryColors.fun

          return (
            <div key={cat.category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {cat.category}
                </span>
                <span className="text-xs text-gray-500">
                  {cat.count} ({cat.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Suggestions */}
      {isImbalanced && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-sm">
          <p className="text-blue-800">
            <span className="font-semibold">Tip:</span> Try exploring{' '}
            {missingCategories.length > 0
              ? missingCategories[0]
              : categoryBreakdown[categoryBreakdown.length - 1]?.category}{' '}
            activities for balanced growth!
          </p>
        </div>
      )}

      {missingCategories.length > 0 && !isImbalanced && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 text-sm">
          <p className="text-purple-800">
            <span className="font-semibold">New areas to explore:</span>{' '}
            {missingCategories.slice(0, 2).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
