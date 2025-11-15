import type { PersonalizedTip, ConnectionInsights, Completion, Child } from './recommendations/types'
import { daysSinceLastCompletion, isOverrepresented, isUnderrepresented } from './insights-calculator'

/**
 * Generate personalized coaching tips for a parent based on their child's data
 *
 * @param child - Child profile data
 * @param insights - Connection insights for the child
 * @param completions - Recent completions array
 * @returns Array of 3-5 personalized tips sorted by priority
 */
export function generatePersonalizedTips(
  child: Child,
  insights: ConnectionInsights,
  completions: Completion[]
): PersonalizedTip[] {
  const tips: PersonalizedTip[] = []
  let tipId = 0

  // 1. Re-engagement tips (Priority: 100)
  const daysSince = daysSinceLastCompletion(insights.lastCompletionDate)
  if (daysSince > 7 && daysSince < Infinity) {
    tips.push({
      id: `tip-${tipId++}`,
      type: 're_engagement',
      message: `It's been ${daysSince} days since your last activity with ${child.name}. They'd love some connection time!`,
      priority: 100,
      icon: '💜'
    })
  } else if (daysSince === Infinity && insights.totalCompletions === 0) {
    tips.push({
      id: `tip-${tipId++}`,
      type: 're_engagement',
      message: `Start your connection journey with ${child.name}! Try your first 5-minute activity today.`,
      priority: 100,
      icon: '🌟'
    })
  }

  // 2. Developmental tips based on age (Priority: 90)
  const developmentalTip = getDevelopmentalTip(child.age, child.name)
  if (developmentalTip) {
    tips.push({
      id: `tip-${tipId++}`,
      type: 'developmental',
      message: developmentalTip,
      priority: 90,
      icon: '🧠'
    })
  }

  // 3. Category balance tips (Priority: 80 for severe imbalance)
  const balanceTips = getCategoryBalanceTips(
    child.name,
    insights.categoryDistribution,
    insights.totalCompletions,
    tipId
  )
  tips.push(...balanceTips)
  tipId += balanceTips.length

  // 4. Streak encouragement tips (Priority: 70)
  if (insights.currentStreak >= 3) {
    const streakTip = getStreakTip(child.name, insights.currentStreak)
    tips.push({
      id: `tip-${tipId++}`,
      type: 'streak',
      message: streakTip,
      priority: 70,
      icon: '🔥'
    })
  }

  // 5. Engagement pattern tips (Priority: 60)
  const engagementTips = getEngagementTips(child.name, completions, insights, tipId)
  tips.push(...engagementTips)

  // Sort by priority (highest first) and return top 5
  return tips
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
}

/**
 * Get developmental tip based on child's age
 */
function getDevelopmentalTip(age: number, childName: string): string | null {
  if (age < 2) {
    return `At ${age} ${age === 1 ? 'year' : 'months'} old, ${childName} thrives on sensory experiences. Try activities with textures, sounds, and gentle movement.`
  } else if (age >= 2 && age < 5) {
    return `At age ${age}, ${childName} is learning emotional regulation. Activities that name and validate feelings build lifelong skills.`
  } else if (age >= 5 && age < 8) {
    return `At age ${age}, ${childName} is developing empathy. Activities that help notice others' feelings are especially valuable now.`
  } else if (age >= 8 && age < 12) {
    return `At age ${age}, ${childName} values growing independence. Activities that give them choices and leadership build confidence.`
  } else if (age >= 12 && age < 15) {
    return `At age ${age}, ${childName} needs connection without pressure. Side-by-side activities (like cooking or projects) work wonderfully.`
  } else if (age >= 15 && age < 19) {
    return `At age ${age}, ${childName} values authenticity. Asking their opinion and really listening builds deep connection.`
  }

  return null // Age out of range
}

/**
 * Get category balance tips if distribution is imbalanced
 */
function getCategoryBalanceTips(
  childName: string,
  distribution: { category: string; percentage: number }[],
  totalCompletions: number,
  startId: number
): PersonalizedTip[] {
  const tips: PersonalizedTip[] = []
  let tipId = startId

  if (totalCompletions < 5) {
    // New user - encourage exploration
    tips.push({
      id: `tip-${tipId++}`,
      type: 'category_balance',
      message: `You're just getting started! Try activities from different categories to discover what ${childName} loves most.`,
      priority: 75,
      icon: '🎯'
    })
    return tips
  }

  // Check for overrepresented categories (>40%)
  const overrepresented = distribution.filter(d => d.percentage > 40)
  if (overrepresented.length > 0) {
    const category = overrepresented[0].category
    const categoryName = category.replace(/_/g, ' ')
    tips.push({
      id: `tip-${tipId++}`,
      type: 'category_balance',
      message: `You've been doing lots of ${categoryName} activities! Try mixing in some variety for well-rounded growth.`,
      priority: 80,
      icon: '⚖️'
    })
  }

  // Check for underrepresented categories (<10%)
  if (totalCompletions >= 10) {
    const underrepresented = distribution.filter(d => d.percentage < 10 && d.percentage > 0)
    if (underrepresented.length > 0) {
      const category = underrepresented[0].category
      const categoryName = category.replace(/_/g, ' ')
      tips.push({
        id: `tip-${tipId++}`,
        type: 'category_balance',
        message: `${childName} might enjoy exploring more ${categoryName} activities - they haven't tried many yet!`,
        priority: 75,
        icon: '🌈'
      })
    }
  }

  return tips
}

/**
 * Get streak encouragement tip
 */
function getStreakTip(childName: string, streak: number): string {
  if (streak >= 7) {
    return `Amazing! A full week of daily connection with ${childName}! You're building a powerful habit.`
  } else if (streak >= 5) {
    return `You're on a ${streak}-day streak with ${childName}! Just 2 more days to make it a full week!`
  } else if (streak >= 3) {
    return `You're on a ${streak}-day streak with ${childName}! Consistency is building a beautiful routine.`
  }

  return `Keep your ${streak}-day streak going!`
}

/**
 * Get engagement pattern tips
 */
function getEngagementTips(
  childName: string,
  completions: Completion[],
  insights: ConnectionInsights,
  startId: number
): PersonalizedTip[] {
  const tips: PersonalizedTip[] = []
  let tipId = startId

  if (completions.length === 0) return tips

  // Calculate reflection rate
  const completionsWithReflections = completions.filter(c => c.reflection_note && c.reflection_note.trim().length > 0).length
  const reflectionRate = completionsWithReflections / completions.length

  if (reflectionRate > 0.5) {
    tips.push({
      id: `tip-${tipId++}`,
      type: 'engagement',
      message: `You're great at reflecting on moments with ${childName}! These notes become precious memories.`,
      priority: 60,
      icon: '📝'
    })
  }

  // Calculate average duration vs estimated
  const completionsWithDuration = completions.filter(c => c.duration_seconds && c.duration_seconds > 0)
  if (completionsWithDuration.length >= 3) {
    const avgDuration = completionsWithDuration.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / completionsWithDuration.length
    const avgMinutes = Math.round(avgDuration / 60)

    if (avgMinutes > 7) {
      tips.push({
        id: `tip-${tipId++}`,
        type: 'engagement',
        message: `${childName} really takes their time with activities (avg ${avgMinutes} min). This deep engagement is wonderful!`,
        priority: 60,
        icon: '⏰'
      })
    }
  }

  // Check for favorite categories
  if (insights.favoriteCategories.length > 0 && insights.favoriteCategories[0].count >= 3) {
    const favoriteCategory = insights.favoriteCategories[0].category.replace(/_/g, ' ')
    tips.push({
      id: `tip-${tipId++}`,
      type: 'engagement',
      message: `${childName} loves ${favoriteCategory} activities! You've found something that really resonates with them.`,
      priority: 60,
      icon: '❤️'
    })
  }

  return tips
}

/**
 * Helper function to get the category name for display
 */
export function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    connection: 'Connection',
    behavior: 'Behavior',
    learning: 'Learning',
    mealtime: 'Mealtime',
    bedtime: 'Bedtime',
    creative_expression: 'Creative Expression',
    emotional_connection: 'Emotional Connection',
    spiritual_growth: 'Spiritual Growth',
    service: 'Service',
    gratitude: 'Gratitude'
  }

  return categoryNames[category] || category.replace(/_/g, ' ')
}
